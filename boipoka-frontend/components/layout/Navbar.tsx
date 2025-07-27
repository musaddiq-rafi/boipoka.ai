"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";

import { initFirebase } from "@/lib/googleAuth";

initFirebase(); // Initialize Firebase only once

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Function to determine if a link is active
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') {
      return false;
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Get link styles based on active state
  const getLinkStyles = (path: string) => {
    if (isActive(path)) {
      return "font-medium text-blue-600 transition"; // Active link
    }
    return "text-gray-600 hover:text-blue-600 transition"; // Inactive link
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-blue-100 py-3 px-6 sm:px-10 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-3 font-bold text-xl text-gray-900"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Boipoka.AI
          </span>
        </Link>
        
        <div className="hidden md:flex space-x-6 items-center">
          <Link
            href="/"
            className={isActive('/') ? "font-medium text-blue-600 transition" : "text-gray-600 hover:text-blue-600 transition"}
          >
            Home
          </Link>
          {user && (
            <>
              <Link
                href="/explore"
                className={getLinkStyles('/explore')}
              >
                Explore
              </Link>
             
              <Link
                  href="/character-chat"
                  className={getLinkStyles('/character-chat')}
              >
                Fictional Chat
              </Link>
              <Link
                  href="/character-guess"
                  className={getLinkStyles('/character-guess')}
              >
                Bookinator
              </Link>
              <Link
                href="/collections"
                className={getLinkStyles('/collections')}
              >
                Collections
              </Link>
              <Link
                href="/discussions"
                className={getLinkStyles('/discussions')}
              >
                Discussions
              </Link>
            </>
          )}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 focus:outline-none"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-blue-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center border border-blue-200">
                    <span className="text-white font-semibold text-sm">
                      {user.displayName?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <span className={isActive('/profile') ? "font-medium text-blue-600" : "font-medium text-gray-900"}>
                  {user.displayName?.split(" ")[0] || "User"}
                </span>
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-blue-100 z-50">
                  <div className="p-4 border-b border-blue-100">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                          width={40}
                          height={40}
                          className="rounded-full border-2 border-blue-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.displayName?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName || "User"}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className={`block px-4 py-3 text-sm ${isActive('/profile') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-blue-50'}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className={`block px-4 py-3 text-sm ${isActive('/settings') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-blue-50'}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    onClick={async () => {
                      await signOut(getAuth());
                      setMenuOpen(false);
                      router.push("/");
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-3 items-center">
              <Link
                href="/signin"
                className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/signin') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'} transition`}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/signup') 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'} transition shadow-md`}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-6 w-6 text-blue-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-blue-100 bg-white/95 backdrop-blur-sm rounded-b-xl shadow-lg">
          <div className="flex flex-col space-y-2 px-2 pb-4">
            <Link 
              href="/" 
              className={`${isActive('/') ? "text-blue-600 bg-blue-50" : "text-gray-900 hover:text-blue-600 hover:bg-blue-50"} font-medium py-2 px-3 rounded-lg transition`}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  href="/explore"
                  className={`${isActive('/explore') ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"} py-2 px-3 rounded-lg transition`}
                  onClick={() => setMenuOpen(false)}
                >
                  Explore
                </Link>
                <Link
                  href="/ai-chat"
                  className={`${isActive('/ai-chat') ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"} py-2 px-3 rounded-lg transition`}
                  onClick={() => setMenuOpen(false)}
                >
                  AI Chat
                </Link>
                <Link
                    href="/character-chat"
                    className={`${isActive('/character-chat') ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"} py-2 px-3 rounded-lg transition`}
                    onClick={() => setMenuOpen(false)}
                >
                  Character Chat
                </Link>
                <Link
                    href="/character-guess"
                    className={`${isActive('/character-guess') ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"} py-2 px-3 rounded-lg transition`}
                    onClick={() => setMenuOpen(false)}
                >
                  Character Guesser
                </Link>
                <Link
                  href="/collections"
                  className={`${isActive('/collections') ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"} py-2 px-3 rounded-lg transition`}
                  onClick={() => setMenuOpen(false)}
                >
                  Collections
                </Link>
                <Link
                  href="/discussions"
                  className={`${isActive('/discussions') ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"} py-2 px-3 rounded-lg transition`}
                  onClick={() => setMenuOpen(false)}
                >
                  Discussions
                </Link>
              </>
            )}
            {user ? (
              <>
                <Link
                  href="/profile"
                  className={`${isActive('/profile') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"} py-2 px-3 rounded-lg transition`}
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 py-2 px-3 text-left rounded-lg transition"
                  onClick={async () => {
                    await signOut(getAuth());
                    setMenuOpen(false);
                    router.push("/");
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className={`${isActive('/signin') ? "text-blue-600 bg-blue-50" : "text-blue-600 hover:bg-blue-50"} font-medium py-2 px-3 rounded-lg transition`}
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={`${isActive('/signup') ? 'bg-blue-700' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'} text-white rounded-lg px-3 py-2 font-medium text-center transition shadow-md`}
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}