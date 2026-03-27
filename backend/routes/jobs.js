const express = require("express");
const { body, validationResult } = require("express-validator");
const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const Profile = require("../models/Profile");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendEmail } = require("../utils/emailService");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Get all jobs (with optional filters)
router.get("/", async (req, res) => {
  try {
    const { search, skills, location, jobType } = req.query;

    let query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (skills) {
      query.skills = { $regex: skills, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    const jobs = await Job.find(query)
      .populate({
        path: "createdBy",
        select: "name email",
        populate: {
          path: "businessProfile",
          model: "BusinessProfile",
        },
      })
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get my jobs (for business dashboard) — must come before /:id
router.get("/my/jobs", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user.user.id }).sort({
      createdAt: -1,
    });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get my applications (for developer dashboard)
router.get("/my/applications", auth, async (req, res) => {
  try {
    const developerId = req.user.user.id;

    const applications = await JobApplication.find({ developerId })
      .populate({
        path: "jobId",
        select: "title location salary jobType",
        populate: {
          path: "createdBy",
          select: "name",
          populate: {
            path: "businessProfile",
            model: "BusinessProfile",
            select: "companyName logo verified",
          },
        },
      })
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get applications for a business (for their job postings) — must come before /:id
router.get("/applications/my/list", auth, async (req, res) => {
  try {
    const businessId = req.user.user.id;

    const applications = await JobApplication.find({ businessId })
      .populate("jobId", "title")
      .populate("developerId", "name email")
      .populate(
        "developerProfile",
        "skills experience location portfolio verified bio",
      )
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate({
      path: "createdBy",
      select: "name email",
      populate: {
        path: "businessProfile",
        model: "BusinessProfile",
      },
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Create job (business only)
router.post(
  "/",
  auth,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("skills").isArray().withMessage("Skills must be an array"),
    body("location").notEmpty().withMessage("Location is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.user.role !== "business") {
      return res.status(403).json({ message: "Only businesses can post jobs" });
    }

    const { title, description, skills, location, salary, jobType } = req.body;

    try {
      const job = new Job({
        title,
        description,
        skills,
        location,
        salary,
        jobType: jobType || "full-time",
        createdBy: req.user.user.id,
      });

      await job.save();
      res.json(job);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
);

// Update job
router.put("/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.createdBy.toString() !== req.user.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, skills, location, salary, jobType } = req.body;

    job.title = title || job.title;
    job.description = description || job.description;
    job.skills = skills || job.skills;
    job.location = location || job.location;
    job.salary = salary || job.salary;
    job.jobType = jobType || job.jobType;

    await job.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Delete job
router.delete("/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.createdBy.toString() !== req.user.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Apply for a job (developer applies)
router.post("/:jobId/apply", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const developerId = req.user.user.id;
    const developerProfile = await Profile.findOne({ userId: developerId });

    // Check if already applied
    const existingApp = await JobApplication.findOne({
      jobId: req.params.jobId,
      developerId,
    });

    if (existingApp) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job" });
    }

    // Create application
    const application = new JobApplication({
      jobId: req.params.jobId,
      developerId,
      businessId: job.createdBy,
      developerProfile: developerProfile?._id,
      message: req.body.message || "",
      status: "pending",
    });

    await application.save();

    // -- NEW: Notification & Email System --
    try {
      // 1. In-App Notification
      const notification = new Notification({
        recipient: job.createdBy, // Business owner
        sender: developerId, // Developer
        type: "application_received",
        title: "New Job Application",
        message: `A developer applied for your job: ${job.title}.`,
        link: "/business-dashboard#applications",
      });
      await notification.save();

      // 2. Email Notification
      const businessUser = await User.findById(job.createdBy);
      if (businessUser) {
        await sendEmail({
          email: businessUser.email,
          subject: `New Application Received for ${job.title}`,
          html: `<div style="font-family:sans-serif;color:#333;max-width:600px;">
                  <h2 style="color:#7c3aed;">Hello ${businessUser.name},</h2>
                  <p>Great news! A new developer has just applied for your <strong>${job.title}</strong> position on PHP Talent Hub.</p>
                  <p>Log in to your Business Dashboard to review their application, cover letter, and verify their PHP skills.</p>
                  <div style="margin: 30px 0;">
                    <a href="http://localhost:5173/business-dashboard" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">View Dashboard</a>
                  </div>
                  <p style="font-size:12px;color:#94a3b8;">This is an automated message from PHP Talent Hub.</p>
                 </div>`
        });
      }
    } catch (notifyErr) {
      console.error("Notification Error:", notifyErr);
    }
    // -- END NEW --

    res.json({
      message: "Application submitted successfully",
      application,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get applications for a specific job
router.get("/:jobId/applications", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.createdBy.toString() !== req.user.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const applications = await JobApplication.find({ jobId: req.params.jobId })
      .populate("developerId", "name email")
      .populate(
        "developerProfile",
        "skills experience location portfolio verified",
      )
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Accept/Reject application
router.put("/:applicationId/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await JobApplication.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.businessId.toString() !== req.user.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    application.status = status;
    await application.save();

    // -- NEW: Notification & Email System --
    try {
      // Fetch developer and job details for email/notification
      const devUser = await User.findById(application.developerId);
      const jobDetails = await Job.findById(application.jobId);
      
      if (devUser && jobDetails) {
        const isAccepted = status === "accepted";
        
        // 1. In-App Notification
        const notification = new Notification({
          recipient: application.developerId,
          sender: req.user.user.id, // Business user
          type: isAccepted ? "application_accepted" : "application_rejected",
          title: `Application ${isAccepted ? 'Accepted' : 'Rejected'}`,
          message: `Your application for ${jobDetails.title} was ${status}.`,
          link: "/developer-dashboard#applications",
        });
        await notification.save();

        // 2. Email Notification
        const emailSubject = isAccepted 
            ? `Good news! Your application for "${jobDetails.title}" was accepted!`
            : `Update on your application for "${jobDetails.title}"`;
            
        const themeColor = isAccepted ? "#10b981" : "#ef4444";
        
        await sendEmail({
          email: devUser.email,
          subject: emailSubject,
          html: `<div style="font-family:sans-serif;color:#333;max-width:600px;">
                  <h2 style="color:${themeColor};">Hi ${devUser.name},</h2>
                  <p>The status of your application for the <strong>${jobDetails.title}</strong> role has been updated to: <strong style="color:${themeColor};text-transform:uppercase;">${status}</strong>.</p>
                  <p>${isAccepted ? "The company should reach out to you shortly for the next steps!" : "Don't be discouraged! There are hundreds of other verified PHP jobs waiting for you."}</p>
                  <div style="margin: 30px 0;">
                    <a href="http://localhost:5173/developer-dashboard" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Go to Dashboard</a>
                  </div>
                  <p style="font-size:12px;color:#94a3b8;">This is an automated message from PHP Talent Hub.</p>
                 </div>`
        });
      }
    } catch (notifyErr) {
      console.error("Notification Error:", notifyErr);
    }
    // -- END NEW --

    res.json({
      message: `Application ${status}`,
      application,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Check if developer already applied for a job
router.get("/:jobId/check-application", auth, async (req, res) => {
  try {
    const developerId = req.user.user.id;
    const application = await JobApplication.findOne({
      jobId: req.params.jobId,
      developerId,
    });

    res.json({
      applied: !!application,
      status: application?.status || null,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
