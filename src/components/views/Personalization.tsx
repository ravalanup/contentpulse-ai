import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RECOMMENDATION_PIPELINE,
  RECOMMENDATION_METRICS,
  SAMPLE_RECOMMENDATION_EXPLANATION,
} from '../../data/mockData';
import { PipelineStage } from '../../types';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  GitCommit,
  Info,
} from 'lucide-react';

export const Personalization: React.FC = () => {
  const { customers, catalog } = useApp();
  const [activeStageId, setActiveStageId] = useState<string>('pipe-04');
  const [selectedSubId, setSelectedSubId] = useState<string>('sub-8921-mv');

  const selectedStage = RECOMMENDATION_PIPELINE.find((s) => s.id === activeStageId) || RECOMMENDATION_PIPELINE[3];

  const metricsList = [
    { label: 'Precision@10', value: (RECOMMENDATION_METRICS.precisionAtK * 100).toFixed(1) + '%', benchmark: 'Target >40.0%', isGood: true },
    { label: 'Recall@50', value: (RECOMMENDATION_METRICS.recallAtK * 100).toFixed(1) + '%', benchmark: 'Target >65.0%', isGood: true },
    { label: 'NDCG@10', value: RECOMMENDATION_METRICS.ndcg.toFixed(3), benchmark: 'Target >0.850', isGood: true },
    { label: 'Recommendation CTR', value: RECOMMENDATION_METRICS.ctr.toFixed(1) + '%', benchmark: 'Baseline: 17.2%', isGood: true },
    { label: 'Catalog Completion', value: RECOMMENDATION_METRICS.completionRate.toFixed(1) + '%', benchmark: 'Median: 64.0%', isGood: true },
    { label: 'Catalog Coverage', value: RECOMMENDATION_METRICS.catalogCoverage.toFixed(1) + '%', benchmark: 'Target >75.0%', isGood: true },
    { label: 'Intra-List Diversity', value: RECOMMENDATION_METRICS.intraListDiversity.toFixed(2), benchmark: 'Target >0.70', isGood: true },
    { label: 'Novelty Score', value: RECOMMENDATION_METRICS.noveltyScore.toFixed(2), benchmark: 'Target >0.55', isGood: true },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-cyan-400" />
          Personalization & Recommendation Engine
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          End-to-end algorithmic pipeline: from real-time behavioral ingestion and ScaNN candidate retrieval to multi-task Transformer ranking and explainability.
        </p>
      </div>

      {/* Primary Recommendation Metrics (8 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {metricsList.map((m, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] text-slate-400 font-medium block truncate">{m.label}</span>
              <span className="text-base font-bold font-mono text-cyan-400 mt-1 block">{m.value}</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-2 block border-t border-slate-800/60 pt-1 truncate">
              {m.benchmark}
            </span>
          </div>
        ))}
      </div>

      {/* Conceptual Recommendation Pipeline (Step 1 -> Step 7) */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Live Recommendation Architecture Pipeline</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Total Latency: 84ms • P99 SLA: &lt;100ms</span>
        </div>

        {/* Step Flow Bar */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {RECOMMENDATION_PIPELINE.map((stage) => {
            const isActive = activeStageId === stage.id;
            return (
              <div
                key={stage.id}
                onClick={() => setActiveStageId(stage.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                  isActive
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>STEP {stage.stepNumber}</span>
                    <span className="text-cyan-400 font-semibold">{stage.latencyMs}ms</span>
                  </div>
                  <h4 className={`text-xs font-bold mb-1 ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {stage.title}
                  </h4>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{stage.subsystem}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{(stage.throughputQps / 1000).toFixed(0)}k QPS</span>
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>Inspect →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Stage Deep Inspection Panel */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Step {selectedStage.stepNumber}: {selectedStage.title}
              </span>
              <span className="text-xs font-mono text-slate-400">{selectedStage.subsystem}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedStage.description}</p>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <div>
                <strong className="text-slate-300">Input: </strong> {selectedStage.inputArtifact}
              </div>
              <div>
                <strong className="text-slate-300">Output: </strong> {selectedStage.outputArtifact}
              </div>
            </div>
          </div>

          <div className="md:w-1/2 flex items-center justify-around bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            {selectedStage.metrics.map((m, idx) => (
              <div key={idx} className="text-center">
                <span className="text-[11px] text-slate-400 block font-mono">{m.label}</span>
                <span className="text-base font-bold font-mono text-cyan-400 mt-0.5 block">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendation Explanation (Explainable AI Engine) */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Explainable AI: Recommendation Attribution Engine</h3>
              <p className="text-xs text-slate-400">
                Deconstructs why a specific item ranked #1 for a subscriber (SHAP-calibrated feature weights & counterfactuals)
              </p>
            </div>
          </div>

          {/* Subscriber selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Target Subscriber:</span>
            <select
              id="select-explain-subscriber"
              value={selectedSubId}
              onChange={(e) => setSelectedSubId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-cyan-300 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.segmentName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attribution breakdown card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Top Recommendation</span>
              <h4 className="text-base font-extrabold text-white">
                {SAMPLE_RECOMMENDATION_EXPLANATION.contentTitle}
              </h4>
              <span className="text-xs font-mono text-cyan-400">
                Predicted p(Complete): 88.4% • Overall Affinity Score: {(SAMPLE_RECOMMENDATION_EXPLANATION.overallScore * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Candidate Rank</span>
                <span className="text-slate-200 font-bold">#{SAMPLE_RECOMMENDATION_EXPLANATION.candidateGenerationRank}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Reranker Delta</span>
                <span className="text-emerald-400 font-bold">+2 Ranks</span>
              </div>
            </div>
          </div>

          {/* Core Reasoning Narrative */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-200 leading-relaxed">
            <strong className="text-cyan-300 font-semibold block mb-1">Primary Decision Rationale:</strong>
            {SAMPLE_RECOMMENDATION_EXPLANATION.primaryDriver}
          </div>

          {/* Factor attribution weights bar breakdown */}
          <div>
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Factor Influence Weights (Normalized Feature Attribution)
            </h5>
            <div className="space-y-2.5">
              {SAMPLE_RECOMMENDATION_EXPLANATION.factors.map((f, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{f.factor}</span>
                    <span className="font-mono text-cyan-400 font-semibold">{f.weight}% weight</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${f.weight * 2.2}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Counterfactual analysis */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-100">Counterfactual Simulation: </strong>
              {SAMPLE_RECOMMENDATION_EXPLANATION.counterfactual}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
