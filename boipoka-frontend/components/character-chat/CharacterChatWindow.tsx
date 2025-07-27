"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";

// Initialize Firebase
initFirebase();

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
        setMessages(result.data.chat.messages || []);
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);
    setError(null);

    const auth = getAuth();
    if (!auth.currentUser) {
      setError("Authentication required");
      setIsSending(false);
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      // Add user message to local state immediately
      const tempUserMessage: Message = {
        _id: `temp-user-${Date.now()}`,
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      // Send message to backend
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
        // Get the last message from the chat (the one we just added)
        const newMessage =
          result.data.chat.messages[result.data.chat.messages.length - 1];
        // Replace temp message with actual message from backend
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempUserMessage._id ? newMessage : msg
          )
        );

        // Generate AI response
        await generateAIResponse(newMessage);
      } else {
        throw new Error(result.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
      // Remove the temporary user message on error
      setMessages((prev) =>
        prev.filter((msg) => msg._id.startsWith("temp-user-"))
      );
    } finally {
      setIsSending(false);
    }
  };

  const generateAIResponse = async (userMessage?: Message) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!apiKey || apiKey === "your_gemini_api_key_here") {
        // Fallback to local responses if no API key
        console.warn("No Gemini API key found, using local responses");
        const aiResponse = generateCharacterResponse(character.name);
        await saveAIMessage(aiResponse);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Get the latest user message from the current messages state
      const currentMessages = userMessage
        ? [...messages, userMessage]
        : messages;
      const latestUserMessage = currentMessages[currentMessages.length - 1];

      // Prepare conversation history for context (including the latest message)
      const conversationHistory = currentMessages
        .slice(-6) // Keep last 6 messages for context
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

      // Truncate response if it's too long (keep under 4500 chars to be safe)
      if (aiResponse.length > 4500) {
        aiResponse = aiResponse.substring(0, 4450) + "...";
        console.warn("AI response truncated due to length limit");
      }

      await saveAIMessage(aiResponse);
    } catch (error) {
      console.error("Error with Gemini API:", error);
      // Check if it's a model not found error
      if (
        error instanceof Error &&
        error.message.includes("models/gemini-pro is not found")
      ) {
        console.warn("Gemini Pro model not available, using fallback response");
      } else if (
        error instanceof Error &&
        error.message.includes("not found for API version")
      ) {
        console.warn("Model version not supported, using fallback response");
      }
      // Fallback to local responses on API error
      const aiResponse = generateCharacterResponse(character.name);
      await saveAIMessage(aiResponse);
    }
  };

  const saveAIMessage = async (aiResponse: string) => {
    try {
      // Add AI response to backend
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
        // Get the last message from the chat (the AI response we just added)
        const newMessage =
          result.data.chat.messages[result.data.chat.messages.length - 1];
        setMessages((prev) => [...prev, newMessage]);
      } else {
        throw new Error(result.message || "Failed to add AI response");
      }
    } catch (error) {
      console.error("Error saving AI response:", error);
      // Add error message
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
    const responses = {
      "Sherlock Holmes": [
        "Elementary! Your message reveals quite a bit about your state of mind. I observe that you are curious by nature, which is always a commendable trait.",
        "Fascinating observation. The evidence suggests you have something important on your mind. Pray, continue.",
        "Most intriguing! As I always say, 'You see, but you do not observe.' What details have you noticed that others might miss?",
      ],
      "Elizabeth Bennet": [
        "How delightfully amusing! Your words show great wit, which I must confess I find quite refreshing in conversation.",
        "I must say, that is quite an interesting perspective. I do so enjoy discourse with someone of obvious intelligence.",
        "You speak with such conviction - I admire that quality greatly. It reminds me that first impressions are not always to be trusted.",
      ],
      Gandalf: [
        "All we have to decide is what to do with the time that is given us. Your words carry weight, my friend.",
        "Curious indeed... There is more to this than meets the eye. I sense great wisdom in your question.",
        "Many that live deserve death. And some that die deserve life. Can you give it to them? Do not be too eager to deal out death in judgement.",
      ],
      "Hermione Granger": [
        "That's brilliant! I've read about something similar in 'Hogwarts: A History' - it's absolutely fascinating how these things connect!",
        "Oh my! That reminds me of something I learned in Ancient Runes class. Books really are the most wonderful things, aren't they?",
        "Fascinating! I should research that further in the library. There's always more to learn, and knowledge is truly the greatest power we can possess.",
      ],
      "Harry Potter": [
        "That's really interesting! It reminds me of something that happened at Hogwarts. Sometimes the most ordinary things can lead to extraordinary adventures.",
        "Blimey! That's quite something. Ron and Hermione would find this fascinating too.",
        "I've learned that courage isn't about not being scared - it's about doing what's right even when you are scared. What do you think?",
        "You know, Professor Dumbledore always said that it's our choices that show what we truly are, far more than our abilities.",
        "That sounds like something Hermione would know all about! She's brilliant with that sort of thing.",
        "Voldemort... *pauses* He's the darkest wizard of our time. But I've learned that love and friendship are more powerful than any dark magic.",
        "The wizarding world is full of mysteries and magic. There's always something new to discover!",
        "Sometimes I miss the simple days before I knew I was a wizard, but I wouldn't change anything now.",
      ],
      "Atticus Finch": [
        "That's a thoughtful observation. You know, you never really understand a person until you consider things from his point of view.",
        "I believe there's good in everyone, and your words remind me of that fundamental truth about human nature.",
        "Real courage is when you know you're licked before you begin, but you begin anyway and see it through. Your perspective shows real wisdom.",
      ],
      "Jay Gatsby": [
        "Old sport, that's quite remarkable! You know, I've always believed that we beat on, boats against the current, borne back ceaselessly into the past.",
        "Fascinating, absolutely fascinating! Your words remind me of the green light across the bay - always reaching for something just beyond our grasp.",
        "You have a way with words that reminds me of the finest parties at West Egg. There's something magical about hope, don't you think?",
      ],
      মজিদ: [
        "আহা! তুমি বোঝো না বাবা। এই কথাগুলো সাধারণ মানুষের বোঝার মতো নয়। আল্লাহর কুদরত বিশাল।",
        "দেখো, আমার কাছে অলৌকিক শক্তি আছে। পীরের মাজারে যারা সত্যিকারের মন নিয়ে আসে, তাদের মনোবাঞ্ছা পূর্ণ হয়।",
        "ইমান রাখো, তাকওয়া রাখো। আর সবসময় মাজারের খেদমত করো। তাহলে দুনিয়া ও আখেরাতে মঙ্গল হবে।",
        "তোমার এই প্রশ্ন শয়তানের কুমন্ত্রণা। সন্দেহ করা পাপ। বিশ্বাস রাখো, ভালো হবে।",
      ],
    };

    const characterResponses = responses[
      characterName as keyof typeof responses
    ] || [
      "That's quite interesting! Tell me more about your thoughts on this matter.",
    ];

    return characterResponses[
      Math.floor(Math.random() * characterResponses.length)
    ];
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as React.FormEvent);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-96 flex flex-col">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-t-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">{character.avatar}</div>
            <p>Start a conversation with {character.name}!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">{character.avatar}</span>
                    <span className="text-sm font-medium text-gray-600">
                      {character.name}
                    </span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.role === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center mb-1">
                <span className="text-lg mr-2">{character.avatar}</span>
                <span className="text-sm font-medium text-gray-600">
                  {character.name}
                </span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="border-t p-4">
        <div className="flex space-x-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Type a message to ${character.name}...`}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-20"
            rows={1}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
