'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, User, MapPin, Star, BookOpen, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Skill, User as UserType, SkillCategory, SkillLevel } from '@/types';

export default function SearchPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | ''>('');
  const [location, setLocation] = useState('');
  const [skillType, setSkillType] = useState<'teach' | 'learn' | ''>('');
  const [minRating, setMinRating] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<UserType | null>(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState<string>('');
  const [selectedRequestedSkill, setSelectedRequestedSkill] = useState<string>('');
  const [isSubmittingExchange, setIsSubmittingExchange] = useState(false);
  const [currentUserSkills, setCurrentUserSkills] = useState<Skill[]>([]);

  const categories: SkillCategory[] = [
    'tech', 'music', 'languages', 'academics', 'management', 
    'arts', 'sports', 'cooking', 'crafts', 'other'
  ];

  const levels: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedLevel) params.append('level', selectedLevel);
      if (location) params.append('location', location);
      if (skillType) params.append('skillType', skillType);
      if (minRating) params.append('minRating', minRating);

      const response = await fetch(`/api/search/users?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        console.log('Search results:', result);
        // API returns { data: users, error: null }
        const results = Array.isArray(result) ? result : (result.data || []);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStartExchange = async () => {
    if (!selectedPartner || !selectedOfferedSkill || !selectedRequestedSkill) {
      alert('Please select both skills to exchange');
      return;
    }

    setIsSubmittingExchange(true);
    try {
      const response = await fetch('/api/exchanges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: selectedPartner._id,
          offeredSkillId: selectedOfferedSkill,
          requestedSkillId: selectedRequestedSkill
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Exchange created successfully! You can now chat with ' + selectedPartner.name);
        // Reset skill selections but keep the modal open to allow more exchanges with same user
        setSelectedOfferedSkill('');
        setSelectedRequestedSkill('');
      } else {
        alert(result.error || 'Failed to create exchange');
      }
    } catch (error) {
      console.error('Error creating exchange:', error);
      alert('Failed to create exchange: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmittingExchange(false);
    }
  };

  useEffect(() => {
    // Initial search on page load
    handleSearch();
  }, []);

  useEffect(() => {
    // Fetch current user's skills when modal is opened
    if (showExchangeModal && selectedPartner && session?.user?.email) {
      const fetchUserSkills = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const result = await response.json();
            // API returns { data: user, error: null }
            const user = result.data || result;
            setCurrentUserSkills(user.skillsToTeach || []);
          }
        } catch (error) {
          console.error('Error fetching user skills:', error);
        }
      };
      fetchUserSkills();
    }
  }, [showExchangeModal, selectedPartner, session]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-1 sm:mb-2">Find Skill Exchange Partners</h1>
        <p className="text-xs sm:text-sm text-secondary-600">Discover people who can teach you new skills or learn from you</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:gap-0 gap-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 h-4 sm:h-5 sm:w-5 text-secondary-400" />
              </div>
              <input
                type="text"
                placeholder="Search for skills, people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field pl-10 w-full text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex items-center justify-center space-x-2 text-xs sm:text-sm py-2.5 sm:py-2 px-3 sm:px-4 flex-1 sm:flex-none"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">Filter</span>
              </button>
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="btn-primary text-xs sm:text-sm py-2.5 sm:py-2 px-4 sm:px-8 disabled:opacity-50 flex-1 sm:flex-none"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-secondary-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-secondary-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | '')}
                    className="input-field text-xs sm:text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-secondary-700 mb-2">
                    Skill Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value as SkillLevel | '')}
                    className="input-field text-xs sm:text-sm"
                  >
                    <option value="">All Levels</option>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-secondary-700 mb-2">
                    Skill Type
                  </label>
                  <select
                    value={skillType}
                    onChange={(e) => setSkillType(e.target.value as 'teach' | 'learn' | '')}
                    className="input-field text-xs sm:text-sm"
                  >
                    <option value="">Both Teach & Learn</option>
                    <option value="teach">Can Teach</option>
                    <option value="learn">Want to Learn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-secondary-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-secondary-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="input-field text-xs sm:text-sm"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Stars</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="w-10 h-10 bg-secondary-200 rounded-full mb-4" />
                <div className="h-4 bg-secondary-200 rounded mb-2" />
                <div className="h-3 bg-secondary-200 rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-secondary-200 rounded" />
                  <div className="h-3 bg-secondary-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {searchResults.map((user) => (
              <div key={user._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-secondary-900 text-sm sm:text-base truncate">{user.name}</h3>
                    {user.location && (
                      <p className="text-xs sm:text-sm text-secondary-600 flex items-center truncate">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{user.location}</span>
                      </p>
                    )}
                    {user.averageRating > 0 && (
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                                star <= user.averageRating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-secondary-600">
                          {user.averageRating.toFixed(1)} ({user.totalReviews})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {user.bio && (
                  <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
                    {user.bio}
                  </p>
                )}

                <div className="space-y-3">
                  {user.skillsToTeach.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-secondary-700 mb-2 flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        Can Teach
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {user.skillsToTeach.slice(0, 3).map((skill: Skill) => (
                          <span
                            key={skill._id}
                            className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {user.skillsToTeach.length > 3 && (
                          <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded-full">
                            +{user.skillsToTeach.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {user.skillsToLearn.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-secondary-700 mb-2">
                        Wants to Learn
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {user.skillsToLearn.slice(0, 3).map((skill: Skill) => (
                          <span
                            key={skill._id}
                            className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {user.skillsToLearn.length > 3 && (
                          <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded-full">
                            +{user.skillsToLearn.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <button 
                    onClick={() => {
                      if (session?.user?.id === user._id) {
                        alert('You cannot start an exchange with yourself!');
                      } else {
                        setSelectedPartner(user);
                        setShowExchangeModal(true);
                        setSelectedOfferedSkill('');
                        setSelectedRequestedSkill('');
                      }
                    }}
                    disabled={session?.user?.id === user._id}
                    className="w-full btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {session?.user?.id === user._id ? 'Your Profile' : 'Start Exchange'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No results found</h3>
            <p className="text-secondary-600">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>

      {/* Exchange Modal */}
      {selectedPartner && showExchangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-secondary-900">
                Start Exchange with {selectedPartner.name}
              </h2>
              <button
                onClick={() => {
                  setShowExchangeModal(false);
                  setSelectedPartner(null);
                  setSelectedOfferedSkill('');
                  setSelectedRequestedSkill('');
                }}
                className="p-1 hover:bg-secondary-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Skill You Can Teach
                </label>
                {currentUserSkills.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    You haven't added any skills to teach yet. Please update your profile first.
                  </div>
                ) : (
                  <select
                    value={selectedOfferedSkill}
                    onChange={(e) => setSelectedOfferedSkill(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Select a skill to teach</option>
                    {currentUserSkills.map((skill: Skill) => (
                      <option key={skill._id} value={skill._id}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-secondary-600 mt-1">
                  You can only teach skills you've defined in your profile
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Skill You Want to Learn
                </label>
                {!selectedPartner.skillsToTeach || selectedPartner.skillsToTeach.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    This user hasn't added any skills they can teach.
                  </div>
                ) : (
                  <select
                    value={selectedRequestedSkill}
                    onChange={(e) => setSelectedRequestedSkill(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Select a skill to learn</option>
                    {selectedPartner.skillsToTeach.map((skill: Skill) => (
                      <option key={skill._id} value={skill._id}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-secondary-600 mt-1">
                  Choose from skills that {selectedPartner.name} can teach
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowExchangeModal(false);
                    setSelectedPartner(null);
                    setSelectedOfferedSkill('');
                    setSelectedRequestedSkill('');
                  }}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartExchange}
                  disabled={
                    isSubmittingExchange || 
                    !selectedOfferedSkill || 
                    !selectedRequestedSkill ||
                    currentUserSkills.length === 0 ||
                    !selectedPartner.skillsToTeach ||
                    selectedPartner.skillsToTeach.length === 0
                  }
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    currentUserSkills.length === 0 ? 'Add skills to your profile first' :
                    !selectedPartner.skillsToTeach || selectedPartner.skillsToTeach.length === 0 ? 'This user has no skills to teach' :
                    !selectedOfferedSkill || !selectedRequestedSkill ? 'Select both skills' : ''
                  }
                >
                  {isSubmittingExchange ? 'Creating...' : 'Create Exchange'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
