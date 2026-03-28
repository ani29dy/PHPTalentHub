const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const BusinessProfile = require("../models/BusinessProfile");
const { auth } = require("../middleware/auth");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/emailService");

const router = express.Router();

// Register user
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["developer", "business", "admin"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, businessProfile } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        verificationToken: crypto.randomBytes(32).toString("hex"),
        isVerified: false
      });

      await user.save();

      // Create business profile if registering as business
      if (role === "business" && businessProfile) {
        const newBusinessProfile = new BusinessProfile({
          user: user._id,
          ...businessProfile,
          verified: false,
          verificationRequested: false,
        });
        await newBusinessProfile.save();

        // Update user with business profile reference
        user.businessProfile = newBusinessProfile._id;
        await user.save();
      }

      // Send Verification Email
      const emailSent = await sendVerificationEmail(user, user.verificationToken);

      res.status(201).json({
        message: "Registration successful! Please check your email to verify your account.",
        emailSent: !!emailSent
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
);

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(401).json({ 
          message: "Please verify your email before logging in. Check your inbox (including spam).",
          unverified: true 
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "7d" },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
        },
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
);

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Verify email token
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired verification token." 
      });
    }

    // Update user status
    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Email verified successfully! You can now log in." 
    });
  } catch (err) {
    console.error("Verification Error:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error during verification. Please try again later." 
    });
  }
});

module.exports = router;
