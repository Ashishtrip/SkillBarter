'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  MessageSquare, 
  Globe, 
  Lock,
  ArrowRight,
  Sparkles
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-secondary text-sm font-medium">Loading communities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background py-8">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                Special Interest Hubs
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
              Exchange Communities
            </h1>
            <p className="text-secondary text-sm sm:text-base mt-1">
              Join focused cohorts and trade insights with peers in your discipline.
            </p>
          </div>

          <button
            onClick={() => alert('Group creation will open shortly!')}
            className="btn-primary flex items-center gap-2 self-start md:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Community</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-secondary/60" />
              </div>
              <input
                type="text"
                placeholder="Search by topic, discipline, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-xs font-semibold text-on-surface transition-all"
            >
              <Filter className="w-4 h-4 text-secondary" />
              <span>{showFilters ? 'Hide Categories' : 'Filter by Domain'}</span>
            </button>

            <button
              onClick={handleSearch}
              className="btn-primary text-xs px-6 py-2.5"
            >
              Search
            </button>
          </div>

          {/* Collapsible Filter Pills */}
          {showFilters && (
            <div className="pt-3 border-t border-outline-variant/20 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                  selectedCategory === '' 
                    ? 'bg-primary text-white font-semibold' 
                    : 'bg-surface-container text-secondary hover:text-on-surface'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize transition-all ${
                    selectedCategory === category 
                      ? 'bg-primary text-white font-semibold' 
                      : 'bg-surface-container text-secondary hover:text-on-surface'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const memberActive = isMember(group);
            return (
              <div 
                key={group._id} 
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 flex flex-col justify-between hover:-translate-y-[1px] hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-secondary font-medium px-2.5 py-1 rounded-full bg-surface-container">
                      {group.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span className="capitalize">{group.category || 'General'}</span>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg text-on-surface hover:text-primary transition-colors cursor-pointer">
                    {group.name}
                  </h3>

                  <p className="text-secondary text-xs sm:text-sm line-clamp-3 mt-2 mb-4 leading-relaxed">
                    {group.description || 'A community of practitioners collaborating on exchanges and peer skill sharing.'}
                  </p>

                  {group.tags && group.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {group.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="font-mono text-[11px] px-2.5 py-0.5 bg-primary/5 text-primary-fixed-variant rounded-md border border-primary/10"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-secondary py-3 border-t border-outline-variant/20 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-secondary/70" />
                      <span>{group.members?.length || 1} members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-secondary/70" />
                      <span>{group.posts?.length || 0} discussions</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {memberActive ? (
                      <button
                        onClick={() => leaveGroup(group._id)}
                        className="flex-1 btn-outline text-xs py-2 hover:border-error hover:text-error transition-colors"
                      >
                        Leave Group
                      </button>
                    ) : (
                      <button
                        onClick={() => joinGroup(group._id)}
                        className="flex-1 btn-primary text-xs py-2"
                      >
                        Join Cohort
                      </button>
                    )}
                    <button 
                      onClick={() => alert(`Opening group "${group.name}" details...`)}
                      className="px-3 py-2 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-xs font-semibold text-secondary transition-colors"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {groups.length === 0 && !isLoading && (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center max-w-lg mx-auto">
            <Users className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-on-surface">No communities found</h3>
            <p className="text-secondary text-sm mt-1 mb-6">Try broadening your search term or select another category filter.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
              className="btn-outline text-xs px-4 py-2"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-4">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="btn-outline text-xs px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs text-secondary font-medium">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="btn-outline text-xs px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
