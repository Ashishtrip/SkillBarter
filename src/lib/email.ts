/**
 * Email service integration
 * Supports multiple email providers (Nodemailer, SendGrid, Resend)
 */

import crypto from 'crypto';
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

 

export interface EmailService {

  sendEmail(options: EmailOptions): Promise<void>;

}

 

// ... (existing code)
// Simple email service using console.log for development
class DevelopmentEmailService implements EmailService {
  async sendEmail(options: EmailOptions): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== EMAIL (Development) ===');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Body:', options.text || options.html);
      console.log('==========================');
    }
  }
}

// SendGrid email service for production
class SendGridEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      ...options,
    };
    await this.transporter.sendMail(mailOptions);
  }
}

const emailService: EmailService =
  process.env.NODE_ENV === 'production'
    ? new SendGridEmailService()
    : new DevelopmentEmailService();

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await emailService.sendEmail(options);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Email templates
 */
export const emailTemplates = {
  welcome: (name: string, verificationLink: string) => ({
    subject: 'Welcome to SkillBarter!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0ea5e9;">Welcome to SkillBarter, ${name}!</h1>
          <p>Thank you for joining our community of skill exchangers.</p>
          <p>To get started, please verify your email address by clicking the link below:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
        </body>
      </html>
    `,
    text: `Welcome to SkillBarter, ${name}!\n\nPlease verify your email address by visiting: ${verificationLink}\n\nThis link will expire in 24 hours.`,
  }),

  passwordReset: (name: string, resetLink: string) => ({
    subject: 'Reset Your SkillBarter Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0ea5e9;">Password Reset Request</h1>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Click the link below to create a new password:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetLink}</p>
          <p>This link will expire in 1 hour.</p>
          <p><strong>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">For security reasons, this link can only be used once.</p>
        </body>
      </html>
    `,
    text: `Hello ${name},\n\nReset your password by visiting: ${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
  }),

  passwordResetSuccess: (name: string) => ({
    subject: 'Your Password Has Been Reset',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981;">Password Reset Successful</h1>
          <p>Hello ${name},</p>
          <p>Your password has been successfully reset.</p>
          <p>If you didn't make this change, please contact us immediately.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated notification.</p>
        </body>
      </html>
    `,
    text: `Hello ${name},\n\nYour password has been successfully reset.\n\nIf you didn't make this change, please contact us immediately.`,
  }),

  emailVerified: (name: string) => ({
    subject: 'Email Verified Successfully',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981;">Email Verified!</h1>
          <p>Hello ${name},</p>
          <p>Your email address has been successfully verified. You can now enjoy all features of SkillBarter!</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Get Started
            </a>
          </p>
        </body>
      </html>
    `,
    text: `Hello ${name},\n\nYour email address has been successfully verified. You can now enjoy all features of SkillBarter!`,
  }),
};

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

