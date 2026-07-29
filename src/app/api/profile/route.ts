
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    try {
        const user = await User.findById(session.user.id).populate('skills');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching user profile', error }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, avatar, bio, location, availability } = await req.json();

    await connectDB();

    try {
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        user.name = name || user.name;
        user.avatar = avatar || user.avatar;
        user.bio = bio || user.bio;
        user.location = location || user.location;
        user.availability = availability || user.availability;

        await user.save();

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating user profile', error }, { status: 500 });
    }
}
