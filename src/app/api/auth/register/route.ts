import { NextRequest } from 'next/server';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return createApiErrorResponse('Missing required fields', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return createApiErrorResponse('User with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    return createApiResponse(user, 201);
  } catch (error) {
    return createApiErrorResponse('Failed to create user', 500);
  }
}

