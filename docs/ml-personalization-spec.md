# ContentPulse ML & Personalization Technical Specification

This document describes the 7-stage streaming recommendation pipeline, explainable AI attribution engine, 5 production ML ensembles (`ML-01`..`ML-05`), and A/B/n causal experimentation framework.

---

## 1. 7-Stage Recommendation Pipeline (`Personalization.tsx`)

Total end-to-end budget: **84ms** (`P99 SLA: <100ms`).

| Step | Stage ID | Name | Subsystem | Latency | Throughput | Input -> Output |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `1` | `pipe-01` | **Behavioral Ingestion** | Kafka / Flink Streaming Bus | `8ms` | `185k QPS` | Raw Telemetry Events -> Validated Streaming Stream (`42ms` lag) |
| `2` | `pipe-02` | **Candidate Generation** | Two-Tower ANN (ScaNN) | `14ms` | `42k QPS` | User Vector + Context -> Candidate Set (`N = 1,500`, `Recall@500 = 94.2%`) |
| `3` | `pipe-03` | **Content Semantic Embeddings** | Vector Feature Store (Vertex / Redis) | `11ms` | `42k QPS` | Candidate IDs -> 768-dim Multimodal Vectors (`99.4%` coverage) |
| `4` | `pipe-04` | **Multi-Task Deep Ranking** | Transformer Cross-Attention (`RankNet-v4.1`) | `24ms` | `42k QPS` | Candidate Vectors + History -> Scored Items (`NDCG@10 = 0.884`) |
| `5` | `pipe-05` | **Personalization & Business Rules** | Contextual Bandit & Policy Layer | `9ms` | `42k QPS` | Ranked Scores -> Deduplicated List (`alpha=0.18` diversity, parental filters) |
| `6` | `pipe-06` | **UI Rail Orchestration** | Dynamic Page Composer | `12ms` | `42k QPS` | Rail Config -> Home Screen JSON (`14` rails, `76.4%` edge cache hit) |
| `7` | `pipe-07` | **Feedback Loop & Logging** | Counterfactual Logger & OOB Evaluator | `6ms` | `185k QPS` | Impression & Click Logs -> Golden Training Dataset (`0.000%` IPS loss) |

### Offline & Online Evaluation Targets (`RECOMMENDATION_METRICS`)
- **Precision@10:** `42.8%` (Target `>40.0%`)
- **Recall@50:** `69.4%` (Target `>65.0%`)
- **NDCG@10:** `0.882` (Target `>0.850`)
- **Recommendation CTR:** `18.7%` (Baseline `17.2%`)
- **Catalog Completion:** `68.4%` (Median `64.0%`)
- **Catalog Coverage:** `76.2%` (Target `>75.0%`)
- **Intra-List Diversity:** `0.74` (Target `>0.70`)
- **Novelty Score:** `0.61` (Target `>0.55`)

---

## 2. Explainable AI Attribution Engine

For any recommended item (e.g., `Galactic Vanguard` for `Marcus Vance / sub-8921-mv`), the attribution panel surfaces:
- **Normalized Feature Weights:**
  - Genre & Thematic Affinity (`38%`)
  - Recent Viewing Sequence (`29%`)
  - Viewing Context & Time (`18%`)
  - Collaborative Twin Signal (`15%`)
- **Rank Journey:** Candidate Generation Rank (`#3`) -> Reranking Adjustment (`+2` to `+4` positions based on predicted episodic completion `p = 0.86`).
- **Counterfactual Explanation:** Quantifies which recent viewing event caused the #1 placement and what rank the title would fall to without it.

---

## 3. Production ML Model Ensembles (`ML-01`..`ML-05`)

| Model ID | Name & Version | Architecture | P99 Latency | Throughput | Accuracy vs. Benchmark | Drift (`PSI`) | Data Product Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`ML-01`** | Multi-Task Personalization Transformer (`RankNet-v4.1.2-prod`) | Transformer with Sparse Cross-Attention | `28ms` | `72,000 QPS` | `NDCG@10: 0.882` (Base `0.841`) | `0.042` (Stable) | `DP-01`, `DP-02`, `DP-05` |
| **`ML-02`** | Survival Hazard Churn Classifier (`ChurnHazard-XGB-v3.4`) | Survival Cox-Boosted Trees (XGBoost) | `14ms` | `18,500 QPS` | `PR-AUC: 0.812` *(Target `>0.835`)* | `0.218` *(Moderate Drift - Degraded until `dqi-01` remediated)* | `DP-04`, `DP-01` |
| **`ML-03`** | Multimodal Content & User Twin Encoder (`ContentEmbed-768-v3.2`) | Two-Tower Dual-Encoder (`768-dim`) | `11ms` | `45,000 QPS` | `Recall@50: 69.4%` (Target `>65.0%`) | `0.028` (Stable) | `DP-02`, `DP-06` |
| **`ML-04`** | Smart Resume & Episodic Bridge Predictor (`EpisodicBridge-v2.0`) | Temporal Sequence LSTM + Attention | `19ms` | `31,000 QPS` | `Next-Ep Playthrough: 78.4%` (Base `72.1%`) | `0.061` (Stable) | `DP-08`, `DP-01` |
| **`ML-05`** | Household Co-Viewing & Shared Profile Matcher (`HouseholdGraph-v1.8`) | Heterogeneous Graph Neural Network (GNN) | `34ms` | `14,200 QPS` | `Co-Viewing Lift: +29.5%` (Target `>20.0%`) | `0.054` (Stable) | `DP-07`, `DP-01` |

---

## 4. A/B/n Experimentation & Causal Guardrails

Experiments (`exp-01`..`exp-04`) require statistical significance (`p < 0.05`, positive lower bound on 95% CI, statistical power `>80%`) **and** zero degradation on guardrail metrics before shipping:

| Experiment ID | Name | Status | Lift | `p-value` | Guardrail Result | Default Decision |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`exp-01`** | Personalized Home Ranking v2 | `Running` | `+8.4%` CTR (`17.2% -> 18.65%`) | `0.0003` | All 4 guardrails passed (Completion `+0.55%`, Latency `+6ms`) | `ship` |
| **`exp-02`** | Dynamic Hero Artwork Personalization | `Concluded` | `+12.1%` Hero Play | `0.0001` | All 2 guardrails passed | `ship` |
| **`exp-03`** | High-Aggression Churn Preemption Rail | `Running` | `-1.8%` Retention | `0.042` | **Failed** (`Session Exit Rate +4.8%`, `New Title Exploration -8.2%`) | `stop` |
| **`exp-04`** | Zero-Search LLM Query Disambiguation | `Draft` | `+6.2%` projected | `0.005` | Search P95 `+18ms` (`<150ms` target) | `undecided` |
