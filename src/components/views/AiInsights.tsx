import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AiInsightResponse } from '../../types';
import {
  Sparkles,
  Send,
  RefreshCw,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

export const AiInsights: React.FC = () => {
  const { queryAiInsights, hasApiKey, setActiveView } = useApp();

  const [inputQuery, setInputQuery] = useState(
    'Why is churn increasing in the Casual Viewers segment, and what content or rails can recover them?'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<AiInsightResponse | null>(null);

  const samplePrompts = [
    'Why is churn increasing in the Casual Viewers segment, and what content or rails can recover them?',
    'Which content should we promote this weekend to maximize family co-viewing and completion?',
    'What caused the drop-off between episodes 3 and 5 of Shadows of Olympus?',
    'Evaluate the impact of Personalized Home Ranking v2 on catalog coverage and novelty.',
  ];

  const handleRunQuery = async (queryText: string) => {
    setIsLoading(true);
    setInputQuery(queryText);
    try {
      const response = await queryAiInsights(queryText);
      setCurrentInsight(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial query on first mount if empty
  React.useEffect(() => {
    if (!currentInsight) {
      handleRunQuery(inputQuery);
    }
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          AI Content & Audience Intelligence Reasoner
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Executive decision support grounded in streaming telemetry, 8 enterprise data product contracts, and causal experimentation.
        </p>
      </div>

      {/* Query Bar & Presets */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-300">Natural Language Analytical Query:</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              {hasApiKey ? 'Gemini 3.8 Flash Active' : 'Deterministic Semantic Engine'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Zero Hallucination Grounding Enforced</span>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputQuery.trim()) handleRunQuery(inputQuery);
          }}
          className="relative"
        >
          <input
            type="text"
            id="input-ai-insights-query"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything regarding retention, completion drop-offs, catalog gaps, or algorithmic performance..."
            className="w-full pl-4 pr-28 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 shadow-inner"
          />
          <button
            type="submit"
            id="btn-run-ai-query"
            disabled={isLoading || !inputQuery.trim()}
            className="absolute right-2 top-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-md"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Synthesize
              </>
            )}
          </button>
        </form>

        {/* Sample Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] text-slate-400">Sample PM queries:</span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              id={`btn-ai-prompt-pill-${idx}`}
              onClick={() => handleRunQuery(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 transition-all text-left truncate max-w-sm"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Result Display Area */}
      {isLoading ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center space-y-3">
          <div className="relative">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <Sparkles className="w-4 h-4 text-cyan-300 absolute -top-1 -right-1" />
          </div>
          <p className="text-sm font-medium text-slate-200">Synthesizing platform telemetry...</p>
          <span className="text-xs font-mono text-slate-400">
            Evaluating cross-table joins across 8 Data Products & causal experiment logs
          </span>
        </div>
      ) : currentInsight ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
          {/* Top metadata badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                Executive Synthesis Result
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">Analysis & Causal Findings</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Confidence: {(currentInsight.confidence * 100).toFixed(0)}%
              </div>
              <span className="text-xs font-mono text-slate-400">{currentInsight.timestamp}</span>
            </div>
          </div>

          {/* Core Analysis Narrative */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans space-y-2">
            <p className="whitespace-pre-line">{currentInsight.summary}</p>
          </div>

          {/* Supporting Metrics Cards */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Corroborating Telemetry & Evidence
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentInsight.supportingMetrics.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between"
                >
                  <span className="text-[11px] text-slate-400 font-mono">{m.metric}</span>
                  <div className="flex items-baseline gap-2 my-1">
                    <span className="text-lg font-bold font-mono text-cyan-400">{m.value}</span>
                    <span
                      className={`text-[10px] font-mono px-1 rounded ${
                        m.trend === 'positive' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {m.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Next Actions */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Recommended Next PM Actions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentInsight.recommendedActions.map((rec, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (rec.actionView) setActiveView(rec.actionView as any);
                  }}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono text-cyan-400 font-semibold">Priority #{idx + 1}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {rec.actionView ? `Go to ${rec.actionView}` : 'Strategic'}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {rec.action}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{rec.rationale}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-cyan-400">
                    <span>Execute in platform</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lineage & Grounding Attribution Footer */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Grounded in Data Contracts:</span>
              <div className="flex flex-wrap gap-1">
                {currentInsight.dataSources.map((ds, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {ds}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Contract Version v2.1 Verified</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
