'use client';

import { useState, useEffect } from 'react';

interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  url: string;
  relevanceScore: number;
  relevance: 'accepted' | 'rejected';
  comment: string;
  crawledAt: string;
}

export default function HistoryPage() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/offers?status=${filter}`
        );
        const data = await response.json();
        setOffers(data);
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [filter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Offers History</h1>

        {/* Filter */}
        <div className="mb-6 flex gap-4">
          {(['all', 'accepted', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-slate-400">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="text-center text-slate-400">No offers found</div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className={`p-6 rounded-lg border-l-4 ${
                  offer.relevance === 'accepted'
                    ? 'bg-slate-700 border-green-500'
                    : 'bg-slate-700 border-red-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {offer.title}
                    </h3>
                    <p className="text-slate-400">
                      {offer.company} • {offer.location}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      offer.relevance === 'accepted'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {offer.relevance === 'accepted' ? '✓ Relevant' : '✗ Not Relevant'}
                  </span>
                </div>

                <div className="mb-3 flex gap-4 text-sm text-slate-400">
                  <span>Source: {offer.source}</span>
                  <span>Score: {(offer.relevanceScore * 100).toFixed(0)}%</span>
                  <span>
                    Crawled: {new Date(offer.crawledAt).toLocaleDateString()}
                  </span>
                </div>

                {offer.comment && (
                  <p className="text-slate-300 mb-3 italic">
                    <strong>AI Analysis:</strong> {offer.comment}
                  </p>
                )}

                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  View Full Offer →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
