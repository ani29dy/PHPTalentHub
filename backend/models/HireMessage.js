const mongoose = require("mongoose");

const hireMessageSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    default:
      "I'm interested in hiring you for a PHP development position. Please contact me to discuss the opportunity.",
  },
  status: {
    type: String,
    enum: ["unread", "read", "responded"],
    default: "unread",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("HireMessage", hireMessageSchema);
