# ContentPulse - Enterprise Content Intelligence & Personalization Platform

ContentPulse is a full-stack streaming decision intelligence, data-mesh governance, and ML observability platform built with React, TypeScript, Tailwind CSS, Express, and Google Gemini. It unifies executive KPIs, subscriber Cohort/Customer 360 telemetry, semantic content discovery, recommendation explainability, A/B/n experimentation, data contract lineage, data quality remediation, ML model health monitoring, and governed human-in-the-loop (HITL) AI agents into a single operational workspace.

---

## Key Capabilities

1. **Executive Overview**
   - Tracks the platform North Star metric (**Meaningful Content Engagement** - weekly qualified viewing hours per active subscriber) alongside 8 core discovery, engagement, and retention KPIs.
   - Displays an **AI Executive Brief** summarizing experimentation lift, cohort retention risks, and active data governance alerts.
   - Recomputes KPIs reactively when global time windows (`7D`, `30D`, `90D`, `YTD`) change or when experiments (`exp-01`) are shipped or halted.

2. **Audience Intelligence & Customer 360**
   - Segments 162.4M active subscribers across 6 behavioral cohorts (`Highly Engaged`, `Family / Shared Viewing`, `Casual Viewers`, `New Subscribers`, `Declining Engagement`, `Churn Risk Cohort`).
   - Clicking a segment applies a global cohort filter; clicking any subscriber opens the **Customer 360 Slide-Over Drawer** with 5-week watch-time trajectories, device mix, recent playback events (`DP-01`), search intent logs (`DP-02`), and personalized rail conversion history.

3. **Content Intelligence & Semantic Catalog 360**
   - Provides natural language semantic content discovery over 768-dimensional multimodal content embeddings.
   - Clicking any title opens the **Content 360 Slide-Over Drawer** showing minute-by-minute drop-off retention curves, metadata tags, target demographics, vector cluster IDs, and 7-week viewership velocity.

4. **Personalization & Recommendation Engine**
   - Visualizes the 7-step production recommendation pipeline (`pipe-01` through `pipe-07`): Behavioral Ingestion -> Two-Tower ANN (ScaNN) Candidate Generation -> Vector Feature Store Enrichment -> Multi-Task Deep Ranking (`RankNet-v4.1`) -> Contextual Bandit & Policy Layer -> Dynamic UI Rail Orchestration -> Counterfactual IPS Logging.
   - Includes an **Explainable AI Attribution Engine** displaying normalized feature weights and counterfactual rank simulations.

5. **AI Insights & Decision Support**
   - Natural language analytical query interface backed by a server-side Gemini proxy (`POST /api/insights/query` and `/api/ai/insights`) with an automatic client-side deterministic synthesis fallback when `GEMINI_API_KEY` is absent or unavailable.
   - Outputs executive summaries, supporting metric deltas, clickable next-action cards that navigate directly to target platform views, and strict Data Product lineage citations.

6. **Experimentation & Causal Inference Hub**
   - Evaluates live and concluded A/B/n tests (`exp-01` through `exp-04`) with p-values, 95% confidence intervals, statistical power, and zero-degradation guardrail metrics.
   - Toggling **Ship 100%**, **Iterate**, or **Rollback** updates global platform KPIs (`Meaningful Content Engagement`, `Recommendation CTR`, `Day-30 Cohort Retention`) in real time.

7. **Enterprise Data Products Catalog (Data Mesh)**
   - Catalogs 8 contract-governed Data Products (`dp-01` Viewing Behavior through `dp-08` Churn Signals) with domain filtering, freshness SLAs, monthly query volume, storage backends, and a **Data Product Drawer** exposing full field schemas and `piiLevel` classifications (`None`, `Pseudonymized`, `Restricted`).

8. **Data Quality, Lineage & Governance Hub**
   - Tracks 6 data quality dimensions (`Freshness`, `Completeness`, `Accuracy`, `Uniqueness`, `Validity`, `Consistency`), an OpenLineage 5-stage consumer graph, and active contract incidents (`dqi-01`, `dqi-02`, `dqi-03`).
   - Executing one-click **Quarantine & Backfill Schema** remediation on `dqi-01` (`Subscription Behavior`) resolves the critical incident, restores the Data Product quality score, and automatically recovers the degraded downstream `Survival Hazard Churn Classifier` (`ML-02`).

