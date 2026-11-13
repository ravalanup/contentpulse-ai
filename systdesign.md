# ContentPulse System Design & AWS Production Architecture

This document explains the current ContentPulse architecture and provides a complete blueprint for deploying the platform on **Amazon Web Services (AWS)** with real-time streaming telemetry, lakehouse storage, online feature serving, vector retrieval, ML inference, and enterprise governance - replacing all in-memory mock datasets.

---

## 1. Current Prototype Architecture

In its current state, ContentPulse runs as a unified Node.js full-stack application on port `3000`:

```text
+-------------------------------------------------------------------+
| Browser Client (React 19 + TypeScript + Tailwind CSS v4)          |
|  - 10 Views (Executive, Audience, Content, Personalization, ...)  |
|  - 4 Slide-Over Inspection Drawers                                |
|  - AppContext (Reactive KPIs, DQ->ML Circuit Breaker, Fallbacks)  |
|  - mockData.ts (162.4M-scale synthetic domain model)              |
+---------------------------------+---------------------------------+
                                  | HTTP / JSON (same-origin)
                                  v
+-------------------------------------------------------------------+
| Express Server (server.ts - Port 3000)                            |
|  - GET  /api/health                                               |
|  - POST /api/insights/query  (/api/ai/insights)                   |
|  - POST /api/agent/execute   (/api/agent/run)                     |
|  - Dev: Vite middlewareMode  | Prod: Static dist/ + SPA fallback  |
+---------------------------------+---------------------------------+
                                  | HTTPS (@google/genai SDK)
                                  v
+-------------------------------------------------------------------+
| Google Gemini API (gemini-3.8-flash)                              |
|  - Server-side proxy using process.env.GEMINI_API_KEY             |
+-------------------------------------------------------------------+
```

### Key Prototype Design Patterns Preserved in Production
- **Contract-First Data Mesh (`DP-01`..`DP-08`):** Every analytical view and ML model depends on explicitly versioned data contracts with `piiLevel` metadata and SLA targets.
- **Causal Circuit Breakers:** A schema failure in an upstream Data Product (`DP-04`) automatically flags and degrades dependent ML models (`ML-02`) until quarantined and backfilled.
- **Deterministic Graceful Degradation:** If the LLM gateway returns `429`/timeout or lacks credentials, the application degrades cleanly to deterministic rule-based synthesis without failing the UI.
- **Governed Human-in-the-Loop (HITL):** Autonomous agents propose changes with evidence citations and require explicit Principal PM approval before mutating production feature flags or experiment allocations.

---

## 2. Target Production AWS Architecture

To run ContentPulse at streaming scale (185k+ ingestion events/sec, <50ms P99 recommendation serving, 85,000+ catalog titles), replace `mockData.ts` and single-node state with the following AWS architecture.

