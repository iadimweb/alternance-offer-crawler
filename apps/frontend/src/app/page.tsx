'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Alternance Offer Crawler
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Daily automation system for job offer search, AI validation & delivery
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-slate-700 rounded-lg p-8 hover:bg-slate-600 transition">
            <h2 className="text-2xl font-bold text-white mb-4">⚙️ Configuration</h2>
            <p className="text-slate-300 mb-6">
              Set up your search criteria, select job sources, and define geographic preferences.
            </p>
            <Link
              href="/config"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
            >
              Go to Configuration
            </Link>
          </div>

          <div className="bg-slate-700 rounded-lg p-8 hover:bg-slate-600 transition">
            <h2 className="text-2xl font-bold text-white mb-4">📋 History</h2>
            <p className="text-slate-300 mb-6">
              Review all crawled offers, see validation results, and explore offer details.
            </p>
            <Link
              href="/history"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
            >
              View History
            </Link>
          </div>

          <div className="bg-slate-700 rounded-lg p-8 hover:bg-slate-600 transition">
            <h2 className="text-2xl font-bold text-white mb-4">🚀 Crawler Status</h2>
            <p className="text-slate-300 mb-6">
              Monitor daily crawler runs, check logs, and trigger on-demand crawls.
            </p>
            <Link
              href="/status"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition"
            >
              Check Status
            </Link>
          </div>

          <div className="bg-slate-700 rounded-lg p-8 hover:bg-slate-600 transition">
            <h2 className="text-2xl font-bold text-white mb-4">📊 Analytics</h2>
            <p className="text-slate-300 mb-6">
              View crawl statistics, offer trends, and validation effectiveness.
            </p>
            <Link
              href="/analytics"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded transition"
            >
              View Analytics
            </Link>
          </div>
        </div>

        <footer className="text-center mt-12 text-slate-400">
          <p>Last crawl: <span className="text-slate-300">Never (awaiting first run)</span></p>
        </footer>
      </div>
    </div>
  );
}
