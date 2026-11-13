import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API health and configuration check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Lazy-initialized GoogleGenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// AI Insights endpoint (supports /api/insights/query and /api/ai/insights)
const handleInsightsQuery = async (req: express.Request, res: express.Response) => {
  const { query, timeRange, segmentFilter } = req.body;
  const ai = getGenAI();

  if (!ai) {
    return res.json({
      success: true,
      source: "synthetic-engine",
      message: "Generated using ContentPulse deterministic intelligence engine.",
    });
  }

  try {
    const prompt = `You are the AI Executive Intelligence engine for ContentPulse, an enterprise streaming content intelligence and personalization platform for a major streaming service.
The user asked: "${query}"
Context: Active Time Range: ${timeRange || "Last 30 Days"}, Active Segment: ${segmentFilter || "All Subscribers"}.
Provide a structured analysis in JSON with these exact fields:
- answer: string (concise executive answer, 2-3 sentences)
- dataMetrics: array of { label: string, value: string, delta: string, status: "positive" | "negative" | "neutral" }
- dataProductsUsed: array of string (e.g. ["Viewing Behavior", "Content Performance", "Recommendation Features"])
- evidence: string (supporting empirical evidence from streaming telemetry)
- confidenceScore: number between 85 and 99
- recommendedAction: string (actionable strategic decision for the product/content team)

Only respond with raw valid JSON without markdown wrapping.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(cleaned);
    res.json({ success: true, source: "gemini-live", result: parsed });
  } catch (err: any) {
    console.error("Gemini API query error:", err);
    res.json({
      success: true,
      source: "synthetic-fallback",
      error: err.message,
    });
  }
};

app.post("/api/insights/query", handleInsightsQuery);
app.post("/api/ai/insights", handleInsightsQuery);

// Agent Workspace execution endpoint (supports /api/agent/execute and /api/agent/run)
const handleAgentExecute = async (req: express.Request, res: express.Response) => {
  const { goal, prompt: userPrompt, agentName, tools, governance } = req.body;
  const taskObjective = goal || userPrompt || "Analyze streaming telemetry drivers";
  const ai = getGenAI();

  if (!ai) {
    return res.json({
      success: true,
      source: "synthetic-engine",
    });
  }

  try {
    const prompt = `You are an enterprise AI Agent (${agentName || "Specialized PM Agent"}) in ContentPulse executing a governed analytical task: "${taskObjective}".
Allowed tools: ${(tools || ["Customer 360", "Content Lineage", "Experimentation Hub", "Vertex Model Drift"]).join(", ")}.
Governance restrictions: Human approval required for mutations, Evidence requirement: STRICT, Data minimization: ACTIVE.

Return raw valid JSON with:
- plan: array of 4 sequential steps describing what the agent will do
- toolsUsed: array of tools selected
- dataSources: array of datasets referenced
- evidence: array of { finding: string, metric: string, confidence: number }
- analysis: string (strategic diagnosis)
- recommendation: string (executable decision with projected ROI/retention impact)
- auditId: string (e.g. "AUDIT-2026-X89")
- status: "awaiting_human_approval"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(cleaned);
    res.json({ success: true, source: "gemini-live", result: parsed });
  } catch (err: any) {
    console.error("Gemini API agent error:", err);
    res.json({
      success: true,
      source: "synthetic-fallback",
      error: err.message,
    });
  }
};

app.post("/api/agent/execute", handleAgentExecute);
app.post("/api/agent/run", handleAgentExecute);

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ContentPulse server running on http://0.0.0.0:${PORT}`);
  });
}

start();
