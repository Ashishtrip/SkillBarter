
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Skill from '@/models/Skill';
import User from '@/models/User';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    try {
        const skill = await Skill.findById(params.id).populate('createdBy', 'name email avatar');

        if (!skill) {
            return NextResponse.json({ message: 'Skill not found' }, { status: 404 });
        }

        return NextResponse.json(skill);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching skill', error }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, category, level, description, tags } = await req.json();

    if (!name || !category || !level) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    try {
        const skill = await Skill.findById(params.id);

        if (!skill) {
            return NextResponse.json({ message: 'Skill not found' }, { status: 404 });
        }

        if (skill.createdBy.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        skill.name = name;
        skill.category = category;
        skill.level = level;
        skill.description = description;
        skill.tags = tags;

        await skill.save();

        return NextResponse.json(skill);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating skill', error }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    try {
        const skill = await Skill.findById(params.id);

        if (!skill) {
            return NextResponse.json({ message: 'Skill not found' }, { status: 404 });
        }

        if (skill.createdBy.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await skill.deleteOne();

        return NextResponse.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting skill', error }, { status: 500 });
    }
}
