
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { userId, method } = await req.json();

  if (!userId || !method) {
    return NextResponse.json({ message: 'Missing userId or method' }, { status: 400 });
  }

  await connectDB();

  try {
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    user.identityVerified = true;
    user.identityVerificationMethod = method;
    await user.save();

    return NextResponse.json({ message: 'User verified successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error verifying user', error }, { status: 500 });
  }
}
