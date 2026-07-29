
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Clock, ArrowLeft, Users, BookOpen, GraduationCap } from 'lucide-react';
import { Exchange } from '@/types';
import { Chat } from '@/components/Chat';
import { Modal } from '@/components/Modal';

export default function ExchangeDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchExchange();
    }
  }, [session, status, router, id]);

  const fetchExchange = async () => {
    try {
      const response = await fetch(`/api/exchanges/${id}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setExchange(data);
      } else {
        router.push('/exchanges');
      }
    } catch (error) {
      console.error('Error fetching exchange:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate) return;

    try {
      const response = await fetch(`/api/exchanges/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduledFor: scheduleDate }),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedExchange = result.data || result;
        setExchange(updatedExchange);
        setIsScheduling(false);
      }
    } catch (error) {
      console.error('Error scheduling exchange:', error);
    }
  };

  const handleAddToCalendar = (provider: 'google' | 'outlook') => {
    // This is a placeholder for the actual calendar integration
    alert(`Adding to ${provider} calendar... (simulation)`);
    setIsCalendarModalOpen(false);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!exchange) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Exchange not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Exchanges</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Exchange Details</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Participants</p>
                  <p className="font-medium text-secondary-900">
                    {exchange.offeredBy ? (
                      typeof exchange.offeredBy === 'object' && exchange.offeredBy !== null
                        ? (exchange.offeredBy as any).name
                        : 'User'
                    ) : 'Unknown'} & {exchange.requestedBy ? (
                      typeof exchange.requestedBy === 'object' && exchange.requestedBy !== null
                        ? (exchange.requestedBy as any).name
                        : 'User'
                    ) : 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Skill Offered</p>
                  <p className="font-medium text-secondary-900">
                    {exchange.skills?.offered ? (
                      typeof exchange.skills.offered === 'object' && exchange.skills.offered !== null
                        ? (exchange.skills.offered as any).name
                        : exchange.skills.offered
                    ) : 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Skill Requested</p>
                  <p className="font-medium text-secondary-900">
                    {exchange.skills?.requested ? (
                      typeof exchange.skills.requested === 'object' && exchange.skills.requested !== null
                        ? (exchange.skills.requested as any).name
                        : exchange.skills.requested
                    ) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Chat exchangeId={exchange._id || ''} currentUserId={session?.user?.id || ''} />
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-secondary-900 mb-4">Schedule</h2>
          {exchange.scheduledFor ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Scheduled for</p>
                  <p className="font-medium text-secondary-900">
                    {new Date(exchange.scheduledFor).toLocaleString()}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsCalendarModalOpen(true)} className="w-full btn-primary flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Add to Calendar</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-secondary-600">This exchange has not been scheduled yet.</p>
              <button onClick={() => setIsScheduling(true)} className="w-full btn-outline">
                Schedule Exchange
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isScheduling} onClose={() => setIsScheduling(false)} title="Schedule Exchange">
        <form onSubmit={handleScheduleSubmit}>
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="input-field w-full"
            required
          />
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsScheduling(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Schedule
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isCalendarModalOpen} onClose={() => setIsCalendarModalOpen(false)} title="Add to Calendar">
        <div className="flex flex-col space-y-4">
            <button onClick={() => handleAddToCalendar('google')} className="w-full btn-primary">
                Add to Google Calendar
            </button>
            <button onClick={() => handleAddToCalendar('outlook')} className="w-full btn-primary">
                Add to Outlook Calendar
            </button>
        </div>
      </Modal>
    </div>
  );
}