9. **AI & ML Model Health Observability**
   - Monitors 5 production ML ensembles (`ML-01` through `ML-05`) across accuracy benchmarks, P99 latency (`<50ms` SLA), QPS throughput, and Population Stability Index (`PSI`) feature drift, with shadow retraining triggers.

10. **Autonomous Agent Workspace (Governed Human-in-the-Loop)**
    - Provides 4 specialized PM agents (`Episodic Retention Investigator`, `Catalog Gap Detector`, `Audience Recovery Agent`, `Experiment Decision Support Agent`) via `POST /api/agent/execute` (`/api/agent/run`) with deterministic fallback.
    - Displays step-by-step tool invocation traces and enforces mandatory **Principal PM Sign-Off** before committing configuration updates.

---

## Tech Stack

- **Frontend:** React 19, TypeScript 5.8, Vite 6, Tailwind CSS v4, Lucide Icons, custom responsive SVG charts (`Sparkline`, `AreaTrendChart`, `BarComparisonChart`, `GaugeRing`).
- **Backend:** Node.js + Express (`server.ts`) serving Vite middleware in development, static `dist/` assets in production, and server-side Gemini API proxy routes via `@google/genai`.
- **State Management:** Centralized reactive state in `src/context/AppContext.tsx` backed by structured domain datasets in `src/data/mockData.ts`.

---

## Quick Start

### Prerequisites

- Node.js 20+ (or Bun)
- npm / bun

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and optionally supply a Google Gemini API key:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="http://localhost:3000"
```

- If `GEMINI_API_KEY` is configured, the header displays **Gemini 3.8** and `/api/insights/query` and `/api/agent/execute` invoke the server-side Gemini SDK.
- If `GEMINI_API_KEY` is omitted, the header displays **Engine v4** and the app runs seamlessly using the built-in deterministic intelligence engine.

### 3. Run in Development

```bash
npm run dev
```

The Express + Vite server listens on `http://localhost:3000`.

### 4. Type-Check & Production Build

```bash
npm run lint
npm run build
npm run start
```

---

## Project Structure

```text
.
├── server.ts                          # Express server, API routes, Vite/static serving
├── index.html                         # HTML entry point
├── metadata.json                      # Application metadata & capabilities
├── package.json                       # Scripts & dependencies
├── .env.example                       # Environment template
├── src/
│   ├── App.tsx                        # Layout shell, view router, global drawers
│   ├── main.tsx                       # React root mount
│   ├── index.css                      # Tailwind CSS v4 entry
│   ├── types/index.ts                 # Canonical TypeScript domain interfaces
│   ├── context/AppContext.tsx         # Reactive state, cross-module effects, API calls
│   ├── data/mockData.ts               # Synthetic streaming telemetry & catalog datasets
│   └── components/
│       ├── common/                    # Header, Sidebar, SimpleCharts, SlideOverDrawer
│       ├── drawers/                   # Customer, Content, DataProduct, QualityIncident drawers
│       └── views/                     # 10 primary platform views
└── docs/                              # Architecture, API, security, testing, runbook & roadmap
```

---

## Documentation Index

- **[User Guide](userguide.md)** - Personas, visual workflows, and programmatic API usage.
- **[Developer Guide](dev.md)** - Codebase map, state wiring, and extension patterns.
- **[System Design & AWS Architecture](systdesign.md)** - Current architecture and full-scale AWS production blueprint.
- **[API Reference](docs/api-reference.md)** - Endpoint schemas, fallback behavior, and integration contracts.
- **[Data Contracts & Lineage](docs/data-contracts-lineage.md)** - Data Mesh catalog (`DP-01`..`DP-08`) and causal DQ-to-ML lineage.
- **[ML & Personalization Spec](docs/ml-personalization-spec.md)** - 7-stage recommendation pipeline, 5 ensembles (`ML-01`..`ML-05`), and A/B/n rigor.
- **[Security & Compliance](docs/security-compliance.md)** - PII classification, pre-LLM minimization, RBAC, privacy, and audit retention.
- **[Operational Runbook](docs/runbook.md)** - Incident playbooks for Gemini 429 failover, DQ circuit breakers, PSI drift, and latency triage.
- **[Testing Strategy](docs/testing.md)** - `curl` smoke tests, unit/contract/Playwright E2E tests, shadow backtesting, and latency benchmarks.
- **[Production Roadmap](docs/roadmap.md)** - Prototype-to-production gap matrix and 4-phase delivery plan.
