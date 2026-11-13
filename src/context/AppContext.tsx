import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  NavView,
  TimeRange,
  KPI,
  AudienceSegment,
  Customer360Profile,
  Content360Item,
  DataProduct,
  DataQualityIncident,
  Experiment,
  ModelMetricGroup,
  AgentRun,
  AiInsightResponse,
  ModelHealthCard,
  AgentExecutionPlan,
} from '../types';
import {
  INITIAL_KPIS,
  AUDIENCE_SEGMENTS,
  CUSTOMER_PROFILES,
  CONTENT_CATALOG,
  DATA_PRODUCTS_CATALOG,
  DATA_QUALITY_INCIDENTS,
  EXPERIMENTS_LIST,
  MODEL_HEALTH_GROUPS,
  INITIAL_AGENT_RUNS,
  PRODUCTION_MODELS,
} from '../data/mockData';

interface AppContextType {
  activeView: NavView;
  setActiveView: (view: NavView) => void;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  selectedSegmentId: string | null;
  setSelectedSegmentId: (id: string | null) => void;
  activeSegment: AudienceSegment | null;
  
  // Slide-over Drawer states
  selectedCustomer: Customer360Profile | null;
  openCustomerDrawer: (customer: Customer360Profile) => void;
  closeCustomerDrawer: () => void;

  selectedContent: Content360Item | null;
  openContentDrawer: (content: Content360Item) => void;
  closeContentDrawer: () => void;

  selectedDataProduct: DataProduct | null;
  openDataProductDrawer: (dp: DataProduct) => void;
  closeDataProductDrawer: () => void;

  selectedQualityIncident: DataQualityIncident | null;
  openQualityIncidentDrawer: (incident: DataQualityIncident) => void;
  closeQualityIncidentDrawer: () => void;

  selectedExperiment: Experiment | null;
  openExperimentDrawer: (exp: Experiment) => void;
  closeExperimentDrawer: () => void;

  // Reactivity
  kpis: KPI[];
  segments: AudienceSegment[];
  customers: Customer360Profile[];
  catalog: Content360Item[];
  dataProducts: DataProduct[];
  qualityIncidents: DataQualityIncident[];
  experiments: Experiment[];
  modelHealth: ModelMetricGroup[];
  modelHealthList: ModelHealthCard[];
  agentRuns: AgentRun[];

  // Mutations
  updateExperimentDecision: (experimentId: string, decision: 'ship' | 'iterate' | 'stop') => void;
  remediateQualityIncident: (incidentId: string) => void;
  addAgentRun: (run: AgentRun) => void;
  approveAgentRun: (runId: string) => void;

  // AI & Agent queries
  queryAiInsights: (query: string) => Promise<AiInsightResponse>;
  runAgentTask: (agentName: string, prompt: string) => Promise<AgentExecutionPlan>;

