'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Analytics {
  period: string;
  totalCrawls: number;
  totalOffersFound: number;
  totalOffersValidated: number;
  acceptanceRate: number;
  avgOffersPerCrawl: number;
  dailyBreakdown: Array<{
    date: string;
    offersFound: number;
    offersAccepted: number;
    duplicates: number;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/stats/crawler?days=${days}`
        );
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [days]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Analytics & Statistics</h1>

        {/* Time Period Selector */}
        <div className="mb-8 flex gap-4">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded transition ${
                days === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Last {d} days
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-slate-400">Loading analytics...</div>
        ) : analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800 p-6 rounded-lg">
                <p className="text-slate-400 text-sm">Total Crawls</p>
                <p className="text-3xl font-bold text-white">
                  {analytics.totalCrawls}
                </p>
              </div>
              <div className="bg-slate-800 p-6 rounded-lg">
                <p className="text-slate-400 text-sm">Total Offers Found</p>
                <p className="text-3xl font-bold text-blue-400">
                  {analytics.totalOffersFound}
                </p>
              </div>
              <div className="bg-slate-800 p-6 rounded-lg">
                <p className="text-slate-400 text-sm">Acceptance Rate</p>
                <p className="text-3xl font-bold text-green-400">
                  {(analytics.acceptanceRate * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-slate-800 p-6 rounded-lg">
                <p className="text-slate-400 text-sm">Avg per Crawl</p>
                <p className="text-3xl font-bold text-orange-400">
                  {analytics.avgOffersPerCrawl.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Daily Breakdown */}
            <div className="bg-slate-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">Daily Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-slate-300 py-2">Date</th>
                      <th className="text-right text-slate-300 py-2">Found</th>
                      <th className="text-right text-slate-300 py-2">Accepted</th>
                      <th className="text-right text-slate-300 py-2">Duplicates</th>
                      <th className="text-right text-slate-300 py-2">Acceptance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.dailyBreakdown.map((day) => (
                      <tr
                        key={day.date}
                        className="border-b border-slate-700 hover:bg-slate-700 transition"
                      >
                        <td className="text-slate-300 py-3">
                          {new Date(day.date).toLocaleDateString()}
                        </td>
                        <td className="text-right text-blue-400">
                          {day.offersFound}
                        </td>
                        <td className="text-right text-green-400">
                          {day.offersAccepted}
                        </td>
                        <td className="text-right text-yellow-400">
                          {day.duplicates}
                        </td>
                        <td className="text-right text-slate-300">
                          {day.offersFound > 0
                            ? (
                                (day.offersAccepted / day.offersFound) *
                                100
                              ).toFixed(0)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-slate-400">No data available</div>
        )}

        <div className="mt-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
