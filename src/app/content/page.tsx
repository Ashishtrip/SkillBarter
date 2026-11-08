'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  FileText, 
  Code, 
  Lightbulb,
  Clock,
  Eye,
  ThumbsUp,
  MessageSquare,
  User,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Content, SkillCategory } from '@/types';

export default function ContentPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | ''>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
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

  const contentTypes = [
    { value: 'tutorial', label: 'Tutorial', icon: BookOpen },
    { value: 'resource', label: 'Resource', icon: FileText },
    { value: 'project', label: 'Project', icon: Code },
    { value: 'article', label: 'Article', icon: Lightbulb },
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { value: 'intermediate', label: 'Intermediate', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { value: 'advanced', label: 'Advanced', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  ];

  useEffect(() => {
    fetchContent();
  }, [pagination?.page, searchTerm, selectedCategory, selectedType, selectedDifficulty]);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', (pagination?.page ?? 1).toString());
      params.append('limit', (pagination?.limit ?? 10).toString());
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedType) params.append('contentType', selectedType);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);

      const response = await fetch(`/api/content?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setContent(Array.isArray(data.content) ? data.content : []);
        setPagination(data.pagination ?? { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchContent();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getContentTypeIcon = (type: string) => {
    const contentType = contentTypes.find(ct => ct.value === type);
    return contentType ? contentType.icon : BookOpen;
  };

  const getDifficultyColor = (difficulty: string) => {
    const diff = difficulties.find(d => d.value === difficulty);
    return diff ? diff.color : 'text-secondary bg-surface-container border-outline-variant/30';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-secondary text-sm font-medium">Loading knowledge base...</p>
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
                Curated Peer Knowledge
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
              Knowledge Repository
            </h1>
            <p className="text-secondary text-sm sm:text-base mt-1">
              Explore step-by-step guides, architecture blueprints, and design systems contributed by barter partners.
            </p>
          </div>
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
                placeholder="Search tutorials, resources, and articles..."
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
              <span>{showFilters ? 'Hide Filters' : 'Refine Filters'}</span>
            </button>

            <button
              onClick={handleSearch}
              className="btn-primary text-xs px-6 py-2.5"
            >
              Search
            </button>
          </div>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-outline-variant/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | '')}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none capitalize"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Content Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                >
                  <option value="">All Types</option>
                  {contentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                >
                  <option value="">All Levels</option>
                  {difficulties.map((diff) => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Content List */}
        <div className="space-y-4">
          {content.map((item) => {
            const TypeIcon = getContentTypeIcon(item.contentType);
            return (
              <div 
                key={item._id} 
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 hover:-translate-y-[1px] hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <TypeIcon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className="font-display font-bold text-lg text-on-surface hover:text-primary transition-colors cursor-pointer">
                        {item.title}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyColor(item.difficulty)} capitalize`}>
                        {item.difficulty}
                      </span>
                    </div>

                    <p className="text-secondary text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
                      {item.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-secondary/80 mb-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{typeof item.author === 'string' ? item.author : (item.author as any)?.name || 'Community Member'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTime(item.estimatedTime || 15)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{item.views || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{item.upvotes?.length || 0} upvotes</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{item.comments?.length || 0} discussions</span>
                      </div>
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.tags.slice(0, 5).map((tag, index) => (
                          <span
                            key={index}
                            className="font-mono text-[11px] px-2.5 py-0.5 bg-primary/5 text-primary-fixed-variant rounded-md border border-primary/10"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
                      <span className="text-xs text-secondary font-medium capitalize">
                        {item.category} • {item.contentType}
                      </span>
                      <button 
                        onClick={() => alert(`Opening "${item.title}"...`)}
                        className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {content.length === 0 && !isLoading && (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-on-surface">No resources found</h3>
            <p className="text-secondary text-sm mt-1 mb-6">Try adjusting your filters or search keywords.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedType('');
                setSelectedDifficulty('');
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
