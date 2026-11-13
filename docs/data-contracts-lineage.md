# ContentPulse Data Contracts & Lineage Specification

ContentPulse treats analytical and ML datasets as **contract-governed Data Products** (`dp-01`..`dp-08`) connected via OpenLineage / Marquez DAGs and automated Data Quality circuit breakers.

---

## 1. Enterprise Data Products Catalog (`src/data/mockData.ts`)

| ID | Name | Domain | Usage Tier | Freshness SLA | Storage Technology | Monthly Queries | Initial Quality Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`dp-01`** | **Viewing Behavior** | Subscriber Telemetry | Tier 1 Critical | `< 3 minutes` (Streaming P99) | Apache Iceberg / BigQuery Streaming | `840M` | `98.4 / 100` |
| **`dp-02`** | **Search Behavior** | Subscriber Intent | Tier 2 Operational | `< 15 minutes` | BigQuery / Redis Intent Cache | `320M` | `91.2 / 100` |
| **`dp-03`** | **Content Metadata** | Catalog Core | Tier 1 Critical | `< 1 hour` | Vector Feature Store / Spanner | `610M` | `99.1 / 100` |
| **`dp-04`** | **Subscription Behavior** | Commerce & Entitlements | Tier 1 Critical | `< 10 minutes` | Cloud Spanner / BigQuery Secure Vault | `190M` | `84.8 / 100` *(Degraded by `dqi-01`)* |
| **`dp-05`** | **Customer Engagement** | Audience Intelligence | Tier 2 Operational | `< 6 hours` (Batch) | Feast / Vertex Feature Store | `450M` | `96.5 / 100` |
| **`dp-06`** | **Content Performance** | Catalog Intelligence | Tier 2 Operational | `< 4 hours` | BigQuery / Looker Semantic Layer | `280M` | `97.8 / 100` |
| **`dp-07`** | **Recommendation Features** | Inference Features | Tier 1 Critical | `< 500 ms` (Real-time KV) | Redis Enterprise / Google Bigtable | `1,800M` | `99.4 / 100` |
| **`dp-08`** | **Churn Signals** | Subscriber Health | Tier 2 Operational | `< 24 hours` | BigQuery / Vertex AI Endpoints | `110M` | `94.6 / 100` |

---

## 2. Key Schema Contracts & PII Levels

All field definitions are inspectable in `DataProductDrawer.tsx`:

- **`dp-01` Viewing Behavior (`v4.2.0`)**: `event_id` (`UUID`, `None`), `account_id` (`STRING (Hash)`, `Pseudonymized`), `profile_id` (`STRING (Hash)`, `Pseudonymized`), `content_id` (`STRING`, `None`), `session_duration_sec` (`INT64`, `None`), `completion_ratio` (`FLOAT64`, `None`), `device_form_factor` (`STRING`, `None`), `bitrate_kbps` (`INT32`, nullable, `None`), `attribution_source` (`STRING`, `None`).
- **`dp-02` Search Behavior (`v3.1.0`)**: `search_session_id`, `query_raw`, `intent_cluster`, `results_returned_count`, `selected_rank` (nullable), `converted_to_play`.
- **`dp-03` Content Metadata (`v5.0.1`)**: `content_id`, `canonical_title`, `content_type`, `runtime_minutes`, `semantic_vector_768` (`ARRAY<FLOAT64>`), `parental_advisory_rating`, `franchise_hub` (nullable).
- **`dp-04` Subscription Behavior (`v3.8.0`)**: `subscription_event_id`, `account_id` (`Pseudonymized`), `tier_code` (`STRING`, `nullable: false` - enforced by contract!), `billing_cycle_day`, `event_type`, `plan_price_usd`.
- **`dp-05` Customer Engagement (`v2.4.0`)**: `profile_id` (`Pseudonymized`), `rolling_7d_watch_hours`, `primary_segment_id`, `genre_affinity_vector` (`MAP<STRING, FLOAT64>`), `weekend_viewing_ratio`.
- **`dp-06` Content Performance (`v4.1.0`)**: `content_id`, `cohort_week`, `completion_rate_30d`, `reach_subscribers_total`, `engagement_efficiency_index`.
- **`dp-07` Recommendation Features (`v5.2.0`)**: `profile_key` (`Pseudonymized`), `last_3_skips_content_ids` (nullable), `current_session_intent_vec`, `candidate_affinity_cache` (`BYTES`).
- **`dp-08` Churn Signals (`v2.1.0`)**: `account_id` (`Pseudonymized`), `churn_probability_30d`, `primary_risk_driver`, `recommended_intervention`.

---

## 3. End-to-End 5-Stage Lineage Architecture (`DataQuality.tsx`)

```text
[1. Ingestion Sources]  ->  [2. Streaming Bus]     ->  [3. Lakehouse Storage] ->  [4. Feature Store]      ->  [5. Consumer Models]
Device SDKs                 Kafka / Event Hubs         Apache Iceberg             Online Redis / Vector       Home Ranking v2 (ML-01)
Billing Webhooks (Stripe)   185k events/sec            Parquet columnar           768-dim vectors             Churn Hazard (ML-02)
CMS Metadata Feeds          Protobuf + Schema Reg      ACID commits               Sub entity stats            Vector Reranker (ML-03)
```

---

## 4. Active Data Quality Incidents & Causal Remediation

| Incident ID | Target Data Product | Dimension | Severity | Initial Status | Root Cause & Downstream Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`dqi-01`** | `dp-04` (`Subscription Behavior`) | `Schema violations` | `Critical` | `Open` | `tier_code` received `NULL` in 1.4% of `billing.subscription.events.v3` payloads from Stripe/Braintree gateway. Blocks Churn Signals ML pipeline and degrades `ML-02` (`PSI = 0.218`). |
| **`dqi-02`** | `dp-02` (`Search Behavior`) | `Completeness` | `Warning` | `Investigating` | Missing tokenized intent vector on 8.2% of Roku/FireTV native search queries (SDK `< 5.0`). |
| **`dqi-03`** | `dp-01` (`Viewing Behavior`) | `Freshness` | `Info` | `Remediated` | Flink checkpointing 12-min backlog during premiere peak; auto-scaled TaskManagers from 32 to 64. |

### Causal Recovery Flow (`remediateQualityIncident('dqi-01')`)
Executing **Quarantine & Backfill Schema** on `dqi-01` in `QualityIncidentDrawer.tsx` triggers a cross-system state update in `AppContext.tsx`:
1. `dqi-01.status` -> `'Remediated'`
2. `dp-04.currentQualityScore` -> `98.9`
3. `Churn Models` (`modelHealth`) & `ML-02` (`modelHealthList`) -> `'Healthy'` (`PSI = 0.052`, `PR-AUC = 0.841`)
4. Sidebar critical alert badge clears automatically.
