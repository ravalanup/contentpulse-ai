import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkline, AreaTrendChart, GaugeRing } from '../common/SimpleCharts';
import {
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Film,
  Users,
  Compass,
  RefreshCw,
  Sliders,
  ChevronRight,
} from 'lucide-react';

export const ExecutiveOverview: React.FC = () => {
  const { kpis, catalog, experiments, setActiveView, setSelectedSegmentId, openContentDrawer } = useApp();
  const [isRefreshingBrief, setIsRefreshingBrief] = useState(false);

  // Active home ranking experiment
  const homeExp = experiments.find((e) => e.id === 'exp-01');
  const isShipped = homeExp?.decision === 'ship';

  const weeklyEngagementTrend = [
    { label: 'W1', value: 4.12, secondaryValue: 4.05 },
    { label: 'W2', value: 4.25, secondaryValue: 4.1 },
    { label: 'W3', value: 4.38, secondaryValue: 4.18 },
    { label: 'W4', value: 4.41, secondaryValue: 4.22 },
    { label: 'W5', value: 4.59, secondaryValue: 4.28 },
    { label: 'W6', value: 4.71, secondaryValue: 4.31 },
    { label: 'W7', value: isShipped ? 4.82 : 4.52, secondaryValue: 4.35 },
  ];

  const retentionCohortTrend = [
    { label: 'Jan', value: 85.9 },
    { label: 'Feb', value: 86.4 },
    { label: 'Mar', value: 86.9 },
    { label: 'Apr', value: 87.3 },
    { label: 'May', value: 87.8 },
    { label: 'Jun', value: 88.2 },
    { label: 'Jul', value: isShipped ? 88.6 : 87.4 },
  ];

  const handleRefreshBrief = () => {
    setIsRefreshingBrief(true);
    setTimeout(() => setIsRefreshingBrief(false), 500);
  };

  const topOpportunities = [
    {
      title: 'Deploy Multimodal Cross-Attention Ranking to 100% Base',
      metric: '+8.4% CTR Lift (+$18.2M LTV)',
      impact: 'Personalized Home Ranking v2 achieved statistical significance (p < 0.001) with zero completion degradation.',
      actionView: 'experimentation',
    },
    {
      title: 'Intervene on Declining Engagement Series Episodic Stalls',
      metric: '10.4M Subscribers at Risk',
      impact: 'Smart Resume & Pivot rails can recover an estimated 1.4pp in 30-day renewal retention before billing expiration.',
      actionView: 'audience',
    },
    {
      title: 'Promote Surging Family Adventure Inventory for Weekend Peak',
      metric: '86.8% Completion Rate',
      impact: 'Pico & The Cloud King and Wonderlings Academy show 29.5% CTR; feature in Friday 4PM-8PM family hero slots.',
      actionView: 'content',
    },
  ];

  const topRisks = [
    {
      title: 'Subscription Behavior Ingestion Schema Violation',
      severity: 'Critical Incident',
      impact: 'Nullable tier_code records in webhook ingestion are stalling downstream Churn Signal ML feature calibration.',
      actionView: 'data_quality',
    },
    {
      title: 'Mid-Tenure Series Fatigue in Serialized Dramas',
      severity: 'Medium Hazard',
      impact: 'Shadows of Olympus and Echoes of Tomorrow exhibit 28% completion cliff between episodes 3 and 5.',
      actionView: 'content',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Header & AI Executive Brief */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: North Star Card */}
        <div className="lg:w-1/3 bg-gradient-to-br from-cyan-950/40 via-slate-900/70 to-blue-950/40 border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-300" />
                Platform North Star Metric
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Primary Goal
              </span>
            </div>

            <h2 className="text-sm font-semibold text-slate-200">Meaningful Content Engagement</h2>
            <p className="text-xs text-slate-400 mt-1">
              Weekly qualified viewing (&gt;10 min uninterrupted or completed episodic session) per active subscriber.
            </p>

            <div className="flex items-baseline gap-3 my-4">
              <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
                {kpis.find((k) => k.id === 'kpi-north-star')?.value || '4.82 hrs'}
              </span>
              <span className="text-xs font-mono text-slate-400">/ active sub / wk</span>
              <span className="flex items-center text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <ArrowUpRight className="w-3.5 h-3.5" /> +7.4% QoQ
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Target: &gt;4.50 hrs/wk</span>
            <span className="text-emerald-400 font-mono font-semibold">107.1% to Target</span>
          </div>
        </div>

        {/* Right: AI Executive Brief */}
        <div className="lg:w-2/3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    AI Executive Brief
                    <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Simulated Portfolio Telemetry
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Automated synthesis of rolling 7-day streaming data and active experiments</p>
                </div>
              </div>

              <button
                type="button"
                id="btn-refresh-exec-brief"
                onClick={handleRefreshBrief}
                disabled={isRefreshingBrief}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Re-synthesize executive brief"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshingBrief ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/70">
              <p>
                <strong className="text-cyan-300">Recommendation Performance:</strong> Recommendation engagement increased{' '}
                <span className="text-emerald-400 font-mono font-semibold">+8.4%</span> following the rollout of the{' '}
                <em>Personalized Home Ranking v2</em> experiment, while catalog completion remained stable at{' '}
                <span className="text-slate-100 font-mono font-semibold">68.4%</span>.
              </p>
              <p>
                <strong className="text-cyan-300">Audience Dynamics:</strong> Declining engagement cohort holds{' '}
                <span className="text-amber-300 font-mono font-semibold">10.4M subscribers</span>. Drop-off is heavily concentrated
                in episodic stalls between episodes 3 and 5 of multi-season dramas, rather than broad catalog dissatisfaction.
              </p>
              <p>
                <strong className="text-cyan-300">Data & Governance Alert:</strong> Ingestion validation on{' '}
                <span className="text-rose-300 font-mono font-semibold">Subscription Behavior (DP-04)</span> triggered a schema
                warning. One-click remediation quarantine is available to prevent downstream churn model degradation.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>Model: ContentPulse Reasoner v4 • Grounded in 8 Data Products</span>
            <button
              type="button"
              id="btn-ask-ai-followup"
              onClick={() => setActiveView('ai_insights')}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              Ask natural language follow-up <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (8 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Primary Enterprise Telemetry & Growth KPIs
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real-time Kafka/Iceberg Ingestion</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-slate-900/50 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 truncate pr-2">{kpi.name}</span>
                  <span
                    className={`font-mono text-[11px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                      kpi.isPositive
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.delta}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-2xl font-bold font-mono tracking-tight text-white">{kpi.value}</span>
                  {kpi.unit && <span className="text-[11px] font-mono text-slate-400 truncate">{kpi.unit}</span>}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">{kpi.benchmark}</span>
                <Sparkline
                  data={kpi.sparkline}
                  color={kpi.isPositive ? '#06b6d4' : '#f43f5e'}
                  width={75}
                  height={22}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section: Engagement & Retention Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Meaningful Weekly Engagement Trend
              </h3>
              <p className="text-xs text-slate-400">Weekly qualified viewing hours per subscriber (Treatment vs Control baseline)</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Treatment
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span> Baseline
              </span>
            </div>
          </div>

          <AreaTrendChart
            data={weeklyEngagementTrend}
            height={210}
            primaryLabel="Treatment (hrs)"
            secondaryLabel="Baseline (hrs)"
            valueSuffix=" hrs"
            color="#06b6d4"
          />
        </div>

        {/* 30-Day Retention Cohort Trend */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Day-30 Cohort Retention Trend
              </h3>
              <p className="text-xs text-slate-400">Monthly renewal retention following personalized home screen activation</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-bold text-emerald-400">{kpis.find((k) => k.id === 'kpi-retention')?.value}</span>
              <span className="text-[10px] text-slate-400 block">+1.6% YoY</span>
            </div>
          </div>

          <AreaTrendChart
            data={retentionCohortTrend}
            height={210}
            primaryLabel="Cohort Retention"
            valueSuffix="%"
            color="#3b82f6"
          />
        </div>
      </div>

      {/* Strategic Priorities: Top Opportunities & Key Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Opportunities */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Top Strategic Growth Opportunities
            </h3>
            <span className="text-xs font-mono text-slate-400">Prioritized by Impact</span>
          </div>

          <div className="space-y-3">
            {topOpportunities.map((opp, idx) => (
              <div
                key={idx}
                onClick={() => setActiveView(opp.actionView as any)}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {opp.title}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {opp.metric}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{opp.impact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Risks */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Key Platform Risks & Governance Alerts
            </h3>
            <span className="text-xs font-mono text-slate-400">Active Monitoring</span>
          </div>

          <div className="space-y-3">
            {topRisks.map((risk, idx) => (
              <div
                key={idx}
                onClick={() => setActiveView(risk.actionView as any)}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-rose-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-xs text-slate-100 group-hover:text-rose-300 transition-colors">
                    {risk.title}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                    {risk.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{risk.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee Content Performance Highlights */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              Content 360 Performance Velocity
            </h3>
            <p className="text-xs text-slate-400">Top catalog titles driving meaningful engagement and completion</p>
          </div>
          <button
            type="button"
            id="btn-view-all-content"
            onClick={() => setActiveView('content')}
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Explore Catalog 360 <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {catalog.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => openContentDrawer(item)}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-cyan-400 font-mono">{item.genre}</span>
                  <span className="text-slate-400 font-mono">{item.rating}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.synopsis}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Completion</span>
                  <span className="font-mono text-cyan-400 font-bold">{item.completionRate}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Rec CTR</span>
                  <span className="font-mono text-slate-200 font-bold">{item.recommendationCTR}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
