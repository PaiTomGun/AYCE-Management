import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="bg-red-500 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl">A</span>
              <span className="bg-yellow-400 w-10 h-10 rounded-lg flex items-center justify-center text-gray-900 font-bold text-xl">Y</span>
              <span className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl">C</span>
              <span className="bg-red-500 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl">E</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:inline">Management</span>
          </div>
          <Link
            href="/staff/login"
            className="text-white hover:text-red-400 transition-colors font-medium"
          >
            Staff Login →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-35">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex gap-2">
              <span className="bg-red-500 w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl transform hover:scale-110 transition-transform">A</span>
              <span className="bg-yellow-400 w-20 h-20 rounded-2xl flex items-center justify-center text-gray-900 font-bold text-4xl shadow-2xl transform hover:scale-110 transition-transform">Y</span>
              <span className="bg-blue-500 w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl transform hover:scale-110 transition-transform">C</span>
              <span className="bg-red-500 w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl transform hover:scale-110 transition-transform">E</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Restaurant Management
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-red-500">
              Made Simple
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            A comprehensive management system designed specifically for All You Can Eat restaurants in Thailand.
            Streamline operations, enhance customer experience, and make data-driven decisions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/staff/login"
                className="bg-red-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform w-full sm:w-auto"
              >
                🔐 Staff Login
              </Link>
              <Link
                href="/menu/demo-session"
                className="bg-white text-gray-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform w-full sm:w-auto"
              >
                📱 View Demo Menu
              </Link>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-16 py-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left hover:bg-white/20 transition-all">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">Real-Time Analytics</h3>
                <p className="text-gray-300 text-sm">Track sales, customer flow, and table turnover with live dashboards</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left hover:bg-white/20 transition-all">
                <div className="text-4xl mb-3">🍽️</div>
                <h3 className="text-xl font-bold text-white mb-2">Table Management</h3>
                <p className="text-gray-300 text-sm">Efficiently manage seating, assignments, and dining durations</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left hover:bg-white/20 transition-all">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="text-xl font-bold text-white mb-2">QR Ordering</h3>
                <p className="text-gray-300 text-sm">Customers order directly from their phones, reducing wait times</p>
              </div>
            </div>

          </div>
          <div className="text-gray-400 text-sm mt-10">
            © 2025 AYCE Management System. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
