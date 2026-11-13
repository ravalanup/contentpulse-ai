# ContentPulse Prototype-to-Production Gap Matrix & Engineering Roadmap

This document maps the gaps between the current ContentPulse prototype (`v4.2`) and a full-scale AWS production deployment (`systdesign.md`), followed by a 4-phase engineering delivery roadmap.

---

## 1. Prototype-to-Production Gap Matrix

| Domain | Current Prototype State | Production Target State (AWS) | Gap / Engineering Work Required |
| :--- | :--- | :--- | :--- |
| **Telemetry & Catalog Data** | Static synthetic arrays in `src/data/mockData.ts` (`162.4M` simulated scale). | Real-time **Amazon MSK (Kafka)** + **Apache Flink** + **S3 Apache Iceberg** lakehouse + **Athena/Redshift**. | Build ingestion connectors, Flink sessionization jobs, and backend BFF endpoints (`/api/kpis`, `/api/customers`, `/api/catalog`). |
| **State Persistence** | Ephemeral React `useState` in `AppContext.tsx` (resets on browser reload). | **Amazon RDS PostgreSQL (Multi-AZ)** + **S3 WORM** audit archive. | Persist experiment decisions, Data Quality incident states, remediation logs, and HITL agent approvals in RDS. |
| **Client/Server AI Contract** | `server.ts` returns `{ result: { answer, dataMetrics } }`, while `AppContext.tsx` checks `data.summary` / `data.steps` and falls back to deterministic synthesis. | Unified typed JSON contract between `server.ts` and `AppContext.tsx` with Zod validation. | Add response mapper/normalizer in `AppContext.tsx` (or unify schema in `server.ts`) and align `Experimentation.tsx` field bindings with `types/index.ts`. |
| **Authentication & RBAC** | No login wall; single simulated `Principal PM` identity. | **Amazon Cognito / OIDC SSO** with JWT verification and server-side RBAC (`Executive`, `Principal PM`, `Data Steward`, `ML Engineer`). | Add Cognito auth middleware on `/api/*`, role-gated mutations, and multi-tenant isolation. |
| **PII & LLM Security** | Prompts sent directly to Gemini without automated PII regex/token scrubbing. | Server-side **PII redaction middleware**, KMS pseudonymization vaults, and VPC-isolated **AWS Bedrock / Gemini Enterprise**. | Implement pre-LLM payload sanitizer, KMS salt rotation, and COPPA/GDPR opt-out enforcement. |
| **Vector Search & Feature Store** | Keyword-weighted simulation in `ContentIntelligence.tsx` (`getSemanticSearchResults`) and static `RECOMMENDATION_METRICS`. | **Amazon OpenSearch Serverless (768-dim HNSW)** + **ElastiCache Redis / SageMaker Feature Store**. | Deploy embedding generation pipeline (`ML-03`), index 85,000+ catalog titles, and wire real vector nearest-neighbor queries. |
| **ML Model Serving & Drift** | Static metrics in `PRODUCTION_MODELS` with reactive `dqi-01` -> `ML-02` state coupling. | **Amazon SageMaker Endpoints** + **Model Monitor (PSI/KS)** + **SageMaker Pipelines** shadow retraining. | Wire live CloudWatch/Model Monitor metrics and trigger real Step Functions/SageMaker shadow retraining jobs. |
| **Data Quality & Lineage** | Hardcoded 3 incidents (`dqi-01`..`dqi-03`) and static 5-stage DAG. | **AWS Glue Schema Registry**, **Great Expectations / Deequ** checks, and **OpenLineage / Marquez** API. | Emit live OpenLineage events from Flink/Glue jobs; wire remediation button to S3 DLQ quarantine + Flink backfill API. |
| **Autonomous Agents** | Single-turn prompt simulation (`POST /api/agent/execute`) with static fallback steps. | Multi-turn tool-calling agent runtime (LangGraph / Bedrock Agents) executing real read-only RPC tools. | Implement authenticated internal tool adapters (`query_data_product`, `inspect_content_lineage`, `verify_model_health`, `stage_feature_flag`). |
| **Automated Test & CI/CD** | Only `tsc --noEmit` (`npm run lint`) and `npm run build` exist. | Full Vitest unit/contract suite, Playwright E2E, `k6` load tests, and Terraform/CDK blue-green deploy. | Add `vitest`, `@playwright/test`, GitHub Actions CI workflow, Dockerfile, and IaC modules. |

