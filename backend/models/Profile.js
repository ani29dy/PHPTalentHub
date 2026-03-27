const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  skills: [
    {
      type: String,
      trim: true,
    },
  ],
  languages: [
    {
      type: String,
      trim: true,
    },
  ],
  experience: {
    type: String,
    enum: ["0-1 years", "1-3 years", "3-5 years", "5+ years"],
    default: "0-1 years",
  },
  location: {
    type: String,
    trim: true,
  },
  portfolio: {
    type: String,
    trim: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationRequested: {
    type: Boolean,
    default: false,
  },
  subscriptionType: {
    type: String,
    enum: ["free", "monthly", "yearly"],
    default: "free",
  },
  subscriptionExpiresAt: {
    type: Date,
  },
  profileImage: {
    type: String, // URL from Cloudinary
  },
  bio: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
