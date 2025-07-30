'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Wifi, WifiOff, RefreshCw } from 'lucide-react';

// Offline quotes about books and reading
const offlineQuotes = [
  "A room without books is like a body without a soul. - Marcus Tullius Cicero",
  "So many books, so little time. - Frank Zappa",
  "The more that you read, the more things you will know. - Dr. Seuss",
  "A reader lives a thousand lives before he dies. - George R.R. Martin",
  "Books are a uniquely portable magic. - Stephen King",
  "Reading is to the mind what exercise is to the body. - Joseph Addison",
  "You can never get a cup of tea large enough or a book long enough to suit me. - C.S. Lewis",
  "I have always imagined that Paradise will be a kind of library. - Jorge Luis Borges"
];

// Popular book recommendations
const popularBooks = [
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Classic Fiction",
    description: "A gripping tale of racial injustice and childhood innocence in the American South."
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian Fiction",
    description: "A chilling vision of a totalitarian future where freedom of thought is forbidden."
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    description: "A witty and romantic story of love overcoming pride and prejudice."
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Classic American",
    description: "A tale of love, wealth, and the American Dream in the Jazz Age."
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    genre: "Fantasy",
    description: "The magical beginning of the beloved wizarding world series."
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    description: "An epic tale of good versus evil in Middle-earth."
  }
];

export default function OfflinePage() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Rotate quotes every 10 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % offlineQuotes.length);
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(quoteInterval);
    };
  }, []);

  const handleRetry = () => {
    if (isOnline) {
      window.location.href = '/';
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="text-center py-8 px-4">
        <div className="flex items-center justify-center mb-4">
          <WifiOff className="w-16 h-16 text-purple-600 mr-4" />
          <BookOpen className="w-16 h-16 text-purple-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          You&apos;re Currently Offline
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Don&apos;t worry! Here are some inspiring quotes and book recommendations to keep you company.
        </p>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-center mb-8">
        <div className={`flex items-center px-4 py-2 rounded-full ${
          isOnline 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 mr-2" />
              Connection Restored
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 mr-2" />
              No Internet Connection
            </>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto px-4 pb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Quotes Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-purple-600" />
              Inspiring Quotes
            </h2>
            <div className="text-center">
              <blockquote className="text-lg italic text-gray-700 mb-4 min-h-[60px] flex items-center justify-center">
                "{offlineQuotes[currentQuote]}"
              </blockquote>
              <div className="flex justify-center space-x-2">
                {offlineQuotes.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentQuote ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Book Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Popular Book Recommendations
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {popularBooks.map((book, index) => (
                <div key={index} className="border-l-4 border-purple-600 pl-4 py-2">
                  <h3 className="font-semibold text-gray-800">{book.title}</h3>
                  <p className="text-sm text-gray-600">by {book.author}</p>
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mt-1">
                    {book.genre}
                  </span>
                  <p className="text-sm text-gray-700 mt-2">{book.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Retry Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleRetry}
            className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              isOnline
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            {isOnline ? 'Go to BoiBritto' : 'Try Again'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-gray-500 text-sm">
        <p>This page is cached for offline viewing. Content will sync when you&apos;re back online.</p>
      </div>
    </div>
  );
}
