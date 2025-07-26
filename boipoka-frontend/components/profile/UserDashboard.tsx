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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-amber-700 text-white rounded-lg"
          onClick={() => (window.location.href = "/signin")}
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-10">
        <p>No profile data found</p>
      </div>
    );
  }

  return (
    <main className="bg-white text-gray-900 py-16 px-6 sm:px-10 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
          <Image
            src={profile.avatar}
            alt="User Avatar"
            width={80}
            height={80}
            className="rounded-full border border-gray-200"
          />
          <div>
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            <p className="text-sm text-gray-500">
              @{profile.username} • {profile.email}
            </p>
            <p className="mt-2 text-gray-700">{profile.bio}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {(profile.interestedGenres || []).map((genre, index) => (
                <span
                  key={index}
                  className="bg-amber-100 text-amber-700 text-sm px-3 py-1 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
                  activeTab === tab
                    ? "bg-amber-100 text-amber-700"
                    : "text-gray-600 hover:text-amber-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "My Collections" && (
            <div className="space-y-4">
              {(collections || []).length > 0 ? (
                <>
                  {collections.map((collection) => (
                    <Link
                        key={collection._id}
                        href={`/collections/${collection._id}`}
                        className="block border p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition"
                        >
                    <h3 className="font-semibold text-amber-700">
                      {collection.title}
                    </h3>
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {collection.description}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      {collection.visibility} • {collection.books?.length || 0} book
                      {collection.books?.length !== 1 ? "s" : ""}
                    </div>
                    </Link>
                  ))}

                  {/* See More button for Collections */}
                  <div className="flex justify-center mt-6">
                    <Link
                      href="/my-collections"
                      className="px-4 py-2 text-amber-700 border border-amber-200 rounded-md hover:bg-amber-50 flex items-center gap-1 transition-colors"
                    >
                      See All Collections
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  You have no collections yet
                </p>
              )}
            </div>
          )}

          {activeTab === "Reading Tracker" && (
            <div className="space-y-4">
              {loadingBooks ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-700"></div>
                  <span className="ml-2 text-gray-600">
                    Loading book details...
                  </span>
                </div>
              ) : (readingList || []).length > 0 ? (
                <>
                  {readingList.map((item) => (
                    <div
                      key={item._id}
                      className="border p-4 rounded-xl bg-amber-50 flex items-center gap-4"
                    >
                      <div className="flex-shrink-0 w-15 h-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        {item.bookDetails?.thumbnail ? (
                          <Image
                            src={item.bookDetails.thumbnail}
                            alt={item.bookDetails.title || "Book cover"}
                            width={60}
                            height={80}
                            className="rounded-md object-cover"
                            unoptimized={true}
                          />
                        ) : (
                          <span className="text-gray-400 text-xs text-center px-1">
                            No Image
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-700 text-lg">
                          {item.bookDetails?.title || "Unknown Title"}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          by{" "}
                          {item.bookDetails?.authors?.join(", ") ||
                            "Unknown Author"}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                            {item.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.visibility}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* See More button for Reading Tracker */}
                  <div className="flex justify-center mt-6">
                    <Link
                      href="/readingitems"
                      className="px-4 py-2 text-amber-700 border border-amber-200 rounded-md hover:bg-amber-50 flex items-center gap-1 transition-colors"
                    >
                      See All Reading Items
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Your reading list is empty
                </p>
              )}
            </div>
          )}

          {activeTab === "Blogs" && (
            <div className="space-y-3">
              {(blogs || []).length > 0 ? (
                blogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="border p-3 rounded-md bg-amber-50"
                  >
                    <h4 className="font-semibold text-amber-700">
                      {blog.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Visibility: {blog.visibility}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  You haven&apos;t created any blogs yet
                </p>
              )}
            </div>
          )}

          {activeTab === "Discussions" && (
            <div className="text-gray-600 text-center py-4">
              Discussions feature coming soon
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
