"use client";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { googleSignInPopup } from "@/lib/googleAuth";
import { FaGoogle } from "react-icons/fa";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { idToken } = await googleSignInPopup();
      // Call backend to check user
      const res = await axios.get(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
        }/api/auth/login`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
          withCredentials: true,
        }
      );
      const data = res.data;
      console.log("Sign in response:", data);
      if (data.success) {
        if (data.data.newUser) {
          router.push("/signup");
        } else {
          router.push("/profile");
        }
      } else {
        setError(data.message || "Sign in failed");
      }
    } catch (err: unknown) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to sign in with Google.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl animate-ping"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
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
            
            {/* Brand */}
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 border border-white/30">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-cyan-200 to-blue-100 bg-clip-text text-transparent">
                  Boipoka.AI
                </span>
              </h1>
              
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-2">
                <span className="text-xs font-medium text-white">🤖 AI-Powered Reading</span>
              </div>
              
              <p className="text-blue-100 text-sm">
                Sign in to unlock your personalized AI reading experience
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
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

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-4 bg-white border-2 border-blue-200 hover:border-blue-300 rounded-2xl py-4 px-6 text-gray-800 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaGoogle className="text-white" size={16} />
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
                  {isLoading ? "Connecting..." : "Continue with Google"}
                </span>
              </div>
              
              {isLoading && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-6 h-6 border-2 border-blue-200 rounded-full"></div>
                    <div className="w-6 h-6 border-t-2 border-blue-600 rounded-full animate-spin absolute top-0 left-0"></div>
                  </div>
                </div>
              )}
            </button>

            {/* AI Features Preview */}
            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-blue-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-blue-600 font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI-Enhanced Features
                  </span>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="group p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-700 text-sm mb-1">Smart Recommendations</h3>
                  <p className="text-blue-600 text-xs">AI-powered book suggestions</p>
                </div>

                <div className="group p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-700 text-sm mb-1">Smart Collections</h3>
                  <p className="text-blue-600 text-xs">Organize books intelligently</p>
                </div>

                <div className="group p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-700 text-sm mb-1">AI Chat Assistant</h3>
                  <p className="text-blue-600 text-xs">Get book insights instantly</p>
                </div>

                <div className="group p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-700 text-sm mb-1">Reading Analytics</h3>
                  <p className="text-blue-600 text-xs">Track your progress smartly</p>
                </div>
              </div>
            </div>

            {/* Sign up link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                New to Boipoka.AI?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
                >
                  Create your AI-powered account
                </Link>
              </p>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 pt-6 border-t border-blue-100">
              <div className="flex items-center justify-center gap-6 text-xs text-blue-600">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 text-xs text-blue-600">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Join 25K+ AI-enhanced readers</span>
          </div>
        </div>
      </div>
    </div>
  );
}