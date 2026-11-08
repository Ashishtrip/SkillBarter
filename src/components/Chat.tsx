'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Video, Paperclip, CheckCheck, Sparkles } from 'lucide-react';
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
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
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
        setMessages((prev) => [...prev, result.data]);
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
          content: 'Started a live video exchange session',
          type: 'video_call',
          videoCall: { room },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessages((prev) => [...prev, result.data]);
        router.push(`/video/${room}`);
      }
    } catch (error) {
      console.error('Error starting video call:', error);
    }
  };

  const formatMessageTime = (timestamp: string | Date | undefined) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-2">
        <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-xs text-outline font-mono">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[560px] bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card overflow-hidden">
      {/* ─── Chat Header (Stitch Style) ─── */}
      <div className="flex justify-between items-center p-4 border-b border-outline-variant/25 bg-surface/60 backdrop-blur-md">
        <div>
          <h2 className="text-base font-bold font-display text-on-surface">
            Project Discussion
          </h2>
          <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Real-time Workspace Active</span>
          </p>
        </div>

        <button
          onClick={startVideoCall}
          className="btn-outline text-xs py-1.5 px-3 rounded-lg"
        >
          <Video className="w-3.5 h-3.5 text-primary" />
          <span>Start Video Call</span>
        </button>
      </div>

      {/* ─── Message Stream Area (Stitch Style) ─── */}
      <div className="flex-grow p-5 overflow-y-auto flex flex-col gap-4 bg-surface-bright/50">
        {/* Date Divider */}
        <div className="flex items-center justify-center my-1">
          <span className="bg-surface-container-high text-on-surface-variant text-[11px] font-mono px-3 py-0.5 rounded-full">
            Today
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="text-center text-on-surface-variant py-12 space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-on-surface">Begin Collaboration</p>
            <p className="text-xs text-outline max-w-xs mx-auto">
              Share details, repo links, Figma design URLs, or schedule your first session.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const senderId =
              typeof message.sender === 'string' ? message.sender : message.sender?._id;
            const senderName =
              typeof message.sender === 'string'
                ? 'User'
                : message.sender?.name || 'Partner';
            const isOwn = senderId === currentUserId;
            const isSystem = message.type !== 'text';

            if (isSystem) {
              if (message.type === 'video_call' && message.videoCall) {
                return (
                  <div key={message._id} className="flex justify-center my-2">
                    <div className="bg-primary/10 border border-primary/20 text-on-surface text-center text-xs py-3 px-5 rounded-2xl max-w-sm shadow-sm space-y-2">
                      <p className="font-semibold">{message.content}</p>
                      <button
                        onClick={() => router.push(`/video/${message.videoCall?.room}`)}
                        className="btn-primary text-xs py-1.5 px-4"
                      >
                        Join Video Room
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={message._id} className="flex justify-center my-1">
                  <div className="bg-surface-container-high text-on-surface-variant text-xs py-1.5 px-3.5 rounded-full border border-outline-variant/30">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message._id}
                className={`flex items-end gap-2.5 max-w-[85%] ${
                  isOwn ? 'self-end justify-end' : 'self-start justify-start'
                }`}
              >
                {!isOwn && (
                  <div className="w-7 h-7 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center font-bold text-xs text-on-surface flex-shrink-0">
                    {senderName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isOwn
                        ? 'bg-primary text-white rounded-br-sm shadow-sm'
                        : 'bg-surface-container-low text-on-surface rounded-bl-sm border border-outline-variant/30'
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-[10px] text-outline px-1 ${
                      isOwn ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{formatMessageTime(message.createdAt)}</span>
                    {isOwn && <CheckCheck className="w-3 h-3 text-primary" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Message Input Area (Stitch Style) ─── */}
      <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/25">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message, milestone deliverables..."
            className="flex-grow bg-surface-bright border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-outline outline-none transition-all"
            disabled={isSending}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="p-2.5 bg-primary hover:bg-primary-container text-white rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-50 active:scale-95"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
export default Chat;