---

## 2. 4-Phase Engineering Delivery Roadmap

### Phase 1: Contract Hardening, Persistence & Auth Foundation (Weeks 1-4)
**Goal:** Eliminate ephemeral state, align all TypeScript/API contracts, and secure the control plane.
- **API & UI Alignment:** Normalize `server.ts` Gemini responses (`result.answer`, `result.plan`) to match `AiInsightResponse` and `AgentExecutionPlan` in `AppContext.tsx`; align `Experimentation.tsx` bindings with `Experiment` (`control`, `treatment`, `liftPercent`, `pValue`) and fix `UsageTier` label parity in `DataProducts.tsx`.
- **PostgreSQL Persistence:** Stand up RDS PostgreSQL and migrate experiment decisions, quality incident statuses, and agent HITL audit logs out of React memory into REST endpoints (`/api/experiments`, `/api/quality/incidents`, `/api/agent/runs`).
- **Auth & Security:** Integrate Amazon Cognito SSO + JWT verification middleware, enforce RBAC (`Principal PM`, `Data Steward`, `ML Engineer`), and add pre-LLM PII redaction middleware.
- **Automated Testing:** Establish Vitest unit/contract tests and Playwright E2E regression tests in GitHub Actions.

### Phase 2: Streaming Data Mesh & OpenLineage Integration (Weeks 5-10)
**Goal:** Replace `mockData.ts` KPIs, Customer 360, and Data Quality feeds with live telemetry.
- **Streaming Ingestion:** Deploy Amazon MSK (Kafka) topics (`playback.heartbeat.v4`, `search.intent.v3`, `billing.subscription.events.v3`) backed by AWS Glue Schema Registry.
- **Stream Processing & DLQ:** Deploy Apache Flink jobs for sessionization, 3-minute freshness SLA streaming into S3 Apache Iceberg, and automatic malformed-record quarantine to S3 DLQ.
- **Lineage & Quality Engine:** Deploy Marquez (OpenLineage) + Great Expectations / AWS Glue Data Quality rules so `DataQuality.tsx` and `QualityIncidentDrawer.tsx` display live schema violations and trigger real backfill workflows.

### Phase 3: Production ML Serving, Vector Search & Online Feature Store (Weeks 11-16)
**Goal:** Connect Content 360 semantic search, Personalization explainability, and Model Health observability to live ML infrastructure.
- **Vector & Feature Infrastructure:** Provision Amazon OpenSearch Serverless (768-dim HNSW index for `ML-03` embeddings) and ElastiCache Redis / SageMaker Feature Store (`<10ms` P99 lookup for `dp-07`).
- **Model Endpoints & Explainability:** Host `ML-01` (`RankNet`), `ML-02` (`ChurnHazard-XGB`), `ML-04` (`EpisodicBridge-LSTM`), and `ML-05` (`HouseholdGraph-GNN`) on SageMaker Endpoints; expose live SHAP attribution weights to `Personalization.tsx`.
- **Observability & Shadow Retraining:** Integrate SageMaker Model Monitor (`PSI`, `ECE`, `PR-AUC`) and wire **Trigger Shadow Retraining** to launch real SageMaker Pipelines + counterfactual IPS replay (`pipe-07`).

### Phase 4: Real Tool-Using Agents, Multi-Region Scale & Chaos Testing (Weeks 17-22)
**Goal:** Operationalize autonomous PM agents with real tool integrations and certify production SLAs.
- **Real Agent Tooling:** Connect `AgentWorkspace` to live Athena/Feature Store read queries, Marquez lineage APIs, SageMaker health APIs, and AWS AppConfig / LaunchDarkly feature-flag staging (strictly gated on Principal PM HITL approval + S3 WORM audit logging).
- **Resilience & Load Certification:** Execute `k6` load benchmarks (`42,000 QPS` recommendation pipeline, `<100ms` end-to-end P99, `<50ms` model P99) and run chaos drills simulating Gemini `429` failovers and Kafka schema poison-pill events (`dqi-01`).
- **Multi-Region Rollout:** Replicate OpenSearch indexes, Redis feature caches, and ECS control-plane clusters across `us-east-1` and `eu-west-1` with regional tenant isolation.
