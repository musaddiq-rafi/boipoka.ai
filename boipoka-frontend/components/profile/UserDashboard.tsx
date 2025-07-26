"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";
import { fetchBookDetails } from "@/lib/googleBooks";

// Initialize Firebase
initFirebase();

interface ProfileData {
  _id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  interestedGenres: string[];
  createdAt: string;
  updatedAt: string;
}

interface Collection {
  _id: string;
  title: string;
  description: string;
  visibility: string;
  books: Array<{
    volumeId: string;
    addedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ReadingItem {
  _id: string;
  volumeId: string;
  status: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  bookDetails?: {
    title: string;
    authors: string[];
    thumbnail: string;
  };
}

interface Blog {
  _id: string;
  title: string;
  visibility: string;
  spoilerAlert: boolean;
  genres: string[];
  createdAt: string;
  updatedAt: string;
}

const tabs = ["My Collections", "Reading Tracker", "Blogs", "Discussions"];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("My Collections");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [readingList, setReadingList] = useState<ReadingItem[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError("");

      try {
        const auth = getAuth();

        if (!auth.currentUser) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const token = await auth.currentUser.getIdToken();

        const response = await axios.get(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
          }/api/profile/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        const { data } = response;

        if (data.success) {
          console.log("Profile data received:", data.data);
          setProfile(data.data.profile_data);

          // Set collections without fetching book details (for preview)
          const collectionsData = data.data.collections || [];
          console.log("Collections data:", collectionsData);
          setCollections(collectionsData);

          // Fetch book details for reading list items
          const readingItems = data.data.reading_tracker || [];
          console.log("Reading items:", readingItems);
          setLoadingBooks(true);

          if (readingItems.length > 0) {
            const readingItemsWithDetails = await Promise.all(
              readingItems.map(async (item: ReadingItem) => {
                const bookDetails = await fetchBookDetails(item.volumeId);
                return {
                  ...item,
                  bookDetails: {
                    title: bookDetails.title,
                    authors: bookDetails.authors || [],
                    thumbnail: bookDetails.imageLinks?.thumbnail || bookDetails.imageLinks?.smallThumbnail || "",
                  },
                };
              })
            );
            setReadingList(readingItemsWithDetails);
          } else {
            setReadingList([]);
          }
          setLoadingBooks(false);

          setBlogs(data.data.blogs || []);
        } else {
          setError(data.message || "Failed to load profile data");
        }
      } catch (error: unknown) {
        console.error("Failed to load profile data:", error);
        const errorMessage =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          "Failed to load profile data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProfileData();
      } else {
        setError("Please log in to view your dashboard");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <p className="text-blue-600 font-semibold text-lg">Loading your dashboard</p>
            <p className="text-blue-500 text-sm animate-pulse">Preparing your AI-enhanced experience...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-700 mb-3">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => (window.location.href = "/signin")}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-blue-700 mb-3">Profile Not Found</h3>
          <p className="text-blue-600">No profile data found for your account</p>
        </div>
      </div>
    );
  }

  const getStatValue = (status: string) => {
    return readingList.filter(item => item.status === status).length;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Hero Section with Profile */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl animate-ping"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 px-6 py-16 sm:px-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Profile Image and Info */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl backdrop-blur-sm">
                    <Image
                      src={profile.avatar}
                      alt="User Avatar"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  {/* AI Badge */}
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                    <span className="text-lg">🤖</span>
                  </div>
                  {/* Online Status */}
                  <div className="absolute top-2 right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>

                {/* User Basic Info */}
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm font-medium text-white">AI-Enhanced Reader</span>
                  </div>
                  
                  <h1 className="text-4xl font-bold mb-3">
                    <span className="bg-gradient-to-r from-cyan-200 to-blue-100 bg-clip-text text-transparent">
                      {profile.displayName}
                    </span>
                  </h1>
                  
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-blue-100 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span>{profile.username}</span>
                  </div>
                  
                  <p className="text-blue-100 text-lg mb-6 max-w-md">{profile.bio}</p>
                  
                  {/* Interest Tags */}
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {(profile.interestedGenres || []).slice(0, 4).map((genre, index) => (
                      <span
                        key={index}
                        className="bg-white/10 backdrop-blur-sm text-cyan-200 text-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-colors"
                      >
                        #{genre}
                      </span>
                    ))}
                    {profile.interestedGenres?.length > 4 && (
                      <span className="bg-white/10 backdrop-blur-sm text-cyan-200 text-sm px-4 py-2 rounded-full border border-white/20">
                        +{profile.interestedGenres.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                    <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{collections.length}</div>
                    <div className="text-blue-200 text-sm">Collections</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                    <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{getStatValue('reading')}</div>
                    <div className="text-blue-200 text-sm">Reading</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                    <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{getStatValue('completed')}</div>
                    <div className="text-blue-200 text-sm">Completed</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{getStatValue('interested')}</div>
                    <div className="text-blue-200 text-sm">Wishlist</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Link
                    href="/explore"
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2 group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Explore Books
                  </Link>
                  
                  <Link
                    href="/my-collections"
                    className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center gap-2 font-medium group shadow-lg"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-12 sm:px-10">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 mb-8 overflow-hidden">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-6 text-sm font-medium whitespace-nowrap transition-all duration-300 relative ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                      : "text-blue-700 hover:text-blue-800 hover:bg-blue-50"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {index === 0 && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                    {index === 1 && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                    {index === 2 && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                    {index === 3 && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                    {tab}
                  </span>
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "My Collections" && (
              <div className="space-y-8">
                {(collections || []).length > 0 ? (
                  <>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {collections.slice(0, 6).map((collection, index) => (
                        <Link
                          key={collection._id}
                          href={`/collections/${collection._id}`}
                          className="group block bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-8 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              collection.visibility === 'public'
                                ? 'bg-green-100 text-green-700'
                                : collection.visibility === 'private'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {collection.visibility === 'public' && '🌍 Public'}
                              {collection.visibility === 'private' && '🔒 Private'}
                              {collection.visibility === 'friends' && '👥 Friends'}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-blue-700 text-xl mb-3 line-clamp-2 group-hover:text-blue-800 transition-colors">
                            {collection.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                            {collection.description || "No description provided"}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <span className="font-medium">{collection.books?.length || 0} books</span>
                            </div>
                            <div className="text-gray-400 text-xs">
                              {new Date(collection.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* See More button for Collections */}
                    <div className="flex justify-center">
                      <Link
                        href="/my-collections"
                        className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
                      >
                        View All Collections
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/90 backdrop-blur-sm p-16 rounded-3xl shadow-xl text-center border border-blue-200">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-8">
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-blue-700 mb-4">Start Your Collection Journey</h3>
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                      Create your first collection and start organizing your favorite books with AI-powered recommendations!
                    </p>
                    <Link
                      href="/my-collections"
                      className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Create Your First Collection
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Reading Tracker" && (
              <div className="space-y-8">
                {loadingBooks ? (
                  <div className="flex justify-center py-16">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-600 font-semibold">Loading your books</p>
                        <p className="text-blue-500 text-sm animate-pulse">Fetching AI-enhanced details...</p>
                      </div>
                    </div>
                  </div>
                ) : (readingList || []).length > 0 ? (
                  <>
                    <div className="grid gap-6 md:grid-cols-2">
                      {readingList.slice(0, 6).map((item) => (
                        <div
                          key={item._id}
                          className="group bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-6"
                        >
                          <div className="flex-shrink-0 w-20 h-28 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center overflow-hidden border border-blue-200 group-hover:scale-105 transition-transform">
                            {item.bookDetails?.thumbnail ? (
                              <Image
                                src={item.bookDetails.thumbnail}
                                alt={item.bookDetails.title || "Book cover"}
                                width={80}
                                height={112}
                                className="w-full h-full object-cover"
                                unoptimized={true}
                              />
                            ) : (
                              <div className="text-blue-600 text-center px-2">
                                <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span className="text-xs">No Cover</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-bold text-blue-700 text-lg mb-2 line-clamp-2 group-hover:text-blue-800 transition-colors">
                              {item.bookDetails?.title || "Unknown Title"}
                            </h4>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-1">
                              by {item.bookDetails?.authors?.join(", ") || "Unknown Author"}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                item.status === 'reading' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : item.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-cyan-100 text-cyan-800'
                              }`}>
                                {item.status === 'reading' && '📖 Reading'}
                                {item.status === 'completed' && '✅ Completed'}
                                {item.status === 'interested' && '💭 Want to Read'}
                              </span>
                              
                              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full capitalize">
                                {item.visibility}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* See More button for Reading Tracker */}
                    <div className="flex justify-center">
                      <Link
                        href="/readingitems"
                        className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
                      >
                        View All Reading Items
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/90 backdrop-blur-sm p-16 rounded-3xl shadow-xl text-center border border-blue-200">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-8">
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-blue-700 mb-4">Begin Your Reading Journey</h3>
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                      Start tracking your reading progress and discover AI-powered book recommendations tailored just for you!
                    </p>
                    <Link
                      href="/explore"
                      className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Discover Books
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Blogs" && (
              <div className="space-y-8">
                {(blogs || []).length > 0 ? (
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {blogs.map((blog) => (
                      <div
                        key={blog._id}
                        className="group bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              blog.visibility === 'public'
                                ? 'bg-green-100 text-green-700'
                                : blog.visibility === 'private'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {blog.visibility === 'public' && '🌍 Public'}
                              {blog.visibility === 'private' && '🔒 Private'}
                              {blog.visibility === 'friends' && '👥 Friends'}
                            </span>
                            {blog.spoilerAlert && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                ⚠️ Spoiler
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <h4 className="font-bold text-blue-700 text-xl mb-4 line-clamp-2 group-hover:text-blue-800 transition-colors">
                          {blog.title}
                        </h4>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.genres.slice(0, 3).map((genre, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs">
                              #{genre}
                            </span>
                          ))}
                        </div>
                        
                        <div className="text-gray-400 text-xs">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/90 backdrop-blur-sm p-16 rounded-3xl shadow-xl text-center border border-blue-200">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8">
                      <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-blue-700 mb-4">Share Your Stories</h3>
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                      Start writing and share your thoughts, reviews, and book discussions with the community!
                    </p>
                    <button className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                      Write Your First Blog
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Discussions" && (
              <div className="bg-white/90 backdrop-blur-sm p-16 rounded-3xl shadow-xl text-center border border-blue-200">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-blue-700 mb-4">AI-Powered Discussions Coming Soon</h3>
                <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                  Join intelligent book discussions powered by AI. Connect with fellow readers and discover new perspectives!
                </p>
                <div className="mt-8 flex items-center justify-center gap-2 text-blue-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}