  // API Health status
  hasApiKey: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<NavView>('executive');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);

  // Drawer states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer360Profile | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content360Item | null>(null);
  const [selectedDataProduct, setSelectedDataProduct] = useState<DataProduct | null>(null);
  const [selectedQualityIncident, setSelectedQualityIncident] = useState<DataQualityIncident | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);

  // State collections
  const [experiments, setExperiments] = useState<Experiment[]>(EXPERIMENTS_LIST);
  const [qualityIncidents, setQualityIncidents] = useState<DataQualityIncident[]>(DATA_QUALITY_INCIDENTS);
  const [dataProducts, setDataProducts] = useState<DataProduct[]>(DATA_PRODUCTS_CATALOG);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>(INITIAL_AGENT_RUNS);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Check health endpoint for Gemini API key
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasApiKey) {
          setHasApiKey(true);
        }
      })
      .catch(() => {
        // Dev server or offline fallback
      });
  }, []);

  const activeSegment = useMemo(() => {
    if (!selectedSegmentId) return null;
    return AUDIENCE_SEGMENTS.find((s) => s.id === selectedSegmentId) || null;
  }, [selectedSegmentId]);

  // Reactive KPI calculation based on Time Range & Experiment Decisions
  const kpis = useMemo(() => {
    const homeExp = experiments.find((e) => e.id === 'exp-01');
    const isShipped = homeExp?.decision === 'ship';
    const isStopped = homeExp?.decision === 'stop';

    let ctrVal = isShipped ? '18.7%' : isStopped ? '17.2%' : '17.8%';
    let ctrDelta = isShipped ? '+8.4%' : isStopped ? '0.0%' : '+3.5%';
    let retVal = isShipped ? '88.6%' : isStopped ? '87.2%' : '87.8%';
    let northStarVal = isShipped ? '4.82 hrs' : isStopped ? '4.48 hrs' : '4.65 hrs';

    // Adjust for time range scaling
    let watchTimeMultiplier = timeRange === '7d' ? 0.25 : timeRange === '90d' ? 2.9 : timeRange === 'ytd' ? 11.2 : 1.0;
    let watchTimeDisplay = (3.14 * watchTimeMultiplier).toFixed(2) + (timeRange === '7d' ? 'B hrs' : 'B hrs');

    return INITIAL_KPIS.map((k) => {
      if (k.id === 'kpi-north-star') {
        return { ...k, value: northStarVal };
      }
      if (k.id === 'kpi-rec-ctr') {
        return { ...k, value: ctrVal, delta: ctrDelta };
      }
      if (k.id === 'kpi-retention') {
        return { ...k, value: retVal };
      }
      if (k.id === 'kpi-watch-time') {
        return { ...k, value: watchTimeDisplay };
      }
      return k;
    });
  }, [experiments, timeRange]);

  // Reactive Model Health: if Subscription Behavior DQ incident is remediated, Churn Model recovers!
  const modelHealth = useMemo(() => {
    const subIncident = qualityIncidents.find((i) => i.id === 'dqi-01');
    const isRemediated = subIncident?.status === 'Remediated';

    return MODEL_HEALTH_GROUPS.map((group) => {
      if (group.category === 'Churn Models') {
        if (isRemediated) {
          return {
            ...group,
            healthStatus: 'Healthy' as const,
            metrics: [
              { label: 'Precision@Top10%', value: '78.4%', benchmark: 'Target: >75.0%', status: 'good' as const },
              { label: 'Recall@Top10%', value: '73.2%', benchmark: 'Baseline: 71.4%', status: 'good' as const },
              { label: 'PR-AUC', value: '0.844', benchmark: 'Baseline: 0.835', status: 'good' as const },
              { label: 'Calibration (Brier Score)', value: '0.076', benchmark: 'Target: <0.090', status: 'good' as const },
              { label: 'Top-Decile Lift', value: '5.4x', benchmark: 'Baseline: 5.1x', status: 'good' as const },
            ],
            businessImpactSummary: 'Lineage unblocked: Subscription schema sanitized and backfill completed. Calibrated hazard scores active for retention campaigns.',
          };
        }
      }
      return group;
    });
  }, [qualityIncidents]);

  // Mutations
  const updateExperimentDecision = (experimentId: string, decision: 'ship' | 'iterate' | 'stop') => {
    setExperiments((prev) =>
      prev.map((exp) => {
        if (exp.id === experimentId) {
          return {
            ...exp,
            decision,
            decisionRationale:
              decision === 'ship'
                ? `Shipped to 100% production traffic by Principal PM. Guardrails certified.`
                : decision === 'stop'
                ? `Halted by Principal PM due to metric trade-off evaluation.`
                : `Set to iterate for additional statistical power.`,
          };
        }
        return exp;
      })
    );
  };

  const remediateQualityIncident = (incidentId: string) => {
    setQualityIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: 'Remediated' } : inc))
    );

    // Also update data product quality score
    setDataProducts((prev) =>
      prev.map((dp) => {
        if (incidentId === 'dqi-01' && dp.id === 'dp-04') {
          return { ...dp, currentQualityScore: 98.9, lastUpdated: 'Just now (Remediated)' };
        }
        if (incidentId === 'dqi-02' && dp.id === 'dp-02') {
          return { ...dp, currentQualityScore: 97.4, lastUpdated: 'Just now (Remediated)' };
        }
        return dp;
      })
    );
  };

  const addAgentRun = (run: AgentRun) => {
    setAgentRuns((prev) => [run, ...prev]);
  };

  const approveAgentRun = (runId: string) => {
    setAgentRuns((prev) =>
      prev.map((run) =>
        run.id === runId
          ? {
              ...run,
              auditRecord: {
                ...run.auditRecord,
                approvalStatus: 'Approved',
                approvedBy: 'Principal PM (Authorized in UI)',
              },
            }
          : run
      )
    );
  };

  // Drawer handlers
  const openCustomerDrawer = (customer: Customer360Profile) => setSelectedCustomer(customer);
  const closeCustomerDrawer = () => setSelectedCustomer(null);

  const openContentDrawer = (content: Content360Item) => setSelectedContent(content);
  const closeContentDrawer = () => setSelectedContent(null);

  const openDataProductDrawer = (dp: DataProduct) => setSelectedDataProduct(dp);
  const closeDataProductDrawer = () => setSelectedDataProduct(null);

  const openQualityIncidentDrawer = (incident: DataQualityIncident) => setSelectedQualityIncident(incident);
  const closeQualityIncidentDrawer = () => setSelectedQualityIncident(null);

  const openExperimentDrawer = (exp: Experiment) => setSelectedExperiment(exp);
  const closeExperimentDrawer = () => setSelectedExperiment(null);

  // Reactive Model Health List
  const modelHealthList = useMemo<ModelHealthCard[]>(() => {
    const isIncidentResolved = !qualityIncidents.some(
      (i) => i.id === 'dqi-01' && i.status !== 'Remediated'
    );

    return PRODUCTION_MODELS.map((model) => {
      if (model.id === 'ML-02') {
        if (isIncidentResolved) {
          return {
            ...model,
            status: 'Healthy',
            driftMetric: { psiScore: 0.052, status: 'Stable (PSI < 0.10)' },
            accuracyMetric: 'PR-AUC: 0.841',
          };
        } else {
          return {
            ...model,
            status: 'Degraded',
            driftMetric: { psiScore: 0.218, status: 'Moderate Drift (PSI > 0.20)' },
            accuracyMetric: 'PR-AUC: 0.812',
          };
        }
      }
      return model;
    });
  }, [qualityIncidents]);

  // AI Insights Query Engine
  const queryAiInsights = async (query: string): Promise<AiInsightResponse> => {
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.summary) {
          return data;
        }
      }
    } catch {
      // fallback to deterministic analysis
    }

    // High-fidelity deterministic synthesis
    const qLower = query.toLowerCase();
    if (qLower.includes('churn') || qLower.includes('casual')) {
      return {
        summary:
          'Churn risk in Casual Viewers (+18% YoY) is primarily driven by "decision fatigue": subscribers spend an average of 4.2 minutes browsing without initiating playback, compared to 1.1 minutes in the Engaged cohort.\n\nFurthermore, 68% of drop-offs occur after completing a single movie or season finale with no immediate continuation recommendation presented.',
        supportingMetrics: [
          { metric: 'Browsing Latency', value: '4.2 min', delta: '+38%', trend: 'negative' },
          { metric: 'Zero-Play Sessions', value: '31.4%', delta: '+6.2%', trend: 'negative' },
          { metric: 'First-Minute Bounce', value: '18.2%', delta: '+2.1%', trend: 'negative' },
        ],
        recommendedActions: [
          {
            action: 'Deploy "Smart Resume & Pivot" Rail',
            rationale: 'Surfaces next-best narrative matches within 3 seconds of opening the app.',
            actionView: 'personalization',
          },
          {
            action: 'Promote High-Completion Series Pilot Episodes',
            rationale: 'Pilot completions increase 30-day renewal retention by 2.4x.',
            actionView: 'content',
          },
          {
            action: 'Audit Churn Hazard Model Drift',
            rationale: 'Verify whether input distribution changes explain recent hazard volatility.',
            actionView: 'model_health',
          },
        ],
        confidence: 0.94,
        dataSources: ['Viewing Behavior (DP-01)', 'Churn Signals (DP-05)', 'Search Intent (DP-06)'],
        timestamp: 'Just now',
      };
    }

    if (qLower.includes('family') || qLower.includes('weekend')) {
      return {
        summary:
          'Family co-viewing surges between Friday 4:00 PM and Sunday 8:00 PM, accounting for 62% of total viewing hours across smart TVs.\n\nTitles with strong multi-generational appeal (e.g. Pico & The Cloud King, Wonderlings Academy) show 86.8% completion rates and 29.5% recommendation CTR.',
        supportingMetrics: [
          { metric: 'Weekend Co-Viewing Share', value: '62.0%', delta: '+11.4%', trend: 'positive' },
          { metric: 'Family Genre Completion', value: '86.8%', delta: '+5.1%', trend: 'positive' },
          { metric: 'Living Room TV Share', value: '78.4%', delta: '+8.2%', trend: 'positive' },
        ],
        recommendedActions: [
          {
            action: 'Feature Animated Adventure in Top Hero Slot',
            rationale: 'Peak family viewing hours show highest conversion when top billboard features animation.',
            actionView: 'content',
          },
          {
            action: 'Promote Shared Viewing Discovery Rail',
            rationale: 'Activates cross-profile watch party and parent-child viewing sessions.',
            actionView: 'personalization',
          },
        ],
        confidence: 0.96,
        dataSources: ['Household Graph (DP-07)', 'Viewing Behavior (DP-01)', 'Content Metadata (DP-02)'],
        timestamp: 'Just now',
      };
    }

    return {
      summary:
        'Causal analysis indicates that Personalized Home Ranking v2 (+8.4% CTR) has significantly increased catalog discovery breadth without harming episodic completion rates (68.4% stable).\n\nSubscribers exposed to the treatment group explore 2.3 additional distinct genre tags per month compared to control baseline.',
      supportingMetrics: [
        { metric: 'Treatment CTR Lift', value: '+8.4%', delta: '+1.45pp', trend: 'positive' },
        { metric: 'Episodic Completion', value: '68.4%', delta: '+0.1%', trend: 'positive' },
        { metric: 'Long-Tail Discoveries', value: '+14.2%', delta: '+3.1%', trend: 'positive' },
      ],
      recommendedActions: [
        {
          action: 'Roll Out Personalized Home Ranking v2 to 100%',
          rationale: 'Statistical significance confirmed (p = 0.0003) with zero latency degradation.',
          actionView: 'experimentation',
        },
        {
          action: 'Monitor Churn Hazard Model Drift',
          rationale: 'Remediate nullable tier code to unblock feature calibration.',
          actionView: 'data_quality',
        },
      ],
      confidence: 0.97,
      dataSources: ['Viewing Behavior (DP-01)', 'Experimentation Hub (DP-05)', 'Content Metadata (DP-02)'],
      timestamp: 'Just now',
    };
  };

  // Autonomous Agent Task Runner
  const runAgentTask = async (agentName: string, prompt: string): Promise<AgentExecutionPlan> => {
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName, prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.steps) {
          return data;
        }
      }
    } catch {
      // fallback to high-fidelity agent plan
    }

    // High-fidelity fallback plan
    return {
      steps: [
        {
          stepNumber: 1,
          action: 'Query Customer 360 Telemetry for Stalled Viewing Profiles',
          toolUsed: 'query_data_product(DP-01)',
          status: 'completed',
          resultSummary: 'Identified 10.4M subscribers stalled in episodes 3-5 of multi-season serialized dramas.',
        },
        {
          stepNumber: 2,
          action: 'Inspect Content Drop-off Minute Curves for Target Series',
          toolUsed: 'inspect_content_lineage(DP-08)',
          status: 'completed',
          resultSummary: 'Found 28% drop cliff at minute 38 of episode 4 in Shadows of Olympus.',
        },
        {
          stepNumber: 3,
          action: 'Audit Production Model Drift & Verification Gate',
          toolUsed: 'verify_model_health(ML-04)',
          status: 'completed',
          resultSummary: 'Smart Resume predictor is healthy (P99: 19ms). Ready to generate recap hooks.',
        },
        {
          stepNumber: 4,
          action: 'Formulate Policy & Feature Flag Rollout Specification',
          toolUsed: 'synthesize_experiment_policy(Exp-02)',
          status: 'completed',
          resultSummary: 'Constructed automated 60-second recap short rail for stalled episodic subscribers.',
        },
      ],
      proposedSolution: {
        title: 'Automated Smart Resume & Episodic Bridge Rail Rollout',
        description:
          'Activate dynamic episodic recap prompts on the Home Screen for subscribers with >7 days of inactivity on serialized series. Projected to recover +1.4pp Day-30 retention across 10.4M at-risk accounts.',
        impactedDataProducts: ['Viewing Behavior (DP-01)', 'Content Drop-off (DP-08)', 'Recommendation Features (DP-05)'],
        humanApprovalRequired: true,
      },
    };
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        timeRange,
        setTimeRange,
        selectedSegmentId,
        setSelectedSegmentId,
        activeSegment,

        selectedCustomer,
        openCustomerDrawer,
        closeCustomerDrawer,

        selectedContent,
        openContentDrawer,
        closeContentDrawer,

        selectedDataProduct,
        openDataProductDrawer,
        closeDataProductDrawer,

        selectedQualityIncident,
        openQualityIncidentDrawer,
        closeQualityIncidentDrawer,

        selectedExperiment,
        openExperimentDrawer,
        closeExperimentDrawer,

        kpis,
        segments: AUDIENCE_SEGMENTS,
        customers: CUSTOMER_PROFILES,
        catalog: CONTENT_CATALOG,
        dataProducts,
        qualityIncidents,
        experiments,
        modelHealth,
        modelHealthList,
        agentRuns,

        updateExperimentDecision,
        remediateQualityIncident,
        addAgentRun,
        approveAgentRun,

        queryAiInsights,
        runAgentTask,

        hasApiKey,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
