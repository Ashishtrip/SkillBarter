import connectDB from './mongodb';
import User from '@/models/User';
import Badge from '@/models/Badge';
import UserBadge from '@/models/UserBadge';
import Exchange from '@/models/Exchange';
import GroupEvent from '@/models/GroupEvent';
import GroupPost from '@/models/GroupPost';

export const checkAndAwardBadges = async (userId: string): Promise<void> => {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    return;
  }

  const badges = await Badge.find({ isActive: true });

  for (const badge of badges) {
    const hasBadge = await UserBadge.findOne({ user: userId, badge: badge._id });
    if (hasBadge) {
      continue;
    }

    let shouldAward = false;

    switch (badge.criteria.type) {
      case 'login_streak':
        if (user.loginStreak && user.loginStreak >= badge.criteria.value) {
          shouldAward = true;
        }
        break;
      case 'exchange_streak':
        if (user.exchangeStreak && user.exchangeStreak >= badge.criteria.value) {
          shouldAward = true;
        }
        break;
      case 'exchanges_completed':
        const completedExchanges = await Exchange.countDocuments({
          participants: userId,
          status: 'completed',
        });
        if (completedExchanges >= badge.criteria.value) {
          shouldAward = true;
        }
        break;
      case 'exchanges_taught':
        const taughtExchanges = await Exchange.countDocuments({
          'skills.offered': { $in: user.skillsToTeach },
          participants: userId,
          status: 'completed',
        });
        if (taughtExchanges >= badge.criteria.value) {
          shouldAward = true;
        }
        break;
      case 'exchanges_learned':
        const learnedExchanges = await Exchange.countDocuments({
          'skills.requested': { $in: user.skillsToLearn },
          participants: userId,
          status: 'completed',
        });
        if (learnedExchanges >= badge.criteria.value) {
          shouldAward = true;
        }
        break;
      case 'group_events':
        const groupEvents = await GroupEvent.countDocuments({
          participants: userId,
        });
        if (groupEvents >= badge.criteria.value) {
          shouldAward = true;
        }
        break;
      case 'posts_created':
        const postsCreated = await GroupPost.countDocuments({
          author: userId,
        });
        if (postsCreated >= badge.criteria.value) {
          shouldAward = true;
        }
        break;
      case 'upvotes_received':
        const posts = await GroupPost.find({ author: userId });
        const upvotes = posts.reduce((acc, post) => acc + post.upvotes.length, 0);
        if (upvotes >= badge.criteria.value) {
          shouldAward = true;
        }
        break;
      case 'rating_achieved':
        if (user.averageRating >= badge.criteria.value) {
          shouldAward = true;
        }
        break;
    }

    if (shouldAward) {
      await UserBadge.create({
        user: userId,
        badge: badge._id,
        awardedAt: new Date(),
      });
    }
  }
};