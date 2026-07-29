import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Badge from '@/models/Badge';

export async function POST() {
  await connectDB();

  const badges = [
    {
      name: 'Daily Visitor',
      description: 'Logged in for 3 consecutive days.',
      icon: '🥉',
      category: 'achievement',
      criteria: {
        type: 'login_streak',
        value: 3,
      },
      points: 10,
      rarity: 'common',
      isActive: true,
    },
    {
      name: 'Consistent Member',
      description: 'Logged in for 7 consecutive days.',
      icon: '🥈',
      category: 'achievement',
      criteria: {
        type: 'login_streak',
        value: 7,
      },
      points: 25,
      rarity: 'uncommon',
      isActive: true,
    },
    {
        name: 'Dedicated User',
        description: 'Logged in for 30 consecutive days.',
        icon: '🥇',
        category: 'achievement',
        criteria: {
            type: 'login_streak',
            value: 30,
        },
        points: 100,
        rarity: 'rare',
        isActive: true,
    },
    {
        name: 'Skill Sharer',
        description: 'Completed 2 exchanges in a week.',
        icon: '🤝',
        category: 'exchange',
        criteria: {
            type: 'exchange_streak',
            value: 2,
            timeframe: 'weekly',
        },
        points: 20,
        rarity: 'common',
        isActive: true,
    },
  ];

  try {
    await Badge.deleteMany({});
    await Badge.insertMany(badges);
    return NextResponse.json({ message: 'Badges seeded successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error seeding badges', error }, { status: 500 });
  }
}