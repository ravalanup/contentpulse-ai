# ContentPulse Security, Privacy & Governance Compliance

This document defines the security controls, data privacy safeguards, pre-LLM minimization rules, role-based access control (RBAC), and audit retention standards for ContentPulse.

---

## 1. Data Classification & PII Minimization (`DataProduct` Contracts)

Every schema field across the 8 enterprise Data Products (`dp-01`..`dp-08`) carries an explicit `piiLevel` tag enforced in `src/types/index.ts` and inspected in `DataProductDrawer.tsx`:

| `piiLevel` | Definition | Examples in ContentPulse | Handling & Storage Rule |
| :--- | :--- | :--- | :--- |
| **`None`** | Non-identifying content metadata, aggregate metrics, or device classes. | `content_id`, `completion_ratio`, `device_form_factor`, `semantic_vector_768`, `tier_code` | Standard lakehouse encryption at rest (S3 SSE-KMS). |
| **`Pseudonymized`** | Salted, one-way hashed subscriber or household identifiers. | `account_id` (`DP-01`, `DP-04`, `DP-08`), `profile_id` (`DP-01`, `DP-05`), `profile_key` (`DP-07`) | Stored with rotating salt keys in KMS; never joined with raw email/name inside analytical views or ML feature stores. |
| **`Restricted`** | Direct PII or sensitive billing/kids profile attributes. | Raw email, billing address, payment token, minor age flags | Segregated in encrypted Vault / tokenized billing boundary; blocked from LLM prompts and general PM dashboards. |

---

## 2. Pre-LLM PII Redaction & Data Minimization

Before any payload is sent from `server.ts` (`/api/insights/query` or `/api/agent/execute`) to Google Gemini or AWS Bedrock:

1. **Aggregate-Only Context Policy:** Prompts may include cohort-level statistics (`10.4M subscribers`, `4.2 min browsing latency`), content metadata (`Galactic Vanguard`), and model metrics (`PSI = 0.218`), never raw subscriber rows.
2. **Server-Side Scrubber Middleware (Production Control):**
   - Strips email patterns, IPv4/IPv6 addresses, phone numbers, and raw UUID/account tokens (`sub-xxxx-xx`) from user-submitted `query` or `goal` strings before forwarding to the LLM.
   - Replaces any subscriber references with opaque session aliases (`[SUBSCRIBER_TOKEN_1]`).
3. **Zero Training / Enterprise Proxy:** Production LLM calls use enterprise API tiers (Google Cloud Vertex AI / Gemini Enterprise or AWS Bedrock PrivateLink) with zero prompt retention and zero model training on telemetry.
4. **Secret Isolation:** `GEMINI_API_KEY` is read strictly on the server via `process.env.GEMINI_API_KEY` (AWS Secrets Manager in production) and is never exposed in `VITE_*` client bundles.

---

## 3. Privacy Regulation Alignment (GDPR, CCPA/CPRA, COPPA)

Because ContentPulse analyzes household viewing behavior and Kids/Family profiles (`Family / Shared Viewing` cohort, `TV-Y7` / `G` animation inventory):

- **GDPR & CCPA/CPRA (Right to Erasure & Opt-Out):**
  - Deleting or resetting a subscriber's KMS pseudonymization salt renders all historical `account_id` and `profile_id` rows in Apache Iceberg (`DP-01`, `DP-05`, `DP-08`) permanently unlinkable, satisfying erasure SLAs without rewriting immutable Parquet history.
  - Behavioral personalization opt-outs (`do_not_profile`) are enforced at `pipe-05` (**Personalization & Business Rules**) before ranking scores are returned to client devices.
- **COPPA / Kids Profile Isolation:**
  - Profiles flagged as Kids (`TV-Y7` / `G` restricted) are excluded from cross-profile commercial ad targeting, churn marketing push notifications, and LLM-based query logs.
  - Parental rating filters are enforced deterministically at `pipe-05` and cannot be overridden by bandit exploration.

---

## 4. Server-Side RBAC & Tenant Isolation

In production AWS deployment (`Amazon Cognito` + OIDC SSO), all API routes validate JWT claims server-side and enforce least-privilege role scopes:

| Role | Allowed Views & Read Scopes | Allowed Mutating Actions |
| :--- | :--- | :--- |
| **`Executive / Viewer`** | Read-only access to `Executive Overview`, `Content Intelligence`, `AI Insights` | None (cannot ship experiments, remediate pipelines, or approve agent runs) |
| **`Principal PM`** | Full read access to all 10 views | `POST /api/experiments/:id/decision` (`ship`/`iterate`/`rollback`), `POST /api/agents/runs/:id/approve` |
| **`Data Steward`** | Full read access + `Restricted` lineage diagnostics | `POST /api/quality/incidents/:id/remediate` (DLQ quarantine & backfill) |
| **`ML Engineer`** | Full read access to `Personalization`, `Model Health`, `Experimentation` | `POST /api/models/:id/retrain` (shadow pipeline trigger), feature flag staging |

- **Environment / Brand Isolation:** Multi-region or multi-brand streaming tenants (e.g., US vs. EMEA catalogs) are isolated via JWT `tenant_id` claims enforced at both the API gateway and database/Athena row-level security policies.

---

## 5. Autonomous Agent Governance & Audit Retention

`AgentWorkspace` enforces a strict **Human-in-the-Loop (HITL)** governance model (`AgentRun.auditRecord` in `src/types/index.ts`):

- **Tool Allowlist Enforcement (`allowlistEnforced: true`):** Agents can only invoke pre-approved read/stage tools (`Customer 360 API`, `Content Catalog Vector Query`, `Analytics Ingestion Store`, `Experimentation Hub`). Direct database writes or unreviewed production flag flips are blocked.
- **Mandatory Human Sign-Off (`requiresApproval: true`):** Proposals enter `Pending Review` (`awaiting_human_approval`) and require an authenticated Principal PM decision (`Approved` / `Rejected`) before downstream feature flags or campaigns are enacted.
- **Immutable Audit Retention:** Every agent run, tool execution trace, evidence citation, and human approval decision (`runId`, `initiatorRole`, `approvedBy`, timestamp, payload diff) is persisted to append-only storage (RDS audit table + S3 Object Lock WORM archive) for a minimum of **7 years** (or per corporate SOX/ITGC policy) to support internal governance and model accountability audits.
