import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AudienceSegment, Customer360Profile } from '../../types';
import {
  Users,
  UserCheck,
  TrendingDown,
  AlertCircle,
  HeartHandshake,
  Smartphone,
  Tv,
  Eye,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';

export const AudienceIntelligence: React.FC = () => {
  const {
    segments,
    customers,
    selectedSegmentId,
    setSelectedSegmentId,
    openCustomerDrawer,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter customers by selected segment or search query
  const filteredCustomers = customers.filter((cust) => {
    const matchesSegment = selectedSegmentId ? cust.segmentId === selectedSegmentId : true;
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.preferredGenres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSegment && matchesSearch;
  });

  const activeSegmentObj = segments.find((s) => s.id === selectedSegmentId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-cyan-400" />
            Audience Intelligence & Customer 360
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Segmented streaming behaviors, churn vulnerability, cross-profile co-viewing, and individual subscriber telemetry.
          </p>
        </div>

        {selectedSegmentId && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filtering by:</span>
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {activeSegmentObj?.name}
            </span>
            <button
              type="button"
              id="btn-clear-audience-segment-filter"
              onClick={() => setSelectedSegmentId(null)}
              className="text-xs text-slate-400 hover:text-white underline underline-offset-2 ml-1"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>

      {/* 6 Strategic Audience Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((segment) => {
          const isSelected = selectedSegmentId === segment.id;
          const isCritical = segment.churnRisk === 'Critical' || segment.churnRisk === 'High';

          return (
            <div
              key={segment.id}
              onClick={() => setSelectedSegmentId(isSelected ? null : segment.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-100">{segment.name}</span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {segment.churnRisk} Churn Risk ({segment.churnScore})
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">{segment.tagline}</p>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 text-center mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Subscribers</span>
                    <span className="text-xs font-mono font-bold text-slate-100">
                      {(segment.subscriberCount / 1000000).toFixed(1)}M
                    </span>
                    <span className="text-[9px] text-slate-400 block">({segment.percentage}%)</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Watch Time</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {segment.engagementHrsPerWk}h
                    </span>
                    <span className="text-[9px] text-slate-400 block">/ sub / wk</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Rec CTR</span>
                    <span className="text-xs font-mono font-bold text-slate-100">
                      {segment.recommendationCTR}%
                    </span>
                    <span className="text-[9px] text-slate-400 block">conversion</span>
                  </div>
                </div>

                {/* Behavioral summary & Genres */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="text-slate-400 line-clamp-2">
                    <strong className="text-slate-300">Behavior: </strong>
                    {segment.behavioralSummary}
                  </div>
                </div>
              </div>

              {/* Bottom selection cue */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-400">
                  Day-30 Retention: <strong className="text-slate-200">{segment.retentionRate}%</strong>
                </span>
                <span className="text-cyan-400 font-medium flex items-center gap-0.5 text-[11px]">
                  {isSelected ? 'Active Filter' : 'Filter cohort'} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Segment Deep Dive Panel (if a segment is clicked) */}
      {activeSegmentObj && (
        <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Segment Deep Dive: {activeSegmentObj.name} ({(activeSegmentObj.subscriberCount / 1000000).toFixed(1)}M Subscribers)
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              Retention: {activeSegmentObj.retentionRate}% • Completion: {activeSegmentObj.completionRate}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Top Affinity Genres:</span>
              <div className="flex flex-wrap gap-1">
                {activeSegmentObj.topGenres.map((g, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px]">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Primary Device Access:</span>
              <div className="space-y-1 text-slate-200 text-[11px]">
                {activeSegmentObj.primaryDevices.map((d, idx) => (
                  <div key={idx}>• {d}</div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Recommended Growth Policy:</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeSegmentObj.churnRisk === 'High' || activeSegmentObj.churnRisk === 'Critical'
                  ? 'Trigger proactive smart resume recommendations and high-completion feature promotions before weekend billing renewal.'
                  : 'Optimize recommendation rail freshness to maximize long-tail discovery and prevent binge fatigue.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Customer 360 Profile Explorer Table */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              Customer 360 Telemetry Profiles (Synthetic Cohort Sample)
            </h3>
            <p className="text-xs text-slate-400">
              Click any subscriber to inspect complete viewing sessions, search events, device mix, and recommendation logs.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              id="input-search-customers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subscriber or genre..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500 font-sans"
            />
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-medium">Subscriber</th>
                <th className="pb-3 font-medium">Account Tier</th>
                <th className="pb-3 font-medium">Segment</th>
                <th className="pb-3 font-medium">Watch Time</th>
                <th className="pb-3 font-medium">Completion</th>
                <th className="pb-3 font-medium">Rec CTR</th>
                <th className="pb-3 font-medium">Churn Probability</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.map((cust) => {
                const isHighRisk = cust.churnProbability >= 60;
                return (
                  <tr
                    key={cust.id}
                    onClick={() => openCustomerDrawer(cust)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 pr-4">
                      <div className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {cust.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {cust.id} • {cust.location}
                      </div>
                    </td>

                    <td className="py-3 pr-4 text-slate-300 font-mono">
                      {cust.accountType}
                      <span className="text-[10px] text-slate-400 block">{cust.tenureMonths} mos tenure</span>
                    </td>

                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {cust.segmentName}
                      </span>
                    </td>

                    <td className="py-3 pr-4 font-mono font-bold text-cyan-400">{cust.weeklyWatchTimeHrs}h / wk</td>

                    <td className="py-3 pr-4 font-mono text-slate-200">{cust.completionRate}%</td>

                    <td className="py-3 pr-4 font-mono text-slate-200">{cust.recommendationCTR}%</td>

                    <td className="py-3 pr-4">
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          isHighRisk ? 'text-rose-400 bg-rose-500/10' : 'text-slate-300 bg-slate-800'
                        }`}
                      >
                        {cust.churnProbability}%
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        type="button"
                        id={`btn-inspect-sub-${cust.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openCustomerDrawer(cust);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect 360
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
