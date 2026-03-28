const axios = require("axios");

/**
 * Calls Abstract API to verify if an email address literally exists and is deliverable.
 * This catches fake accounts at real domains (e.g., faslkdfj@gmail.com).
 */
const verifyEmailExistence = async (email) => {
  const apiKey = process.env.ABSTRACT_EMAIL_API_KEY || process.env.ABSTRACT_API_KEY;
  
  // If no API key is set, we skip this deep check (graceful fallback)
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.warn("Abstract API key not found. Skipping deep existence check.");
    return true; 
  }

  try {
    const response = await axios.get(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`
    );

    const { deliverability, is_valid_format, is_disposable_email } = response.data;

    // We reject if the email is undeliverable or disposable
    if (deliverability === "UNDELIVERABLE") {
      return false;
    }

    if (is_disposable_email?.value === true) {
      return false;
    }

    return is_valid_format?.value === true;
  } catch (error) {
    console.error("Abstract API verification failed:", error.message);
    // If the API fails (e.g. rate limit), we allow the user through to avoid blocking real signups
    return true;
  }
};

module.exports = { verifyEmailExistence };
