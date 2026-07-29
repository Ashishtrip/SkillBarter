'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Target, Users, MessageSquare, Calendar, Award } from 'lucide-react';

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'exchange' | 'community' | 'achievement' | 'special';
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface UserBadge {
  _id: string;
  badge: Badge;
  earnedAt: string;
  progress: number;
  isDisplayed: boolean;
}

interface BadgesProps {
  userId: string;
  showAll?: boolean;
}

export function Badges({ userId, showAll = false }: BadgesProps) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserBadges();
  }, [userId]);

  const fetchUserBadges = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/badges`);
      if (response.ok) {
        const data = await response.json();
        setBadges(showAll ? data : data.filter((badge: UserBadge) => badge.isDisplayed));
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600 bg-gray-100';
      case 'uncommon':
        return 'text-green-600 bg-green-100';
      case 'rare':
        return 'text-blue-600 bg-blue-100';
      case 'epic':
        return 'text-purple-600 bg-purple-100';
      case 'legendary':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exchange':
        return <Target className="w-4 h-4" />;
      case 'community':
        return <Users className="w-4 h-4" />;
      case 'achievement':
        return <Trophy className="w-4 h-4" />;
      case 'special':
        return <Award className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 bg-primary-600 rounded-full animate-pulse" />
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">No badges yet</h3>
        <p className="text-secondary-600">Complete exchanges and participate in the community to earn badges!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-secondary-900">Badges & Achievements</h3>
        <span className="text-sm text-secondary-600">{badges.length} earned</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((userBadge) => (
          <div
            key={userBadge._id}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRarityColor(userBadge.badge.rarity)}`}>
                {getCategoryIcon(userBadge.badge.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-secondary-900 truncate">
                  {userBadge.badge.name}
                </h4>
                <p className="text-sm text-secondary-600 line-clamp-2">
                  {userBadge.badge.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(userBadge.badge.rarity)}`}>
                    {userBadge.badge.rarity}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-secondary-500">
                    <Zap className="w-3 h-3" />
                    <span>{userBadge.badge.points} pts</span>
                  </div>
                </div>
                {userBadge.progress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${userBadge.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-secondary-500 mt-1">
                      {userBadge.progress.toFixed(0)}% complete
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
