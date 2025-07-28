import CharacterSelector from '@/components/character-chat/CharacterSelector';

export default function CharacterChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl animate-ping"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Minimal Hero */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent">
                Talk With Your Dream Characters
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              AI-powered conversations with your favorite literary characters
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/10 to-cyan-600/10 backdrop-blur-sm border border-blue-300/30">
              <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-blue-700 font-medium text-sm">Powered by Gemini AI</span>
            </div>
          </div>

          {/* Character Selector */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/40 p-8">
              <CharacterSelector />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}