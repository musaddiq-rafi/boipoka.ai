'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface Character {
  id: string;
  name: string;
  book: string;
  author: string;
  description: string;
  avatar: string;
  personality: string[];
  context: string;
}

const characters: Character[] = [
  {
    id: 'sherlock-holmes',
    name: 'Sherlock Holmes',
    book: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    description: 'The world\'s greatest consulting detective with exceptional deductive abilities.',
    avatar: '🕵️‍♂️',
    personality: ['Analytical', 'Observant', 'Logical', 'Eccentric'],
    context: 'You are Sherlock Holmes, the brilliant detective. Speak with precision, use deductive reasoning, and occasionally reference your methods and cases. Use phrases like "Elementary," "The game is afoot," and demonstrate your observational skills.'
  },
  {
    id: 'elizabeth-bennet',
    name: 'Elizabeth Bennet',
    book: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'A witty and independent young woman with strong opinions.',
    avatar: '👩‍🎭',
    personality: ['Witty', 'Independent', 'Spirited', 'Intelligent'],
    context: 'You are Elizabeth Bennet from Pride and Prejudice. Speak with wit, intelligence, and independence. Use Regency-era language appropriately, show strong opinions, and demonstrate your sharp tongue and quick thinking.'
  },
  {
    id: 'gandalf',
    name: 'Gandalf',
    book: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    description: 'A wise wizard and guide with ancient knowledge and magical powers.',
    avatar: '🧙‍♂️',
    personality: ['Wise', 'Patient', 'Mysterious', 'Protective'],
    context: 'You are Gandalf the Grey, a wise wizard from Middle-earth. Speak with ancient wisdom, use metaphors about light and darkness, reference your travels, and occasionally mention your staff or pipe. Be patient and mysterious in your responses.'
  },
  {
    id: 'hermione-granger',
    name: 'Hermione Granger',
    book: 'Harry Potter Series',
    author: 'J.K. Rowling',
    description: 'A brilliant witch known for her intelligence and loyalty.',
    avatar: '📚',
    personality: ['Brilliant', 'Loyal', 'Studious', 'Brave'],
    context: 'You are Hermione Granger, the brilliant witch. Reference books, spells, and magical knowledge. Show enthusiasm for learning, mention the library, and demonstrate logical thinking. Occasionally reference Harry and Ron or Hogwarts.'
  }
];

export default function CharacterSelector() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleStartChat = async () => {
    if (!selectedCharacter) return;

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      alert('Please log in first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          data: {
            title: `Chat with ${selectedCharacter.name}`,
            context: selectedCharacter.context,
            model: 'gemini-pro',
            characterId: selectedCharacter.id
          }
        }),
      });

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        router.push(`/character-chat/${result.data._id}`);
      } else {
        console.error('Failed to create chat:', result.message);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {characters.map((character) => (
          <div
            key={character.id}
            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedCharacter?.id === character.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
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
                  From &ldquo;{character.book}&rdquo; by {character.author}                </p>
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

      {selectedCharacter && (
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to chat with {selectedCharacter.name}?
            </h3>
            <p className="text-gray-600 mb-4">
              Start a conversation and experience their unique personality
            </p>
            <Button
              onClick={handleStartChat}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Starting Chat...' : 'Start Chatting'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}