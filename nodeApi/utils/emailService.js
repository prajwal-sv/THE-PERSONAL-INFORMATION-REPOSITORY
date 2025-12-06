import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Personal Info API" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
          <p>You requested a password reset for your Personal Information Repository account.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">Your OTP code is:</p>
            <h1 style="margin: 10px 0; color: #4f46e5; letter-spacing: 5px;">${otp}</h1>
            <p style="margin: 0; font-size: 12px;">This code will expire in 10 minutes</p>
          </div>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p style="font-size: 12px; color: #6b7280; margin-top: 30px; text-align: center;">
            &copy; 2025 Personal Information Repository API
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};