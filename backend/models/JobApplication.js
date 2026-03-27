const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  developerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  developerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  message: {
    type: String,
    trim: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate applications
jobApplicationSchema.index({ jobId: 1, developerId: 1 }, { unique: true });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