```text
                         +-------------------------+
                         |  Smart TV / Mobile /    |
                         |  Web Playback Clients   |
                         +------------+------------+
                                      |
          +---------------------------+---------------------------+
          | Web App Traffic                                       | Telemetry Beacons (Protobuf)
          v                                                       v
+--------------------+                                 +----------------------+
| Amazon CloudFront  |                                 | AWS API Gateway /    |
| + S3 (Static SPA)  |                                 | NLB Ingestion Edge   |
+---------+----------+                                 +----------+-----------+
          |                                                       |
          | Auth (JWT via Amazon Cognito)                         v
          v                                            +----------------------+
+--------------------+                                 | Amazon MSK (Kafka)   |
| Application Load   |                                 | + AWS Glue Schema    |
| Balancer (ALB)     |                                 |   Registry           |
+---------+----------+                                 +----------+-----------+
          |                                                       |
          v                                                       v
+------------------------------------+                 +----------------------+
| Amazon ECS Fargate / EKS           |                 | Amazon Managed       |
| (ContentPulse BFF & Control Plane) |                 | Service for Apache   |
|  - /api/kpis, /api/customers       |                 | Flink                |
|  - /api/experiments (RDS)          |                 |  - Sessionization    |
|  - /api/data-products (Glue/Lineage|                 |  - Schema Quarantine |
|  - /api/insights/query (PII Redact)|                 |  - DLQ Routing       |
|  - /api/agent/execute (HITL Audit) |                 +----+------------+----+
+----+------------+-------------+----+                      |            |
     |            |             |                           |            |
     |            |             |             +-------------+            +-------------+
     |            |             |             v                                        v
     |            |             |   +--------------------+                  +--------------------+
     |            |             |   | S3 + Apache Iceberg|                  | ElastiCache Redis  |
     |            |             |   | (Lakehouse DP-01.. |                  | / SageMaker Online |
     |            |             |   |  DP-08 + Glue)     |                  | Feature Store      |
     |            |             |   +---------+----------+                  +---------+----------+
     |            |             |             |                                       |
     v            v             v             v                                       v
+---------+ +-----------+ +----------+ +---------------------------------------------------------+
| RDS     | | OpenSearch| | Bedrock /| | Amazon SageMaker Endpoints & Model Monitor              |
| Postgres| | Serverless| | Gemini   | |  - ML-01 RankNet Transformer (<28ms P99)                |
| (State, | | (768-dim  | | Enterprise | |  - ML-02 Churn XGBoost (Survival Hazard)               |
|  Audit, | |  Vector   | | Proxy    | |  - ML-03 Dual-Encoder Embeddings (768-dim)             |
|  Expts) | |  HNSW)    | | (Secrets | |  - ML-04 Episodic Bridge LSTM                           |
+---------+ +-----------+ |  Mgr)    | |  - ML-05 Household GNN                                  |
                          +----------+ +---------------------------------------------------------+
```

---

## 3. Component-by-Component AWS Mapping

### 3.1 Frontend Delivery & Edge Security
- **Amazon S3 + Amazon CloudFront:** Hosts the compiled Vite SPA (`dist/`). CloudFront enforces TLS 1.3, security headers (CSP, HSTS), and AWS WAF rules.
- **Amazon Cognito + IAM:** Authenticates internal users (Principal PM, Data Steward, ML Engineer, Content Strategist) via OIDC/SAML SSO and injects role claims into JWT tokens validated by the backend.

### 3.2 Control Plane & API Tier (`server.ts` Evolution)
- **Amazon ECS Fargate (or EKS) behind ALB:** Runs horizontally scaled TypeScript/Node.js API containers (or split microservices for BFF and AI Orchestration).
- **Amazon RDS for PostgreSQL (Multi-AZ):** Persists mutable control-plane state currently held in React state:
  - Experiment configurations, allocation percentages, and PM Ship/Iterate/Rollback decisions.
  - Data Quality incidents, remediation status, and operator notes.
  - Agent execution runs, tool traces, and immutable HITL approval audit records (`auditRecord`).
- **AWS Secrets Manager:** Stores `GEMINI_API_KEY` (or external LLM credentials), database credentials, and webhook signing secrets with automatic rotation.

### 3.3 Real-Time Ingestion & Data Mesh (`DP-01`..`DP-08`)
- **Amazon MSK (Managed Streaming for Apache Kafka):** Ingests playback heartbeats (`dp-01`), search events (`dp-02`), and Stripe/Braintree billing webhooks (`dp-04`).
- **AWS Glue Schema Registry:** Enforces strict Protobuf/Avro contracts at ingestion. When malformed records (e.g., `tier_code = NULL`) breach thresholds, **Managed Service for Apache Flink** routes invalid events to an Amazon S3 Dead-Letter Queue (DLQ) and emits a Data Quality incident event to the control plane.
- **Amazon S3 + Apache Iceberg + AWS Glue Data Catalog:** Stores partitioned, ACID-compliant lakehouse tables for `Viewing Behavior`, `Content Performance`, and `Churn Signals`.
- **Amazon Athena / Amazon Redshift Serverless:** Powers ad-hoc analytical aggregations for `Executive Overview` KPIs, `Cohort Segmentation`, and `A/B/n` statistical significance jobs (scheduled via **AWS Step Functions** + **Amazon EventBridge**).
- **OpenLineage + Marquez on ECS (or Amazon DataZone):** Captures live upstream-to-downstream lineage graphs powering the `Data Quality` and `Data Product` drawers.

