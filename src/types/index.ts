export type NavView =
  | 'executive'
  | 'audience'
  | 'content'
  | 'personalization'
  | 'ai_insights'
  | 'experimentation'
  | 'data_products'
  | 'data_quality'
  | 'model_health'
  | 'agent_workspace';

export type TimeRange = '7d' | '30d' | '90d' | 'ytd';

export interface KPI {
  id: string;
  name: string;
  value: string;
  rawNumber: number;
  unit?: string;
  delta: string;
  trend: 'up' | 'down' | 'neutral';
  isPositive: boolean;
  benchmark: string;
  sparkline: number[];
  category: 'north_star' | 'discovery' | 'engagement' | 'retention';
  description: string;
}

export interface AudienceSegment {
  id: string;
  name: string;
  tagline: string;
  subscriberCount: number;
  percentage: number;
  engagementHrsPerWk: number;
  completionRate: number;
  recommendationCTR: number;
  retentionRate: number;
  churnRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  churnScore: number; // 0-100
  topGenres: string[];
  primaryDevices: string[];
  behavioralSummary: string;
  weeklyTrend: number[];
}

export interface ViewingEvent {
  contentId: string;
  contentTitle: string;
  timestamp: string;
  watchDurationMin: number;
  completed: boolean;
  device: string;
  source: 'home_recommendation' | 'search' | 'editorial_rail' | 'continue_watching';
}

export interface SearchEvent {
  query: string;
  timestamp: string;
  convertedToPlay: boolean;
  resultRankClicked?: number;
}

export interface Customer360Profile {
  id: string;
  name: string;
  accountType: 'Ad-Supported' | 'Premium Ad-Free' | 'Trio Bundle';
  tenureMonths: number;
  segmentId: string;
  segmentName: string;
  location: string;
  primaryLanguage: string;
  profilesCount: number;
  weeklyWatchTimeHrs: number;
  completionRate: number;
  recommendationCTR: number;
  churnProbability: number;
  preferredGenres: string[];
  activeDevices: { device: string; sharePercent: number }[];
  recentViewing: ViewingEvent[];
  recentSearches: SearchEvent[];
  recommendationHistory: {
    title: string;
    algorithm: string;
    recommendedAt: string;
    clicked: boolean;
    converted: boolean;
    affinityScore: number;
  }[];
  engagementTrajectory: number[];
}

export interface Content360Item {
  id: string;
  title: string;
  contentType: 'Original Series' | 'Feature Film' | 'Documentary' | 'Short' | 'Animation';
  genre: string;
  releaseYear: number;
  runtimeOrSeasons: string;
  rating: string;
  targetDemographics: string[];
  completionRate: number;
  engagementHoursTotal: number;
  searchInterestScore: number; // 0-100
  recommendationCTR: number;
  semanticEmbeddingStatus: 'Indexed (v3.2)' | 'Pending Optimization' | 'Retraining';
  embeddingClusterId: string;
  audienceFitSegments: string[];
  performanceTrend: 'Surging' | 'Stable' | 'Declining' | 'Underperforming';
  historicalWeeklyViews: number[];
  dropoffDistribution: { minutePoint: string; retentionPercent: number }[];
  synopsis: string;
  metadataTags: string[];
}

export interface SemanticSearchResult {
  content: Content360Item;
  relevanceScore: number; // 0-100
  similarityExplanation: string;
  audienceFit: string;
  engagementSignal: string;
  completionSignal: string;
}

export interface PipelineStage {
  id: string;
  title: string;
  stepNumber: number;
  subsystem: string;
  latencyMs: number;
  throughputQps: number;
  description: string;
  metrics: { label: string; value: string }[];
  inputArtifact: string;
  outputArtifact: string;
}

export interface RecommendationMetrics {
  precisionAtK: number;
  recallAtK: number;
  ndcg: number;
  ctr: number;
  completionRate: number;
  catalogCoverage: number;
  intraListDiversity: number;
  noveltyScore: number;
}

export interface RecommendationExplanation {
  subscriberId: string;
  contentId: string;
  contentTitle: string;
  overallScore: number;
  primaryDriver: string;
  factors: {
    factor: string;
    weight: number;
    description: string;
  }[];
  counterfactual: string;
  candidateGenerationRank: number;
  rerankingAdjustment: string;
}

export interface ExperimentVariant {
  name: string;
  isControl: boolean;
  sampleSize: number;
  recommendationCTR: number;
  completionRate: number;
  watchTimeHours: number;
  sessionFrequency: number;
  day30Retention: number;
}

