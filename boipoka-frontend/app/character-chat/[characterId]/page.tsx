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

// Character data (same as in CharacterSelector)
const characters: Character[] = [
  {
    id: "sherlock-holmes",
    name: "Sherlock Holmes",
    bookTitle: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    description:
      "The world's greatest consulting detective with exceptional deductive abilities.",
    avatar: "🕵️‍♂️",
  },
  {
    id: "elizabeth-bennet",
    name: "Elizabeth Bennet",
    bookTitle: "Pride and Prejudice",
    author: "Jane Austen",
    description: "A witty and independent young woman with strong opinions.",
    avatar: "👩‍🎭",
  },
  {
    id: "gandalf",
    name: "Gandalf",
    bookTitle: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    description:
      "A wise wizard and guide with ancient knowledge and magical powers.",
    avatar: "🧙‍♂️",
  },
  {
    id: "hermione-granger",
    name: "Hermione Granger",
    bookTitle: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description: "A brilliant witch known for her intelligence and loyalty.",
    avatar: "📚",
  },
  {
    id: "harry-potter",
    name: "Harry Potter",
    bookTitle: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description:
      "The Boy Who Lived, a young wizard discovering his magical heritage.",
    avatar: "⚡",
  },
  {
    id: "atticus-finch",
    name: "Atticus Finch",
    bookTitle: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "A moral lawyer fighting for justice in the American South.",
    avatar: "⚖️",
  },
  {
    id: "jay-gatsby",
    name: "Jay Gatsby",
    bookTitle: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A mysterious millionaire chasing the American Dream.",
    avatar: "🎩",
  },
  {
    id: "mojid",
    name: "মজিদ",
    bookTitle: "লালসালু",
    author: "সৈয়দ ওয়ালীউল্লাহ",
    description:
      "একজন ধূর্ত ধর্মীয় নেতা যিনি গ্রামবাসীদের উপর নিয়ন্ত্রণ প্রতিষ্ঠা করেন।",
    avatar: "🕌",
  },
];

export default function CharacterChatPage() {
  const params = useParams();
  const characterId = params.characterId as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add a ref to prevent duplicate initialization calls
  const initializingRef = useRef(false);

  useEffect(() => {
    const foundCharacter = characters.find((c) => c.id === characterId);
    if (!foundCharacter) {
      setError("Character not found");
      setIsLoading(false);
      return;
    }

    setCharacter(foundCharacter);

    // Only initialize if not already initializing and no chatId exists
    if (!initializingRef.current && !chatId) {
      initializeChat(foundCharacter);
    }
  }, [characterId, chatId]); // Added chatId back to dependencies

  const initializeChat = async (char: Character) => {
    // Prevent duplicate calls
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
      // Get Firebase ID token
      const token = await auth.currentUser.getIdToken();

      console.log(
        "Initializing chat for character:",
        char.name,
        char.bookTitle
      );

      // Try to create/get existing chat with this character
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
        console.log(
          "Existing messages count:",
          result.data.chat.messages?.length || 0
        );
      } else {
        throw new Error(result.message || "Failed to initialize chat");
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      setError("Failed to initialize chat. Please try again.");
    } finally {
      setIsLoading(false);
      initializingRef.current = false; // Reset the ref when done
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Character not found"}
          </h1>
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  if (!chatId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Failed to load chat
          </h1>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Character Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-5xl">{character.avatar}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {character.name}
              </h1>
              <p className="text-gray-600">
                From &ldquo;{character.bookTitle}&rdquo; by {character.author}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {character.description}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <CharacterChatWindow
          chatId={chatId}
          character={character}
          systemPrompt={getCharacterPrompt(character.name, character.bookTitle)}
        />
      </div>
    </div>
  );
}
