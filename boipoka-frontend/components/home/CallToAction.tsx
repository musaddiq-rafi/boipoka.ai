import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 py-16 px-6 sm:px-10 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-16 h-16 bg-cyan-400/10 rounded-full blur-xl animate-ping"></div>
      <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-blue-300 rounded-full animate-bounce opacity-60"></div>
      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-cyan-300 rounded-full animate-pulse opacity-70"></div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* AI Badge */}
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
          <span className="text-xs font-medium text-white">🚀 AI-Powered Discovery</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
          Ready to revolutionize your reading with{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
            Boipoka.AI
          </span>
          ?
        </h2>
        
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
          Join thousands of readers who have discovered their next favorite books through 
          artificial intelligence. Experience personalized recommendations that understand your taste.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Link 
            href="/explore" 
            className="group px-6 py-3 rounded-xl bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1"
          >
            <span className="flex items-center justify-center gap-2">
              Explore with AI Now
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          
          <Link 
            href="/signup" 
            className="group px-6 py-3 rounded-xl border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm hover:border-white/60"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Start Free Today
            </span>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">99.2%</div>
            <div className="text-xs text-blue-200">AI Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">50K+</div>
            <div className="text-xs text-blue-200">Books Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">25K+</div>
            <div className="text-xs text-blue-200">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">24/7</div>
            <div className="text-xs text-blue-200">AI Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}