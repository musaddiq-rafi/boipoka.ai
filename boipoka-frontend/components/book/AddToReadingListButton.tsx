"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import axios from "axios";

interface AddToReadingListButtonProps {
  bookId: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  className?: string;
}

export default function AddToReadingListButton({
  bookId,
  onSuccess,
  onError,
  className = "w-full mt-4 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
}: AddToReadingListButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<"interested" | "reading" | "completed">("interested");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [visibility, setVisibility] = useState<"public" | "private" | "friends">("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset dates when status changes
  useEffect(() => {
    if (status === "interested") {
      setStartDate("");
      setEndDate("");
    } else if (status === "reading") {
      setStartDate(new Date().toISOString().split("T")[0]); // Today
      setEndDate("");
    } else if (status === "completed") {
      if (!startDate) {
        setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]); // 7 days ago
      }
      setEndDate(new Date().toISOString().split("T")[0]); // Today
    }
  }, [status]);

  const handleAddToReadingList = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("Please sign in to add books to your reading list");
        router.push("/signin");
        return;
      }

      const idToken = await user.getIdToken();

      // Prepare request data based on status
      const requestData: any = {
        volumeId: bookId,
        status,
        visibility
      };

      // Add dates based on status requirements
      if (status === "reading" || status === "completed") {
        requestData.startedAt = startDate ? new Date(startDate).toISOString() : null;
      }

      if (status === "completed") {
        requestData.completedAt = endDate ? new Date(endDate).toISOString() : null;
      }

      // Validate dates based on requirements
      if ((status === "reading" || status === "completed") && !startDate) {
        setError("Start date is required for 'Reading' or 'Completed' status");
        setIsSubmitting(false);
        return;
      }

      if (status === "completed" && !endDate) {
        setError("Completion date is required for 'Completed' status");
        setIsSubmitting(false);
        return;
      }

      if (status === "completed" && new Date(endDate) < new Date(startDate)) {
        setError("Completion date cannot be earlier than start date");
        setIsSubmitting(false);
        return;
      }

      // Send request to API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/reading-list`,
        {
          data: requestData
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          },
          withCredentials: true
        }
      );

      onSuccess?.("Book added to your reading list!");
      setIsModalOpen(false);

    } catch (err: any) {
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        "Failed to add book to reading list";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Add to Reading List
      </button>

      {/* Reading List Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl max-w-md w-full shadow-xl border border-blue-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-xl px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Add to Reading List
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {error && (
                <div className="mb-5 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-5">
                {/* Reading Status */}
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    📚 Reading Status
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <select
                      className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-blue-50 text-blue-900"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="interested">📖 Interested</option>
                      <option value="reading">📚 Currently Reading</option>
                      <option value="completed">✅ Completed</option>
                    </select>
                  </div>
                </div>

                {/* Start Date - show if status is 'reading' or 'completed' */}
                {(status === "reading" || status === "completed") && (
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      📅 Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-blue-50 text-blue-900"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                )}

                {/* End Date - show if status is 'completed' */}
                {status === "completed" && (
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      🎉 Completion Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-blue-50 text-blue-900"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                )}

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    👁️ Visibility
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <select
                      className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-blue-50 text-blue-900"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                    >
                      <option value="public">🌍 Public - Everyone can see</option>
                      <option value="private">🔒 Private - Only you can see</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-blue-50 px-6 py-4 border-t border-blue-200 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToReadingList}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-300 disabled:opacity-50 shadow-md"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Adding...
                  </span>
                ) : (
                  "Add to Reading List"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}