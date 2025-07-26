"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchBookDetails } from "@/lib/googleBooks";
import AddToCollectionButton from "@/components/book/AddToCollectionButton";
import AddToReadingListButton from "@/components/book/AddToReadingListButton";
import { auth } from "@/lib/googleAuth";
import axios from "axios";

interface RecommendedBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
  };
  source: 'tag' | 'search' | 'personal' | 'reading-list' | 'collection';
}

function Toast({ msg, type = "success" }: { msg: string; type?: "success" | "error" }) {
  if (!msg) return null;

  if (type === "success") {
    return (
      <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl z-50 flex items-center shadow-lg backdrop-blur-sm">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
        <span>{msg}</span>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl shadow-lg z-50 backdrop-blur-sm">
      {msg}
    </div>
  );
}

function renderDescription(desc?: string) {
  if (!desc) return <span>No description available.</span>;

  const paragraphs = desc
    .replace(/<br\s*\/?\>/gi, "\n")
    .split(/<\/?p>/gi)
    .map((s) => s.trim())
    .filter(Boolean);

  return paragraphs.map((p, i) => (
    <p key={i} className="mb-3 last:mb-0 text-gray-700 text-sm leading-relaxed">
      {p}
    </p>
  ));
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [book, setBook] = useState<any>(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [recommendations, setRecommendations] = useState<RecommendedBook[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  // Separate recommendations state for reading list and collections
  const [readingListRecommendations, setReadingListRecommendations] = useState<RecommendedBook[]>([]);
  const [collectionRecommendations, setCollectionRecommendations] = useState<RecommendedBook[]>([]);
  const [loadingReadingListRecommendations, setLoadingReadingListRecommendations] = useState(false);
  const [loadingCollectionRecommendations, setLoadingCollectionRecommendations] = useState(false);
  const [hasReadingList, setHasReadingList] = useState(false);
  const [hasCollections, setHasCollections] = useState(false);

  // Fetch book details
  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoadingBook(true);
      try {
        const data = await fetchBookDetails(id);
        setBook(data);
      } catch (e) {
        console.error("Failed to load book", e);
      } finally {
        setLoadingBook(false);
      }
    })();
  }, [id]);

  // Fetch general recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!book) return;
      
      setLoadingRecommendations(true);
      try {
        // 1. Get recommendations based on book categories (for positions 1,3,5,7,9)
        let tagBasedBooks: RecommendedBook[] = [];
        if (book.categories && book.categories.length > 0) {
          const randomCategory = book.categories[Math.floor(Math.random() * book.categories.length)];
          const tagResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(randomCategory)}&maxResults=5`
          );
          
          if (tagResponse.ok) {
            const data = await tagResponse.json();
            if (data.items) {
              tagBasedBooks = data.items
                .filter((item: any) => item.id !== id)
                .map((item: any) => ({...item, source: 'tag' as const}));
            }
          }
        }
        
        // 2. Get recommendations based on book title search (for positions 2,4,6,8,10)
        let searchBasedBooks: RecommendedBook[] = [];
        const searchResponse = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(book.title)}&maxResults=5`
        );
        
        if (searchResponse.ok) {
          const data = await searchResponse.json();
          if (data.items) {
            searchBasedBooks = data.items
              .filter((item: any) => item.id !== id && !tagBasedBooks.some(b => b.id === item.id))
              .map((item: any) => ({...item, source: 'search' as const}));
          }
        }
        
        // 3. Blend the recommendations (alternating pattern)
        const blendedRecommendations: RecommendedBook[] = [];
        for (let i = 0; i < 5; i++) {
          if (i < tagBasedBooks.length) {
            blendedRecommendations.push(tagBasedBooks[i]); // Positions 0,2,4,6,8 (1-indexed: 1,3,5,7,9)
          }
          
          if (i < searchBasedBooks.length) {
            blendedRecommendations.push(searchBasedBooks[i]); // Positions 1,3,5,7,9 (1-indexed: 2,4,6,8,10)
          }
        }
        
        setRecommendations(blendedRecommendations.slice(0, 10));
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoadingRecommendations(false);
      }
    };
    
    fetchRecommendations();
  }, [book, id]);


