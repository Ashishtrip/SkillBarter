'use client';

import { useState } from 'react';
import { Flag, AlertTriangle, X } from 'lucide-react';
import { Modal } from './Modal';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'user' | 'content' | 'exchange' | 'group' | 'message';
  reportedId: string;
  reportedName: string;
}

export function ReportModal({ isOpen, onClose, reportType, reportedId, reportedName }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reasons = [
    { value: 'spam', label: 'Spam', description: 'Repetitive or unwanted content' },
    { value: 'harassment', label: 'Harassment', description: 'Bullying, threats, or intimidation' },
    { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Offensive or inappropriate material' },
    { value: 'fake_profile', label: 'Fake Profile', description: 'Misleading or fraudulent profile' },
    { value: 'scam', label: 'Scam', description: 'Fraudulent or deceptive behavior' },
    { value: 'other', label: 'Other', description: 'Other violation of community guidelines' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason || !description.trim()) {
      setError('Please select a reason and provide a description');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const reportData: any = {
        reportType,
        reason,
        description: description.trim(),
      };

      // Add the appropriate ID field based on report type
      switch (reportType) {
        case 'user':
          reportData.reportedUserId = reportedId;
          break;
        case 'content':
          reportData.reportedContentId = reportedId;
          break;
        case 'exchange':
          reportData.reportedExchangeId = reportedId;
          break;
        case 'group':
          reportData.reportedGroupId = reportedId;
          break;
        case 'message':
          reportData.reportedMessageId = reportedId;
          break;
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        onClose();
        // Reset form
        setReason('');
        setDescription('');
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit report');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReportTypeLabel = () => {
    switch (reportType) {
      case 'user':
        return 'User';
      case 'content':
        return 'Content';
      case 'exchange':
        return 'Exchange';
      case 'group':
        return 'Group';
      case 'message':
        return 'Message';
      default:
        return 'Item';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Content" size="md">
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Reporting {getReportTypeLabel()}</h4>
              <p className="text-sm text-yellow-700 mt-1">
                You are reporting: <span className="font-medium">{reportedName}</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-3">
              What's the issue?
            </label>
            <div className="space-y-2">
              {reasons.map((reasonOption) => (
                <label key={reasonOption.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={reasonOption.value}
                    checked={reason === reasonOption.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-medium text-secondary-900">
                      {reasonOption.label}
                    </div>
                    <div className="text-xs text-secondary-600">
                      {reasonOption.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
              Additional Details
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input-field"
              placeholder="Please provide more details about the issue..."
              maxLength={1000}
            />
            <p className="mt-1 text-sm text-secondary-500">
              {description.length}/1000 characters
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason || !description.trim()}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Flag className="w-4 h-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
