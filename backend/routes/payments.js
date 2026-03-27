const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Profile = require("../models/Profile");
const { auth } = require("../middleware/auth");

const router = express.Router();

const getRazorpayInstance = () => {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
    });
};

router.post("/create-order", auth, async (req, res) => {
  try {
    const { plan } = req.body; // 'monthly' | 'yearly'
    // Razorpay uses sub-units (paise). 1 INR = 100 paise; 10 INR = 1000 paise
    const amount = plan === "yearly" ? 1000 : 100; 

    // If no actual keys are configured, return a mock order to enable local testing bypass
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "rzp_test_dummy") {
      return res.json({ 
        order: { id: "mock_order_" + Date.now() }, 
        key_id: "rzp_test_dummy" 
      });
    }

    const rzp = getRazorpayInstance();
    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${req.user.user.id.substring(0,8)}_${Date.now()}`
    };

    const order = await rzp.orders.create(options);
    res.json({ order, key_id: rzp.key_id }); // Return key_id so frontend can use it seamlessly
  } catch (err) {
    console.error("Order Creation Error:", err);
    res.status(500).json({ message: "Failed to create order. Ensure your razorpay keys are valid." });
  }
});

router.post("/verify", auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    
    // Signature validation
    if (process.env.RAZORPAY_KEY_SECRET) {
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }
    } else {
        console.log("Mocking positive verification for Local Development (Missing Secret Key)");
    }

    const profile = await Profile.findOne({ userId: req.user.user.id });
    if (!profile) return res.status(404).json({ message: "Developer Profile not found" });

    // Apply Premium
    const expiry = new Date();
    if (plan === "yearly") expiry.setDate(expiry.getDate() + 365);
    else expiry.setDate(expiry.getDate() + 30);

    profile.verified = true;
    profile.subscriptionType = plan;
    profile.subscriptionExpiresAt = expiry;
    profile.verificationRequested = false;

    await profile.save();
    
    res.json({ message: "Payment successful. Account verified!", profile });
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

module.exports = router;
