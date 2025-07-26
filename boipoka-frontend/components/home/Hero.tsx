"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const phrases = [
  `AI-Powered Reading`,
  `Smart Book Discovery`,
  `Intelligent Writing`,
  `Literary AI Assistant`,
];

const TypewriterText = ({ text, speed = 80 }: { text: string; speed?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
      {displayText}
      {currentIndex < text.length && <span className="ml-1 animate-pulse text-blue-500">|</span>}
    </span>
  );
};

export default function Hero() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentPhrase = phrases[currentPhraseIndex];

  return (
    <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-16 px-6 sm:px-10 flex-grow relative overflow-hidden">
      {/* Floating AI Elements */}
      <div className="absolute top-20 left-10 w-3 h-3 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-32 right-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-40"></div>
      <div className="absolute bottom-40 left-20 w-4 h-4 bg-blue-300 rounded-full animate-bounce opacity-50"></div>
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-6">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200">
            <span className="text-xs font-medium text-blue-700">🤖 AI-Powered Platform</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            <span className="block">Boipoka.AI for your</span>
            <TypewriterText text={currentPhrase} />
          </h1>
          
          <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
            Experience the future of literature with AI-powered book recommendations, 
            intelligent writing assistance, and smart community connections. 
            Let artificial intelligence enhance your literary journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/explore"
              className="group px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 text-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center gap-2">
                Explore with AI
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/ai-features"
              className="px-6 py-3 rounded-xl border-2 border-blue-200 text-blue-700 font-semibold hover:bg-blue-50 text-center transition-all duration-300 hover:border-blue-300"
            >
              Discover AI Features
            </Link>
          </div>
          
          <div className="flex items-center gap-6 pt-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">AI Online</span>
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-semibold text-blue-600">10K+</span> Books Analyzed
            </div>
          </div>
        </div>

        {/* Modern Book Stack with AI Glow */}
        <div className="relative h-80 md:h-96">
          {/* AI Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-3xl blur-3xl"></div>
          
          {/* Background Geometric Shape */}
          <div className="absolute top-4 right-4 h-64 w-44 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl transform rotate-6 opacity-80"></div>

          {/* Secondary Book */}
          <div className="absolute top-12 right-12 h-64 w-44 bg-white shadow-2xl rounded-2xl overflow-hidden transform rotate-3 border border-blue-100">
            <Image
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="AI-curated book"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
          </div>

          {/* Main Book with AI Badge */}
          <div className="absolute top-20 right-28 h-64 w-44 bg-white shadow-2xl rounded-2xl overflow-hidden transform -rotate-6 border border-cyan-100">
            <div className="relative w-full h-full">
              <Image
                src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="AI-recommended book"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent rounded-2xl"></div>
              
              {/* AI Badge */}
              <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                <span className="text-xs font-semibold text-blue-600">AI Picked</span>
              </div>
            </div>
          </div>
          
          {/* Floating AI Icon */}
          <div className="absolute bottom-8 left-8 w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}