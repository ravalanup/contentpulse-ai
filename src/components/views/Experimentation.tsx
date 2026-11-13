import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Experiment } from '../../types';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  ArrowRight,
  Info,
} from 'lucide-react';

export const Experimentation: React.FC = () => {
  const { experiments, updateExperimentDecision } = useApp();
  const [selectedExpId, setSelectedExpId] = useState<string>('exp-01');

  const selectedExp = experiments.find((e) => e.id === selectedExpId) || experiments[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <FlaskConical className="w-5 h-5 text-cyan-400" />
          Experimentation & Causal Inference Platform
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Rigorous A/B and multi-armed bandit hypothesis testing with guardrail safety checks and real-time KPI re-computation.
        </p>
      </div>

      {/* Experiment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {experiments.map((exp) => {
          const isSelected = exp.id === selectedExpId;
          const isSignificant = exp.statisticalSignificance.isSignificant;

          return (
            <div
              key={exp.id}
              onClick={() => setSelectedExpId(exp.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-mono text-cyan-400">{exp.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                      exp.decision === 'ship'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : exp.decision === 'rollback'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {exp.decision.toUpperCase()}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-100 mb-1 line-clamp-1">{exp.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{exp.hypothesis}</p>

                {/* Primary Delta */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">{exp.primaryMetric}</span>
                    <span className="text-xs font-mono text-slate-300">
                      {exp.controlValue} → <strong className="text-white">{exp.treatmentValue}</strong>
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-400 flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +{exp.relativeLiftPercent}%
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                <span className={isSignificant ? 'text-emerald-400' : 'text-amber-400'}>
                  p = {exp.statisticalSignificance.pValue} ({isSignificant ? 'Sig' : 'Underpowered'})
                </span>
                <span className="text-cyan-400 font-medium">Select →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Experiment Deep Dive & PM Decision Workspace */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
        {/* Top Header & Decision Action Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {selectedExp.id} • {selectedExp.modelOrFeature}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Sample: {(selectedExp.sampleSize / 1000000).toFixed(0)}M Subscribers ({selectedExp.allocationPercent}%
                allocation)
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white">{selectedExp.name}</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">{selectedExp.hypothesis}</p>
          </div>

          {/* PM Decision Button Group */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start lg:self-center">
            <span className="text-xs font-mono text-slate-400 px-2">PM Decision:</span>
            <button
              type="button"
              id="btn-exp-decision-ship"
              onClick={() => updateExperimentDecision(selectedExp.id, 'ship')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedExp.decision === 'ship'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Ship 100%
            </button>

            <button
              type="button"
              id="btn-exp-decision-iterate"
              onClick={() => updateExperimentDecision(selectedExp.id, 'iterate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedExp.decision === 'iterate'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Iterate
            </button>

            <button
              type="button"
              id="btn-exp-decision-rollback"
              onClick={() => updateExperimentDecision(selectedExp.id, 'rollback')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedExp.decision === 'rollback'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Rollback
            </button>
          </div>
        </div>

        {/* Statistical Rigor & Primary Delta Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 font-mono">Primary Metric Lift</span>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 my-1">
              +{selectedExp.relativeLiftPercent}%
            </div>
            <div className="text-[11px] text-slate-400">
              {selectedExp.controlValue} (Ctrl) → {selectedExp.treatmentValue} (Trt)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 font-mono">Statistical Significance</span>
            <div className="text-2xl font-extrabold font-mono text-cyan-300 my-1">
              p = {selectedExp.statisticalSignificance.pValue}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">Statistically Significant (p &lt; 0.05)</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 font-mono">Confidence Interval (95%)</span>
            <div className="text-lg font-bold font-mono text-slate-100 my-1">
              [{selectedExp.statisticalSignificance.confidenceInterval[0]}%,{' '}
              {selectedExp.statisticalSignificance.confidenceInterval[1]}%]
            </div>
            <div className="text-[11px] text-slate-400 font-mono">Strict positive lower bound</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 font-mono">Statistical Power</span>
            <div className="text-2xl font-extrabold font-mono text-slate-100 my-1">
              {(selectedExp.statisticalSignificance.power * 100).toFixed(0)}%
            </div>
            <div className="text-[11px] text-slate-400">Well above 80% threshold</div>
          </div>
        </div>

        {/* Guardrail Safety Metrics */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              Guardrail Metrics & Safety Checks (Zero Degradation Policy)
            </h4>
            <span className="text-xs font-mono text-slate-400">P99 System Health</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedExp.guardrailMetrics.map((g, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">{g.name}</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Ctrl: {g.control} • Trt: <strong className="text-white">{g.treatment}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      g.status === 'passed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {g.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{g.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Rationale Note */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-slate-100">Principal PM Governance Protocol:</strong>
            <p className="text-slate-400 leading-relaxed">
              When an experiment decision is toggled to <strong>"Ship 100%"</strong>, ContentPulse automatically activates
              downstream feature flags in the Vertex Feature Store and updates the global North Star telemetry reactively.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
