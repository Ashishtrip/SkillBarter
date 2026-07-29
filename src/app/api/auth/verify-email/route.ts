import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail, emailTemplates } from '@/lib/email';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return createApiErrorResponse('Verification token is required', 400);
    }

    await connectDB();

    // Find user with valid verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return createApiErrorResponse('Invalid or expired verification token', 400);
    }

    // Verify email
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      const emailContent = emailTemplates.emailVerified(user.name);
      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailError) {
      logError(emailError, { userId: user._id, action: 'send_email_verification_confirmation' });
    }

    return createApiResponse({
      message: 'Email verified successfully',
    });
  } catch (error) {
    logError(error, { action: 'verify_email' });
    return createApiErrorResponse('Failed to verify email');
  }
}

