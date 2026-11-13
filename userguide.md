# ContentPulse User Guide

This guide explains the target personas for **ContentPulse** and details how each persona uses the platform both **visually** (via the web workspace) and **programmatically** (via REST APIs and data contracts).

---

## 1. Platform Personas

| Persona | Primary Responsibilities | Key Modules Used |
| :--- | :--- | :--- |
| **Principal Product Manager (Personalization & Growth)** | Owns North Star engagement, A/B/n rollout decisions, cohort retention, and AI-assisted prioritization. | Executive Overview, Experimentation, AI Insights, Agent Workspace |
| **Audience & Retention Strategist** | Monitors subscriber health, churn hazards, household co-viewing patterns, and stalled-series recovery. | Audience Intelligence, Customer 360 Drawer, AI Insights |
| **Content & Merchandising Strategist** | Analyzes title completion curves, semantic discovery fit, demographic reach, and hero-slot promotion. | Content Intelligence, Content 360 Drawer, Personalization |
| **ML & Personalization Engineer** | Tunes 7-stage ranking pipelines, inspects SHAP attribution/counterfactuals, monitors PSI drift, and triggers shadow retraining. | Personalization, AI / Model Health, Experimentation |
| **Data Platform Engineer / Data Steward** | Enforces Data Product schemas, monitors freshness SLAs, investigates OpenLineage DAG breaks, and executes remediation. | Data Products, Data Quality, Quality Incident Drawer |

---

## 2. Visual Workflows by Persona

### A. Principal Product Manager

1. **Daily Executive Pulse (`Executive Overview`)**
   - Inspect **Meaningful Content Engagement** (North Star KPI) and the 8 primary telemetry cards.
   - Switch global time ranges in the top header (`Last 7D`, `Last 30D`, `Last 90D`, `YTD`) to scale watch-time telemetry.
   - Read the **AI Executive Brief** and click **Ask natural language follow-up** to jump directly into `AI Insights`.

2. **Ship or Halt Experiments (`Experimentation`)**
   - Review `exp-01` (**Personalized Home Ranking v2**) and inspect lift (`+8.4%`), p-value (`0.0003`), 95% CI, and guardrail safety checks.
   - Click **Ship 100%**, **Iterate**, or **Rollback** in the PM Decision bar.
   - Observe reactive updates across the app: shipping `exp-01` lifts `Recommendation CTR` to `18.7%`, `Day-30 Cohort Retention` to `88.6%`, and `Meaningful Content Engagement` to `4.82 hrs`.

3. **Natural Language Strategy (`AI Insights`)**
   - Enter custom executive questions or select a preset PM query pill (e.g., *"Why is churn increasing in the Casual Viewers segment..."*).
   - Review the grounded narrative, supporting metric cards, and click any **Recommended Next PM Action** card to navigate directly to the relevant execution view (`personalization`, `content`, `model_health`, `experimentation`, `data_quality`).

4. **Governed AI Execution (`Agent Workspace`)**
   - Select one of the 4 autonomous agents (e.g., `Experiment Decision Support Agent`).
   - Click **Dispatch Autonomous Agent** to execute the 4-step tool trace (`query_data_product`, `inspect_content_lineage`, `verify_model_health`, `synthesize_experiment_policy`).
   - Review the **Agent Proposal** and click **Approve & Enact Proposal** (approving the Experiment agent automatically ships `exp-01`) or **Reject / Modify** to discard without committing changes.

---

### B. Audience & Retention Strategist

1. **Cohort Filtering (`Audience Intelligence`)**
   - Compare the 6 subscriber cohorts (`Highly Engaged`, `Family / Shared Viewing`, `Casual Viewers`, `New Subscribers`, `Declining Engagement`, `Churn Risk Cohort`).
   - Click a cohort card (such as `Declining Engagement`) to activate the global **Segment Focus** pill in the header and open the **Segment Deep Dive** panel showing top genres, device access, and growth policy.

2. **Individual Telemetry Inspection (`Customer 360 Drawer`)**
   - Search subscribers by name, ID, or genre in the Customer 360 table (e.g., `Elena Rostova` / `sub-4412-er`).
   - Click **Inspect 360** to open the slide-over drawer and audit:
     - 5-week watch-time trajectory bars
     - Device share (`Smart TV` vs. `Mobile` / `Web`)
     - Recent playback events with pause/completion status (`DP-01`)
     - Personalized rail impressions, clicks, and conversions
     - Recent search queries and zero-playback diagnostics

---

### C. Content & Merchandising Strategist

