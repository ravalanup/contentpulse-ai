# ContentPulse Developer Guide

This guide helps developers navigate the ContentPulse codebase, understand how state and reactivity work, and safely add or modify views, drawers, data products, and API endpoints.

---

## 1. Architecture at a Glance

ContentPulse uses a clean separation between **UI Views**, **Slide-Over Inspection Drawers**, **Central Reactive State**, **Synthetic Domain Data**, and the **Express AI Proxy**.

| Layer | File / Directory | Responsibility |
| :--- | :--- | :--- |
| **Server & AI Proxy** | `server.ts` | Express HTTP server on port `3000`, Vite dev middleware, static `dist/` serving, `/api/health`, `/api/insights/query` (`/api/ai/insights`), `/api/agent/execute` (`/api/agent/run`). |
| **Application Shell** | `src/App.tsx` | Renders `AppProvider`, persistent `Header` + `Sidebar`, active view switch, and the 4 global drawers. |
| **Global State & Logic** | `src/context/AppContext.tsx` | Holds state for navigation, time range, segment filter, drawer selections, KPIs, experiments, quality incidents, model health reactivity, and AI/Agent API callers with fallbacks. |
| **Domain Types** | `src/types/index.ts` | TypeScript interfaces for KPIs, Segments, Customer360, Content360, PipelineStages, Experiments, DataProducts, Incidents, ModelHealth, and Agents. |
| **Mock Datasets** | `src/data/mockData.ts` | Rich domain data (`INITIAL_KPIS`, `AUDIENCE_SEGMENTS`, `CUSTOMER_PROFILES`, `CONTENT_CATALOG`, `RECOMMENDATION_PIPELINE`, `EXPERIMENTS_LIST`, `DATA_PRODUCTS_CATALOG`, `DATA_QUALITY_INCIDENTS`, `MODEL_HEALTH_GROUPS`, `INITIAL_AGENT_RUNS`, `PRODUCTION_MODELS`). |
| **Shared Components** | `src/components/common/` | `Header.tsx`, `Sidebar.tsx`, `SlideOverDrawer.tsx`, `SimpleCharts.tsx` (`Sparkline`, `AreaTrendChart`, `BarComparisonChart`, `GaugeRing`). |
| **Primary Views** | `src/components/views/` | 10 full-page analytical views (`ExecutiveOverview`, `AudienceIntelligence`, `ContentIntelligence`, `Personalization`, `AiInsights`, `Experimentation`, `DataProducts`, `DataQuality`, `ModelHealth`, `AgentWorkspace`). |
| **Deep-Dive Drawers** | `src/components/drawers/` | 4 slide-over drawers (`CustomerDrawer`, `ContentDrawer`, `DataProductDrawer`, `QualityIncidentDrawer`). |

---

## 2. How Reactive State Works (`src/context/AppContext.tsx`)

Rather than isolated static pages, views share live derived state through `useApp()`:

1. **Global Time Range & Experiment Coupling (`kpis` memo)**
   - Changing `timeRange` (`7d`, `30d`, `90d`, `ytd`) scales `kpi-watch-time`.
   - Calling `updateExperimentDecision('exp-01', decision)` recalculates `kpi-north-star` (`4.82 hrs` when shipped, `4.48 hrs` when stopped, `4.65 hrs` otherwise), `kpi-rec-ctr`, and `kpi-retention`.

2. **Data Quality -> ML Model Health Circuit Breaker (`modelHealth` & `modelHealthList` memos)**
   - Calling `remediateQualityIncident('dqi-01')`:
     1. Marks `dqi-01` as `Remediated`.
     2. Updates `dp-04` (`Subscription Behavior`) `currentQualityScore` to `98.9`.
     3. Automatically transitions `Churn Models` (`modelHealth`) and `ML-02` (`Survival Hazard Churn Classifier` in `modelHealthList`) from `Degraded` (`PSI: 0.218`, `PR-AUC: 0.812`) to `Healthy` (`PSI: 0.052`, `PR-AUC: 0.841`).
     4. Updates the alert badge in `Sidebar.tsx`.

3. **AI & Agent API Calls with Deterministic Fallback**
   - `queryAiInsights(query)` posts to `/api/ai/insights` and falls back to keyword-driven deterministic synthesis (`churn`/`casual`, `family`/`weekend`, or default ranking synthesis) returning `AiInsightResponse`.
   - `runAgentTask(agentName, prompt)` posts to `/api/agent/run` and falls back to a structured 4-step `AgentExecutionPlan`.
   - **Developer Note:** `server.ts` currently returns `{ success: true, source: 'gemini-live', result: { ... } }` while `AppContext.tsx` checks `data.summary` / `data.steps` directly. If you want live Gemini responses rendered verbatim in the UI, normalize `data.result` into `AiInsightResponse` / `AgentExecutionPlan` inside `AppContext.tsx` (see [docs/api-reference.md](docs/api-reference.md)).

---

## 3. Common Extension Tasks

### Add a New Platform View
1. Add a union member to `NavView` in `src/types/index.ts`.
2. Create `src/components/views/MyNewView.tsx` using `useApp()` and Tailwind dark-mode tokens (`bg-slate-900/50`, `border-slate-800/80`, `text-cyan-400`, `font-mono` for metrics).
3. Register the route in `renderView()` inside `src/App.tsx`.
4. Add the navigation entry in `navItems` inside `src/components/common/Sidebar.tsx`.

### Add a New Data Product or ML Model
1. Append a `DataProduct` object to `DATA_PRODUCTS_CATALOG` in `src/data/mockData.ts` (include `schema` fields with accurate `piiLevel`: `'None' | 'Pseudonymized' | 'Restricted'`).
2. Append a `ModelHealthCard` object to `PRODUCTION_MODELS` in `src/data/mockData.ts` and wire any causal incident dependency in `modelHealthList` inside `src/context/AppContext.tsx`.

### Add a New Slide-Over Drawer
1. Add `selectedX` state + `openXDrawer`/`closeXDrawer` handlers to `AppContext.tsx`.
2. Build `src/components/drawers/XDrawer.tsx` wrapping `<SlideOverDrawer />` (`src/components/common/SlideOverDrawer.tsx`), which handles backdrop click and `ESC` key closing automatically.
3. Mount `<XDrawer />` at the bottom of `AppContent` in `src/App.tsx`.

### Update or Align `Experimentation.tsx`
- When modifying `src/components/views/Experimentation.tsx`, verify property names against the `Experiment` interface in `src/types/index.ts` (`control`, `treatment`, `liftPercent`, `confidenceInterval`, `pValue`, `isStatisticallySignificant`, `decision: 'ship' | 'iterate' | 'stop' | 'undecided'`).

### Modify Backend AI Prompts or Models (`server.ts`)
- Edit the prompt templates in `handleInsightsQuery` and `handleAgentExecute` inside `server.ts`.
- Keep the `@google/genai` client lazy-initialized via `getGenAI()` so the server starts cleanly without `GEMINI_API_KEY`.
- Never expose `GEMINI_API_KEY` to Vite (`VITE_*`); all Gemini calls must stay server-side in `server.ts`.

---

## 4. Code & Build Standards

- **Styling:** Tailwind CSS v4 (`@import "tailwindcss";` in `src/index.css`). Avoid inline styles except dynamic computed chart widths/heights.
- **Charts:** Extend `src/components/common/SimpleCharts.tsx` for custom SVG visualizations to keep bundle size small and styling consistent.
- **Verification before committing:**
  ```bash
  npm run lint    # Runs tsc --noEmit
  npm run build   # Builds Vite client bundle + esbuild server.cjs
  ```
