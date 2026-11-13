# ContentPulse Operational Runbook

This runbook provides step-by-step triage and recovery playbooks for production and staging incidents in ContentPulse.

---

## Playbook 1: Gemini API `429` Quota Exhaustion or Upstream Timeout

### Symptoms
- `POST /api/insights/query` or `POST /api/agent/execute` returns `{ "success": true, "source": "synthetic-fallback", "error": "...429..." }`.
- Server logs record `Gemini API query error` or `Gemini API agent error`.
- Header still shows **Gemini 3.8** (because `GEMINI_API_KEY` is present), while requests degrade to the client deterministic engine.

### Impact
- **User Experience:** Non-breaking. `AppContext.tsx` automatically synthesizes deterministic insights and 4-step agent plans so dashboards and HITL workflows remain usable.
- **Functional Loss:** Custom queries outside preset patterns return generic ranking/experimentation synthesis instead of dynamic LLM reasoning.

### Triage & Resolution
1. Verify API health and key presence:
   ```bash
   curl -s http://localhost:3000/api/health
   ```
2. Inspect server logs for HTTP status (`429 RESOURCE_EXHAUSTED`, `401/403` invalid/expired key, or `504` upstream timeout).
3. If `429` quota spike:
   - Check Google AI Studio / Cloud Console TPM & RPM quotas for `gemini-3.8-flash`.
   - Enable request coalescing / Redis response caching (`TTL = 300s`) keyed on normalized `(query, timeRange, segmentFilter)`.
   - Route overflow traffic to the secondary AWS Bedrock endpoint or fallback tier.
4. If `401/403` key failure:
   - Rotate `GEMINI_API_KEY` in AWS Secrets Manager / `.env` and restart the service (`npm run start` or ECS rolling task replacement).
   - Note: `server.ts` caches `genAIClient` in memory (`let genAIClient`), so a process restart is required after rotating the key.

---

## Playbook 2: Critical Data Quality Contract Violation (`dqi-01` Blast Radius)

### Symptoms
- Red pulsing **1 Crit** badge appears on **Data Quality** in the left sidebar (`Sidebar.tsx`).
- Critical alert banner displays: *"Critical Data Incident Active: Nullable Tier Code in Subscription Events"*.
- `Subscription Behavior (DP-04)` quality score drops to `84.8/100`.
- Downstream `Churn Signals` feature store and `Survival Hazard Churn Classifier (ML-02)` show **Degraded**.

### Root Cause Pattern
- Upstream Stripe / Braintree billing webhook gateway emits `tier_code = NULL` (e.g., 1.4% of `billing.subscription.events.v3` Kafka messages), failing the Glue / Schema Registry non-null contract.

### Triage & Remediation
1. Open **Data Quality** -> click **Investigate Lineage** on `dqi-01`.
2. Inspect the 5-step OpenLineage trace in `QualityIncidentDrawer` to confirm the exact failing node (`Schema Registry Contract Validator`).
3. Trigger automated remediation:
   - Click **Quarantine & Backfill Schema** in the drawer (in production: routes malformed `tier_code` records to the S3 Dead-Letter Queue, triggers an Apache Flink backfill from raw audit logs, and unblocks `DP-04`).
4. Verify recovery:
   - `dqi-01` status becomes `Remediated`.
   - `DP-04` quality score recovers to `98.9/100`.
   - Navigate to **AI / Model Health** and confirm `ML-02` transitions from `Degraded` to `Healthy` (`PSI = 0.052`, `PR-AUC = 0.841`).
5. Post-incident follow-up: coordinate with the Subscription Platform team to enforce producer-side schema validation before webhook emission.

---

## Playbook 3: ML Feature Drift & Model Degradation (`PSI > 0.20`)

### Symptoms
- **AI / Model Health** displays **1 Degraded** (or multiple models in `Attention` / `Degraded` state).
- Model card shows Population Stability Index `PSI >= 0.20` (e.g., `ML-02` at `PSI = 0.218`, `PR-AUC` dropping from `0.835` to `0.812`).

### Triage & Resolution
1. **Check Upstream Data Contracts First:** Do **not** blindly retrain a model on corrupted data. Inspect `Contract Dependencies` on the degraded model card (e.g., `Subscription Behavior (DP-04)`, `Viewing Behavior (DP-01)`).
2. If an open Data Quality incident exists on any dependency, execute **Playbook 2** first.
3. If all upstream Data Products are healthy (`>97/100`) and drift persists (e.g., seasonal catalog shift or holiday viewing spike):
   - Click **Trigger Shadow Retraining** on the model card (`btn-retrain-model-ML-02`).
   - Verify shadow model offline evaluation (`PR-AUC`, `NDCG@10`, `ECE` calibration error) on the last 14 days of counterfactual IPS logs (`pipe-07`) before promoting shadow traffic to `100%`.

---

## Playbook 4: Recommendation Pipeline & API Latency Triage (`P99 > 50ms` / `> 100ms`)

### Symptoms
- Personalization pipeline total latency breaches the `<100ms` end-to-end budget (`84ms` baseline), or individual model P99 latency breaches the `<50ms` serving SLA.
- Experiment guardrail **P99 Recommendation Serving Latency** flips to failed.

### Triage & Resolution
1. Open **Personalization** and click through stages `pipe-01` to `pipe-07` to isolate the bottleneck:
   - **`pipe-02` Candidate Generation (>14ms):** Check OpenSearch / ScaNN vector index shard saturation, HNSW `efSearch` parameter, and catalog size growth.
   - **`pipe-03` Feature Store (>11ms):** Check ElastiCache Redis / Feature Store cache hit rate and network saturation.
   - **`pipe-04` Multi-Task Deep Ranking (>24ms):** Check SageMaker GPU/Inferentia2 endpoint queue depth, batch size, and auto-scaling cooldowns.
   - **`pipe-06` UI Rail Orchestration (>12ms):** Check edge cache hit ratio (target `>75%`).
2. **Immediate Mitigation:**
   - If `exp-01` (or an active treatment) introduced excessive cross-attention latency, use **Experimentation** -> click **Rollback** on the treatment to revert traffic to the baseline Two-Tower model (`17.2%` baseline CTR, lower compute footprint).
   - Scale Flink TaskManager / inference replicas (as documented in resolved incident `dqi-03`).

---

## Playbook 5: Experiment Guardrail Breach (`exp-03` Pattern)

### Symptoms
- An active A/B test exhibits statistically significant negative lift or violates guardrail metrics (e.g., `Session Exit Rate +4.8%`, `New Title Exploration -8.2%` as seen in `exp-03`).

### Triage & Resolution
1. Navigate to **Experimentation** and select the affected experiment.
2. Confirm guardrail failure badges (`FAILED`) and negative confidence interval bounds.
3. Click **Rollback** immediately to halt treatment traffic and protect subscriber retention.
4. Log the decision rationale in the experiment audit record for the Experimentation & Growth review.
