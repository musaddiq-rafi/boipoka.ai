"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GENRES = [
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
  "children",
  "classic",
  "graphic-novel",
  "memoir",
  "education",
  "others",
];

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGenreToggle = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : prev.length < 5
        ? [...prev, genre]
        : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { getAuth } = await import("firebase/auth");
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const idToken = await user.getIdToken();

      await axios.post(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
        }/api/auth/signup`,
        {
          data: {
            username,
            bio,
            interestedGenres: genres,
          },
        },
        {
          headers: { Authorization: `Bearer ${idToken}` },
          withCredentials: true,
        }
      );
      router.push("/profile");
    } catch (err: unknown) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Signup failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Format genre name for display
  const formatGenre = (genre: string) => {
    return genre
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 flex flex-col justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl animate-ping"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

      <div className="max-w-2xl w-full mx-auto px-6 relative">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-200 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-10 text-center relative overflow-hidden">
            {/* Floating AI elements */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center animate-bounce">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <div className="absolute top-4 left-4 w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-ping"></div>
            
            {/* Brand */}
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 border border-white/30">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-3">
                Complete Your{" "}
                <span className="bg-gradient-to-r from-cyan-200 to-blue-100 bg-clip-text text-transparent">
                  AI Profile
                </span>
              </h1>
              
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3">
                <span className="text-sm font-medium text-white">🤖 Personalizing Your AI Experience</span>
              </div>
              
              <p className="text-blue-100 text-lg max-w-md mx-auto">
                Help our AI understand your reading preferences for smarter recommendations
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-blue-600 mb-2">
                <span>Setup Progress</span>
                <span>Final Step</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full w-full transition-all duration-300"></div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Username field */}
              <div className="space-y-2">
                <label className="block text-blue-700 font-semibold text-sm flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Username
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-medium">
                    @
                  </span>
                  <input
                    type="text"
                    className="pl-8 w-full rounded-xl border-2 border-blue-200 py-4 px-4 text-gray-800 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 group-hover:border-blue-300"
                    placeholder="Choose your unique AI reader ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  This will be your unique identifier on Boipoka.AI
                </p>
              </div>

              {/* Bio field */}
              <div className="space-y-2">
                <label className="block text-blue-700 font-semibold text-sm flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  Bio
                  <span className="text-xs font-normal text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Optional</span>
                </label>
                <textarea
                  className="w-full rounded-xl border-2 border-blue-200 py-4 px-4 text-gray-800 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 hover:border-blue-300 resize-none"
                  placeholder="Tell our AI about your reading journey, favorite authors, or what kind of books excite you..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Helps our AI understand your reading personality (max 500 characters)
                </p>
              </div>

              {/* Genre selection */}
              <div ref={dropdownRef} className="space-y-2">
                <label className="block text-blue-700 font-semibold text-sm flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  Favorite Genres
                  <span className="text-xs font-normal text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                    Select up to 5 for AI training
                  </span>
                </label>

                {/* Selected genres display */}
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200 min-h-[60px] flex flex-wrap gap-2 items-center">
                  {genres.length === 0 ? (
                    <div className="text-blue-400 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Select genres to train your AI reading assistant
                    </div>
                  ) : (
                    genres.map((genre) => (
                      <div
                        key={genre}
                        className="group bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <span className="font-medium">{formatGenre(genre)}</span>
                        <button
                          type="button"
                          onClick={() => handleGenreToggle(genre)}
                          className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Dropdown trigger button */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between py-4 px-4 border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 hover:border-blue-300 transition-all duration-300"
                >
                  <span className="text-blue-700 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {genres.length === 5
                      ? "Perfect! Maximum genres selected"
                      : `Add genres (${genres.length}/5 selected)`}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < genres.length ? 'bg-blue-500' : 'bg-blue-200'
                          }`}
                        />
                      ))}
                    </div>
                    <svg
                      className={`h-5 w-5 text-blue-400 transition-transform duration-300 ${
                        dropdownOpen ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute z-20 mt-2 w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-200 max-h-80 overflow-hidden">
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50">
                        {GENRES.map((genre) => {
                          const isSelected = genres.includes(genre);
                          const isDisabled = genres.length >= 5 && !isSelected;

                          return (
                            <button
                              key={genre}
                              type="button"
                              onClick={() => handleGenreToggle(genre)}
                              disabled={isDisabled}
                              className={`group px-4 py-3 text-sm text-left rounded-xl flex items-center gap-3 transition-all duration-300 ${
                                isSelected
                                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                                  : isDisabled
                                  ? "opacity-40 cursor-not-allowed bg-gray-50 text-gray-400"
                                  : "text-blue-700 hover:bg-blue-50 hover:shadow-md border border-blue-100 hover:border-blue-200"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                  isSelected
                                    ? "bg-white/20 border-white/30"
                                    : "border-blue-300 group-hover:border-blue-400"
                                }`}
                              >
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className="font-medium">{formatGenre(genre)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !username.trim()}
                  className="group w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="relative">
                        <div className="w-6 h-6 border-2 border-white/30 rounded-full"></div>
                        <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin absolute top-0 left-0"></div>
                      </div>
                      <span>Training Your AI Assistant...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Complete AI Setup & Enter Dashboard</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Sign in link */}
            <div className="text-center mt-8 pt-6 border-t border-blue-100">
              <p className="text-blue-600">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-blue-700 font-semibold hover:text-blue-800 hover:underline transition-colors"
                >
                  Sign in to your AI dashboard
                </Link>
              </p>
            </div>

            {/* Features preview */}
            <div className="mt-8 pt-6 border-t border-blue-100">
              <h3 className="text-blue-700 font-semibold mb-4 text-center flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                What You'll Get with AI Profile
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-blue-700 text-sm font-medium">Smart Recommendations</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-blue-700 text-sm font-medium">AI Reading Assistant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}