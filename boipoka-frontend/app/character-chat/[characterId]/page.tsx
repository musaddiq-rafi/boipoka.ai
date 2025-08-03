"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";
import CharacterChatWindow from "@/components/character-chat/CharacterChatWindow";
import { getCharacterPrompt } from "@/lib/characterPrompts";

// Initialize Firebase
initFirebase();

interface Character {
  id: string;
  name: string;
  bookTitle: string;
  author: string;
  description: string;
  avatar: string;
}

const characters: Character[] = [
  {
    id: "adubhai",
    name: "আদুভাই",
    bookTitle: "আদুভাই (ছোটগল্প)",
    author: "আবুল মনসুর আহমদ",
    description: "শ্রেণীহীনতার ঊর্ধ্বে জ্ঞানান্বেষী, দৃঢ়চেতা এবং আদর্শবাদী এক চিরসবুজ ছাত্র।",
    avatar: "👨‍🎓",
  },
  {
    id: "mojid",
    name: "মজিদ",
    bookTitle: "লালসালু",
    author: "সৈয়দ ওয়ালীউল্লাহ",
    description: "গ্রামবাসীদের ধর্মীয় বিশ্বাসকে ব্যবহার করে নিয়ন্ত্রণ প্রতিষ্ঠা করা একজন ধূর্ত পীর।",
    avatar: "🕌",
  },
  {
    id: "harry-potter",
    name: "Harry Potter",
    bookTitle: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description: "The Boy Who Lived, a young wizard discovering his magical heritage and fighting dark forces.",
    avatar: "⚡",
  },
  {
    id: "anupam",
    name: "অনুপম",
    bookTitle: "অপরিচিতা",
    author: "রবীন্দ্রনাথ ঠাকুর",
    description: "শুরুতে মামা-নির্ভর, কিন্তু পরে আত্মমর্যাদা ও প্রজ্ঞার প্রতি মুগ্ধ এক সংবেদনশীল যুবক।",
    avatar: "📖",
  },
  {
    id: "paradoxical-sazid",
    name: "প্যারাডক্সিক্যাল সাজিদ",
    bookTitle: "প্যারাডক্সিক্যাল সাজিদ",
    author: "আরিফ আজাদ",
    description: "ইসলামের বিরুদ্ধে উত্থাপিত প্রশ্নগুলোর যৌক্তিক ও দার্শনিক উত্তর প্রদানকারী একজন তীক্ষ্ণবুদ্ধিসম্পন্ন গবেষক।",
    avatar: "🧠",
  },
  {
    id: "sherlock-holmes",
    name: "Sherlock Holmes",
    bookTitle: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    description: "The world's greatest consulting detective, master of deductive reasoning and observation.",
    avatar: "🕵️",
  },
];

export default function CharacterChatPage() {
  const params = useParams();
  const characterId = params.characterId as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializingRef = useRef(false);

  useEffect(() => {
    const foundCharacter = characters.find((c) => c.id === characterId);
    if (!foundCharacter) {
      setError("Character not found");
      setIsLoading(false);
      return;
    }

    setCharacter(foundCharacter);

    if (!initializingRef.current && !chatId) {
      initializeChat(foundCharacter);
    }
  }, [characterId, chatId]);

  const initializeChat = async (char: Character) => {
    if (initializingRef.current) {
      console.log("Chat initialization already in progress, skipping...");
      return;
    }

    initializingRef.current = true;

    const auth = getAuth();
    if (!auth.currentUser) {
      setError("Please log in to chat");
      setIsLoading(false);
      initializingRef.current = false;
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();

      console.log("Initializing chat for character:", char.name, char.bookTitle);

      const response = await fetch("http://localhost:5001/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            character: {
              name: char.name,
              bookTitle: char.bookTitle,
              description: char.description,
              avatar: char.avatar,
            },
            context: `Chat with ${char.name} from ${char.bookTitle}`,
            model: "gemini-pro",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Chat initialization result:", result);

      if (result.success) {
        setChatId(result.data.chat._id);
        console.log("Chat ID set to:", result.data.chat._id);
        console.log("Existing messages count:", result.data.chat.messages?.length || 0);
      } else {
        throw new Error(result.message || "Failed to initialize chat");
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      setError("Failed to initialize chat. Please try again.");
    } finally {
      setIsLoading(false);
      initializingRef.current = false;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex flex-col">
        {/* Chat-like loading header */}
        <div className="bg-white border-b border-blue-100 p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-blue-100 rounded animate-pulse mb-1 w-32"></div>
              <div className="h-3 bg-blue-50 rounded animate-pulse w-48"></div>
            </div>
          </div>
        </div>
        
        {/* Loading content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur-lg animate-pulse"></div>
            </div>
            
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Connecting to AI Character
            </h2>
            <p className="text-blue-600">Setting up your literary conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            {error || "Character not found"}
          </h1>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!chatId) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            Failed to load chat
          </h1>
          
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex flex-col">
      {/* Chat Header - Like modern messaging apps */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-blue-100 p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center space-x-4">
          {/* Back button */}
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-blue-50 rounded-xl transition-colors duration-200 group"
          >
            <svg className="w-5 h-5 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {/* Character avatar with online indicator */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-2xl shadow-sm">
              {character.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
          </div>

          {/* Character info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {character.name}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Online • AI Character</span>
            </div>
          </div>

          {/* Character info capsule */}
          <div className="hidden lg:flex items-center bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-full border border-blue-200">
            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-blue-700 text-sm font-medium max-w-xs truncate">
              {character.bookTitle}
            </span>
          </div>

          {/* Chat options */}
          <div className="flex items-center space-x-2">
            {/* AI badge */}
            <div className="hidden sm:flex items-center px-3 py-1 bg-blue-100 rounded-full">
              <svg className="w-3 h-3 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-blue-700 text-xs font-medium">Gemini AI</span>
            </div>

            {/* Info button */}
            <button className="p-2 hover:bg-blue-50 rounded-xl transition-colors duration-200 group">
              <svg className="w-5 h-5 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Window - Main content area with fixed layout */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          <CharacterChatWindow
            chatId={chatId}
            character={character}
            systemPrompt={getCharacterPrompt(character.name, character.bookTitle)}
          />
        </div>
      </div>
    </div>
  );
}