1. **Semantic Content Discovery (`Content Intelligence`)**
   - Enter a natural language brief in the **Natural Language Semantic Content Discovery** bar (e.g., *"Find family-friendly adventure content with strong completion among viewers aged 18-34."*).
   - Inspect the Top 3 ranked semantic matches with cosine relevance scores, similarity rationale, and audience fit.

2. **Title Drop-off Diagnostics (`Content 360 Drawer`)**
   - Filter the Master Catalog Inventory by genre (`Sci-Fi`, `Fantasy`, `Family`, `Nature`, `Action`) or format (`Original Series`, `Feature Film`, `Documentary`, `Animation`).
   - Click any title (e.g., `Shadows of Olympus` or `Pico & The Cloud King`) to open the Content 360 drawer and inspect minute-by-minute drop-off bars (`0-5m` to `End Credits`), 768-dim vector cluster status, and 7-week viewership velocity.

---

### D. ML & Personalization Engineer

1. **Pipeline Latency & Stage Inspection (`Personalization`)**
   - Click any of the 7 pipeline stage cards (`pipe-01` Behavioral Ingestion through `pipe-07` Feedback Loop & Logging) to inspect subsystem latency, QPS throughput, and input/output artifacts.
   - Select a target subscriber in the **Explainable AI: Recommendation Attribution Engine** to review normalized feature weights (`Genre & Thematic Affinity`, `Recent Viewing Sequence`, `Viewing Context & Time`, `Collaborative Twin Signal`) and counterfactual rank shifts.

2. **Drift Monitoring & Shadow Retraining (`AI / Model Health`)**
   - Monitor the 5 production ensembles (`ML-01`..`ML-05`) for P99 inference latency (`<50ms` SLA) and Population Stability Index (`PSI`).
   - If `ML-02` (**Survival Hazard Churn Classifier**) shows `Degraded` with `PSI = 0.218`, verify its `Contract Dependencies` (`Subscription Behavior (DP-04)`) and coordinate remediation before clicking **Trigger Shadow Retraining**.

---

### E. Data Platform Engineer / Data Steward

1. **Contract Inspection (`Data Products` & `Data Product Drawer`)**
   - Filter the 8 Data Products by domain (`Telemetry`, `Metadata`, `Customer Intelligence`, `Monetization`, `Machine Learning`) or search by schema/owner.
   - Click a card to open the **Data Product Drawer** and verify freshness SLAs, registered downstream consumers, and field-level `Nullable` and `PII Level` (`None`, `Pseudonymized`, `Restricted`) contracts.

2. **Incident Triage & Auto-Remediation (`Data Quality` & `Quality Incident Drawer`)**
   - Monitor the 6 quality dimensions (`Freshness`, `Completeness`, `Accuracy`, `Uniqueness`, `Validity`, `Consistency`) and the active critical alert banner.
   - Click **Investigate Lineage** on `dqi-01` (`Subscription Behavior` - nullable `tier_code` in 1.4% of Stripe/Braintree webhooks).
   - Inspect the 5-step OpenLineage failure path and click **Quarantine & Backfill Schema**.
   - Confirm cross-system recovery: `dqi-01` transitions to `Remediated`, `dp-04` quality score jumps from `84.8` to `98.9`, the sidebar alert clears, and `ML-02` (`Survival Hazard Churn Classifier`) recovers from `Degraded` (`PSI 0.218`) to `Healthy` (`PSI 0.052`).

---

## 3. Programmatic Usage (REST API)

Developers, notebooks, CI scripts, and internal tools can interact directly with ContentPulse's Express backend on port `3000`.

### Check Server & AI Mode Health

```bash
curl -s http://localhost:3000/api/health
```

Returns whether the server is healthy and whether `GEMINI_API_KEY` is active (`hasApiKey: true | false`).

### Query Executive AI Insights

```bash
curl -s -X POST http://localhost:3000/api/insights/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Why is churn increasing in the Casual Viewers segment?",
    "timeRange": "Last 30 Days",
    "segmentFilter": "Casual Viewers"
  }'
```

*(Alias route `POST /api/ai/insights` is also supported.)*

### Dispatch a Governed Agent Task

```bash
curl -s -X POST http://localhost:3000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "Episodic Retention Investigator",
    "goal": "Diagnose the 28% completion cliff in serialized sci-fi and formulate an automated retention rail proposal.",
    "tools": ["Customer 360", "Content Lineage", "Experimentation Hub", "Vertex Model Drift"],
    "governance": {
      "humanApprovalRequired": true,
      "evidenceMode": "STRICT"
    }
  }'
```

*(Alias route `POST /api/agent/run` is also supported.)*

For full request/response schemas and deterministic fallback behavior, see [docs/api-reference.md](docs/api-reference.md).
