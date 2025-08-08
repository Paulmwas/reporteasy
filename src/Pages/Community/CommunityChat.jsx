import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CommunityChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Fetch initial chat messages
  const fetchChatMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, we would fetch chat messages from the API
      // For now, we'll simulate getting messages from the reports endpoint
      const reports = await api.reports.list({ limit: 10, messageType: 'text' });
      
      // Transform reports into chat messages
      const chatMessages = reports.reports.map(report => ({
        id: report.id,
        userId: report.userId,
        phoneNumber: report.phoneNumber,
        content: report.content,
        timestamp: report.createdAt,
        isAdmin: false // In a real app, we'd check user role
      }));
      
      setMessages(chatMessages);
      
      // Get active users count from community impact
      const impact = await api.analytics.getCommunityImpact();
      setActiveUsers(impact.activeUsers || 0);
      
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      setError(err.message || 'Failed to load chat messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChatMessages();
    
    // In a real app, we would set up WebSocket or polling for new messages
    // For this demo, we'll just refresh periodically
    const interval = setInterval(fetchChatMessages, 30000);
    return () => clearInterval(interval);
  }, [fetchChatMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      
      // In a real implementation, we would send to a chat API endpoint
      // For now, we'll simulate by creating a new report
      const response = await api.reports.sendMultiChannelUpdate('simulated-chat-id', {
        status: 'in-progress',
        message: newMessage
      });
      
      // Add the new message to our local state
      const newMsg = {
        id: Date.now().toString(), // Temporary ID
        userId: 'current-user', // In real app, get from auth context
        phoneNumber: '', // Would be user's phone
        content: newMessage,
        timestamp: new Date().toISOString(),
        isAdmin: true // Assuming admin is sending
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Anonymous';
    return phone.replace('whatsapp:', '').replace('+', '');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex animate-pulse">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="ml-3">
            <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-16 w-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            {error}
            <button 
              onClick={fetchChatMessages}
              className="ml-2 text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
            >
              Retry
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Community Chat
            </h1>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 mr-2 rounded-full bg-green-500"></span>
                {activeUsers} active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {error ? renderErrorState() : 
           loading ? renderLoadingSkeleton() : 
           messages.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No messages yet</h3>
              <p className="mt-1 text-sm text-gray-500">Be the first to start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.isAdmin ? 'justify-end' : ''}`}
                >
                  {!message.isAdmin && (
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                      {message.phoneNumber ? formatPhoneNumber(message.phoneNumber).charAt(0) : 'U'}
                    </div>
                  )}
                  <div className={`ml-3 ${message.isAdmin ? 'mr-3' : ''}`}>
                    <div className={`rounded-lg p-4 ${message.isAdmin ? 'bg-green-600 text-white' : 'bg-white shadow'}`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className={`mt-1 text-xs ${message.isAdmin ? 'text-right' : ''}`}>
                      <span className="text-gray-500">
                        {message.isAdmin ? 'You' : formatPhoneNumber(message.phoneNumber)}
                      </span>
                      <span className="mx-1 text-gray-400">•</span>
                      <span className="text-gray-400">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message input */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6">
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 rounded-l-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              placeholder="Type your message..."
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-lg shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                !newMessage.trim() || isSending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;