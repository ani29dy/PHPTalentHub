const nodemailer = require("nodemailer");

// Create standard transporter using Gmail
// Gmail typically requires an App Password for this to work (EMAIL_PASS)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"PHP Talent Hub" <phptalenthub@gmail.com>',
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    // If we're developing locally and haven't set up credentials, log it
    if (!process.env.EMAIL_USER) {
       console.log("\n=========================================");
       console.log("💌 MOCK EMAIL INTERCEPTED (NO SMTP CONFIGURED)");
       console.log(`To: ${options.email}`);
       console.log(`Subject: ${options.subject}`);
       console.log("Previewing HTML output:");
       console.log(options.html?.replace(/<[^>]*>?/gm, '')); 
       console.log("=========================================\n");
       return true; 
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent via Gmail: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

/**
 * Sends a professional verification email to new users
 */
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL || 'https://phptalenthub.onrender.com'}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg; color: #1a202c;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4c51bf; margin: 0;">PHP Talent Hub</h1>
        <p style="color: #718096; margin: 5px 0;">Professional Networking for PHP Experts</p>
      </div>
      
      <div style="background-color: #f7fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
        <h2 style="margin-top: 0; color: #2d3748;">Activate Your Account</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Thank you for joining PHP Talent Hub! To complete your registration and start connecting with the best PHP talent and businesses, please verify your email address below:</p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${verificationUrl}" style="background-color: #4c51bf; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        
        <p style="font-size: 14px; color: #718096;">If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 13px; color: #4a5568; word-break: break-all;">${verificationUrl}</p>
      </div>
      
      <div style="text-align: center; font-size: 12px; color: #a0aec0;">
        <p>This invitation was sent to ${user.email}. If you didn't create an account, please ignore this email.</p>
        <p>&copy; 2026 PHP Talent Hub. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmail({
    email: user.email,
    subject: "Verify your PHP Talent Hub Account",
    html,
  });
};

module.exports = { sendEmail, sendVerificationEmail };
