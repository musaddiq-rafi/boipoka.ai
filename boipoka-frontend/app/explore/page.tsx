"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface BookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    categories?: string[];
    averageRating?: number;
  };
}

const GENRES = [
  "all",
  "fiction",
  "non-fiction",
  "fantasy",
  "sci-fi",
  "mystery",
  "romance",
  "thriller",
  "historical",
  "biography",
  "poetry",
  "self-help",
  "horror",
  "drama",
  "adventure",
  "comedy",
  "spirituality",
  "philosophy",
  "science",
  "psychology",
  "young-adult",
  "children",
  "classic",
  "graphic-novel",
  "memoir",
  "education",
  "others"
];

export default function ExplorePage() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const maxResults = 20; // Books per page
  
  // Show all genres in the main view instead of splitting them
  const mainGenres = GENRES;
  const extraGenres: string[] = [];
  const [showAllGenres, setShowAllGenres] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [category, currentPage]); // Fetch books when category or page changes

const fetchBooks = async () => {
  setLoading(true);
  setError("");
  try {
    let searchTerm = "";
    if (category === "all") {
      searchTerm = query.trim() !== "" ? query : "book"; // Default term for "All"
    } else {
      searchTerm = category;
    }
    const startIndex = currentPage * maxResults;

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=${maxResults}&startIndex=${startIndex}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }

    const data = await response.json();
    setBooks(data.items || []);
    setTotalItems(data.totalItems || 0);
  } catch (err) {
    setError("Error fetching books. Please try again later.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page on new search
    fetchBooks();
  };
  
  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setCurrentPage(0); // Reset to first page when changing category
  };
  
  const totalPages = Math.ceil(totalItems / maxResults);
  
  // Format genre name for display (capitalize, replace hyphens)
  const formatGenre = (genre: string) => {
    if (genre === "all") return "All";
    return genre
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white py-16 px-6 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-cyan-400/10 rounded-full blur-xl animate-ping"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* AI Badge */}
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <span className="text-xs font-medium text-white">🤖 AI-Powered Discovery</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Explore Books with{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
              Boipoka.AI
            </span>
          </h1>
          <p className="text-blue-100 max-w-2xl mb-8 text-lg">
            Discover new books across various genres using our AI-powered recommendations.
            Search for your favorite authors, titles, or let AI suggest topics for you.
          </p>
          
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or keyword..."
              className="px-4 py-3 rounded-lg flex-grow text-gray-900 bg-white/90 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              aria-label="Search books"
            />
            <button
              type="submit"
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </span>
            </button>
          </form>
        </div>
      </div>
      
      {/* Categories filter */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 overflow-x-auto">
          <div className="flex space-x-3 items-center">
            {/* Main genres */}
            {mainGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => handleCategoryChange(genre)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  category === genre
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                {formatGenre(genre)}
              </button>
            ))}
            
            {/* "More" dropdown button */}
            <div className="relative">
              <button 
                onClick={() => setShowAllGenres(!showAllGenres)}
                className="whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center transition-all duration-300"
              >
                More 
                <svg className={`w-4 h-4 ml-1 transition-transform ${showAllGenres ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showAllGenres && (
                <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-blue-100 p-4 z-20 grid grid-cols-2 sm:grid-cols-3 gap-2 w-[300px]">
                  {extraGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => {
                        handleCategoryChange(genre);
                        setShowAllGenres(false);
                      }}
                      className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium text-left rounded-lg transition-colors ${
                        category === genre
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                          : "text-blue-700 hover:bg-blue-50"
                      }`}
                    >
                      {formatGenre(genre)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Books grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search results info */}
        {!loading && books.length > 0 && (
          <div className="mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              AI found {currentPage * maxResults + 1}-{Math.min((currentPage + 1) * maxResults, totalItems)} of {totalItems} results
            </span>
          </div>
        )}
      
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">AI is searching for books...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
            <svg className="w-5 h-5 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        
        {!loading && books.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No books found</h3>
            <p className="text-gray-500">Try a different search term or browse our AI-recommended categories</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 flex flex-col border border-blue-100 hover:-translate-y-1"
            >
              <div className="relative h-56 bg-gradient-to-br from-blue-50 to-cyan-50">
                {book.volumeInfo.imageLinks ? (
                  <Image
                    src={book.volumeInfo.imageLinks.thumbnail || ""}
                    alt={book.volumeInfo.title}
                    fill
                    style={{ objectFit: "cover" }}
                    className="p-2 rounded-xl"
                    unoptimized // Use unoptimized for external images
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 flex-grow">
                <h3 className="font-semibold text-lg line-clamp-2 text-gray-800 mb-2">
                  {book.volumeInfo.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                </p>
                
                {book.volumeInfo.categories && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {book.volumeInfo.categories.slice(0, 2).map((category, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-lg"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-gray-500 text-sm line-clamp-3">
                  {book.volumeInfo.description || "No description available"}
                </p>
              </div>
              
              <div className="p-4 border-t border-blue-100">
                <Link
                  href={`/book/${book.id}`}
                  className="block w-full text-center py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {books.length > 0 && !loading && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-lg border border-blue-200 bg-white text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
              >
                Previous
              </button>
              
              <div className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages || 1}
              </div>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!books.length || books.length < maxResults}
                className="px-4 py-2 rounded-lg border border-blue-200 bg-white text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}