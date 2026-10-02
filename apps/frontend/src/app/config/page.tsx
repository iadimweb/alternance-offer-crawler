'use client';

import { useState } from 'react';

interface SearchConfig {
  domain: string;
  specialty: string;
  keywords: string[];
  locations: string[];
  regionPriorities: { region: string; priority: number }[];
  enabledSources: string[];
  email: string;
}

export default function ConfigPage() {
  const [config, setConfig] = useState<SearchConfig>({
    domain: '',
    specialty: '',
    keywords: [],
    locations: [],
    regionPriorities: [],
    enabledSources: [],
    email: '',
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setConfig({
        ...config,
        keywords: [...config.keywords, newKeyword.trim()],
      });
      setNewKeyword('');
    }
  };

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      setConfig({
        ...config,
        locations: [...config.locations, newLocation.trim()],
      });
      setNewLocation('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setConfig({
      ...config,
      keywords: config.keywords.filter((_, i) => i !== index),
    });
  };

  const handleRemoveLocation = (index: number) => {
    setConfig({
      ...config,
      locations: config.locations.filter((_, i) => i !== index),
    });
  };

  const handleToggleSource = (source: string) => {
    setConfig({
      ...config,
      enabledSources: config.enabledSources.includes(source)
        ? config.enabledSources.filter((s) => s !== source)
        : [...config.enabledSources, source],
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/config`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        }
      );
      if (response.ok) {
        alert('Configuration saved successfully!');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Search Configuration</h1>

        <div className="space-y-6 bg-slate-800 p-8 rounded-lg">
          {/* Domain & Specialty */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Domain (ex: Audiovisual, IT, Marketing)
              </label>
              <input
                type="text"
                value={config.domain}
                onChange={(e) =>
                  setConfig({ ...config, domain: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
                placeholder="Audiovisual"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Specialty (ex: Sound, Editing, Production)
              </label>
              <input
                type="text"
                value={config.specialty}
                onChange={(e) =>
                  setConfig({ ...config, specialty: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
                placeholder="Sound"
              />
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Keywords
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddKeyword();
                }}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
                placeholder="Add keyword and press Enter"
              />
              <button
                onClick={handleAddKeyword}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(index)}
                    className="hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Locations / Cities
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddLocation();
                }}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
                placeholder="Add location and press Enter"
              />
              <button
                onClick={handleAddLocation}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.locations.map((location, index) => (
                <span
                  key={index}
                  className="bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {location}
                  <button
                    onClick={() => handleRemoveLocation(index)}
                    className="hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Job Sources */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Job Sources
            </label>
            <div className="space-y-2">
              {['LinkedIn', 'Indeed', 'Apec', 'Welcome to the Jungle', 'Google Search'].map(
                (source) => (
                  <label key={source} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.enabledSources.includes(source)}
                      onChange={() => handleToggleSource(source)}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-300">{source}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email for Daily Summary
            </label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
              placeholder="your@email.com"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
