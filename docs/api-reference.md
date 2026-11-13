# ContentPulse API Reference

Base URL (local development & production server): `http://localhost:3000`
Content-Type: `application/json`

---

## 1. Endpoints Overview

| Method | Path | Aliases | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | - | Server health and Gemini API key readiness check |
| `POST` | `/api/insights/query` | `/api/ai/insights` | Executive natural language telemetry & causal insights |
| `POST` | `/api/agent/execute` | `/api/agent/run` | Governed multi-step autonomous PM agent execution |

---

## 2. `GET /api/health`

Verifies that the Express server is running and reports whether `process.env.GEMINI_API_KEY` is configured.

### Response (`200 OK`)

```json
{
  "status": "ok",
  "hasApiKey": true,
  "timestamp": "2026-11-13T14:35:00.000Z"
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `status` | `string` | Always `"ok"` when the Express process is serving requests. |
| `hasApiKey` | `boolean` | `true` if `GEMINI_API_KEY` is set; `false` triggers client-side Engine v4 mode. |
| `timestamp` | `string` | ISO-8601 server UTC timestamp. |

---

## 3. `POST /api/insights/query` (Alias: `POST /api/ai/insights`)

Synthesizes executive streaming intelligence grounded in active time range, subscriber segment filter, Data Products (`DP-01`..`DP-08`), and experimentation telemetry.

### Request Body

```json
{
  "query": "Why is churn increasing in the Casual Viewers segment, and what content or rails can recover them?",
  "timeRange": "Last 30 Days",
  "segmentFilter": "Casual Viewers"
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `query` | `string` | Yes | Natural language analytical question. |
| `timeRange` | `string` | No | Active window context (defaults to `"Last 30 Days"`). |
| `segmentFilter` | `string` | No | Active cohort filter (defaults to `"All Subscribers"`). |

### Response - Live Gemini Mode (`200 OK`, `source: "gemini-live"`)

```json
{
  "success": true,
  "source": "gemini-live",
  "result": {
    "answer": "Churn in Casual Viewers is driven by 4.2-minute browsing latency without playback initiation and post-finale drop-offs lacking immediate continuation rails.",
    "dataMetrics": [
      {
        "label": "Browsing Latency",
        "value": "4.2 min",
        "delta": "+38%",
        "status": "negative"
      }
    ],
    "dataProductsUsed": [
      "Viewing Behavior",
      "Churn Signals",
      "Search Intent"
    ],
    "evidence": "31.4% of Casual Viewer sessions terminate with zero playback after scrolling past Row 3.",
    "confidenceScore": 94,
    "recommendedAction": "Deploy the Smart Resume & Pivot rail and promote high-completion pilot episodes."
  }
}
```

### Response - No Key / Fallback Mode (`200 OK`)

When `GEMINI_API_KEY` is absent:
```json
{
  "success": true,
  "source": "synthetic-engine",
  "message": "Generated using ContentPulse deterministic intelligence engine."
}
```

When the Gemini SDK throws an error (e.g., `429` quota exhaustion, network timeout, or JSON parse failure):
```json
{
  "success": true,
  "source": "synthetic-fallback",
  "error": "Resource has been exhausted (e.g. check quota)."
}
```

### Client Deterministic Fallback Rules (`src/context/AppContext.tsx`)

When `queryAiInsights()` receives a non-live payload (or network failure), it executes deterministic keyword routing and returns an `AiInsightResponse`:

| Keyword Match (`query.toLowerCase()`) | Synthesized Diagnosis | Cited Data Products | Target `actionView` Routes |
| :--- | :--- | :--- | :--- |
| Includes `"churn"` or `"casual"` | Decision fatigue (4.2 min browsing latency, 31.4% zero-play sessions, 18.2% first-minute bounce). | `DP-01`, `DP-05`, `DP-06` | `personalization`, `content`, `model_health` |
| Includes `"family"` or `"weekend"` | Fri 4PM-Sun 8PM co-viewing surge (62% share, 86.8% family completion, 78.4% Smart TV share). | `DP-07`, `DP-01`, `DP-02` | `content`, `personalization` |
| Default (all other queries) | Causal evaluation of `Personalized Home Ranking v2` (+8.4% CTR lift, 68.4% stable completion, +14.2% long-tail discovery). | `DP-01`, `DP-05`, `DP-02` | `experimentation`, `data_quality` |

> **Implementation Note:** In the current prototype, `server.ts` returns `result: { answer, dataMetrics, ... }` while `AppContext.tsx` inspects top-level `data.summary`. Adding a response mapper in `AppContext.tsx` (Phase 1 of `docs/roadmap.md`) binds live Gemini responses directly to the UI cards.

---

## 4. `POST /api/agent/execute` (Alias: `POST /api/agent/run`)

Executes a governed analytical planning task for one of the 4 Principal PM agents under strict evidence and human-approval constraints.

### Request Body

```json
{
  "agentName": "Episodic Retention Investigator",
  "goal": "Diagnose the 28% completion cliff in serialized sci-fi and formulate an automated retention rail proposal.",
  "tools": [
    "Customer 360",
    "Content Lineage",
    "Experimentation Hub",
    "Vertex Model Drift"
  ],
  "governance": {
    "humanApprovalRequired": true,
    "evidenceMode": "STRICT"
  }
}
```

*(Note: `prompt` is accepted as an alias for `goal`.)*

### Response - Live Gemini Mode (`200 OK`, `source: "gemini-live"`)

```json
{
  "success": true,
  "source": "gemini-live",
  "result": {
    "plan": [
      "Step 1: Query Viewing Behavior (DP-01) for subscribers stalled between episodes 3 and 5.",
      "Step 2: Inspect Content Drop-off curves for serialized sci-fi and dark drama series.",
      "Step 3: Verify ML-04 Smart Resume predictor P99 latency and drift status.",
      "Step 4: Draft feature-flag rollout proposal gated on Principal PM approval."
    ],
    "toolsUsed": [
      "Customer 360",
      "Content Lineage",
      "Vertex Model Drift"
    ],
    "dataSources": [
      "Viewing Behavior (DP-01)",
      "Content Performance (DP-06)"
    ],
    "evidence": [
      {
        "finding": "28% completion cliff occurs at minute 38 of episode 4 in Shadows of Olympus.",
        "metric": "10.4M stalled accounts",
        "confidence": 96
      }
    ],
    "analysis": "Algorithmic repetition of stalled titles at Rank #1 creates browsing friction rather than encouraging resumption.",
    "recommendation": "Activate automated 60-second episodic recap hooks on Home Screen after >7 days inactivity.",
    "auditId": "AUDIT-2026-X89",
    "status": "awaiting_human_approval"
  }
}
```

### Response - Fallback & Error Handling

- If `GEMINI_API_KEY` is missing, returns `{ "success": true, "source": "synthetic-engine" }`.
- If Gemini fails, returns `{ "success": true, "source": "synthetic-fallback", "error": "..." }` and logs the exception server-side without exposing secrets.
- `AppContext.tsx` (`runAgentTask`) returns a deterministic 4-step `AgentExecutionPlan` with `humanApprovalRequired: true` so the HITL approval flow in `AgentWorkspace.tsx` remains operational offline.

---

## 5. Production Webhook & Event Patterns (AWS Target Architecture)

In production deployment (`systdesign.md`), ContentPulse adds asynchronous event ingestion and outbound governance notifications:

- **Inbound Billing Webhook (`POST /webhooks/billing/subscription`)**: Validates Stripe/Braintree HMAC signatures, enforces Glue Schema Registry validation (`tier_code` non-null), and routes failed payloads to an S3 Dead-Letter Queue while creating a `DataQualityIncident`.
- **Outbound Governance Notification (SNS -> Slack / PagerDuty / AppConfig)**: Triggered when a Principal PM clicks **Approve & Enact Proposal** in `AgentWorkspace` or **Ship 100%** in `Experimentation`, emitting an immutable signed audit event (`auditId`, `approverId`, `timestamp`, `targetFlag`).
