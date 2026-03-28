const express = require("express");
const { body, validationResult } = require("express-validator");
const Profile = require("../models/Profile");
const BusinessProfile = require("../models/BusinessProfile");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");
const { auth } = require("../middleware/auth");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const router = express.Router();

// Cloudinary Configuration
console.log("Cloudinary Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME); // Debugging
console.log("Cloudinary API Key Loaded:", !!process.env.CLOUDINARY_API_KEY); // Debugging

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
} else {
  console.error("CRITICAL: Cloudinary environment variables NOT found in process.env!");
}

// Multer storage in memory
const upload = multer({ storage: multer.memoryStorage() });

// Unified Tracking & Notification Helper
const logAndNotify = async (profileId, visitorId, type) => {
  try {
    // 1. Log Activity
    const activity = new Activity({ profileId, visitorId, type });
    await activity.save();

    // 2. Send Notification to Developer
    const profile = await Profile.findById(profileId).populate("userId");
    const visitor = await User.findById(visitorId).populate("businessProfile");
    
    if (!profile || !visitor) return;

    const visitorName = visitor.businessProfile?.companyName || visitor.name;
    let title = "";
    let message = "";

    switch (type) {
      case "view":
        title = "Profile View 👀";
        message = `${visitorName} viewed your professional profile.`;
        break;
      case "download":
        title = "CV Download 📥";
        message = `${visitorName} downloaded your resume.`;
        break;
      case "portfolio_visit":
        title = "Portfolio Visit 🔗";
        message = `${visitorName} clicked on your portfolio link.`;
        break;
      case "hire_inquiry":
        title = "Hire Inquiry ✉️";
        message = `${visitorName} is interested in hiring you!`;
        break;
    }

    const Notification = require("../models/Notification");
    const notification = new Notification({
      recipient: profile.userId._id,
      sender: visitorId,
      type: "activity",
      title,
      message,
      link: `/developer-dashboard?filter=${type}`
    });
    await notification.save();
  } catch (err) {
    console.error("Tracking/Notification Error:", err);
  }
};

