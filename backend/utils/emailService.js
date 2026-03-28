const nodemailer = require("nodemailer");

// Create standard transporter using Gmail
// Gmail typically requires an App Password for this to work (EMAIL_PASS)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // Output SMTP traffic to console
  logger: true // Log information to console
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"PHP Talent Hub" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    // If we're developing locally and haven't set up credentials, log it
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
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
    console.error("❌ Error sending email via SMTP:");
    console.error("Message:", error.message);
    if (error.code) console.error("Code:", error.code);
    if (error.command) console.error("Command:", error.command);
    return false;
  }
};

/**
 * Sends a professional verification email to new users
 */
const sendVerificationEmail = async (user, token) => {
  // Sanitize CLIENT_URL (remove trailing slash if present)
  const baseUrl = (process.env.CLIENT_URL || 'https://phptalenthub.onrender.com').replace(/\/$/, "");
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1a202c;">
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

/**
 * Sends a notification email to a developer when a recruiter is interested in hiring them
 */
const sendHiringInterestEmail = async (developer, recruiter, recruiterProfile) => {
  const baseUrl = (process.env.CLIENT_URL || 'https://phptalenthub.onrender.com').replace(/\/$/, "");
  const dashboardUrl = `${baseUrl}/developer-dashboard`;
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1a202c; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <!-- Header -->
      <div style="background-color: #4c51bf; padding: 25px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: -0.5px;">PHP Talent Hub</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Professional Hiring Inquiry</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 30px;">
        <h2 style="margin-top: 0; color: #2d3748; font-size: 20px;">Great News, ${developer.name}!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
          A recruiter has just expressed interest in your profile on PHP Talent Hub. They are impressed with your experience and would like to discuss potential opportunities with you.
        </p>

        <!-- Recruiter Box -->
        <div style="background-color: #f8fafc; border: 1px solid #edf2f7; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            ${recruiterProfile.logo ? `<img src="${recruiterProfile.logo}" alt="${recruiterProfile.companyName}" style="width: 50px; height: 50px; border-radius: 8px; margin-right: 15px; object-fit: cover;">` : ''}
            <div>
              <h3 style="margin: 0; color: #2d3748; font-size: 18px;">${recruiter.name}</h3>
              <p style="margin: 2px 0 0 0; color: #718096; font-size: 14px;">${recruiterProfile.companyName}</p>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 5px;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Industry:</strong> ${recruiterProfile.industry}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Location:</strong> ${recruiterProfile.location}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Contact Email:</strong> <a href="mailto:${recruiter.email}" style="color: #4c51bf; text-decoration: none; font-weight: bold;">${recruiter.email}</a></p>
          </div>
        </div>

        <p style="font-size: 14px; text-align: center; color: #718096; margin-bottom: 25px;">
          You can reply directly to the recruiter's email mentioned above or view more details on your dashboard.
        </p>
        
        <div style="text-align: center;">
          <a href="${dashboardUrl}" style="background-color: #4c51bf; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.2s;">View My Dashboard</a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #edf2f7;">
        <p style="margin: 0; font-size: 12px; color: #a0aec0;">
          &copy; 2026 PHP Talent Hub. Empowering the PHP community.<br>
          You received this because you are a registered developer.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    email: developer.email,
    subject: `💼 Hiring Interest: ${recruiter.name} from ${recruiterProfile.companyName}`,
    html,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendHiringInterestEmail };
