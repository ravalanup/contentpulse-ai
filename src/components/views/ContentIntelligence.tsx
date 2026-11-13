import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Content360Item, SemanticSearchResult } from '../../types';
import { Sparkline } from '../common/SimpleCharts';
import {
  Film,
  Search,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Tag,
  Eye,
} from 'lucide-react';

export const ContentIntelligence: React.FC = () => {
  const { catalog, openContentDrawer } = useApp();

  const [semanticQuery, setSemanticQuery] = useState(
    'Find family-friendly adventure content with strong completion among viewers aged 18–34.'
  );
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  const sampleQueries = [
    'Find family-friendly adventure content with strong completion among viewers aged 18–34.',
    'Prestige serialized space opera or sci-fi with low early-episode drop-off.',
    'Nature documentaries and ambient visual content suited for background co-viewing.',
    'High search interest titles with lagging recommendation conversion.',
  ];

  // Semantic search simulation algorithm based on query tokens
  const getSemanticSearchResults = (query: string): SemanticSearchResult[] => {
    const qLower = query.toLowerCase();

    return catalog.map((item) => {
      let score = 70;
      let explanation = 'Baseline semantic proximity in 768-dim embedding space.';
      let audienceFit = 'Broad catalog distribution.';

      if (qLower.includes('family') || qLower.includes('kid')) {
        if (item.genre.includes('Family') || item.genre.includes('Animation') || item.rating === 'G' || item.rating === 'PG') {
          score += 24;
          explanation = 'Matched animated/family tags and high co-viewing completion indices.';
          audienceFit = '98th percentile fit for Family & Shared Viewing cohorts.';
        }
      }

      if (qLower.includes('sci-fi') || qLower.includes('space') || qLower.includes('opera')) {
        if (item.genre.includes('Sci-Fi') || item.title.includes('Galactic') || item.title.includes('Quantum')) {
          score += 26;
          explanation = 'High vector cosine similarity with deep space lore and serialized worldbuilding.';
          audienceFit = 'Dominant resonance in 18-34 Highly Engaged subscriber base.';
        }
      }

      if (qLower.includes('nature') || qLower.includes('ambient') || qLower.includes('documentary')) {
        if (item.contentType === 'Documentary' || item.genre.includes('Nature')) {
          score += 25;
          explanation = 'Matched ultra-high-definition acoustic and visual relaxation embeddings.';
          audienceFit = 'Strong appeal for casual weekend and ambient tablet viewing.';
        }
      }

      if (item.completionRate >= 80) score += 4;

      return {
        content: item,
        relevanceScore: Math.min(99, Math.max(62, score)),
        similarityExplanation: explanation,
        audienceFit,
        engagementSignal: `${(item.engagementHoursTotal / 1000000).toFixed(0)}M watch hrs total • ${item.performanceTrend} velocity`,
        completionSignal: `${item.completionRate}% completion rate (${item.completionRate >= 78 ? 'Upper Decile' : 'Median'})`,
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  const searchResults = getSemanticSearchResults(semanticQuery);

  // Filter regular catalog table
  const filteredCatalog = catalog.filter((item) => {
    const matchesGenre = selectedGenre === 'All' || item.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    const matchesType = selectedType === 'All' || item.contentType === selectedType;
    return matchesGenre && matchesType;
  });

  const genres = ['All', 'Sci-Fi', 'Fantasy', 'Family', 'Nature', 'Action'];
  const types = ['All', 'Original Series', 'Feature Film', 'Documentary', 'Animation', 'Short'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Film className="w-5 h-5 text-cyan-400" />
          Content Intelligence & Semantic Catalog 360
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Multimodal content embeddings, retention drop-off analytics, episodic completion curves, and semantic discovery.
        </p>
      </div>

      {/* Semantic Discovery Interface Panel */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 border border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Natural Language Semantic Content Discovery</h3>
              <p className="text-[11px] text-slate-400">
                Vector retrieval powered by 768-dimensional multimodal content embeddings (Vertex Vector Search)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            Cosine Proximity Scored
          </span>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-cyan-400" />
          <input
            type="text"
            id="input-semantic-discovery-query"
            value={semanticQuery}
            onChange={(e) => setSemanticQuery(e.target.value)}
            placeholder="Describe audience criteria, narrative tone, genre, or completion goals..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 shadow-inner"
          />
          <button
            type="button"
            id="btn-trigger-semantic-query"
            className="absolute right-2 top-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
          >
            Rank Candidates
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] text-slate-400">Try query:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              type="button"
              id={`btn-sample-semantic-query-${idx}`}
              onClick={() => setSemanticQuery(q)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all truncate max-w-xs ${
                semanticQuery === q
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              "{q}"
            </button>
          ))}
        </div>

        {/* Top 3 Ranked Semantic Results */}
        <div className="pt-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Top Ranked Semantic Matches ({searchResults.length} Candidates Scored)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {searchResults.slice(0, 3).map((res, idx) => (
              <div
                key={res.content.id}
                onClick={() => openContentDrawer(res.content)}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-400">Rank #{idx + 1}</span>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {res.relevanceScore}% Relevance
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {res.content.title}
                  </h5>
                  <div className="text-[11px] text-slate-400 font-mono mb-2">
                    {res.content.genre} • {res.content.contentType}
                  </div>

                  <p className="text-xs text-slate-300 mb-3 line-clamp-2 leading-relaxed">
                    {res.content.synopsis}
                  </p>

                  <div className="space-y-1.5 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="text-slate-300">
                      <strong className="text-cyan-400 font-mono">Similarity:</strong> {res.similarityExplanation}
                    </div>
                    <div className="text-slate-300">
                      <strong className="text-cyan-400 font-mono">Audience Fit:</strong> {res.audienceFit}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-400 font-bold">{res.content.completionRate}% Completion</span>
                  <span className="text-cyan-400 font-medium flex items-center gap-1 text-[11px]">
                    Inspect 360 <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog 360 Master Inventory Table */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              Content 360 Master Catalog Inventory
            </h3>
            <p className="text-xs text-slate-400">
              Click any title to inspect drop-off distribution curves, target demographics, and 768-dim embedding clusters.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px] px-1">Genre:</span>
              {genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  id={`filter-genre-${g.toLowerCase()}`}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    selectedGenre === g ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px] px-1">Type:</span>
              {types.slice(0, 4).map((t) => (
                <button
                  key={t}
                  type="button"
                  id={`filter-type-${t.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setSelectedType(t)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    selectedType === t ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-medium">Title & Format</th>
                <th className="pb-3 font-medium">Genre & Rating</th>
                <th className="pb-3 font-medium">Completion Rate</th>
                <th className="pb-3 font-medium">Total Watch Time</th>
                <th className="pb-3 font-medium">Search Interest</th>
                <th className="pb-3 font-medium">Rec CTR</th>
                <th className="pb-3 font-medium">Embedding Status</th>
                <th className="pb-3 font-medium">Trend</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCatalog.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => openContentDrawer(item)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 pr-4">
                    <div className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {item.contentType} • {item.runtimeOrSeasons}
                    </div>
                  </td>

                  <td className="py-3 pr-4">
                    <div className="text-slate-300">{item.genre}</div>
                    <span className="text-[10px] font-mono text-slate-400">{item.rating}</span>
                  </td>

                  <td className="py-3 pr-4 font-mono font-bold text-cyan-400">{item.completionRate}%</td>

                  <td className="py-3 pr-4 font-mono text-slate-200">
                    {(item.engagementHoursTotal / 1000000).toFixed(0)}M hrs
                  </td>

                  <td className="py-3 pr-4 font-mono text-slate-300">{item.searchInterestScore}/100</td>

                  <td className="py-3 pr-4 font-mono text-slate-200">{item.recommendationCTR}%</td>

                  <td className="py-3 pr-4">
                    <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {item.semanticEmbeddingStatus}
                    </span>
                  </td>

                  <td className="py-3 pr-4">
                    <span
                      className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                        item.performanceTrend === 'Surging'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : item.performanceTrend === 'Stable'
                          ? 'text-cyan-400 bg-cyan-500/10'
                          : 'text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {item.performanceTrend}
                    </span>
                  </td>

                  <td className="py-3 text-right">
                    <button
                      type="button"
                      id={`btn-open-content-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openContentDrawer(item);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