export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  owner: string;
  status: 'Running' | 'Concluded' | 'Draft';
  startDate: string;
  durationDays: number;
  control: ExperimentVariant;
  treatment: ExperimentVariant;
  primaryMetric: string;
  liftPercent: number;
  confidenceInterval: [number, number];
  pValue: number;
  isStatisticallySignificant: boolean;
  guardrailMetrics: {
    metric: string;
    impact: string;
    passed: boolean;
  }[];
  decision: 'ship' | 'iterate' | 'stop' | 'undecided';
  decisionRationale?: string;
  recommendation: 'Ship' | 'Iterate' | 'Stop';
}

export interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  description: string;
  piiLevel: 'None' | 'Pseudonymized' | 'Restricted';
}

export interface DataProduct {
  id: string;
  name: string;
  owner: string;
  domain: string;
  description: string;
  consumers: string[];
  freshness: string;
  slaTarget: string;
  currentQualityScore: number; // 0-100
  schemaVersion: string;
  lastUpdated: string;
  monthlyQueriesM: number;
  usageTier: 'Tier 1 Critical' | 'Tier 2 Operational' | 'Tier 3 Analytical';
  storageTech: string;
  schema: SchemaField[];
}

export interface DataQualityIncident {
  id: string;
  dataProductId: string;
  dataProductName: string;
  dimension: 'Completeness' | 'Accuracy' | 'Freshness' | 'Consistency' | 'Reliability' | 'Schema violations';
  severity: 'Critical' | 'Warning' | 'Info';
  status: 'Open' | 'Investigating' | 'Remediated';
  detectedAt: string;
  impactSummary: string;
  impactedDownstreamConsumers: string[];
  lineagePath: string[];
  recommendedRemediation: string;
  autoRemediationAction?: string;
}

export interface ModelMetricGroup {
  category: 'Recommendation Models' | 'Churn Models' | 'Embedding Models' | 'GenAI' | 'Agentic AI';
  modelName: string;
  version: string;
  healthStatus: 'Healthy' | 'Degraded' | 'Attention';
  productionTrafficPercent: number;
  metrics: { label: string; value: string; benchmark: string; status: 'good' | 'warn' | 'bad' }[];
  businessImpactSummary: string;
}

export interface AgentStep {
  stepNumber: number;
  name: string;
  toolUsed: string;
  status: 'completed' | 'in_progress' | 'pending';
  outputSnippet: string;
  latencyMs: number;
}

export interface AgentRun {
  id: string;
  goal: string;
  createdAt: string;
  plan: string[];
  toolsUsed: string[];
  dataSources: string[];
  steps: AgentStep[];
  evidence: {
    source: string;
    finding: string;
    metric: string;
    confidence: number;
  }[];
  analysis: string;
  recommendation: string;
  projectedImpact: string;
  auditRecord: {
    runId: string;
    initiatorRole: string;
    allowlistEnforced: boolean;
    dataMinimizationApplied: boolean;
    requiresApproval: boolean;
    approvedBy?: string;
    approvalStatus: 'Pending Review' | 'Approved' | 'Rejected';
  };
}

export interface AiInsightResponse {
  summary: string;
  supportingMetrics: {
    metric: string;
    value: string;
    delta: string;
    trend: 'positive' | 'negative' | 'neutral';
  }[];
  recommendedActions: {
    action: string;
    rationale: string;
    actionView?: string;
  }[];
  confidence: number;
  dataSources: string[];
  timestamp: string;
}

export interface ModelHealthCard {
  id: string;
  name: string;
  version: string;
  architecture: string;
  status: 'Healthy' | 'Degraded' | 'Attention';
  lastRetrained: string;
  p99LatencyMs: number;
  throughputQps: number;
  accuracyMetric: string;
  benchmarkMetric: string;
  driftMetric: {
    psiScore: number;
    status: string;
  };
  dataProductDependencies: string[];
  monitoringFramework: string;
}

export interface AgentExecutionStep {
  stepNumber: number;
  action: string;
  toolUsed: string;
  status: 'completed' | 'in_progress' | 'failed';
  resultSummary: string;
}

export interface AgentExecutionPlan {
  steps: AgentExecutionStep[];
  proposedSolution: {
    title: string;
    description: string;
    impactedDataProducts: string[];
    humanApprovalRequired: boolean;
  };
}
