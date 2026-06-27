'use client';

import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 10 }),
      });
      const data = await res.json();
      if (data.success) setPapers(data.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (paperId: string) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper_id: paperId, question: 'Summarize this paper' }),
      });
      const data = await res.json();
      if (data.success) setAnalysis(data.data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">📚</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Elicit Assistant
            </h1>
          </div>
          <p className="text-gray-300 text-lg">AI-powered research paper assistant</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search research papers..."
              className="flex-1 px-6 py-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={!query || loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-blue-400">Papers Found</h2>
            {papers.map((paper, i) => (
              <div
                key={i}
                onClick={() => setSelectedPaper(paper)}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border cursor-pointer transition-all ${
                  selectedPaper?.id === paper.id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <h3 className="font-bold mb-1">{paper.title}</h3>
                <p className="text-sm text-gray-400">{paper.authors.join(', ')} • {paper.year}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs px-2 py-1 bg-slate-700 rounded">{paper.journal}</span>
                  <span className="text-xs text-blue-400">{paper.citations.toLocaleString()} citations</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            {selectedPaper ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-4">{selectedPaper.title}</h3>
                <p className="text-gray-300 mb-4">{selectedPaper.abstract_text}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-gray-400 text-sm">Year</p>
                    <p className="font-bold text-blue-400">{selectedPaper.year}</p>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-gray-400 text-sm">Citations</p>
                    <p className="font-bold text-blue-400">{selectedPaper.citations.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAnalyze(selectedPaper.id)}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : '🤖 Analyze with AI'}
                </button>
              </div>
            ) : (
              <div className="bg-slate-800/30 rounded-2xl p-12 border border-slate-700 text-center">
                <p className="text-6xl mb-4">📄</p>
                <p className="text-gray-400">Select a paper to analyze</p>
              </div>
            )}

            {analysis && (
              <div className="mt-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/50">
                <h3 className="text-lg font-bold text-green-400 mb-3">AI Analysis</h3>
                <p className="text-gray-300 mb-4">{analysis.summary}</p>
                <h4 className="font-semibold mb-2">Key Findings:</h4>
                <ul className="space-y-2">
                  {analysis.key_findings.map((finding: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400">•</span>
                      {finding}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-3 bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-400">Confidence: {(analysis.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
