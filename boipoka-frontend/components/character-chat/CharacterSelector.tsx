"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";

// Initialize Firebase (assuming this handles initialization idempotently)
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
    id: "adubhai",
    name: "আদুভাই",
    bookTitle: "আদুভাই (ছোটগল্প)",
    author: "আবুল মনসুর আহমদ",
    description: "শ্রেণীহীনতার ঊর্ধ্বে জ্ঞানান্বেষী, দৃঢ়চেতা এবং আদর্শবাদী এক চিরসবুজ ছাত্র।",
    avatar: "👨‍🎓",
    personality: ["Principled", "Resilient", "Optimistic", "Diligent"],
  },
  {
    id: "mojid",
    name: "মজিদ",
    bookTitle: "লালসালু",
    author: "সৈয়দ ওয়ালীউল্লাহ",
    description:
      "গ্রামবাসীদের ধর্মীয় বিশ্বাসকে ব্যবহার করে নিয়ন্ত্রণ প্রতিষ্ঠা করা একজন ধূর্ত পীর।",
    avatar: "🕌",
    personality: ["Cunning", "Manipulative", "Religious", "Authoritative"],
  },
  {
    id: "harry-potter",
    name: "Harry Potter",
    bookTitle: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description:
      "The Boy Who Lived, a young wizard discovering his magical heritage and fighting dark forces.",
    avatar: "⚡",
    personality: ["Brave", "Loyal", "Modest", "Determined"],
  },
  {
    id: "anupam",
    name: "অনুপম",
    bookTitle: "অপরিচিতা",
    author: "রবীন্দ্রনাথ ঠাকুর",
    description:
      "শুরুতে মামা-নির্ভর, কিন্তু পরে আত্মমর্যাদা ও প্রজ্ঞার প্রতি মুগ্ধ এক সংবেদনশীল যুবক।",
    avatar: "📖",
    personality: ["Sensitive", "Contemplative", "Evolving", "Idealistic"],
  },
  {
    id: "paradoxical-sazid",
    name: "প্যারাডক্সিক্যাল সাজিদ",
    bookTitle: "প্যারাডক্সিক্যাল সাজিদ",
    author: "আরিফ আজাদ",
    description:
      "ইসলামের বিরুদ্ধে উত্থাপিত প্রশ্নগুলোর যৌক্তিক ও দার্শনিক উত্তর প্রদানকারী একজন তীক্ষ্ণবুদ্ধিসম্পন্ন গবেষক।",
    avatar: "🧠",
    personality: ["Logical", "Rational", "Apologetic", "Inquisitive"],
  },
];

export default function CharacterSelector() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleCharacterSelect = async (character: Character) => {
    const auth = getAuth();
    if (!auth.currentUser) {
      alert("Please log in first.");
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