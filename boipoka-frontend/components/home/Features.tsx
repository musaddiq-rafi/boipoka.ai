export default function Features() {
  const features = [
    {
      title: "AI-Powered Recommendations",
      description: "Get intelligent book suggestions powered by advanced machine learning algorithms that understand your unique reading preferences.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      ),
    },
    {
      title: "Talk with Characters",
      description: "Engage in conversations with your favorite book characters and explore their thoughts and motivations.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      ),
    },
    {
      title: "Interactive Games",
      description: "Play engaging games that bring your favorite books to life, enhancing your reading experience with fun and interactivity.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      ),
    },
  ];

  return (
    <section className="py-16 px-6 sm:px-10 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-24 h-24 bg-blue-200/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 left-10 w-20 h-20 bg-cyan-200/20 rounded-full blur-lg"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 mb-4">
            <span className="text-xs font-medium text-blue-700">🚀 AI-Enhanced Features</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Boipoka.AI
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of reading with artificial intelligence at your fingertips
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
            >
              {/* Icon with gradient background */}
              <div className="relative mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-blue-500/25 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {feature.icon}
                  </svg>
                </div>
                {/* Floating AI indicator */}
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
              </div>
              
              <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {feature.description}
              </p>
              
              {/* Learn more link */}
              <div className="pt-3 border-t border-gray-100">
                <span className="text-blue-600 font-medium text-xs group-hover:text-blue-700 cursor-pointer flex items-center gap-1">
                  Learn more
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Additional AI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">99.2%</div>
            <div className="text-xs text-gray-600">AI Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">50K+</div>
            <div className="text-xs text-gray-600">Books Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">25K+</div>
            <div className="text-xs text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">24/7</div>
            <div className="text-xs text-gray-600">AI Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}