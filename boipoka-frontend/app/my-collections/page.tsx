"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";
import Image from "next/image";
import Link from "next/link";

// Initialize Firebase
initFirebase();

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

export default function MyCollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    visibility: "public" as "public" | "private" | "friends"
  });

  useEffect(() => {
    const fetchMyCollections = async () => {
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections?owner=me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        const { data } = response;

        if (data.success) {
          setCollections(data.data.collections || []);
        } else {
          setError(data.message || "Failed to load collections");
        }
      } catch (error: unknown) {
        console.error("Failed to load collections:", error);
        const errorMessage =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          "Failed to load collections";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchMyCollections();
      } else {
        router.push("/signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.title.trim()) {
      alert("Please enter a title for your collection");
      return;
    }

    setCreateLoading(true);

    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        setError("User not authenticated");
        return;
      }

      const token = await auth.currentUser.getIdToken();

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections`,
        {
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          visibility: createForm.visibility,
          books: []
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Add the new collection to the list
        setCollections(prev => [response.data.data.collection, ...prev]);

        // Reset form and close modal
        setCreateForm({
          title: "",
          description: "",
          visibility: "public"
        });
        setShowCreateModal(false);

        // Show success message
        alert("Collection created successfully!");
      } else {
        alert(response.data.message || "Failed to create collection");
      }
    } catch (error: unknown) {
      console.error("Failed to create collection:", error);
      const errorMessage =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to create collection";
      alert(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setCreateForm({
      title: "",
      description: "",
      visibility: "public"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-600">Loading your collections...</p>
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
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md"
            onClick={() => router.push("/signin")}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-16 px-6 sm:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl mb-8 px-6 py-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                <span className="text-xs font-medium text-white">📚 Personal Collections</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                My{" "}
                <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                  Collections
                </span>
              </h1>
              <p className="text-blue-100">Organize and manage your personal book collections</p>
            </div>
            <Link
              href="/profile"
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to Profile
            </Link>
          </div>
        </div>

        {/* Create Collection Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create New Collection
          </button>
        </div>

        {/* Collections Grid */}
        {collections.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection._id}
                href={`/collections/${collection._id}`}
                className="block bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-lg text-blue-700 line-clamp-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {collection.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
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

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {collection.description || "No description provided"}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-blue-100">
                  <span className="flex items-center gap-2 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {collection.books?.length || 0} book{collection.books?.length !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 0v9M8 12h8" />
                    </svg>
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm p-12 rounded-xl shadow-lg text-center border border-blue-200">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-blue-700 mb-3">No Collections Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Start building your book collections by creating your first collection and adding books you love!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create First Collection
              </button>
              <Link
                href="/explore"
                className="inline-flex items-center px-6 py-3 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 hover:border-blue-300 font-medium transition-all duration-300"
              >
                Explore Books
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl w-full max-w-md border border-blue-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-xl px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Create New Collection
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleCreateCollection} className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-blue-700 mb-2">
                    📚 Collection Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 text-blue-900 placeholder-blue-400"
                    placeholder="Enter collection title"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-blue-700 mb-2">
                    📝 Description
                  </label>
                  <textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-blue-50 text-blue-900 placeholder-blue-400"
                    placeholder="Describe your collection (optional)"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <div>
                  <label htmlFor="visibility" className="block text-sm font-medium text-blue-700 mb-2">
                    👁️ Visibility
                  </label>
                  <select
                    id="visibility"
                    value={createForm.visibility}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, visibility: e.target.value as "public" | "private" | "friends" }))}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 text-blue-900"
                  >
                    <option value="public">🌍 Public - Everyone can see</option>
                    <option value="private">🔒 Private - Only you can see</option>
                    <option value="friends">👥 Friends Only</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading || !createForm.title.trim()}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                  >
                    {createLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      "Create Collection"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}