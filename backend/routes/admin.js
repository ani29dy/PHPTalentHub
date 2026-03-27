const express = require("express");
const Profile = require("../models/Profile");
const BusinessProfile = require("../models/BusinessProfile");
const User = require("../models/User");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// Get all users
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, "name email role createdAt");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get verification requests
router.get("/verification-requests", auth, adminAuth, async (req, res) => {
  try {
    // Get developer verification requests
    const developerRequests = await Profile.find({
      verificationRequested: true,
    })
      .populate("userId", "name email")
      .lean()
      .exec();

    // Get business verification requests
    const businessRequests = await BusinessProfile.find({
      verificationRequested: true,
    })
      .populate("user", "name email")
      .lean()
      .exec();

    // Combine and map for consistent frontend naming
    const allRequests = [
      ...developerRequests.map((req) => ({
        _id: req._id,
        user: req.userId,
        type: "developer",
        profile: {
          skills: req.skills,
          experience: req.experience,
          portfolio: req.portfolio,
          bio: req.bio,
          location: req.location,
        },
      })),
      ...businessRequests.map((req) => ({
        _id: req._id,
        user: req.user,
        type: "business",
        profile: {
          companyName: req.companyName,
          companySize: req.companySize,
          industry: req.industry,
          location: req.location,
          description: req.description,
          benefits: req.benefits,
          culture: req.culture,
        },
      })),
    ];

    res.json(allRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Approve verification
router.put(
  "/approve-verification/:profileId",
  auth,
  adminAuth,
  async (req, res) => {
    try {
      // Try to find in developer profiles first
      let profile = await Profile.findById(req.params.profileId);

      if (profile) {
        // It's a developer profile
        profile.verified = true;
        profile.verificationRequested = false;
        await profile.save();
        return res.json({ message: "Developer verification approved" });
      }

      // Try to find in business profiles
      profile = await BusinessProfile.findById(req.params.profileId);

      if (profile) {
        // It's a business profile
        profile.verified = true;
        profile.verificationRequested = false;
        await profile.save();
        return res.json({ message: "Business verification approved" });
      }

      return res.status(404).json({ message: "Profile not found" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
);

// Reject verification
router.put(
  "/reject-verification/:profileId",
  auth,
  adminAuth,
  async (req, res) => {
    try {
      // Try to find in developer profiles first
      let profile = await Profile.findById(req.params.profileId);

      if (profile) {
        // It's a developer profile
        profile.verificationRequested = false;
        await profile.save();
        return res.json({ message: "Developer verification rejected" });
      }

      // Try to find in business profiles
      profile = await BusinessProfile.findById(req.params.profileId);

      if (profile) {
        // It's a business profile
        profile.verificationRequested = false;
        await profile.save();
        return res.json({ message: "Business verification rejected" });
      }

      return res.status(404).json({ message: "Profile not found" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
);

// Get detailed profile information
router.get("/profile/:profileId", auth, adminAuth, async (req, res) => {
  try {
    // Try to find in developer profiles first
    let profile = await Profile.findById(req.params.profileId)
      .populate("userId", "name email")
      .lean()
      .exec();

    if (profile) {
      return res.json({
        type: "developer",
        user: profile.userId,
        profile: {
          _id: profile._id,
          skills: profile.skills,
          experience: profile.experience,
          portfolio: profile.portfolio,
          bio: profile.bio,
          location: profile.location,
          verified: profile.verified,
          verificationRequested: profile.verificationRequested,
          createdAt: profile.createdAt?.toISOString(),
        },
      });
    }

    // Try to find in business profiles
    profile = await BusinessProfile.findById(req.params.profileId)
      .populate("user", "name email")
      .lean()
      .exec();

    if (profile) {
      return res.json({
        type: "business",
        user: profile.user,
        profile: {
          _id: profile._id,
          companyName: profile.companyName,
          companySize: profile.companySize,
          industry: profile.industry,
          location: profile.location,
          description: profile.description,
          benefits: profile.benefits,
          culture: profile.culture,
          website: profile.website,
          foundedYear: profile.foundedYear,
          socialLinks: profile.socialLinks,
          verified: profile.verified,
          verificationRequested: profile.verificationRequested,
          createdAt: profile.createdAt?.toISOString(),
        },
      });
    }

    return res.status(404).json({ message: "Profile not found" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
