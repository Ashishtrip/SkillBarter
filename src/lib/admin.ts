/**
 * Admin utilities and helpers
 */

import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalExchanges: number;
  completedExchanges: number;
  pendingReports: number;
  bannedUsers: number;
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    await connectDB();
    const user = await User.findById(userId).select('role');
    return user?.role === 'admin' || user?.role === 'moderator';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get admin statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
  try {
    await connectDB();
    
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ emailVerified: true }),
      User.countDocuments({ role: 'banned' }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalExchanges: 0, // TODO: Import Exchange model and return actual counts
      completedExchanges: 0,
      pendingReports: 0, // TODO: Import Report model and return actual counts
      bannedUsers,
    };
  } catch (error) {
    console.error('Error getting admin stats:', error);
    throw error;
  }
}

