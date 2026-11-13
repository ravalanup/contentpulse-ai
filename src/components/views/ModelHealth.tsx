import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ModelHealthCard } from '../../types';
import {
  Activity,
  Cpu,
  Zap,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  TrendingDown,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ModelHealth: React.FC = () => {
  const { modelHealthList, qualityIncidents } = useApp();
  const [retrainingModelId, setRetrainingModelId] = useState<string | null>(null);

  const handleRetrain = (id: string) => {
    setRetrainingModelId(id);
    setTimeout(() => {
      setRetrainingModelId(null);
    }, 1200);
  };

  const hasDegradedModel = modelHealthList.some((m) => m.status === 'Degraded');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-cyan-400" />
          AI & ML Model Health Observability
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Production inference telemetry, feature drift monitoring, Kolmogorov-Smirnov distribution checks, and shadow re-training pipelines.
        </p>
      </div>

      {/* Model Health Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono">Live Ensembles</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 my-1">{modelHealthList.length} Models</div>
          <span className="text-[10px] text-slate-400">Vertex AI Real-time Serving</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono">Total Inference Load</span>
          <div className="text-2xl font-bold font-mono text-slate-100 my-1">
            {modelHealthList.reduce((acc, curr) => acc + curr.throughputQps, 0).toLocaleString()} QPS
          </div>
          <span className="text-[10px] text-slate-400">Across Global Edge Regions</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono">Average P99 Latency</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 my-1">26.8ms</div>
          <span className="text-[10px] text-slate-400">Strict &lt;50ms Consumer SLA</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono">Ensemble Fleet Status</span>
          <div
            className={`text-2xl font-bold font-mono my-1 ${
              hasDegradedModel ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {hasDegradedModel ? '1 Degraded' : 'All Healthy'}
          </div>
          <span className="text-[10px] text-slate-400">Automated Circuit Breakers Active</span>
        </div>
      </div>

      {/* Model Cards */}
      <div className="space-y-4">
        {modelHealthList.map((model) => {
          const isDegraded = model.status === 'Degraded';
          const isRetraining = retrainingModelId === model.id;

          return (
            <div
              key={model.id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                isDegraded
                  ? 'bg-amber-950/15 border-amber-500/40'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-cyan-400 font-bold">{model.id}</span>
                    <h4 className="text-base font-bold text-slate-100">{model.name}</h4>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                        isDegraded
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {model.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Architecture: <strong className="text-slate-300 font-mono">{model.architecture}</strong> • Version{' '}
                    <span className="font-mono text-slate-300">{model.version}</span> • Retrained {model.lastRetrained}
                  </p>
                </div>

                {/* Retrain Action Button */}
                <button
                  type="button"
                  id={`btn-retrain-model-${model.id}`}
                  onClick={() => handleRetrain(model.id)}
                  disabled={isRetraining}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 border border-slate-700 hover:border-cyan-500/40 transition-all flex items-center gap-1.5 self-start lg:self-center disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
                  {isRetraining ? 'Queueing Shadow Pipeline...' : 'Trigger Shadow Retraining'}
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-mono">Accuracy Metric</span>
                  <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">{model.accuracyMetric}</div>
                  <span className="text-[10px] text-slate-400">{model.benchmarkMetric}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-mono">Inference Latency (P99)</span>
                  <div className="text-base font-bold font-mono text-slate-100 mt-0.5">{model.p99LatencyMs}ms</div>
                  <span className="text-[10px] text-emerald-400">SLA Compliant</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-mono">Serving Throughput</span>
                  <div className="text-base font-bold font-mono text-slate-100 mt-0.5">
                    {model.throughputQps.toLocaleString()} QPS
                  </div>
                  <span className="text-[10px] text-slate-400">Global traffic share</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-mono">Feature Drift (PSI)</span>
                  <div
                    className={`text-base font-bold font-mono mt-0.5 ${
                      isDegraded ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    PSI = {model.driftMetric.psiScore}
                  </div>
                  <span className="text-[10px] text-slate-400">{model.driftMetric.status}</span>
                </div>
              </div>

              {/* Upstream Dependencies */}
              <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400">Contract Dependencies:</span>
                  {model.dataProductDependencies.map((dep, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {dep}
                    </span>
                  ))}
                </div>

                <span className="font-mono text-[11px] text-slate-400">{model.monitoringFramework}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
