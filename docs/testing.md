# ContentPulse Testing Strategy & Verification Guide

This document outlines the smoke tests, unit/contract tests, Playwright end-to-end tests, shadow-mode model backtesting, and latency benchmarks for ContentPulse.

---

## 1. Smoke Test `curl` Commands

Start the server (`npm run dev` or `npm run start`) on `http://localhost:3000`, then run:

### 1.1 Health Check
```bash
curl -i http://localhost:3000/api/health
```
Expected: HTTP `200`, JSON containing `"status":"ok"`, boolean `"hasApiKey"`, and ISO `"timestamp"`.

### 1.2 AI Insights Query
```bash
curl -s -X POST http://localhost:3000/api/insights/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Why is churn increasing in the Casual Viewers segment?",
    "timeRange": "Last 30 Days",
    "segmentFilter": "Casual Viewers"
  }' | jq .
```
Expected: HTTP `200`, `"success": true`, `"source"` equal to `"gemini-live"` (with key) or `"synthetic-engine"` (without key).

### 1.3 Governed Agent Execution
```bash
curl -s -X POST http://localhost:3000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "Episodic Retention Investigator",
    "goal": "Diagnose the 28% completion cliff in serialized sci-fi."
  }' | jq .
```
Expected: HTTP `200`, `"success": true`, structured agent plan or synthetic engine acknowledgment.

### 1.4 Static Type-Check & Build Gate
```bash
npm run lint
npm run build
```

---

## 2. Unit & Contract Testing Strategy (Vitest)

When adding a test runner (`vitest`), target the following high-leverage units and data contracts:

1. **KPI & Experiment Reactivity (`AppContext`)**
   - Verify `updateExperimentDecision('exp-01', 'ship')` sets `kpi-north-star` to `4.82 hrs`, `kpi-rec-ctr` to `18.7%`, and `kpi-retention` to `88.6%`.
   - Verify `updateExperimentDecision('exp-01', 'stop')` reverts KPIs to `4.48 hrs`, `17.2%`, and `87.2%`.
   - Verify `timeRange` switching (`7d`, `30d`, `90d`, `ytd`) scales `kpi-watch-time` deterministically.

2. **Causal DQ-to-ML Circuit Breaker**
   - Verify initial state has `dqi-01` (`Open`) and `ML-02` (`Degraded`, `PSI = 0.218`).
   - Verify `remediateQualityIncident('dqi-01')` updates `dqi-01` to `Remediated`, raises `dp-04` `currentQualityScore` to `98.9`, and transitions `ML-02` to `Healthy` (`PSI = 0.052`, `PR-AUC: 0.841`).

3. **Data Product Contract Validation**
   - Assert every item in `DATA_PRODUCTS_CATALOG` (`dp-01`..`dp-08`) defines non-empty `schema`, valid `piiLevel` (`None | Pseudonymized | Restricted`), and positive `currentQualityScore`.

4. **API Contract Tests (`supertest` against `server.ts`)**
   - Validate `/api/health`, `/api/insights/query`, `/api/ai/insights`, `/api/agent/execute`, and `/api/agent/run` return HTTP `200` and clean JSON even when `GEMINI_API_KEY` is unset or mocked to throw a `429` error.

---

## 3. End-to-End Browser Testing Strategy (Playwright)

All interactive controls have stable element IDs (`#nav-item-*`, `#btn-*`, `#input-*`) for deterministic Playwright automation:

| Test Scenario | Selector / User Flow | Assertion |
| :--- | :--- | :--- |
| **Time Window Scaling** | Click `#btn-time-range-7d` then `#btn-time-range-ytd` | Total Watch Time card updates cleanly without layout overflow. |
| **Segment Filter Propagation** | Navigate `#nav-item-audience` -> click `Declining Engagement` card -> clear via `#btn-clear-segment-filter` | Header Segment Focus pill mounts/unmounts; Customer 360 table filters to matching segment (`sub-4412-er`). |
| **Customer 360 & Content 360 Drawers** | Click `#btn-inspect-sub-sub-8921-mv` -> press `Escape` -> navigate `#nav-item-content` -> click `#btn-open-content-cnt-01` | Slide-over drawers render viewing history, drop-off curves, and close cleanly on `Escape` or `#btn-close-slide-over`. |
| **DQ Remediation -> Model Health Recovery** | Navigate `#nav-item-data_quality` -> `#btn-open-incident-dqi-01` -> `#btn-execute-remediation` -> `#nav-item-model_health` | Sidebar badge changes from `1 Crit` to `1 Open`; `ML-02` status transitions from `Degraded` to `Healthy`. |
| **AI Insights Query & Action Routing** | Navigate `#nav-item-ai_insights` -> click `#btn-ai-prompt-pill-1` -> click recommended action card | Renders grounded metrics (`62.0%`, `86.8%`) and navigates to `content` or `personalization`. |
| **Governed Agent HITL Flow** | Navigate `#nav-item-agent_workspace` -> select `Experiment Decision Support Agent` -> `#btn-run-agent-task` -> `#btn-approve-proposal` | Displays 4 completed tool steps and changes proposal status to `Enacted`. |

---

## 4. Shadow-Mode Model Retraining & Counterfactual Backtesting

Before promoting any candidate ML model (`RankNet-v4.x`, `ChurnHazard-XGB`, `ContentEmbed-768`) to production A/B traffic:

1. **Offline IPS / Counterfactual Replay (`pipe-07`)**
   - Replay historical impression and propensity logs (`IPS Logging Loss = 0.000%`) against the candidate model to estimate `NDCG@10` (`>0.850`), `Recall@50` (`>65%`), and `Intra-List Diversity` (`>0.70`) without risking live user degradation.
2. **Shadow-Mode Mirroring (`AI / Model Health`)**
   - Triggered via **Trigger Shadow Retraining** (`#btn-retrain-model-ML-*`), mirroring 5-10% of live production inference requests to the candidate SageMaker endpoint asynchronously.
   - Compare prediction distributions (`PSI < 0.10`), calibration error (`ECE < 0.040`, `Brier < 0.090`), and P99 latency before opening an A/B/n experiment in `Experimentation`.

---

## 5. Recommendation & API Latency Benchmarks

Target SLAs verified under synthetic load (`k6` or `Locust`) before production promotion:

| Subsystem / Endpoint | Target P95 | Target P99 | Throughput Target |
| :--- | :--- | :--- | :--- |
| `GET /api/health` | `< 10ms` | `< 20ms` | `1,000+ RPS` |
| `POST /api/insights/query` (Deterministic Fallback) | `< 25ms` | `< 50ms` | `500 RPS` |
| `POST /api/insights/query` (Live Gemini Proxy) | `< 680ms` | `< 1,200ms` | Token-quota bounded |
| `pipe-02` Two-Tower Candidate Retrieval (ScaNN/OpenSearch) | `< 10ms` | `< 14ms` | `42,000 QPS` |
| `pipe-04` Multi-Task Deep Ranking (`RankNet-v4.1`) | `< 18ms` | `< 24ms` | `42,000 QPS` |
| End-to-End Home Rail Personalization (`pipe-01`..`pipe-07`) | `< 65ms` | `< 100ms` | `42,000 QPS` |