// Get all profiles (for business search)
router.get("/", async (req, res) => {
  try {
    const { skills, languages, location, experience } = req.query;

    // No longer hiding unverified completely. Everyone gets a chance. But Verified ranks highest.
    let query = {};

    // ✅ Skills (partial match)
    if (skills) {
      query.skills = { $regex: skills, $options: "i" };
    }

    // ✅ Languages (partial match)
    if (languages) {
      query.languages = { $regex: languages, $options: "i" };
    }

    // ✅ Specializations (partial match)
    if (req.query.specializations) {
      query.specializations = { $regex: req.query.specializations, $options: "i" };
    }

    // ✅ Location (partial match)
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // ✅ Experience (exact match)
    if (experience) {
      query.experience = experience;
    }

    // ✅ Exclude self if logged in
    const token = req.header("x-auth-token") || req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      const jwt = require("jsonwebtoken");
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        query.userId = { $ne: decoded.user.id };
      } catch (e) { /* ignore invalid tokens */ }
    }

    // Sort by verified to prioritize verified developers!
    const profiles = await Profile.find(query)
      .populate("userId", "name email")
      .sort({ verified: -1 });

    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Create or update profile
router.post(
  "/",
  auth,
  [
    body("skills").isArray().withMessage("Skills must be an array"),
    body("languages").isArray().withMessage("Languages must be an array"),
    body("experience")
      .isIn(["0-1 years", "1-3 years", "3-5 years", "5+ years"])
      .withMessage("Invalid experience level"),
    body("location").notEmpty().withMessage("Location is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      skills,
      languages,
      specializations,
      experience,
      location,
      portfolio,
      linkedin,
      bio,
      workExperience,
      education,
      projects,
      certifications,
      hobbies,
    } = req.body;

    try {
      let profile = await Profile.findOne({ userId: req.user.user.id });

      if (profile) {
        // Update existing profile
        profile.skills = skills;
        profile.languages = languages;
        profile.experience = experience;
        profile.location = location;
        profile.portfolio = portfolio;
        profile.linkedin = linkedin;
        profile.bio = bio;
        profile.workExperience = workExperience;
        profile.education = education;
        profile.projects = projects;
        profile.certifications = certifications;
        profile.hobbies = hobbies;
        profile.specializations = specializations;
        await profile.save();
      } else {
        // Create new profile
        profile = new Profile({
          userId: req.user.user.id,
          skills,
          languages,
          experience,
          location,
          portfolio,
          linkedin,
          bio,
          workExperience,
          education,
          projects,
          certifications,
          hobbies,
          specializations,
        });
        await profile.save();
      }

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
);

// Request verification
router.post("/request-verification", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    profile.verificationRequested = true;
    await profile.save();

    res.json({ message: "Verification request submitted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Upload resume to Cloudinary
router.post("/resume/upload", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check file type
    const allowedTypes = [
      "application/pdf", 
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Only PDF and Word documents are allowed" });
    }

    // Move Cloudinary configuration inside the route for reliability
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    console.log("Cloudinary Uploading with Key:", process.env.CLOUDINARY_API_KEY ? "EXISTS" : "MISSING");

    // Upload to Cloudinary using stream
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          { 
            resource_type: "raw", 
            folder: "resumes",
            public_id: `resume_${req.user.user.id}_${Date.now()}`
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              console.error("Cloudinary Stream Upload Error Detail:", error); // Added detail
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    // Update profile with resume URL
    const profile = await Profile.findOne({ userId: req.user.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    profile.resumeUrl = result.secure_url;
    profile.resumeName = req.file.originalname;
    await profile.save();

    res.json({ 
      message: "Resume uploaded successfully", 
      resumeUrl: result.secure_url,
      resumeName: req.file.originalname 
    });
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// Track Profile View (explicit)
router.post("/view/:userId", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    if (req.user.user.role === "business" && req.user.user.id !== req.params.userId) {
      await logAndNotify(profile._id, req.user.user.id, "view");
    }
    res.json({ message: "View tracked" });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Track & Redirect Resume Download
router.get("/resume/download/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile || !profile.resumeUrl) return res.status(404).json({ message: "Resume not found" });

    // Extract token from query or header
    const token = req.query.token || req.header("x-auth-token") || req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      const jwt = require("jsonwebtoken");
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        if (decoded.user.role === "business" && decoded.user.id !== req.params.userId) {
          await logAndNotify(profile._id, decoded.user.id, "download");
        }
      } catch (e) { console.error("Download tracking auth failed:", e.message); }
    }
    
    res.redirect(profile.resumeUrl);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Track & Redirect Portfolio Visit
router.get("/portfolio/visit/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile || !profile.portfolio) return res.status(404).json({ message: "Portfolio not found" });

    const token = req.query.token || req.header("x-auth-token") || req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      const jwt = require("jsonwebtoken");
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        if (decoded.user.role === "business" && decoded.user.id !== req.params.userId) {
          await logAndNotify(profile._id, decoded.user.id, "portfolio_visit");
        }
      } catch (e) { console.error("Portfolio tracking auth failed:", e.message); }
    }
    
    res.redirect(profile.portfolio);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Upload avatar (profile image) to Cloudinary
router.post("/avatar/upload", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Only JPEG, PNG and WEBP images are allowed" });
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    // Upload using stream
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          { 
            folder: "avatars",
            transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }]
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    // Update profile
    const profile = await Profile.findOne({ userId: req.user.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    profile.profileImage = result.secure_url;
    await profile.save();

    res.json({ 
      message: "Profile picture updated successfully", 
      profileImage: result.secure_url 
    });
  } catch (err) {
    console.error("Avatar Upload Error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// Get my profile
router.get("/me/profile", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get Developer Dashboard stats
const Application = require("../models/JobApplication");

router.get("/me/dashboard-stats", auth, async (req, res) => {
  try {
    const userId = req.user.user.id;
    
    // 1. Get Application Stats
    const applications = await Application.find({ developerId: userId });
    
    const stats = {
      totalApplications: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      totalViews: 0,
      totalDownloads: 0,
      totalPortfolioVisits: 0,
      totalHireInquiries: 0,
    };

    // 2. Get Recruiter Actions (Hire Requests)
    const recruiterActions = await Notification.find({
      recipient: userId,
      type: "hire_request"
    })
    .populate('sender', 'name email')
    .sort({ createdAt: -1 })
    .limit(10); // Show recent 10

    // 3. Get Profile Completion Info
    const profile = await Profile.findOne({ userId });
    let profileStrength = 0;
    const insights = [];

    if (profile) {
      profileStrength += 10; // Basic details present
      if (profile.skills && profile.skills.length > 0) { profileStrength += 10; } else { insights.push("Add skills"); }
      if (profile.location) { profileStrength += 5; } else { insights.push("Add location"); }
      if (profile.experience) { profileStrength += 5; } else { insights.push("Set experience level"); }
      if (profile.bio) { profileStrength += 10; } else { insights.push("Add a professional summary"); }
      if (profile.portfolio) { profileStrength += 5; } else { insights.push("Link your portfolio/GitHub"); }
      if (profile.workExperience && profile.workExperience.length > 0) { profileStrength += 15; } else { insights.push("Add work experience"); }
      if (profile.education && profile.education.length > 0) { profileStrength += 10; } else { insights.push("Add education history"); }
      if (profile.projects && profile.projects.length > 0) { profileStrength += 15; } else { insights.push("Add some projects"); }
      if (profile.certifications && profile.certifications.length > 0) { profileStrength += 5; } else { insights.push("Add certifications"); }
      if (profile.hobbies && profile.hobbies.length > 0) { profileStrength += 5; } else { insights.push("Add hobbies"); }
      if (profile.verified) { profileStrength += 5; } else { insights.push("Get verified to rank #1"); }
      if (profile.profileImage) { profileStrength += 5; } else { insights.push("Add a profile picture"); }
    } else {
      insights.push("Create your developer profile");
    }

    // 4. Get Activity Stats (Views & Downloads)
    const profileDoc = await Profile.findOne({ userId });
    let totalViews = 0;
    let totalDownloads = 0;
    let recentInterest = [];

    if (profileDoc) {
      stats.totalViews = await Activity.countDocuments({ profileId: profileDoc._id, type: "view" });
      stats.totalDownloads = await Activity.countDocuments({ profileId: profileDoc._id, type: "download" });
      stats.totalPortfolioVisits = await Activity.countDocuments({ profileId: profileDoc._id, type: "portfolio_visit" });
      stats.totalHireInquiries = await Activity.countDocuments({ profileId: profileDoc._id, type: "hire_inquiry" });
      
      // Get unique recent visitors (Businesses)
      const activities = await Activity.find({ profileId: profileDoc._id })
        .sort({ createdAt: -1 })
        .populate({
          path: 'visitorId',
          select: 'name businessProfile',
          populate: { path: 'businessProfile', select: 'companyName logo industry' }
        })
        .limit(20);

      const seen = new Set();
      recentInterest = activities
        .map(a => {
          if (!a.visitorId) return null;
          const companyName = a.visitorId.businessProfile?.companyName || a.visitorId.name || "A Recruiter";
          const logo = a.visitorId.businessProfile?.logo;
          const type = a.type;
          const industry = a.visitorId.businessProfile?.industry;
          const date = a.createdAt;

          const key = `${companyName}-${type}`;
          if (seen.has(key)) return null;
          seen.add(key);

          return { companyName, logo, type, industry, date };
        })
        .filter(Boolean)
        .slice(0, 10);
    }

    res.json({
      stats,
      recruiterActions,
      profileStrength: Math.min(profileStrength, 100),
      insights,
      profile,
      recentInterest
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Business Profile Routes

// Get business profile by user ID
router.get("/business/:userId", async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({
      userId: req.params.userId,
    }).populate("userId", "name email");
    if (!profile) {
      return res.status(404).json({ message: "Business profile not found" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get current user's business profile
router.get("/business/me/profile", auth, async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ user: req.user.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Business profile not found" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Create or update business profile
router.post(
  "/business",
  auth,
  [
    body("companyName").notEmpty().withMessage("Company name is required"),
    body("companySize")
      .isIn(["1-10", "11-50", "51-200", "201-1000", "1000+"])
      .withMessage("Invalid company size"),
    body("industry").notEmpty().withMessage("Industry is required"),
    body("location").notEmpty().withMessage("Location is required"),
    body("description").notEmpty().withMessage("Description is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profileData = {
        ...req.body,
        user: req.user.user.id,
      };

      let profile = await BusinessProfile.findOne({ user: req.user.user.id });
      if (profile) {
        // Update existing profile
        profile = await BusinessProfile.findOneAndUpdate(
          { user: req.user.user.id },
          profileData,
          { new: true },
        );
        // Self-heal: ensure the user document knows about this profile
        await User.findByIdAndUpdate(req.user.user.id, { businessProfile: profile._id });
      } else {
        // Create new profile
        profile = new BusinessProfile(profileData);
        await profile.save();
        
        // Ensure the User document links to this new profile
        await User.findByIdAndUpdate(req.user.user.id, { businessProfile: profile._id });
      }

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
);

// Request business verification
router.post("/business/request-verification", auth, async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ user: req.user.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Business profile not found" });
    }

    profile.verificationRequested = true;
    await profile.save();

    res.json({ message: "Verification request submitted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get developer profile by userId (public)
router.get("/:userId", async (req, res) => { // Removed 'auth' middleware to keep it public, but will track if token is present
  try {
    const profile = await Profile.findOne({
      userId: req.params.userId,
    }).populate("userId", "name email");
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Optional: Auto-track view if a token is passed in header (non-blocking)
    const token = req.header("x-auth-token");
    if (token) {
      const jwt = require("jsonwebtoken");
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.user.role === "business" && decoded.user.id !== req.params.userId) {
          await logAndNotify(profile._id, decoded.user.id, "view");
        }
      } catch (e) { /* ignore invalid tokens */ }
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Notify developer of a hire request before redirecting to email
router.post("/:userId/hire-notify", auth, async (req, res) => {
  try {
    const developerId = req.params.userId;
    const profile = await Profile.findOne({ userId: developerId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Track if sender is a business
    if (req.user.user.role === "business" && req.user.user.id !== req.params.userId) {
      await logAndNotify(profile._id, req.user.user.id, "hire_inquiry");
    }
    
    res.json({ message: "Notification sent & tracked" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
