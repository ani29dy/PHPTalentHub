const mongoose = require("mongoose");

const businessProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  companySize: {
    type: String,
    enum: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
    required: true,
  },
  industry: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  benefits: [
    {
      type: String,
      trim: true,
    },
  ],
  culture: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationRequested: {
    type: Boolean,
    default: false,
  },
  logo: {
    type: String, // URL from Cloudinary
  },
  founded: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear(),
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("BusinessProfile", businessProfileSchema);
