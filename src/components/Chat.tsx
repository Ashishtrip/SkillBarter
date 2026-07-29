'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Video } from 'lucide-react';
import { Message } from '@/types';
import { useRouter } from 'next/navigation';

interface ChatProps {
  exchangeId: string;
  currentUserId: string;
}

export function Chat({ exchangeId, currentUserId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    
    // Use WebSocket for real-time updates if available
    // Fallback to polling if WebSocket is not available
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || '';
    const useWebSocket = wsUrl && typeof WebSocket !== 'undefined';
    
    if (useWebSocket) {
      // WebSocket connection would be established here
      // For now, fallback to polling
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    } else {
      // Poll for new messages every 3 seconds as fallback
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [exchangeId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}/messages`);
      if (response.ok) {
        const result = await response.json();
        setMessages(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessages(prev => [...prev, result.data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const startVideoCall = async () => {
    try {
      const room = `skill-barter-${exchangeId}-${Date.now()}`;
      const response = await fetch(`/api/exchanges/${exchangeId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'started a video call',
          type: 'video_call',
          videoCall: { room },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessages(prev => [...prev, result.data]);
        router.push(`/video/${room}`);
      }
    } catch (error) {
      console.error('Error starting video call:', error);
    }
  };

  const formatMessageTime = (timestamp: string | Date | undefined) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const getMessageTypeStyles = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-blue-50 text-blue-800 text-center text-sm py-2 px-4 rounded-lg';
      case 'exchange_request':
        return 'bg-yellow-50 text-yellow-800 text-center text-sm py-2 px-4 rounded-lg';
      case 'exchange_accepted':
        return 'bg-green-50 text-green-800 text-center text-sm py-2 px-4 rounded-lg';
      case 'exchange_declined':
        return 'bg-red-50 text-red-800 text-center text-sm py-2 px-4 rounded-lg';
      case 'exchange_completed':
        return 'bg-purple-50 text-purple-800 text-center text-sm py-2 px-4 rounded-lg';
      case 'video_call':
        return 'bg-gray-100 text-gray-800 text-center text-sm py-2 px-4 rounded-lg';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg border border-secondary-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-secondary-900">Exchange Chat</h3>
        </div>
        <button
          onClick={startVideoCall}
          className="btn-outline text-sm py-1 px-3"
        >
          <Video className="w-4 h-4 mr-1" />
          Start Video Call
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-secondary-500 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-secondary-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const senderId = typeof message.sender === 'string' ? message.sender : message.sender?._id;
            const isOwn = senderId === currentUserId;
            const isSystem = message.type !== 'text';

            if (isSystem) {
              if (message.type === 'video_call' && message.videoCall) {
                return (
                  <div key={message._id} className="flex justify-center">
                    <div className={getMessageTypeStyles(message.type)}>
                      <p>{message.content}</p>
                      <button
                        onClick={() => router.push(`/video/${message.videoCall?.room}`)}
                        className="btn-primary mt-2"
                      >
                        Join Call
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={message._id} className="flex justify-center">
                  <div className={getMessageTypeStyles(message.type)}>
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-900'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {typeof message.sender === 'string' ? message.sender : message.sender?.name || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwn ? 'text-primary-100' : 'text-secondary-500'
                  }`}>
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-secondary-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 input-field"
            disabled={isSending}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-secondary-500 mt-1">
          {newMessage.length}/1000 characters
        </p>
      </form>
    </div>
  );
}
