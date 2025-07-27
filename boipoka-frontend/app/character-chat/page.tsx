import CharacterSelector from '@/components/character-chat/CharacterSelector';

export default function CharacterChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chat with Literary Characters
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Engage in conversations with iconic characters from classic literature
          </p>
        </div>
        <CharacterSelector />
      </div>
    </div>
  );
}