"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";

// Initialize Firebase
initFirebase();

interface Character {
  id: string;
  name: string;
  bookTitle: string;
  author: string;
  description: string;
  avatar: string;
  personality: string[];
}

const characters: Character[] = [
  {
    id: "sherlock-holmes",
    name: "Sherlock Holmes",
    bookTitle: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    description:
      "The world's greatest consulting detective with exceptional deductive abilities.",
    avatar: "🕵️‍♂️",
    personality: ["Analytical", "Observant", "Logical", "Eccentric"],
  },
  {
    id: "elizabeth-bennet",
    name: "Elizabeth Bennet",
    bookTitle: "Pride and Prejudice",
    author: "Jane Austen",
    description: "A witty and independent young woman with strong opinions.",
    avatar: "👩‍🎭",
    personality: ["Witty", "Independent", "Spirited", "Intelligent"],
  },
  {
    id: "gandalf",
    name: "Gandalf",
    bookTitle: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    description:
      "A wise wizard and guide with ancient knowledge and magical powers.",
    avatar: "🧙‍♂️",
    personality: ["Wise", "Patient", "Mysterious", "Protective"],
  },
  {
    id: "hermione-granger",
    name: "Hermione Granger",
    bookTitle: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description: "A brilliant witch known for her intelligence and loyalty.",
    avatar: "📚",
    personality: ["Brilliant", "Loyal", "Studious", "Brave"],
  },
  {
    id: "harry-potter",
    name: "Harry Potter",
    bookTitle: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description:
      "The Boy Who Lived, a young wizard discovering his magical heritage.",
    avatar: "⚡",
    personality: ["Brave", "Loyal", "Modest", "Determined"],
  },
  {
    id: "atticus-finch",
    name: "Atticus Finch",
    bookTitle: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "A moral lawyer fighting for justice in the American South.",
    avatar: "⚖️",
    personality: ["Just", "Wise", "Compassionate", "Principled"],
  },
  {
    id: "jay-gatsby",
    name: "Jay Gatsby",
    bookTitle: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A mysterious millionaire chasing the American Dream.",
    avatar: "🎩",
    personality: ["Romantic", "Ambitious", "Mysterious", "Idealistic"],
  },
  {
    id: "mojid",
    name: "মজিদ",
    bookTitle: "লালসালু",
    author: "সৈয়দ ওয়ালীউল্লাহ",
    description:
      "একজন ধূর্ত ধর্মীয় নেতা যিনি গ্রামবাসীদের উপর নিয়ন্ত্রণ প্রতিষ্ঠা করেন।",
    avatar: "🕌",
    personality: ["Cunning", "Manipulative", "Religious", "Authoritative"],
  },
];
export default function CharacterSelector() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleCharacterSelect = async (character: Character) => {
    const auth = getAuth();
    if (!auth.currentUser) {
      alert("Please log in first");
      return;
    }

    setIsLoading(character.id);
    try {
      // Navigate directly to character chat page
      router.push(`/character-chat/${character.id}`);
    } catch (error) {
      console.error("Error navigating to chat:", error);
      alert("Failed to open chat. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {characters.map((character) => (
          <div
            key={character.id}
            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 border-gray-200 hover:border-blue-300 ${
              isLoading === character.id ? "opacity-50" : ""
            }`}
            onClick={() => handleCharacterSelect(character)}
          >
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{character.avatar}</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {character.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  From &ldquo;{character.bookTitle}&rdquo; by {character.author}
                </p>
                <p className="text-gray-700 mb-3">{character.description}</p>
                <div className="flex flex-wrap gap-2">
                  {character.personality.map((trait) => (
                    <span
                      key={trait}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Opening chat...</p>
          </div>
        </div>
      )}
    </div>
  );
}
