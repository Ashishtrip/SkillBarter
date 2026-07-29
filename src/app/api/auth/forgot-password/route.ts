import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sanitizeEmail } from '@/lib/sanitize';
import { generateToken, sendEmail, emailTemplates } from '@/lib/email';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return createApiErrorResponse('Email is required', 400);
    }

    let sanitizedEmail: string;
    try {
      sanitizedEmail = sanitizeEmail(email);
    } catch (error) {
      return createApiErrorResponse('Invalid email format', 400);
    }

    await connectDB();

    const user = await User.findOne({ email: sanitizedEmail });
    
    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return createApiResponse({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

    // Save reset token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send password reset email
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    const emailContent = emailTemplates.passwordReset(user.name, resetLink);

    try {
      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailError) {
      logError(emailError, { userId: user._id, action: 'send_password_reset_email' });
      // Don't fail the request if email fails, but log it
    }

    return createApiResponse({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    logError(error, { action: 'forgot_password' });
    return createApiErrorResponse('Failed to process password reset request');
  }
}

