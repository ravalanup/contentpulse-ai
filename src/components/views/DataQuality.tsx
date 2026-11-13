import React from 'react';
import { useApp } from '../../context/AppContext';
import { DataQualityIncident } from '../../types';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  GitFork,
  ArrowRight,
  Clock,
  Wrench,
  Activity,
  Layers,
  Eye,
} from 'lucide-react';

export const DataQuality: React.FC = () => {
  const { qualityIncidents, openQualityIncidentDrawer, remediateQualityIncident } = useApp();

  const openIncidents = qualityIncidents.filter((i) => i.status !== 'Remediated');
  const criticalCount = qualityIncidents.filter(
    (i) => i.severity === 'Critical' && i.status !== 'Remediated'
  ).length;

  const qualityDimensions = [
    { name: 'Freshness', score: 99.8, target: 'Target >99.5%', description: 'P99 streaming lag <45ms' },
    { name: 'Completeness', score: 99.4, target: 'Target >99.0%', description: 'Zero unexpected null fields' },
    { name: 'Accuracy', score: 99.1, target: 'Target >99.0%', description: 'Telemetry range boundary verification' },
    { name: 'Uniqueness', score: 99.9, target: 'Target >99.8%', description: 'Deduplicated event session IDs' },
    {
      name: 'Validity',
      score: criticalCount > 0 ? 94.2 : 98.6,
      target: 'Target >98.0%',
      description: 'Strict schema contract compliance',
      isAlert: criticalCount > 0,
    },
    { name: 'Consistency', score: 99.5, target: 'Target >99.0%', description: 'Cross-table referential integrity' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          Data Quality, Lineage & Governance Hub
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated Great Expectations & Monte Carlo contract validation, root-cause lineage DAG tracing, and zero-degradation remediation.
        </p>
      </div>

      {/* 6 Core Quality Dimensions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {qualityDimensions.map((dim, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border flex flex-col justify-between ${
              dim.isAlert
                ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                : 'bg-slate-900/50 border-slate-800/80 text-slate-200'
            }`}
          >
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">{dim.name}</span>
              <div className="flex items-baseline gap-1 my-1">
                <span
                  className={`text-xl font-bold font-mono ${
                    dim.isAlert ? 'text-rose-400' : 'text-cyan-400'
                  }`}
                >
                  {dim.score}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block">{dim.target}</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-2 block border-t border-slate-800/60 pt-1 truncate">
              {dim.description}
            </span>
          </div>
        ))}
      </div>

      {/* Active Incidents Alert Banner if critical exists */}
      {criticalCount > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-rose-200">
                Critical Data Incident Active: Nullable Tier Code in Subscription Events
              </h4>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Downstream Churn Signal Model (ML-02) and Executive Revenue LTV calculations are currently quarantined.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-remediate-banner-incident"
            onClick={() => {
              const crit = qualityIncidents.find((i) => i.severity === 'Critical' && i.status !== 'Remediated');
              if (crit) openQualityIncidentDrawer(crit);
            }}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-400 text-slate-950 transition-colors shrink-0 shadow-lg"
          >
            Investigate & Remediate Incident →
          </button>
        </div>
      )}

      {/* Incident Management Table */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Automated Data Contract Incident Feed
            </h3>
            <p className="text-xs text-slate-400">
              Contract validation failures triggering automated circuit breakers and lineage notifications.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {openIncidents.length} Unresolved Incidents
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-medium">Incident ID</th>
                <th className="pb-3 font-medium">Dimension</th>
                <th className="pb-3 font-medium">Affected Data Product</th>
                <th className="pb-3 font-medium">Detected At</th>
                <th className="pb-3 font-medium">Severity</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {qualityIncidents.map((incident) => {
                const isRemediated = incident.status === 'Remediated';
                const isCrit = incident.severity === 'Critical';

                return (
                  <tr
                    key={incident.id}
                    onClick={() => openQualityIncidentDrawer(incident)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 pr-4 font-mono font-bold text-cyan-300 group-hover:text-cyan-200">
                      {incident.id}
                    </td>

                    <td className="py-3 pr-4 text-slate-200 font-medium">{incident.dimension}</td>

                    <td className="py-3 pr-4 font-mono text-slate-300">{incident.dataProductName}</td>

                    <td className="py-3 pr-4 font-mono text-slate-400 text-[11px]">{incident.detectedAt}</td>

                    <td className="py-3 pr-4">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          isCrit
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {incident.severity}
                      </span>
                    </td>

                    <td className="py-3 pr-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isRemediated
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {incident.status}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        type="button"
                        id={`btn-open-incident-${incident.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openQualityIncidentDrawer(incident);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Investigate Lineage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual End-to-End Lineage Architecture DAG */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Global Data Product Lineage & Consumer Graph</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">OpenLineage / Marquez Protocol</span>
        </div>

        {/* 5-Stage Lineage Architecture Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">1. Ingestion Sources</span>
            <h4 className="text-xs font-bold text-slate-200">Device Client Telemetry</h4>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>• Smart TV / Mobile SDKs</div>
              <div>• Billing Webhooks (Stripe)</div>
              <div>• CMS Metadata Feeds</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">2. Streaming Bus</span>
            <h4 className="text-xs font-bold text-slate-200">Kafka / Event Hubs</h4>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>• 185k events/sec</div>
              <div>• Protobuf Serialization</div>
              <div>• Schema Registry Check</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">3. Lakehouse Storage</span>
            <h4 className="text-xs font-bold text-slate-200">Apache Iceberg</h4>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>• Parquet columnar format</div>
              <div>• ACID transactional commits</div>
              <div>• Daily snapshot partitions</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">4. Feature Store</span>
            <h4 className="text-xs font-bold text-slate-200">Vertex AI Feature Store</h4>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>• Low-latency online Redis</div>
              <div>• 768-dim content vectors</div>
              <div>• Real-time sub entity stats</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">5. Consumer Models</span>
            <h4 className="text-xs font-bold text-slate-200">Production ML Models</h4>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>• Home Ranking v2</div>
              <div>• Churn Hazard Ensemble</div>
              <div>• Vector Search Reranker</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
