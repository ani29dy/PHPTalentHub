const express = require("express");
const { body, validationResult } = require("express-validator");
const Profile = require("../models/Profile");
const BusinessProfile = require("../models/BusinessProfile");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { auth } = require("../middleware/auth");

const router = express.Router();

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

    // ✅ Location (partial match)
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // ✅ Experience (exact match)
    if (experience) {
      query.experience = experience;
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

    const { skills, languages, experience, location, portfolio, bio } =
      req.body;

    try {
      let profile = await Profile.findOne({ userId: req.user.user.id });

      if (profile) {
        // Update existing profile
        profile.skills = skills;
        profile.languages = languages;
        profile.experience = experience;
        profile.location = location;
        profile.portfolio = portfolio;
        profile.bio = bio;
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
          bio,
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

// Get developer profile by userId (public) — MUST be last to avoid shadowing /business/* routes
router.get("/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      userId: req.params.userId,
    }).populate("userId", "name email");
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
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
    const businessId = req.user.user.id;

    // Optional: Only create notification if sender is a business
    if (req.user.user.role === "business") {
      const businessUser = await User.findById(businessId);
      
      const notification = new Notification({
        recipient: developerId,
        sender: businessId,
        type: "system", // Or a new type like "hire_request"
        title: "New Hire Inquiry",
        message: `${businessUser.name} is interested in hiring you! They have been securely redirected to email you outside the platform.`,
        link: "", 
      });
      await notification.save();
    }
    
    res.json({ message: "Notification sent successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
