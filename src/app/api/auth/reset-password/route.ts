import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { validatePassword } from '@/lib/sanitize';
import { sendEmail, emailTemplates } from '@/lib/email';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return createApiErrorResponse('Token and password are required', 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return createApiErrorResponse(passwordValidation.error || 'Invalid password', 400);
    }

    await connectDB();

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return createApiErrorResponse('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      const emailContent = emailTemplates.passwordResetSuccess(user.name);
      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailError) {
      logError(emailError, { userId: user._id, action: 'send_password_reset_confirmation' });
      // Don't fail the request if email fails
    }

    return createApiResponse({
      message: 'Password has been reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    logError(error, { action: 'reset_password' });
    return createApiErrorResponse('Failed to reset password');
  }
}

