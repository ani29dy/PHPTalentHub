const nodemailer = require("nodemailer");

// Create standard transporter
// You can define real credentials in your .env file
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || "testuser",
    pass: process.env.EMAIL_PASS || "testpass",
  },
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"PHP Talent Hub" <noreply@phptalenthub.com>',
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    // If we're developing locally and haven't set up SMTP, mock it out in the console
    if (!process.env.EMAIL_HOST) {
       console.log("\n=========================================");
       console.log("💌 MOCK EMAIL INTERCEPTED (NO SMTP CONFIGURED)");
       console.log(`To: ${options.email}`);
       console.log(`Subject: ${options.subject}`);
       console.log("Previewing HTML output:");
       console.log(options.html.replace(/<[^>]*>?/gm, '')); // Quick strip HTML for terminal
       console.log("=========================================\n");
       return true; 
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent via SMTP: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = { sendEmail };
