import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Skill from '@/models/Skill';
import { sanitizeSearchQuery } from '@/lib/sanitize';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const location = searchParams.get('location');
    const skillType = searchParams.get('skillType'); // 'teach' or 'learn'
    const minRating = searchParams.get('minRating');

    await connectDB();

    let pipeline: any[] = [];

    // Skill search using basic query (not Atlas $search)
    const matchingSkills: any[] = [];
    if (search) {
      const sanitizedSearch = sanitizeSearchQuery(search);
      if (sanitizedSearch) {
        const skillMatches = await Skill.find({
          $or: [
            { name: { $regex: sanitizedSearch, $options: 'i' } },
            { description: { $regex: sanitizedSearch, $options: 'i' } },
            { tags: { $regex: sanitizedSearch, $options: 'i' } }
          ]
        }).limit(50);
        matchingSkills.push(...skillMatches);
      }
    }

    if (category) {
      const categoryMatches = await Skill.find({ category }).limit(50);
      matchingSkills.push(...categoryMatches);
    }

    if (level) {
      const levelMatches = await Skill.find({ level }).limit(50);
      matchingSkills.push(...levelMatches);
    }

    const skillIds = [...new Set(matchingSkills.map(s => s._id.toString()))].map(id => new mongoose.Types.ObjectId(id));

    // Build user search filter
    let userFilter: any = {};

    // Exclude current user from search results
    if (currentUserId) {
      userFilter._id = { $ne: new mongoose.Types.ObjectId(currentUserId) };
    }

    // Text search on user name, bio, email
    if (search) {
      const sanitizedSearch = sanitizeSearchQuery(search);
      if (sanitizedSearch) {
        userFilter.$or = [
          { name: { $regex: sanitizedSearch, $options: 'i' } },
          { bio: { $regex: sanitizedSearch, $options: 'i' } },
          { email: { $regex: sanitizedSearch, $options: 'i' } }
        ];
      }
    }

    // Location filter
    if (location) {
      userFilter.location = { $regex: location, $options: 'i' };
    }

    // Rating filter
    if (minRating) {
      userFilter.averageRating = { $gte: parseFloat(minRating) };
    }

    // Skill-based filter
    if (skillIds.length > 0) {
      if (skillType === 'teach') {
        userFilter.skillsToTeach = { $in: skillIds };
      } else if (skillType === 'learn') {
        userFilter.skillsToLearn = { $in: skillIds };
      } else {
        userFilter.$or = [
          { skillsToTeach: { $in: skillIds } },
          { skillsToLearn: { $in: skillIds } }
        ];
      }
    } else if (skillType) {
      // Apply skill type filter even without search
      if (skillType === 'teach') {
        userFilter.skillsToTeach = { $exists: true, $ne: [] };
      } else if (skillType === 'learn') {
        userFilter.skillsToLearn = { $exists: true, $ne: [] };
      }
    }

    // Execute user query
    const users = await User.find(userFilter)
      .populate('skillsToTeach')
      .populate('skillsToLearn')
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(20)
      .select('-password');

    return createApiResponse(users);
  } catch (error) {
    logError(error, { action: 'search_users' });
    return createApiErrorResponse('Failed to search users');
  }
}
