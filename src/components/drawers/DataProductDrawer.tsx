import React from 'react';
import { useApp } from '../../context/AppContext';
import { SlideOverDrawer } from '../common/SlideOverDrawer';
import { Database, ShieldCheck, Clock, Layers, Users, Server } from 'lucide-react';

export const DataProductDrawer: React.FC = () => {
  const { selectedDataProduct, closeDataProductDrawer } = useApp();

  if (!selectedDataProduct) return null;

  return (
    <SlideOverDrawer
      isOpen={!!selectedDataProduct}
      onClose={closeDataProductDrawer}
      title={selectedDataProduct.name}
      subtitle={`Data Product ID: ${selectedDataProduct.id} • Domain: ${selectedDataProduct.domain} • Owned by ${selectedDataProduct.owner}`}
      widthClass="max-w-3xl"
      badge={
        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          {selectedDataProduct.usageTier}
        </span>
      }
    >
      {/* Description & Overview */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Product Contract Description</h4>
        <p className="text-sm text-slate-200 leading-relaxed">{selectedDataProduct.description}</p>
      </div>

      {/* Contract SLAs & Operational Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> Freshness SLA
          </div>
          <div className="text-sm font-bold font-mono text-cyan-300">{selectedDataProduct.freshness}</div>
          <div className="text-[10px] text-slate-400 mt-1">{selectedDataProduct.slaTarget}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Quality Score
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">{selectedDataProduct.currentQualityScore}/100</div>
          <div className="text-[10px] text-slate-400 mt-1">Rule validations passing</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-400" /> Schema Version
          </div>
          <div className="text-sm font-bold font-mono text-slate-100">{selectedDataProduct.schemaVersion}</div>
          <div className="text-[10px] text-slate-400 mt-1">Updated {selectedDataProduct.lastUpdated}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
            <Server className="w-3 h-3 text-blue-400" /> Monthly Queries
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">{selectedDataProduct.monthlyQueriesM}M</div>
          <div className="text-[10px] text-slate-400 mt-1">{selectedDataProduct.storageTech}</div>
        </div>
      </div>

      {/* Downstream Consumers */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          Registered Downstream Consumers
        </h4>
        <div className="flex flex-wrap gap-2">
          {selectedDataProduct.consumers.map((consumer, idx) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono"
            >
              {consumer}
            </span>
          ))}
        </div>
      </div>

      {/* Schema Contract Definition Table */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            Schema Contract Definition ({selectedDataProduct.schema.length} fields)
          </h4>
          <span className="text-[11px] font-mono text-slate-400">Strict Type Enforced</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-2 font-medium">Field Name</th>
                <th className="pb-2 font-medium">Data Type</th>
                <th className="pb-2 font-medium">Nullable</th>
                <th className="pb-2 font-medium">PII Level</th>
                <th className="pb-2 font-medium">Semantic Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {selectedDataProduct.schema.map((field, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2.5 pr-3 text-cyan-300 font-medium">{field.name}</td>
                  <td className="py-2.5 pr-3 text-purple-300">{field.type}</td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        field.nullable ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 bg-slate-800'
                      }`}
                    >
                      {field.nullable ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        field.piiLevel === 'Restricted'
                          ? 'text-rose-400 bg-rose-500/10'
                          : field.piiLevel === 'Pseudonymized'
                          ? 'text-cyan-400 bg-cyan-500/10'
                          : 'text-slate-400 bg-slate-800'
                      }`}
                    >
                      {field.piiLevel}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300 font-sans">{field.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SlideOverDrawer>
  );
};
