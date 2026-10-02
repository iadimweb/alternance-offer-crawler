'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CrawlStatus {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  totalFound: number;
  newOffers: number;
  duplicates: number;
}

export default function StatusPage() {
  const [latestCrawl, setLatestCrawl] = useState<CrawlStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/crawl/latest-status`
        );
        const data = await response.json();
        setLatestCrawl(data);
      } catch (error) {
        console.error('Error fetching crawl status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Poll every 10s

    return () => clearInterval(interval);
  }, []);

  const handleTriggerCrawl = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/crawl/trigger`,
        { method: 'POST' }
      );
      if (response.ok) {
        alert('Crawl triggered successfully!');
      }
    } catch (error) {
      console.error('Error triggering crawl:', error);
      alert('Failed to trigger crawl');
    }
  };

  const statusColor = latestCrawl
    ? latestCrawl.status === 'completed'
      ? 'text-green-400'
      : latestCrawl.status === 'running'
      ? 'text-blue-400'
      : 'text-red-400'
    : 'text-gray-400';

  const statusIcon = latestCrawl
    ? latestCrawl.status === 'completed'
      ? '✓'
      : latestCrawl.status === 'running'
      ? '●'
      : '✗'
    : '?';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Crawler Status</h1>

        {/* Latest Crawl Status */}
        <div className="bg-slate-800 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Latest Crawl</h2>

          {loading ? (
            <div className="text-slate-400">Loading status...</div>
          ) : latestCrawl ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className={`text-3xl ${statusColor}`}>
                  {statusIcon}
                </span>
                <div>
                  <p className="text-slate-300">
                    Status: <span className={statusColor}>{latestCrawl.status.toUpperCase()}</span>
                  </p>
                  <p className="text-slate-400 text-sm">
                    Started: {new Date(latestCrawl.startedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {latestCrawl.status === 'completed' && latestCrawl.completedAt && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {latestCrawl.totalFound}
                    </p>
                    <p className="text-slate-400 text-sm">Total Found</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {latestCrawl.newOffers}
                    </p>
                    <p className="text-slate-400 text-sm">New Offers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">
                      {latestCrawl.duplicates}
                    </p>
                    <p className="text-slate-400 text-sm">Duplicates</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-400">No crawl history yet</div>
          )}
        </div>

        {/* Manual Trigger */}
        <div className="bg-slate-800 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Manual Trigger</h2>
          <p className="text-slate-400 mb-4">
            Click to start a crawl immediately (instead of waiting for daily schedule)
          </p>
          <button
            onClick={handleTriggerCrawl}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded transition"
          >
            🚀 Trigger Crawl Now
          </button>
        </div>

        {/* Schedule Info */}
        <div className="bg-slate-800 rounded-lg p-8">
          <h2 className="text-xl font-bold text-white mb-4">Schedule</h2>
          <div className="space-y-2 text-slate-300">
            <p>📅 <strong>Daily Crawl</strong>: 06:00 UTC (every day)</p>
            <p>✉️ <strong>Email Delivery</strong>: 07:00 UTC (after crawl completes)</p>
            <p>🔄 <strong>Last Sync</strong>: {latestCrawl?.completedAt ? new Date(latestCrawl.completedAt).toLocaleString() : 'Never'}</p>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
