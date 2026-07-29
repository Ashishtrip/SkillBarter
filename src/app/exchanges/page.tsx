'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle, Plus, Filter } from 'lucide-react';
import { Exchange, ExchangeStatus } from '@/types';
import Link from 'next/link';

export default function ExchangesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ExchangeStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions: { value: ExchangeStatus | ''; label: string; color: string }[] = [
    { value: '', label: 'All Exchanges', color: 'text-secondary-600' },
    { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'active', label: 'Active', color: 'text-blue-600' },
    { value: 'completed', label: 'Completed', color: 'text-green-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-600' },
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchExchanges();
    }
  }, [session, status, router, statusFilter]);

  const fetchExchanges = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/exchanges?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        const data = Array.isArray(result) ? result : (result.data || []);
        setExchanges(data);
      }
    } catch (error) {
      console.error('Error fetching exchanges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: ExchangeStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'active':
        return <MessageSquare className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: ExchangeStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-1 sm:mb-2">My Exchanges</h1>
          <p className="text-sm sm:text-base text-secondary-600">Manage your skill exchange partnerships</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center justify-center space-x-2 text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button 
            onClick={() => router.push('/search')}
            className="btn-primary flex items-center justify-center space-x-2 text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Exchange</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  statusFilter === option.value
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Exchanges List */}
      <div className="space-y-3 sm:space-y-4">
        {exchanges.length > 0 ? (
          exchanges.map((exchange) => (
            <div key={exchange._id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-wrap items-start gap-2 sm:gap-3">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(exchange.status)}`}
                  >
                    {getStatusIcon(exchange.status)}
                    <span className="hidden sm:inline">{exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}</span>
                    <span className="sm:hidden capitalize">{exchange.status.slice(0, 3)}</span>
                  </span>
                  <span className="text-xs sm:text-sm text-secondary-500">
                    Created {formatDate(exchange.createdAt)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-secondary-900 mb-2 text-sm sm:text-base">Skills Exchange</h3>
                    <div className="text-xs sm:text-sm space-y-1.5">
                      <p className="text-secondary-600">
                        Teaching: <span className="font-medium text-secondary-900">{typeof exchange.skills.offered === 'string' ? exchange.skills.offered : exchange.skills.offered?.name}</span>
                      </p>
                      <p className="text-secondary-600">
                        Learning: <span className="font-medium text-secondary-900">{typeof exchange.skills.requested === 'string' ? exchange.skills.requested : exchange.skills.requested?.name}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs sm:text-sm text-secondary-600 mb-2">
                      {exchange.messages.length} messages
                    </p>
                    {exchange.completedAt && (
                      <p className="text-xs sm:text-sm text-secondary-600">
                        Completed {formatDate(exchange.completedAt)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 pt-2 sm:pt-0">
                  <Link href={`/exchanges/${exchange._id}`} className="btn-outline text-xs sm:text-sm py-1.5 sm:py-1 px-3 sm:px-3 flex-1 sm:flex-none text-center">
                    View Details
                  </Link>
                  {exchange.status === 'active' && (
                    <Link href={`/exchanges/${exchange._id}`} className="btn-primary text-xs sm:text-sm py-1.5 sm:py-1 px-3 sm:px-3 flex-1 sm:flex-none text-center">
                      Open Chat
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 sm:py-12">
            <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-secondary-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-secondary-900 mb-2">No exchanges yet</h3>
            <p className="text-xs sm:text-base text-secondary-600 mb-4 sm:mb-6">
              Start by finding someone to exchange skills with
            </p>
            <button 
              onClick={() => router.push('/search')}
              className="btn-primary text-xs sm:text-sm py-2 px-4 sm:py-2.5 sm:px-6"
            >
              Find Exchange Partners
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
