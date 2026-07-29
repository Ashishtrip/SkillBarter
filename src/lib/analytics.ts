import connectDB from '@/lib/mongodb';
import Exchange from '@/models/Exchange';
import User from '@/models/User';
import Skill from '@/models/Skill';
import Group from '@/models/Group';
import Content from '@/models/Content';

export interface AnalyticsData {
  totalUsers: number;
  totalExchanges: number;
  completedExchanges: number;
  totalGroups: number;
  totalContent: number;
  popularSkills: Array<{
    skill: string;
    count: number;
    category: string;
  }>;
  monthlyStats: Array<{
    month: string;
    users: number;
    exchanges: number;
  }>;
  topUsers: Array<{
    name: string;
    exchanges: number;
    rating: number;
  }>;
}

export async function getAnalytics(timeframe: 'week' | 'month' | 'year' = 'month'): Promise<AnalyticsData> {
  try {
    await connectDB();

    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Basic counts
    const [
      totalUsers,
      totalExchanges,
      completedExchanges,
      totalGroups,
      totalContent,
    ] = await Promise.all([
      User.countDocuments(),
      Exchange.countDocuments(),
      Exchange.countDocuments({ status: 'completed' }),
      Group.countDocuments(),
      Content.countDocuments({ status: 'published' }),
    ]);

    // Popular skills
    const skillStats = await Exchange.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$skills' },
      { $lookup: {
        from: 'skills',
        localField: 'skills.offered',
        foreignField: '_id',
        as: 'offeredSkill'
      }},
      { $lookup: {
        from: 'skills',
        localField: 'skills.requested',
        foreignField: '_id',
        as: 'requestedSkill'
      }},
      { $group: {
        _id: null,
        skills: { $push: { $concatArrays: ['$offeredSkill', '$requestedSkill'] } }
      }},
      { $unwind: '$skills' },
      { $unwind: '$skills' },
      { $group: {
        _id: '$skills._id',
        name: { $first: '$skills.name' },
        category: { $first: '$skills.category' },
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const popularSkills = skillStats.map((stat: any) => ({
      skill: stat.name,
      count: stat.count,
      category: stat.category,
    }));

    // Monthly stats
    const monthlyStats = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        users: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const monthlyStatsWithExchanges = await Promise.all(
      monthlyStats.map(async (stat: any) => {
        const monthStart = new Date(stat._id.year, stat._id.month - 1, 1);
        const monthEnd = new Date(stat._id.year, stat._id.month, 0);
        
        const exchanges = await Exchange.countDocuments({
          createdAt: { $gte: monthStart, $lte: monthEnd }
        });

        return {
          month: `${stat._id.year}-${stat._id.month.toString().padStart(2, '0')}`,
          users: stat.users,
          exchanges,
        };
      })
    );

    // Top users
    const topUsers = await User.aggregate([
      { $lookup: {
        from: 'exchanges',
        localField: '_id',
        foreignField: 'participants',
        as: 'exchanges'
      }},
      { $match: { 'exchanges.status': 'completed' } },
      { $project: {
        name: 1,
        averageRating: 1,
        exchangeCount: { $size: '$exchanges' }
      }},
      { $sort: { exchangeCount: -1, averageRating: -1 } },
      { $limit: 10 }
    ]);

    return {
      totalUsers,
      totalExchanges,
      completedExchanges,
      totalGroups,
      totalContent,
      popularSkills,
      monthlyStats: monthlyStatsWithExchanges,
      topUsers: topUsers.map((user: any) => ({
        name: user.name,
        exchanges: user.exchangeCount,
        rating: user.averageRating || 0,
      })),
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
}

export async function getSkillAnalytics(skillId: string) {
  try {
    await connectDB();

    const skill = await Skill.findById(skillId);
    if (!skill) {
      throw new Error('Skill not found');
    }

    const exchanges = await Exchange.find({
      $or: [
        { 'skills.offered': skillId },
        { 'skills.requested': skillId }
      ]
    }).populate('participants', 'name');

    const completedExchanges = exchanges.filter(ex => ex.status === 'completed');
    const activeExchanges = exchanges.filter(ex => ex.status === 'active');

    return {
      skill: {
        name: skill.name,
        category: skill.category,
        level: skill.level,
      },
      totalExchanges: exchanges.length,
      completedExchanges: completedExchanges.length,
      activeExchanges: activeExchanges.length,
      completionRate: exchanges.length > 0 ? (completedExchanges.length / exchanges.length) * 100 : 0,
      participants: exchanges.reduce((acc: any[], ex: any) => {
        ex.participants.forEach((participant: any) => {
          if (!acc.find((p: any) => p._id.toString() === participant._id.toString())) {
            acc.push(participant);
          }
        });
        return acc;
      }, []),
    };
  } catch (error) {
    console.error('Error getting skill analytics:', error);
    throw error;
  }
}

export async function getUserAnalytics(userId: string) {
  try {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const exchanges = await Exchange.find({ participants: userId });
    const completedExchanges = exchanges.filter((ex: any) => ex.status === 'completed');
    const activeExchanges = exchanges.filter((ex: any) => ex.status === 'active');

    const groups = await Group.find({ members: userId });
    const content = await Content.find({ author: userId });

    return {
      user: {
        name: user.name,
        email: user.email,
        level: user.level,
        points: user.points,
        averageRating: user.averageRating,
        totalReviews: user.totalReviews,
      },
      exchanges: {
        total: exchanges.length,
        completed: completedExchanges.length,
        active: activeExchanges.length,
        completionRate: exchanges.length > 0 ? (completedExchanges.length / exchanges.length) * 100 : 0,
      },
      groups: groups.length,
      content: content.length,
      skills: {
        teaching: user.skillsToTeach.length,
        learning: user.skillsToLearn.length,
      },
    };
  } catch (error) {
    console.error('Error getting user analytics:', error);
    throw error;
  }
}
