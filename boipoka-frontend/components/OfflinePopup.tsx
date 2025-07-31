'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Wifi, WifiOff, RefreshCw, X } from 'lucide-react';

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

// Popular book recommendations (reduced for popup)
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
  }
];

export default function OfflinePopup() {
  const [isOffline, setIsOffline] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);
    setIsOffline(!navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Don't automatically close popup, let user close it
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Rotate quotes every 8 seconds when offline
    let quoteInterval: NodeJS.Timeout;
    if (isOffline) {
      quoteInterval = setInterval(() => {
        setCurrentQuote((prev) => (prev + 1) % offlineQuotes.length);
      }, 8000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (quoteInterval) clearInterval(quoteInterval);
    };
  }, [isOffline]);

  const handleClose = () => {
    if (isOnline) {
      setIsOffline(false);
    }
  };

  const handleRetry = () => {
    if (isOnline) {
      window.location.reload();
    } else {
      // Just check connection status
      setIsOnline(navigator.onLine);
    }
  };

  if (!isOffline) return null;

  return (
    <>
      {/* Backdrop Blur Overlay */}
      <div className="fixed inset-0 z-[9998] bg-white/30 backdrop-blur-md backdrop-saturate-150" />

      {/* Popup Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 relative">
            <button
              onClick={handleClose}
              disabled={!isOnline}
              className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
                isOnline 
                  ? 'hover:bg-white hover:bg-opacity-20 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              title={isOnline ? 'Close' : 'Connect to internet to close'}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center justify-center mb-4">
              <WifiOff className="w-12 h-12 mr-3" />
              <BookOpen className="w-12 h-12" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
              You&apos;re Currently Offline
            </h1>
            <p className="text-center text-purple-100">
              Don&apos;t worry! Here are some inspiring quotes and book recommendations to keep you company.
            </p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center p-4 bg-gray-50">
            <div className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
              isOnline 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 mr-2" />
                  Connection Restored - You can now close this popup
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 mr-2" />
                  No Internet Connection
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quotes Section */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                  Inspiring Quotes
                </h2>
                <div className="text-center">
                  <blockquote className="text-base italic text-gray-700 mb-4 min-h-[50px] flex items-center justify-center">
                    "{offlineQuotes[currentQuote]}"
                  </blockquote>
                  <div className="flex justify-center space-x-2">
                    {offlineQuotes.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentQuote ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Book Recommendations */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Popular Book Recommendations
                </h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {popularBooks.map((book, index) => (
                    <div key={index} className="border-l-4 border-purple-600 pl-3 py-2">
                      <h3 className="font-semibold text-gray-800 text-sm">{book.title}</h3>
                      <p className="text-xs text-gray-600">by {book.author}</p>
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mt-1">
                        {book.genre}
                      </span>
                      <p className="text-xs text-gray-700 mt-1">{book.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 text-center sm:text-left">
              This content is cached for offline viewing. Content will sync when you&apos;re back online.
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 rounded-lg font-semibold transition-all duration-200 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Connection
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
