"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";

// Initialize Firebase
initFirebase();

interface Message {
  _id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Character {
  id: string;
  name: string;
  bookTitle: string;
  author: string;
  description: string;
  avatar: string;
}

interface CharacterChatWindowProps {
  chatId: string;
  character: Character;
  systemPrompt: string;
}

export default function CharacterChatWindow({
  chatId,
  character,
  systemPrompt,
}: CharacterChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const fetchMessages = useCallback(async () => {
    const auth = getAuth();
    if (!auth.currentUser) {
      setError("Authentication required");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching messages for chat ID:", chatId);
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:5001/api/chats/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Fetch messages result:", result);
      console.log(
        "Messages received:",
        result.data?.chat?.messages?.length || 0
      );

      if (result.success) {
        const fetchedMessages = result.data.chat.messages || [];
        setMessages(fetchedMessages);
        setShouldAutoScroll(true);
      } else {
        throw new Error(result.message || "Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const scrollToBottom = useCallback(() => {
    if (shouldAutoScroll && messagesEndRef.current && messagesContainerRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "end" 
        });
      }, 100);
    }
  }, [shouldAutoScroll]);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0 && shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll, scrollToBottom]);

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    }
  }, [isLoading, messages.length, scrollToBottom]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inputMessage.trim() || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);
    setError(null);
    setShouldAutoScroll(true);

    const auth = getAuth();
    if (!auth.currentUser) {
      setError("Authentication required");
      setIsSending(false);
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const tempUserMessage: Message = {
        _id: `temp-user-${Date.now()}`,
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      const response = await fetch(
        `http://localhost:5001/api/chats/${chatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              content: userMessage,
              role: "user",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const newMessage =
          result.data.chat.messages[result.data.chat.messages.length - 1];
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempUserMessage._id ? newMessage : msg
          )
        );

        await generateAIResponse(newMessage);
      } else {
        throw new Error(result.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
      setMessages((prev) =>
        prev.filter((msg) => !msg._id.startsWith("temp-user-"))
      );
    } finally {
      setIsSending(false);
    }
  };

  const generateAIResponse = async (userMessage?: Message) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!apiKey || apiKey === "your_gemini_api_key_here") {
        console.warn("No Gemini API key found, using local responses");
        const aiResponse = generateCharacterResponse(character.name);
        await saveAIMessage(aiResponse);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const currentMessages = userMessage
        ? [...messages, userMessage]
        : messages;
      const latestUserMessage = currentMessages[currentMessages.length - 1];

      const conversationHistory = currentMessages
        .slice(-6)
        .filter((msg): msg is Message => msg !== undefined)
        .map(
          (msg) =>
            `${msg.role === "user" ? "Human" : character.name}: ${msg.content}`
        )
        .join("\n");

      const prompt = `${systemPrompt}

Recent conversation:
${conversationHistory}

The human just asked: "${latestUserMessage?.content || ""}"

Please respond as ${character.name} from "${
        character.bookTitle
      }". Address their specific question directly and stay in character. Keep your response engaging but concise (under 400 words).`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let aiResponse = response.text();

      if (aiResponse.length > 4500) {
        aiResponse = aiResponse.substring(0, 4450) + "...";
        console.warn("AI response truncated due to length limit");
      }

      await saveAIMessage(aiResponse);
    } catch (error) {
      console.error("Error with Gemini API:", error);
      const aiResponse = generateCharacterResponse(character.name);
      await saveAIMessage(aiResponse);
    }
  };

  const saveAIMessage = async (aiResponse: string) => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:5001/api/chats/${chatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              content: aiResponse,
              role: "assistant",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const newMessage =
          result.data.chat.messages[result.data.chat.messages.length - 1];
        setMessages((prev) => [...prev, newMessage]);
      } else {
        throw new Error(result.message || "Failed to add AI response");
      }
    } catch (error) {
      console.error("Error saving AI response:", error);
      const errorMessage: Message = {
        _id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "I apologize, but I encountered an error while processing your message. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const generateCharacterResponse = (characterName: string): string => {
    const responses: Record<string, string[]> = {
      "আদুভাই": [
        "সব সাবজেক্টে পাকা হয়ে ওঠাই ভালো। প্রমোশন সেদিন আমাকে দিতেই হবে।",
        "জ্ঞানলাভের জন্যই আমরা স্কুলে পড়ি, প্রমোশন লাভের জন্য পড়ি না।",
        "এক পয়সা মাইনে কম দেইনি। বছর-বছর নতুন বই-খাতা কিনতে আপত্তি করিনি।"
      ],
      "মজিদ": [
        "তোমার এই প্রশ্ন শয়তানের কুমন্ত্রণা। সন্দেহ করা পাপ। বিশ্বাস রাখো।",
        "কবরের দিকে তাকাও, তাহলেই সব বুঝতে পারবে।"
      ],
      "Harry Potter": [
        "That's really interesting! It reminds me of something that happened at Hogwarts.",
        "Blimey! That's quite something. Ron and Hermione would find this fascinating too."
      ],
      "অনুপম": [
        "সত্যি বলতে কী, তোমার কথা শুনে আমার মনটা ভালো হয়ে গেল।",
        "আশ্চর্য পরিপূর্ণতা! আমি তো কেবল দেখিয়াছিলাম, কিন্তু সে যে প্রাণ দিয়ে সবকিছু ছুঁয়ে যায়।"
      ],
      "প্যারাডক্সিক্যাল সাজিদ": [
        "আপনার প্রশ্নটি খুবই তাৎপর্যপূর্ণ। আসুন, আমরা যুক্তির নিরিখে এর গভীরে প্রবেশ করি।",
        "বিশ্বাস আর বিজ্ঞান একে অপরের পরিপূরক হতে পারে।"
      ],
    };

    const characterResponses = responses[characterName as keyof typeof responses];
    if (!characterResponses || characterResponses.length === 0) {
      return "That's quite interesting! Tell me more about your thoughts on this matter.";
    }

    return characterResponses[Math.floor(Math.random() * characterResponses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      sendMessage(e as unknown as React.FormEvent);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm h-[500px] flex items-center justify-center border border-gray-100">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h3 className="text-base font-medium text-gray-800 mb-1">Loading Chat</h3>
          <p className="text-sm text-gray-500">Preparing your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm h-[500px] flex flex-col border border-gray-100 overflow-hidden">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-b border-red-100 p-3 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Messages Container - Compact */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2.5"
        onScroll={handleScroll}
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm">
              {character.avatar}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Start chatting with {character.name}</h3>
            <p className="text-sm text-gray-500 mb-3">From {character.bookTitle}</p>
            <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
              <svg className="w-3 h-3 text-blue-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-blue-700 text-xs font-medium">AI Powered</span>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } items-end space-x-2`}
            >
              {message.role === "assistant" && (
                <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
                  {character.avatar}
                </div>
              )}
              
              <div
                className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-xl shadow-sm ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-br-md"
                    : "bg-gray-50 text-gray-800 rounded-bl-md border border-gray-100"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center mb-1.5 pb-1.5 border-b border-gray-200">
                    <span className="text-xs font-semibold text-blue-600">
                      {character.name}
                    </span>
                    <div className="ml-2 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  </div>
                )}
                <p className="text-sm leading-snug whitespace-pre-wrap">
                  {message.content}
                </p>
                <p
                  className={`text-xs mt-1.5 ${
                    message.role === "user" ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {message.role === "user" && (
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm">
                  U
                </div>
              )}
            </div>
          ))
        )}

        {isSending && (
          <div className="flex justify-start items-end space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
              {character.avatar}
            </div>
            <div className="bg-gray-50 text-gray-800 max-w-xs lg:max-w-sm px-3 py-2 rounded-xl rounded-bl-md border border-gray-100 shadow-sm">
              <div className="flex items-center mb-1.5 pb-1.5 border-b border-gray-200">
                <span className="text-xs font-semibold text-blue-600">
                  {character.name}
                </span>
                <div className="ml-2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                <div
                  className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Compact Input Area */}
      <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex-shrink-0">
        <form onSubmit={sendMessage}>
          <div className="flex space-x-2 items-end">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${character.name}...`}
                className="w-full resize-none border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 max-h-20 bg-white text-gray-800 placeholder-gray-500 text-sm"
                rows={1}
                disabled={isSending}
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none flex-shrink-0"
            >
              {isSending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-sm">Sending</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="text-sm">Send</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}