"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
}

interface Collection {
  _id: string;
  user: User;
  title: string;
  description: string;
  books: string[];
  tags: string[];
  visibility: "public" | "private" | "friends";
  createdAt: string;
  updatedAt: string;
  bookDetails?: any[]; // To store fetched book details
}

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthInitialized(true);

      try {
        setLoading(true);

        let headers = {};

        if (user) {
          const token = await user.getIdToken();
          headers = {
            Authorization: `Bearer ${token}`
          };
        } else {
          // If not authenticated, redirect to signin
          router.push("/signin");
          return;
        }

        // Fetch all public collections (no query params)
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections`,
          {
            headers,
            withCredentials: true
          }
        );

        if (response.data.success) {
          const collectionsData = response.data.data.collections || [];

          // Fetch book details for each collection
          const collectionsWithBookDetails = await Promise.all(
            collectionsData.map(async (collection: Collection) => {
              // Fetch details for up to 5 books per collection to keep it manageable
              const bookDetailsPromises = collection.books
                .slice(0, 5)
                .map(async (volumeId) => {
                  try {
                    const bookResponse = await fetch(
                      `https://www.googleapis.com/books/v1/volumes/${volumeId}`
                    );
                    if (bookResponse.ok) {
                      return await bookResponse.json();
                    }
                    return null;
                  } catch (error) {
                    console.error(`Error fetching details for book ${volumeId}:`, error);
                    return null;
                  }
                });

              const bookDetails = await Promise.all(bookDetailsPromises);
              return { ...collection, bookDetails: bookDetails.filter(book => book !== null) };
            })
          );

          setCollections(collectionsWithBookDetails);
        } else {
          setError(response.data.message || "Failed to load collections");
        }
      } catch (error: any) {
        console.error("Error fetching collections:", error);
        setError(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get visibility badge
  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">🌍 Public</span>;
      case "private":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">🔒 Private</span>;
      case "friends":
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">👥 Friends</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center max-w-md">
          <svg className="w-8 h-8 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push("/explore")}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Simple Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-700 mb-1">Book Collections</h1>
            <p className="text-gray-600">Discover curated book collections from our community</p>
          </div>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md flex items-center gap-2"
            onClick={() => router.push("/profile")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            My Collections
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {collections.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center border border-blue-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">No Collections Found</h3>
            <p className="text-gray-600 mb-6">Be the first to create and share a collection!</p>
            <button
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md"
              onClick={() => router.push("/profile")}
            >
              Create Your First Collection
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {collections.map((collection) => (
              <Link
                key={collection._id}
                href={`/collections/${collection._id}`}
                className="block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-blue-200 hover:border-blue-300"
              >
                <div className="p-6">
                  {/* Collection Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {collection.title}
                      </h2>
                      {/* Creator info */}
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-3 border-2 border-blue-200">
                          <Image
                            src={collection.user.avatar}
                            alt={collection.user.displayName}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{collection.user.displayName}</span>
                          <span className="text-gray-500"> (@{collection.user.username})</span>
                        </div>
                      </div>
                    </div>
                    {getVisibilityBadge(collection.visibility)}
                  </div>

                  {/* Collection Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {collection.description || "No description provided"}
                  </p>

                  {/* Book Previews */}
                  <div className="mb-6">
                    {collection.bookDetails && collection.bookDetails.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-medium text-blue-700 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Books in this collection ({collection.books.length})
                        </h3>
                        <div className="flex space-x-4 overflow-x-auto pb-3 -mx-1 px-1">
                          {collection.bookDetails.map((book, index) => (
                            <div key={index} className="flex-shrink-0 w-24">
                              <div className="w-24 h-32 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-md overflow-hidden border border-blue-200">
                                {book?.volumeInfo?.imageLinks?.thumbnail ? (
                                  <Image
                                    src={book.volumeInfo.imageLinks.thumbnail}
                                    alt={book.volumeInfo.title || "Book cover"}
                                    width={96}
                                    height={128}
                                    className="h-full w-full object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-blue-600 text-xs text-center px-2">
                                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    No cover
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-700 mt-2 truncate font-medium" title={book?.volumeInfo?.title}>
                                {book?.volumeInfo?.title || "Unknown"}
                              </p>
                            </div>
                          ))}

                          {/* More books indicator */}
                          {collection.books.length > 5 && (
                            <div className="flex-shrink-0 w-24">
                              <div className="w-24 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg shadow-md flex flex-col items-center justify-center border border-blue-300">
                                <svg className="w-6 h-6 text-blue-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="text-blue-700 font-semibold text-sm">
                                  +{collection.books.length - 5}
                                </span>
                                <span className="text-blue-600 text-xs">more</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : collection.books.length > 0 ? (
                      <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        📚 This collection has {collection.books.length} {collection.books.length === 1 ? 'book' : 'books'}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        📭 This collection is empty
                      </div>
                    )}
                  </div>

                  {/* Collection Metadata */}
                  <div className="flex items-center justify-between pt-4 border-t border-blue-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 0v9M8 12h8" />
                      </svg>
                      Created on {formatDate(collection.createdAt)}
                    </div>

                    <div>
                      {collection.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {collection.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                          {collection.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{collection.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}