import React from 'react';
import { useApp } from '../../context/AppContext';
import { SlideOverDrawer } from '../common/SlideOverDrawer';
import { User, Play, Search, ShieldAlert, Sparkles, Tv, Smartphone, Compass } from 'lucide-react';

export const CustomerDrawer: React.FC = () => {
  const { selectedCustomer, closeCustomerDrawer } = useApp();

  if (!selectedCustomer) return null;

  const isHighRisk = selectedCustomer.churnProbability >= 60;

  return (
    <SlideOverDrawer
      isOpen={!!selectedCustomer}
      onClose={closeCustomerDrawer}
      title={selectedCustomer.name}
      subtitle={`Customer 360 ID: ${selectedCustomer.id} • ${selectedCustomer.accountType} (${selectedCustomer.tenureMonths} mos tenure)`}
      badge={
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
            isHighRisk
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}
        >
          {selectedCustomer.segmentName}
        </span>
      }
    >
      {/* Top Telemetry Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 mb-1">Weekly Watch Time</div>
          <div className="text-xl font-bold font-mono text-cyan-400">{selectedCustomer.weeklyWatchTimeHrs} hrs</div>
          <div className="text-[11px] text-slate-400 mt-1">Platform Avg: 4.8 hrs</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 mb-1">Completion Rate</div>
          <div className="text-xl font-bold font-mono text-slate-100">{selectedCustomer.completionRate}%</div>
          <div className="text-[11px] text-emerald-400 mt-1">Top quartile</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 mb-1">Churn Probability</div>
          <div
            className={`text-xl font-bold font-mono ${
              isHighRisk ? 'text-rose-400' : 'text-slate-200'
            }`}
          >
            {selectedCustomer.churnProbability}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">30-day renewal hazard</div>
        </div>
      </div>

      {/* Behavioral Trajectory */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          5-Week Engagement Trajectory (Watch Hrs)
        </h4>
        <div className="flex items-end gap-3 h-16 pt-2">
          {selectedCustomer.engagementTrajectory.map((val, idx) => {
            const maxVal = Math.max(...selectedCustomer.engagementTrajectory, 1);
            const heightPercent = Math.min(100, Math.max(12, (val / maxVal) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-slate-800 rounded-t h-full flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t transition-all duration-500"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{val}h</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Genre Preferences & Device Share */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Preferred Genres</h4>
          <div className="flex flex-wrap gap-1.5">
            {selectedCustomer.preferredGenres.map((genre, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-200 border border-slate-700/60"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Device Mix</h4>
          <div className="space-y-2">
            {selectedCustomer.activeDevices.map((dev, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  {dev.device.includes('TV') ? (
                    <Tv className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  {dev.device}
                </span>
                <span className="font-mono text-slate-200 font-semibold">{dev.sharePercent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Viewing Sessions */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5 text-cyan-400" />
          Recent Playback Stream (Viewing Behavior DP-01)
        </h4>
        <div className="space-y-2.5">
          {selectedCustomer.recentViewing.map((view, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/70 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-medium text-slate-100">{view.contentTitle}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {view.timestamp} • {view.device} • Source: {view.source}
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-cyan-300 font-semibold">{view.watchDurationMin} min</span>
                <div className="text-[10px]">
                  {view.completed ? (
                    <span className="text-emerald-400">Completed (100%)</span>
                  ) : (
                    <span className="text-amber-400">Paused</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation History */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Personalized Rail Exposure History
        </h4>
        <div className="space-y-2">
          {selectedCustomer.recommendationHistory.map((rec, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/70 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-medium text-slate-200">{rec.title}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {rec.algorithm} • {rec.recommendedAt}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-cyan-400 text-xs">{(rec.affinityScore * 100).toFixed(0)}% affinity</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    rec.converted
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : rec.clicked
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {rec.converted ? 'Converted' : rec.clicked ? 'Clicked' : 'Impression Only'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Search Queries */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          Search Intent Telemetry
        </h4>
        {selectedCustomer.recentSearches.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No search events in rolling 14-day window.</p>
        ) : (
          <div className="space-y-2">
            {selectedCustomer.recentSearches.map((s, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-slate-950/60 border border-slate-800/70 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono text-slate-200">"{s.query}"</span>
                  <span className="text-[11px] text-slate-400 ml-2">({s.timestamp})</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    s.convertedToPlay ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-800'
                  }`}
                >
                  {s.convertedToPlay ? `Played (Rank #${s.resultRankClicked})` : 'Zero Playback'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </SlideOverDrawer>
  );
};
