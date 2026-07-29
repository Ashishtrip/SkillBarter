'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  Calendar, 
  MessageSquare, 
  Star,
  Tag,
  Globe,
  Lock
} from 'lucide-react';
import { Group, SkillCategory } from '@/types';

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const categories: SkillCategory[] = [
    'tech', 'music', 'languages', 'academics', 'management', 
    'arts', 'sports', 'cooking', 'crafts', 'other'
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchGroups();
    }
  }, [session, status, router, pagination?.page, searchTerm, selectedCategory]);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', (pagination?.page ?? 1).toString());
      params.append('limit', (pagination?.limit ?? 10).toString());
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/groups?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setGroups(Array.isArray(data.groups) ? data.groups : []);
        setPagination(data.pagination ?? { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchGroups();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh groups list
        fetchGroups();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh groups list
        fetchGroups();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group');
    }
  };

  const isMember = (group: Group) => {
    return group.members?.some((member: any) => member._id === session?.user?.id);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Groups & Communities</h1>
        <p className="text-secondary-600">Join groups to connect with like-minded learners and teachers</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field pl-10 w-full"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={handleSearch}
            className="btn-primary px-8"
          >
            Search
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-secondary-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | '')}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900">{group.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-secondary-600">
                    {group.isPublic ? (
                      <Globe className="w-3 h-3" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                    <span>{group.category}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-secondary-600 mb-4 line-clamp-3">
              {group.description}
            </p>

            {group.tags && group.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {group.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {group.tags.length > 3 && (
                  <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded-full">
                    +{group.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-secondary-600 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{group.members?.length || 0} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{group.posts?.length || 0} posts</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {isMember(group) ? (
                <button
                  onClick={() => leaveGroup(group._id)}
                  className="flex-1 btn-outline text-sm py-2"
                >
                  Leave Group
                </button>
              ) : (
                <button
                  onClick={() => joinGroup(group._id)}
                  className="flex-1 btn-primary text-sm py-2"
                >
                  Join Group
                </button>
              )}
              <button className="btn-outline text-sm py-2 px-3">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="flex items-center px-4 py-2 text-sm text-secondary-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Group Button */}
      <div className="fixed bottom-6 right-6">
        <button className="btn-primary rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
