import React from 'react';
import { useApp } from '../../context/AppContext';
import { SlideOverDrawer } from '../common/SlideOverDrawer';
import { Sparkline } from '../common/SimpleCharts';
import { Film, Users, TrendingUp, Cpu, Tag, Clock, BarChart3 } from 'lucide-react';

export const ContentDrawer: React.FC = () => {
  const { selectedContent, closeContentDrawer } = useApp();

  if (!selectedContent) return null;

  return (
    <SlideOverDrawer
      isOpen={!!selectedContent}
      onClose={closeContentDrawer}
      title={selectedContent.title}
      subtitle={`${selectedContent.contentType} • ${selectedContent.genre} • ${selectedContent.releaseYear} • ${selectedContent.runtimeOrSeasons}`}
      badge={
        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          {selectedContent.rating}
        </span>
      }
    >
      {/* Synopsis */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Synopsis & Narrative Premise</h4>
        <p className="text-sm text-slate-200 leading-relaxed">{selectedContent.synopsis}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {selectedContent.metadataTags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1"
            >
              <Tag className="w-3 h-3 text-cyan-400" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 mb-1">Completion Rate</div>
          <div className="text-lg font-bold font-mono text-cyan-400">{selectedContent.completionRate}%</div>
          <div className="text-[10px] text-slate-400 mt-1">Platform Benchmark: 64%</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 mb-1">Total Watch Time</div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {(selectedContent.engagementHoursTotal / 1000000).toFixed(0)}M hrs
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Surging demand</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 mb-1">Search Interest</div>
          <div className="text-lg font-bold font-mono text-slate-100">{selectedContent.searchInterestScore}/100</div>
          <div className="text-[10px] text-slate-400 mt-1">Query intent index</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 mb-1">Recommendation CTR</div>
          <div className="text-lg font-bold font-mono text-slate-100">{selectedContent.recommendationCTR}%</div>
          <div className="text-[10px] text-cyan-400 mt-1">Rail conversion</div>
        </div>
      </div>

      {/* Drop-off Distribution (Episodic / Minute curve) */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            Viewer Retention & Drop-off Curve
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">Credits completion: {selectedContent.completionRate}%</span>
        </div>

        <div className="space-y-2">
          {selectedContent.dropoffDistribution.map((point, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-mono text-slate-300">{point.minutePoint}</span>
                <span className="font-mono font-semibold text-cyan-400">{point.retentionPercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${point.retentionPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Semantic Vector & Embedding Status */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          Semantic Vector Intelligence (Vertex Feature Store)
        </h4>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400">Embedding Status:</span>
            <div className="font-mono text-emerald-400 font-semibold mt-0.5">
              {selectedContent.semanticEmbeddingStatus}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400">Vector Cluster ID:</span>
            <div className="font-mono text-cyan-300 mt-0.5">{selectedContent.embeddingClusterId}</div>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
          Enriched with 768-dimensional multimodal content vectors matching plot arcs, acoustic pacing, visual mood, and serialized character affinity.
        </div>
      </div>

      {/* Target Demographics & Audience Fit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            Audience Fit Segments
          </h4>
          <div className="space-y-1.5">
            {selectedContent.audienceFitSegments.map((seg, idx) => (
              <div
                key={idx}
                className="text-xs px-2.5 py-1 rounded bg-slate-800/80 text-slate-200 border border-slate-700/60 flex items-center justify-between"
              >
                <span>{seg}</span>
                <span className="text-[10px] text-emerald-400 font-mono">High Affinity</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Demographics
          </h4>
          <div className="space-y-1.5">
            {selectedContent.targetDemographics.map((demo, idx) => (
              <div
                key={idx}
                className="text-xs px-2.5 py-1 rounded bg-slate-800/80 text-slate-200 border border-slate-700/60"
              >
                {demo}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Week Performance Velocity */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            7-Week Viewership Velocity
          </h4>
          <div className="text-xs text-slate-400">
            Trend: <span className="font-mono text-emerald-400 font-semibold">{selectedContent.performanceTrend}</span>
          </div>
        </div>
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
          <Sparkline data={selectedContent.historicalWeeklyViews} color="#06b6d4" width={130} height={36} />
        </div>
      </div>
    </SlideOverDrawer>
  );
};
