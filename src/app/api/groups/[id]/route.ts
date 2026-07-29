
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    try {
        const group = await Group.findById(params.id)
            .populate('members', 'name email avatar')
            .populate('moderators', 'name email avatar')
            .populate('createdBy', 'name email avatar');

        if (!group) {
            return NextResponse.json({ message: 'Group not found' }, { status: 404 });
        }

        return NextResponse.json(group);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching group', error }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, category, tags, isPublic, maxMembers, rules } = await req.json();

    if (!name || !description || !category) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    try {
        const group = await Group.findById(params.id);

        if (!group) {
            return NextResponse.json({ message: 'Group not found' }, { status: 404 });
        }

        if (!group.moderators.some(m => m.toString() === session.user.id)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        group.name = name;
        group.description = description;
        group.category = category;
        group.tags = tags;
        group.isPublic = isPublic;
        group.maxMembers = maxMembers;
        group.rules = rules;

        await group.save();

        return NextResponse.json(group);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating group', error }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    try {
        const group = await Group.findById(params.id);

        if (!group) {
            return NextResponse.json({ message: 'Group not found' }, { status: 404 });
        }

        if (group.createdBy.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await group.deleteOne();

        return NextResponse.json({ message: 'Group deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting group', error }, { status: 500 });
    }
}
