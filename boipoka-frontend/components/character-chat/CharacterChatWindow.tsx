'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Chat {
  _id: string;
  title: string;
  context: string;
  characterId?: string;
  messages: Message[];
}

const characterData = {
  'sherlock-holmes': { name: 'Sherlock Holmes', avatar: '🕵️‍♂️', book: 'The Adventures of Sherlock Holmes' },
  'elizabeth-bennet': { name: 'Elizabeth Bennet', avatar: '👩‍🎭', book: 'Pride and Prejudice' },
  'gandalf': { name: 'Gandalf', avatar: '🧙‍♂️', book: 'The Lord of the Rings' },
  'hermione-granger': { name: 'Hermione Granger', avatar: '📚', book: 'Harry Potter Series' }
};

export default function CharacterChatWindow({ chatId }: { chatId: string }) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const character = chat?.characterId ? characterData[chat.characterId as keyof typeof characterData] : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChat();
  }, [chatId]);

  const fetchChat = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Adjust based on how you store auth token

      const response = await fetch(`http://localhost:5001/api/chats/${chatId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      const result = await response.json();

      if (result.success) {
        setChat(result.data);
        setMessages(result.data.messages || []);

        // Send welcome message if no messages exist
        if (!result.data.messages || result.data.messages.length === 0) {
          await sendWelcomeMessage();
        }
      } else {
        console.error('Failed to fetch chat:', result.message);
        router.push('/character-chat');
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      router.push('/character-chat');
    } finally {
      setIsFetching(false);
    }
  };

  const sendWelcomeMessage = async () => {
    if (!chat?.characterId) return;

    const welcomeMessages = {
      'sherlock-holmes': "Good day! I am Sherlock Holmes. The game is afoot! What mystery or observation would you like to discuss with me?",
      'elizabeth-bennet': "How do you do! I am Elizabeth Bennet. I find myself quite curious about what brings you to converse with me today.",
      'gandalf': "Ah, a visitor! I am Gandalf the Grey. You seem to have found your way here for a reason. What wisdom do you seek?",
      'hermione-granger': "Hello there! I'm Hermione Granger. I've just been reading the most fascinating book! What would you like to discuss?"
    };

    const welcomeContent = welcomeMessages[chat.characterId as keyof typeof welcomeMessages];

    try {
      const response = await fetch(`http://localhost:5001/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            role: 'assistant',
            content: welcomeContent
          }
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMessages(prev => [...prev, result.data]);
      }
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessageContent = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      // Add user message to chat
      const userResponse = await fetch(`http://localhost:5001/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            role: 'user',
            content: userMessageContent
          }
        }),
      });

      if (!userResponse.ok) {
        throw new Error(`Failed to add user message: ${userResponse.status}`);
      }

      const userResult = await userResponse.json();
      if (userResult.success) {
        setMessages(prev => [...prev, userResult.data]);
      }

      // Get chat history for AI context
      const historyResponse = await fetch(`http://localhost:5001/api/chats/${chatId}/history?limit=10`);

      if (!historyResponse.ok) {
        throw new Error(`Failed to get chat history: ${historyResponse.status}`);
      }

      const historyResult = await historyResponse.json();

      if (historyResult.success) {
        // Generate AI response with character context
        const aiResponse = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: historyResult.data,
            context: chat?.context,
            characterId: chat?.characterId,  // Pass character ID for additional context
            characterName: character?.name,  // Pass character name
            model: 'gemini-pro'
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`AI generation failed: ${aiResponse.status}`);
        }

        const aiResult = await aiResponse.json();

        if (aiResult.success) {
          // Add AI response to chat
          const messageResponse = await fetch(`http://localhost:5001/api/chats/${chatId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: {
                role: 'assistant',
                content: aiResult.data.content
              }
            }),
          });

          if (!messageResponse.ok) {
            throw new Error(`Failed to add AI message: ${messageResponse.status}`);
          }

          const messageResult = await messageResponse.json();
          if (messageResult.success) {
            setMessages(prev => [...prev, messageResult.data]);
          }
        } else {
          throw new Error(aiResult.message || 'AI generation failed');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Show error message to user
      setMessages(prev => [...prev, {
        _id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!chat || !character) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Chat not found</p>
          <Button onClick={() => router.push('/character-chat')}>
            Back to Character Selection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => router.push('/character-chat')}
              className="text-gray-600 hover:text-gray-800 bg-transparent border-none"
            >
              ← Back
            </Button>
            <div className="text-2xl">{character.avatar}</div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {character.name}
              </h1>
              <p className="text-sm text-gray-600">From &ldquo;{character.book}&rdquo;</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 shadow-sm border'
                }`}
              >
                {message.role === 'assistant' && character && (
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">{character.avatar}</span>
                    <span className="text-sm font-medium text-gray-600">
                      {character.name}
                    </span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 shadow-sm border max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                {character && (
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">{character.avatar}</span>
                    <span className="text-sm font-medium text-gray-600">
                      {character.name}
                    </span>
                  </div>
                )}
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t px-4 py-3">
        <div className="max-w-4xl mx-auto flex space-x-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={character ? `Type a message to ${character.name}...` : 'Type a message...'}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

// Placeholder response generator - replace with actual AI API call
function generatePlaceholderResponse(characterId: string | undefined, userMessage: string): string {
  const responses = {
    'sherlock-holmes': [
      "Elementary! Your message reveals quite a bit about your state of mind. I observe that you are curious by nature, which is always a commendable trait.",
      "Fascinating observation. The evidence suggests you have something important on your mind. Pray, continue.",
      "Most intriguing! As I always say, 'You see, but you do not observe.' What details have you noticed that others might miss?"
    ],
    'elizabeth-bennet': [
      "How delightfully amusing! Your words show great wit, which I must confess I find quite refreshing in conversation.",
      "I must say, that is quite an interesting perspective. I do so enjoy discourse with someone of obvious intelligence.",
      "You speak with such conviction - I admire that quality greatly. It reminds me that first impressions are not always to be trusted."
    ],
    'gandalf': [
      "All we have to decide is what to do with the time that is given us. Your words carry weight, my friend.",
      "Curious indeed... There is more to this than meets the eye. I sense great wisdom in your question.",
      "Many that live deserve death. And some that die deserve life. Can you give it to them? Do not be too eager to deal out death in judgement."
    ],
    'hermione-granger': [
      "That's brilliant! I've read about something similar in 'Hogwarts: A History' - it's absolutely fascinating how these things connect!",
      "Oh my! That reminds me of something I learned in Ancient Runes class. Books really are the most wonderful things, aren't they?",
      "Fascinating! I should research that further in the library. There's always more to learn, and knowledge is truly the greatest power we can possess."
    ]
  };

  const characterResponses = responses[characterId as keyof typeof responses] || ["That's quite interesting! Tell me more."];
  return characterResponses[Math.floor(Math.random() * characterResponses.length)];
}