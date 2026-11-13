import React from 'react';
import { useApp } from '../../context/AppContext';
import { TimeRange } from '../../types';
import { Activity, Sparkles, X, ShieldCheck, Search, Radio } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    timeRange,
    setTimeRange,
    activeSegment,
    setSelectedSegmentId,
    hasApiKey,
    setActiveView,
  } = useApp();

  const timeRanges: { id: TimeRange; label: string }[] = [
    { id: '7d', label: 'Last 7D' },
    { id: '30d', label: 'Last 30D' },
    { id: '90d', label: 'Last 90D' },
    { id: 'ytd', label: 'YTD' },
  ];

  return (
    <header className="h-16 border-b border-slate-800/90 bg-[#0c111d]/90 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Left Title & Platform Context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
            <Radio className="w-4 h-4 text-white animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-300 ring-2 ring-[#0c111d]"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white font-sans">
                CONTENT<span className="text-cyan-400">PULSE</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                PROD-v4.2
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Disney+ Content Intelligence & Personalization Platform
            </div>
          </div>
        </div>

        {/* Active Segment Filter Pill if present */}
        {activeSegment && (
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Segment Focus:</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-medium">
              <span>{activeSegment.name}</span>
              <button
                type="button"
                id="btn-clear-segment-filter"
                onClick={() => setSelectedSegmentId(null)}
                className="hover:text-white p-0.5 rounded-full hover:bg-cyan-800/40"
                title="Clear segment filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls & Indicators */}
      <div className="flex items-center gap-3">
        {/* Quick Launch Search to Semantic Discovery */}
        <button
          type="button"
          id="btn-header-semantic-search"
          onClick={() => setActiveView('content')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>Semantic content search...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Time Window Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              type="button"
              id={`btn-time-range-${range.id}`}
              onClick={() => setTimeRange(range.id)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                timeRange === range.id
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Live Streaming Bus Status */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-slate-400">Stream Bus:</span>
          <span className="font-mono text-emerald-400 font-semibold">185k QPS</span>
        </div>

        {/* AI Engine Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium ${
            hasApiKey
              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-900/70 border-slate-800 text-slate-300'
          }`}
          title={hasApiKey ? 'Gemini 3.8 Flash live proxy active' : 'Client-side deterministic intelligence engine'}
        >
          <Sparkles className={`w-3.5 h-3.5 ${hasApiKey ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span>{hasApiKey ? 'Gemini 3.8' : 'Engine v4'}</span>
        </div>
      </div>
    </header>
  );
};