### 3.4 Online Feature Store, Vector Search & ML Inference
- **Amazon ElastiCache (Redis Cluster) + Amazon SageMaker Feature Store:** Serves low-latency (`<10ms` P99) online subscriber vectors, recent skip lists (`dp-07`), and rolling engagement aggregates (`dp-05`).
- **Amazon OpenSearch Serverless (Vector Engine, HNSW/Faiss):** Replaces Google ScaNN simulation for 768-dimensional content and user twin embeddings (`ML-03`), powering both **Two-Tower Candidate Retrieval** (`pipe-02`) and **Natural Language Semantic Content Discovery**.
- **Amazon SageMaker Real-Time Endpoints:** Hosts `ML-01` (`RankNet-v4.1` GPU/Inferentia2 inference), `ML-02` (`ChurnHazard-XGB`), `ML-04` (`EpisodicBridge-LSTM`), and `ML-05` (`HouseholdGraph-GNN`) with auto-scaling target tracking.
- **SageMaker Model Monitor + Evidently AI:** Computes rolling Population Stability Index (`PSI`), prediction drift, and calibration error (ECE/Brier), automatically opening incidents or triggering shadow retraining pipelines via **SageMaker Pipelines**.

### 3.5 GenAI Insights & Governed Agent Orchestration
- **LLM Gateway (Server-Side Proxy):** Supports **Google Gemini API** (via `GEMINI_API_KEY` in Secrets Manager) or **Amazon Bedrock** (e.g., Claude / Nova models inside VPC PrivateLink for strict zero-egress compliance).
- **Pre-LLM PII Redaction Middleware:** Strips or tokenizes any `Restricted` or `Pseudonymized` identifiers before sending analytical context to the LLM, returning only aggregated cohort metrics and anonymized IDs.
- **Real Agent Tool Execution:** Replaces simulated tool output in `runAgentTask` with authenticated internal RPC calls:
  - `query_data_product()` -> Athena / Feature Store read-only query service
  - `inspect_content_lineage()` -> OpenLineage / Marquez API
  - `verify_model_health()` -> SageMaker Model Monitor & CloudWatch metrics API
  - `synthesize_experiment_policy()` -> LaunchDarkly / AWS AppConfig feature-flag staging API (gated behind Principal PM approval in RDS).

### 3.6 Observability & Telemetry
- **Amazon CloudWatch + AWS X-Ray / OpenTelemetry:** Tracks P50/P95/P99 latencies across the 7-stage recommendation pipeline and `/api/*` routes.
- **Amazon SNS + PagerDuty / Slack:** Routes critical Data Quality circuit-breaker alerts (`dqi-01`) and `PSI > 0.20` drift events to on-call Data Stewards and ML Engineers.

---

## 4. Network & Deployment Topology

- **VPC Isolation:** Public subnets host only the ALB and NAT Gateways. ECS tasks, RDS, MSK, ElastiCache, OpenSearch, and SageMaker run in private subnets with VPC Endpoints (`S3`, `Secrets Manager`, `Bedrock`, `CloudWatch`).
- **Infrastructure as Code:** Provisioned via **AWS CDK (TypeScript)** or **Terraform** with separate `dev`, `staging`, and `prod` environments.
- **CI/CD Pipeline:** GitHub Actions -> `tsc --noEmit` + Vitest + Playwright -> Docker multi-stage build pushed to **Amazon ECR** -> Blue/Green deployment on ECS Fargate with automated `/api/health` verification.