// Fetch separate reading list and collection recommendations
useEffect(() => {
  const fetchPersonalRecommendations = async () => {
    if (!book) return;

    setLoadingReadingListRecommendations(true);
    setLoadingCollectionRecommendations(true);

    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        setHasReadingList(false);
        setHasCollections(false);
        setLoadingReadingListRecommendations(false);
        setLoadingCollectionRecommendations(false);
        return;
      }

      const token = await user.getIdToken();

      // Fetch user's reading list and collections
      const [readingListRes, collectionsRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/reading-list/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections?owner=me`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        )
      ]);

      // --- READING LIST ---
      const readingList: any[] = readingListRes.data.success ? readingListRes.data.data.readingList || [] : [];
      // Only use items with a valid volumeId
      const readingListBookIds = readingList.map(item => item.volumeId).filter(Boolean);
      setHasReadingList(readingListBookIds.length > 0);

      if (readingListBookIds.length > 0) {
        // Exclude current book
        const filteredReadingListIds = readingListBookIds.filter((bookId: string) => bookId !== id);
        if (filteredReadingListIds.length > 0) {
          const randomReadingListId = filteredReadingListIds[Math.floor(Math.random() * filteredReadingListIds.length)];
          const randomBookDetails = await fetchBookDetails(randomReadingListId);

          if (randomBookDetails.categories && randomBookDetails.categories.length > 0) {
            const randomCategory = randomBookDetails.categories[Math.floor(Math.random() * randomBookDetails.categories.length)];
            const readingListRecResponse = await fetch(
              `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(randomCategory)}&maxResults=5`
            );
            if (readingListRecResponse.ok) {
              const data = await readingListRecResponse.json();
              if (data.items) {
                const readingListRecs = data.items
                  .filter((item: any) => item.id !== id)
                  .map((item: any) => ({ ...item, source: 'reading-list' as const }));
                setReadingListRecommendations(readingListRecs);
              }
            }
          }
        } else {
          setReadingListRecommendations([]);
        }
      } else {
        setReadingListRecommendations([]);
      }

      // --- COLLECTIONS ---
      const collections: any[] = collectionsRes.data.success ? collectionsRes.data.data.collections || [] : [];
      const allCollectionBooks = collections.flatMap((collection: any) =>
        (collection.books || []).map((book: any) => book.volumeId)
      ).filter(Boolean);
      setHasCollections(allCollectionBooks.length > 0);

      const filteredCollectionIds = allCollectionBooks.filter((bookId: string) => bookId !== id);
      if (filteredCollectionIds.length > 0) {
        const randomCollectionId = filteredCollectionIds[Math.floor(Math.random() * filteredCollectionIds.length)];
        const randomBookDetails = await fetchBookDetails(randomCollectionId);

        if (randomBookDetails.categories && randomBookDetails.categories.length > 0) {
          const randomCategory = randomBookDetails.categories[Math.floor(Math.random() * randomBookDetails.categories.length)];
          const collectionRecResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(randomCategory)}&maxResults=5`
          );
          if (collectionRecResponse.ok) {
            const data = await collectionRecResponse.json();
            if (data.items) {
              const collectionRecs = data.items
                .filter((item: any) => item.id !== id && !readingListRecommendations.some(b => b.id === item.id))
                .map((item: any) => ({ ...item, source: 'collection' as const }));
              setCollectionRecommendations(collectionRecs);
            }
          }
        }
      } else {
        setCollectionRecommendations([]);
      }

    } catch (error) {
      console.error("Error fetching personal recommendations:", error);
      setReadingListRecommendations([]);
      setCollectionRecommendations([]);
    } finally {
      setLoadingReadingListRecommendations(false);
      setLoadingCollectionRecommendations(false);
    }
  };

  fetchPersonalRecommendations();
}, [book, id]);
// ...existing code...

  const handleCollectionSuccess = (message: string) => {
    setToast(message);
    setToastType("success");
    setTimeout(() => setToast(""), 3000);
  };

  const handleCollectionError = (message: string) => {
    setToast(message);
    setToastType("error");
    setTimeout(() => setToast(""), 3000);
  };

  const handleReadingListSuccess = (message: string) => {
    setToast(message);
    setToastType("success");
    setTimeout(() => setToast(""), 3000);
  };

  const handleReadingListError = (message: string) => {
    setToast(message);
    setToastType("error");
    setTimeout(() => setToast(""), 3000);
  };

  if (loadingBook)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-600 font-medium">Loading book details...</p>
        </div>
      </div>
    );

  if (!book)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Book not found</h3>
          <p className="text-gray-500">The book you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );

  const info = book;

  return (
    <>
      <Toast msg={toast} type={toastType} />
      {/* ----------- page body ----------- */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Two-column layout for main content and sidebar */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content area */}
            <div className="lg:flex-1">
              {/* Book Details Section */}
              <div className="grid md:grid-cols-3 gap-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-8 mb-10">
                {/* Book Cover Tile */}
                <div className="col-span-1 flex flex-col items-center">
                  <div className="w-48 h-72 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-lg flex items-center justify-center overflow-hidden mb-6 border border-blue-200">
                    {info.imageLinks?.thumbnail ? (
                      <Image
                        src={info.imageLinks.thumbnail}
                        alt={info.title}
                        width={200}
                        height={300}
                        className="rounded-lg object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex flex-col items-center text-blue-400">
                        <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-sm">No image available</span>
                      </div>
                    )}
                  </div>

                  {/* -------- Add to Collection button -------- */}
                  <AddToCollectionButton
                    bookId={id}
                    onSuccess={handleCollectionSuccess}
                    onError={handleCollectionError}
                  />

                  {/* -------- Add to Reading List button -------- */}
                  <AddToReadingListButton
                    bookId={id}
                    onSuccess={handleReadingListSuccess}
                    onError={handleReadingListError}
                  />

                  <Link
                    href="/explore"
                    className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-semibold shadow hover:bg-blue-100 hover:text-blue-800 transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Explore
                  </Link>
                </div>

                {/* Book Details Tile */}
                <div className="col-span-2 flex flex-col gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-blue-700 mb-3">{info.title}</h1>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium text-blue-600">Author(s):</span> {info.authors?.join(", ") || "Unknown"}
                    </p>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium text-blue-600">Published:</span> {info.publishedDate || "Unknown"}
                    </p>
                    {info.categories && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {info.categories.map((c: string, i: number) => (
                          <span key={i} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full border border-blue-200">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    {info.averageRating && (
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-blue-600 font-medium">Rating:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-blue-700 font-bold">{info.averageRating}</span>
                          <span className="text-gray-500">/ 5</span>
                          <div className="flex ml-2">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(info.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 shadow-inner border border-blue-200">
                    <h2 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Description
                    </h2>
                    {renderDescription(info.description)}
                  </div>
                </div>
              </div>
              
              {/* Reading List Recommendations Section */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-blue-700 mb-6">
                  <span className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    Recommendations from your Reading List
                  </span>
                </h2>
                
                {loadingReadingListRecommendations ? (
                  <div className="flex justify-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-blue-600 text-sm">AI is analyzing your reading list...</p>
                    </div>
                  </div>
                ) : hasReadingList && readingListRecommendations.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                    {readingListRecommendations.map((book) => (
                      <Link href={`/book/${book.id}`} key={book.id} className="block group">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 border border-blue-100 hover:-translate-y-1">
                          <div className="aspect-[2/3] relative">
                            {book.volumeInfo.imageLinks?.thumbnail ? (
                              <Image
                                src={book.volumeInfo.imageLinks.thumbnail}
                                alt={book.volumeInfo.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-400 text-sm">
                                <div className="text-center">
                                  <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                  </svg>
                                  No cover
                                </div>
                              </div>
                            )}
                            {/* AI Badge */}
                            <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">{book.volumeInfo.title}</h3>
                            <p className="text-gray-600 text-xs line-clamp-1">{book.volumeInfo.authors?.join(", ") || "Unknown"}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 p-8 text-center rounded-xl">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-blue-700 mb-2">No AI recommendations yet</h3>
                    <p className="text-blue-600 mb-4">Add books to your reading list for personalized AI recommendations!</p>
                    <Link href="/reading-list" className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-md">
                      Go to Reading List
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Collection Recommendations Section */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-blue-700 mb-6">
                  <span className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    Recommendations from Your Collections
                  </span>
                </h2>
                
                {loadingCollectionRecommendations ? (
                  <div className="flex justify-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-blue-600 text-sm">AI is analyzing your collections...</p>
                    </div>
                  </div>
                ) : hasCollections && collectionRecommendations.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                    {collectionRecommendations.map((book) => (
                      <Link href={`/book/${book.id}`} key={book.id} className="block group">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 border border-blue-100 hover:-translate-y-1">
                          <div className="aspect-[2/3] relative">
                            {book.volumeInfo.imageLinks?.thumbnail ? (
                              <Image
                                src={book.volumeInfo.imageLinks.thumbnail}
                                alt={book.volumeInfo.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-400 text-sm">
                                <div className="text-center">
                                  <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                  </svg>
                                  No cover
                                </div>
                              </div>
                            )}
                            {/* AI Badge */}
                            <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">{book.volumeInfo.title}</h3>
                            <p className="text-gray-600 text-xs line-clamp-1">{book.volumeInfo.authors?.join(", ") || "Unknown"}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 p-8 text-center rounded-xl">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-blue-700 mb-2">No AI recommendations yet</h3>
                    <p className="text-blue-600 mb-4">Create collections and add books for personalized AI recommendations!</p>
                    <Link href="/collections" className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-md">
                      Go to Collections
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar for Similar Books */}
            <div className="lg:w-80 w-full">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  Similar Books based on this
                </h2>
                
                {loadingRecommendations ? (
                  <div className="flex justify-center py-8">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-blue-600 text-xs">AI is finding similar books...</p>
                    </div>
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((book, index) => (
                      <Link href={`/book/${book.id}`} key={book.id} className="flex gap-3 hover:bg-blue-50 rounded-lg p-3 transition-all duration-300 border border-transparent hover:border-blue-200">
                        <div className="w-12 h-16 flex-shrink-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded overflow-hidden border border-blue-200">
                          {book.volumeInfo.imageLinks?.thumbnail ? (
                            <Image
                              src={book.volumeInfo.imageLinks.thumbnail}
                              alt={book.volumeInfo.title}
                              width={48}
                              height={64}
                              className="object-cover w-full h-full"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-400 text-xs">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{book.volumeInfo.title}</h3>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2">
                              #{index + 1}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                            {book.volumeInfo.authors?.join(", ") || "Unknown"}
                          </p>
                          <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                            {book.source === 'tag' ? 'Based on category' : 'Based on search'}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-blue-600 text-sm font-medium">No similar books found</p>
                    <p className="text-gray-500 text-xs mt-1">AI couldn't find similar recommendations</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}