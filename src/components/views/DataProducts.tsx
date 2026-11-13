import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataProduct } from '../../types';
import {
  Database,
  Layers,
  ShieldCheck,
  Clock,
  Users,
  Server,
  Code,
  Eye,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';

export const DataProducts: React.FC = () => {
  const { dataProducts, openDataProductDrawer } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  const domains = ['All', 'Telemetry', 'Metadata', 'Customer Intelligence', 'Monetization', 'Machine Learning'];

  const filteredProducts = dataProducts.filter((dp) => {
    const matchesDomain = selectedDomain === 'All' || dp.domain === selectedDomain;
    const matchesSearch =
      dp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dp.owner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Database className="w-5 h-5 text-cyan-400" />
          Enterprise Data Products Catalog (Data Mesh)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Reusable, contract-governed data assets serving recommendation systems, experimentation engines, churn modeling, and analytics.
        </p>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono">Governed Products</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 my-1">{dataProducts.length} Contracts</div>
          <span className="text-[10px] text-slate-400">100% Strict Schema Enforced</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono">Monthly Downstream Queries</span>
          <div className="text-2xl font-bold font-mono text-slate-100 my-1">
            {dataProducts.reduce((acc, curr) => acc + curr.monthlyQueriesM, 0)}M
          </div>
          <span className="text-[10px] text-slate-400">Across 8 Consumer Tiers</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono">Average Contract SLA</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 my-1">99.94%</div>
          <span className="text-[10px] text-slate-400">Real-time Kafka + Iceberg</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono">Tier-1 Mission Critical</span>
          <div className="text-2xl font-bold font-mono text-purple-300 my-1">
            {dataProducts.filter((d) => d.usageTier === 'Tier-1 Mission Critical').length} Products
          </div>
          <span className="text-[10px] text-slate-400">P99 Latency &lt;50ms</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Domain pills */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          <span className="text-slate-400 text-[11px] px-2 font-mono">Domain:</span>
          {domains.map((dom) => (
            <button
              key={dom}
              type="button"
              id={`btn-filter-domain-${dom.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                selectedDomain === dom
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            id="input-search-data-products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schema or owner..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Data Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.map((dp) => (
          <div
            key={dp.id}
            onClick={() => openDataProductDrawer(dp)}
            className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-cyan-400 font-bold">{dp.id}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    dp.usageTier.includes('Tier-1')
                      ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {dp.usageTier}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                {dp.name}
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{dp.description}</p>

              {/* SLAs & Quality Score */}
              <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Freshness</span>
                  <span className="text-xs font-mono font-bold text-cyan-300">{dp.freshness}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Quality Score</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{dp.currentQualityScore}/100</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Monthly QPS</span>
                  <span className="text-xs font-mono font-bold text-slate-200">{dp.monthlyQueriesM}M</span>
                </div>
              </div>

              {/* Schema Fields preview */}
              <div className="space-y-1 text-xs">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>
                    Contract: <strong className="text-slate-200 font-mono">{dp.schemaVersion}</strong> ({dp.schema.length} fields)
                  </span>
                  <span className="font-mono text-slate-400">{dp.storageTech}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">Owner: {dp.owner}</span>
              <span className="text-cyan-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Inspect Schema & Lineage <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
