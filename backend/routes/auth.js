const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const BusinessProfile = require("../models/BusinessProfile");
const { auth } = require("../middleware/auth");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/emailService");

const {
  verifyEmailDomain,
  isDummyString,
  isGibberish,
  isJunkPrefix,
} = require("../utils/validation");
const { verifyEmailExistence } = require("../utils/emailVerify");

const router = express.Router();

// Register user
router.post(
  "/register",
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters")
      .custom((value) => {
        if (isDummyString(value) || /\d/.test(value)) {
          throw new Error(
            "Please enter a professional name (no dummy or numeric names)",
          );
        }
        return true;
      }),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address")
      .custom(async (value) => {
        // Basic validation - check for obvious issues
        if (isJunkPrefix(value) || isGibberish(value)) {
          throw new Error("Please use a valid, professional email address");
        }

        // Optional domain check (don't fail if it times out)
        try {
          const isValidDomain = await Promise.race([
            verifyEmailDomain(value),
            new Promise((resolve) => setTimeout(() => resolve(true), 3000)), // 3 second timeout
          ]);
          if (!isValidDomain) {
            console.warn(
              `Domain validation failed for ${value}, proceeding anyway`,
            );
          }
        } catch (error) {
          console.warn("Domain validation error:", error.message);
        }

        return true;
      }),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character"),
    body("role")
      .isIn(["developer", "business"])
      .withMessage("Invalid role selected"),

    // Optional Business Profile Validation (only if role is business and businessProfile exists)
    body("businessProfile")
      .if(
        (value, { req }) =>
          req.body.role === "business" && req.body.businessProfile,
      )
      .isObject()
      .withMessage("Business profile must be an object"),
    body("businessProfile.companyName")
      .if(
        (value, { req }) =>
          req.body.role === "business" && req.body.businessProfile,
      )
      .notEmpty()
      .withMessage("Company name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Company name must be between 2 and 100 characters"),
    body("businessProfile.companySize")
      .if(
        (value, { req }) =>
          req.body.role === "business" && req.body.businessProfile,
      )
      .isIn(["1-10", "11-50", "51-200", "201-1000", "1000+"])
      .withMessage("Please select a valid company size"),
    body("businessProfile.industry")
      .if(
        (value, { req }) =>
          req.body.role === "business" && req.body.businessProfile,
      )
      .notEmpty()
      .withMessage("Industry is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Industry must be between 2 and 50 characters"),
    body("businessProfile.location")
      .if(
        (value, { req }) =>
          req.body.role === "business" && req.body.businessProfile,
      )
      .notEmpty()
      .withMessage("Company location is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Location must be between 2 and 100 characters"),
    body("businessProfile.description")
      .if(
        (value, { req }) =>
          req.body.role === "business" && req.body.businessProfile,
      )
      .notEmpty()
      .withMessage("Company description is required")
      .isLength({ min: 10, max: 1000 })
      .withMessage("Description must be between 10 and 1000 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
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
        isVerified: false,
      });

      await user.save();

      // Create business profile if registering as business
      let newBusinessProfile = null;
      if (role === "business" && businessProfile) {
        newBusinessProfile = new BusinessProfile({
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
      const emailSent = await sendVerificationEmail(
        user,
        user.verificationToken,
      );

      // If email failed to send, roll back registration so the user can try again
      if (!emailSent) {
        console.error(`❌ Verification email failed for ${email}. Rolling back user creation.`);
        if (newBusinessProfile) {
          await BusinessProfile.findByIdAndDelete(newBusinessProfile._id);
        }
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
          message:
            "Registration failed: we could not send your verification email. Please check your email address and try again, or contact support.",
        });
      }

      res.status(201).json({
        message:
          "Registration successful! Please check your email to verify your account.",
        emailSent: true,
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
          message:
            "Please verify your email before logging in. Check your inbox (including spam).",
          unverified: true,
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
        message: "Invalid or expired verification token.",
      });
    }

    // Update user status
    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (err) {
    console.error("Verification Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error during verification. Please try again later.",
    });
  }
});

// Resend verification email
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "This account is already verified. Please log in." });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();

    // Send email
    const emailSent = await sendVerificationEmail(user, verificationToken);

    res.status(200).json({
      success: true,
      message:
        "Verification email resent successfully. Please check your inbox.",
      emailSent: !!emailSent,
    });
  } catch (err) {
    console.error("Resend Error:", err.message);
    res
      .status(500)
      .json({ message: "Server error during resend. Please try again later." });
  }
});

module.exports = router;
