'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Send,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  MessageCircle,
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchConversations();
    }
  }, [session, status, router]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const result = await response.json();
        const data = Array.isArray(result) ? result : (result.data || []);
        setConversations(data);
        if (data.length > 0) {
          setSelectedConversation(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageText }),
      });

      if (response.ok) {
        setMessageText('');
        // Refresh messages
        if (selectedConversation) {
          const updatedConversations = conversations.map((conv) =>
            conv.id === selectedConversation.id ? { ...conv, messages: [] } : conv
          );
          setConversations(updatedConversations);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Conversation List Sidebar */}
      <div className="w-full lg:w-96 bg-white border-r border-secondary-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-secondary-200">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full text-sm"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full px-4 py-3 border-b border-secondary-100 hover:bg-secondary-50 transition-colors text-left ${
                  selectedConversation?.id === conv.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.participantAvatar ? (
                      <img src={conv.participantAvatar} alt={conv.participantName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-sm font-bold text-primary-600">
                        {conv.participantName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Message Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-secondary-900 truncate">{conv.participantName}</h3>
                      <span className="text-xs text-secondary-500 flex-shrink-0">
                        {new Date(conv.lastMessageTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-600 truncate mt-1">{conv.lastMessage}</p>
                  </div>

                  {/* Unread Badge */}
                  {conv.unreadCount > 0 && (
                    <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-secondary-500">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="hidden lg:flex flex-col flex-1 bg-white">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-secondary-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                {selectedConversation.participantAvatar ? (
                  <img
                    src={selectedConversation.participantAvatar}
                    alt={selectedConversation.participantName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-sm font-bold text-primary-600">
                    {selectedConversation.participantName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-secondary-900">{selectedConversation.participantName}</h2>
                <p className="text-xs text-secondary-500">Active now</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                <Phone size={20} className="text-secondary-600" />
              </button>
              <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                <Video size={20} className="text-secondary-600" />
              </button>
              <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                <Info size={20} className="text-secondary-600" />
              </button>
              <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                <MoreHorizontal size={20} className="text-secondary-600" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
              selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Sender Avatar (only for others) */}
                  {message.senderId !== session?.user?.id && (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary-600">
                        {message.senderName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Message */}
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.senderId === session?.user?.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 text-secondary-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === session?.user?.id
                          ? 'text-primary-100'
                          : 'text-secondary-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-secondary-500">
                <MessageCircle size={32} className="mx-auto mb-2 text-secondary-300" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="px-6 py-4 border-t border-secondary-200">
            <div className="flex items-end gap-3">
              <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-600">
                <Paperclip size={20} />
              </button>

              <input
                type="text"
                placeholder="Aa"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 input-field text-sm"
              />

              <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-600">
                <Smile size={20} />
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-col flex-1 bg-white items-center justify-center">
          <MessageCircle size={48} className="text-secondary-300 mb-4" />
          <p className="text-secondary-600">Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
