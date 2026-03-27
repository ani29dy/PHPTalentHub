const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  skills: [
    {
      type: String,
      trim: true,
    },
  ],
  location: {
    type: String,
    trim: true,
  },
  salary: {
    type: String,
    trim: true,
  },
  jobType: {
    type: String,
    enum: ["full-time", "part-time", "contract", "freelance", "remote"],
    default: "full-time",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Job", jobSchema);

