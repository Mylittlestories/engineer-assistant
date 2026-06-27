import express, { type Express } from "express";
import path from "path";
import fs from "fs";
import os from "os";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import type { Server } from "http";

// Load both standard Node .env and Vite/AI-Studio style .env.local files.
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

type RuntimeConfig = {
  geminiApiKey?: string;
  aiModel?: string;
};

type StartServerOptions = {
  port?: number;
  host?: string;
};

const DEFAULT_MODEL = "gemini-2.5-flash";
let aiInstance: GoogleGenAI | null = null;
let aiInstanceKeyFingerprint = "";

function getConfigDir() {
  return process.env.APP_CONFIG_DIR || path.join(os.homedir(), ".engineer-assistant");
}

function getConfigPath() {
  return path.join(getConfigDir(), "config.json");
}

function readRuntimeConfig(): RuntimeConfig {
  try {
    const raw = fs.readFileSync(getConfigPath(), "utf8");
    return JSON.parse(raw) as RuntimeConfig;
  } catch {
    return {};
  }
}

function writeRuntimeConfig(config: RuntimeConfig) {
  const configDir = getConfigDir();
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), { mode: 0o600 });
}

function resolveApiKey() {
  return process.env.GEMINI_API_KEY || readRuntimeConfig().geminiApiKey || "";
}

function resolveModel() {
  return process.env.GEMINI_MODEL || process.env.AI_MODEL || readRuntimeConfig().aiModel || DEFAULT_MODEL;
}

function maskKey(key: string) {
  if (!key) return "";
  if (key.length <= 8) return "********";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

// Lazily initialized Gemini SDK client to prevent startup crashes when API keys are missing.
function getAI() {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Open AI Settings and save your Gemini API key, or set GEMINI_API_KEY in .env.");
  }

  const fingerprint = `${apiKey.slice(0, 8)}:${apiKey.length}`;
  if (!aiInstance || aiInstanceKeyFingerprint !== fingerprint) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "engineer-assistant-desktop",
        },
      },
    });
    aiInstanceKeyFingerprint = fingerprint;
  }
  return aiInstance;
}

function getStaticDistPath(isCompiled: boolean) {
  if (process.env.STATIC_DIR) {
    return process.env.STATIC_DIR;
  }

  if (isCompiled) {
    return __dirname;
  }

  // server.cjs is emitted into dist/. When running `node dist/server.cjs`, __dirname is dist.
  if (typeof __dirname !== "undefined" && fs.existsSync(path.join(__dirname, "index.html"))) {
    return __dirname;
  }

  return path.join(process.cwd(), "dist");
}

export async function createApp(): Promise<Express> {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, app: "Engineer Assistant", model: resolveModel(), aiConfigured: Boolean(resolveApiKey()) });
  });

  app.get("/api/settings/status", (_req, res) => {
    const apiKey = resolveApiKey();
    res.json({
      configured: Boolean(apiKey),
      keyPreview: maskKey(apiKey),
      model: resolveModel(),
      configPath: getConfigPath(),
      envKeyActive: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.post("/api/settings/api-key", (req, res) => {
    const { apiKey, model } = req.body || {};
    const trimmedKey = typeof apiKey === "string" ? apiKey.trim() : "";
    const trimmedModel = typeof model === "string" && model.trim() ? model.trim() : DEFAULT_MODEL;

    if (!trimmedKey || trimmedKey.length < 20) {
      return res.status(400).json({ error: "A valid Gemini API key is required." });
    }

    const currentConfig = readRuntimeConfig();
    writeRuntimeConfig({ ...currentConfig, geminiApiKey: trimmedKey, aiModel: trimmedModel });
    aiInstance = null;
    aiInstanceKeyFingerprint = "";
    return res.json({ ok: true, configured: true, keyPreview: maskKey(trimmedKey), model: trimmedModel });
  });

  // AI Troubleshooting endpoint
  app.post("/api/troubleshoot", async (req, res) => {
    try {
      const { prompt, chatHistory, selectedRecord } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required." });
      }

      let aiClient: GoogleGenAI;
      try {
        aiClient = getAI();
      } catch (keyError: any) {
        return res.json({
          text: `### ⚠️ AI Key Not Configured\n\nThe online AI assistant is installed correctly, but it needs a **Gemini API key** before it can answer live engineering questions.\n\n**How to enable it:**\n1. Click **AI Settings** in this assistant.\n2. Paste your Gemini API key.\n3. Save and ask the question again.\n\nYou can also set \`GEMINI_API_KEY\` in a local \`.env\` file. Offline calculators, fault tables, saved lessons, and exports continue to work without internet.`
        });
      }

      let databaseContext = "";
      if (selectedRecord) {
        databaseContext = `
You are currently providing support on a specific marine machinery issue:
- Equipment Class: ${selectedRecord.category}
- Make/Model: ${selectedRecord.makeModel}
- Component: ${selectedRecord.component}
- Fault Symptom: ${selectedRecord.faultSymptom}
- Predefined Causes: ${selectedRecord.possibleCauses?.join(", ")}
- Predefined Steps: ${selectedRecord.troubleshootingSteps?.join(", ")}
- Predefined Safety: ${selectedRecord.safetyPrecautions?.join(", ")}
`;
      }

      const systemInstruction = `You are a Chief Marine Engineer and Senior Technical Advisor holding a Class 1 Motor (Unlimited) Certificate of Competency.
You are helping a marine engineer in a ship's engine room.
Your technical instructions must be:
1. Highly professional, authentic, precise, and practical.
2. Formatted with clear markdown headers, bold keywords, and clean bullet points.
3. Heavily focused on engineering safety: LOTO, zero-energy verification, hot surfaces, stored pressure, crankcase/scavenge/fire risk, high-pressure fuel injection injury, and manufacturer's manual limits.
4. Focus only on the engineering domain. If the answer involves steps, present them as a step-by-step checklist.
5. Clearly separate immediate safety action, diagnostic logic, likely causes, tests/measurements, corrective actions, and when to stop and call superintendent/OEM.

Provide helpful advice, diagnostic reasoning, component functions, visual indicators, and corrective actions. Never invent exact torque values, clearances, or alarm limits unless the user supplies the maker/manual data; tell the user to verify against the vessel-specific manual.`;

      const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

      if (chatHistory && Array.isArray(chatHistory)) {
        for (const msg of chatHistory.slice(-16)) {
          if (!msg?.text || msg.id === "welcome") continue;
          contents.push({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: String(msg.text).slice(0, 8000) }]
          });
        }
      }

      const fullPrompt = selectedRecord
        ? `${databaseContext}\n\nUser Question/Action: ${prompt}`
        : `User Question: ${prompt}`;

      contents.push({ role: "user", parts: [{ text: fullPrompt }] });

      const response = await aiClient.models.generateContent({
        model: resolveModel(),
        contents,
        config: {
          systemInstruction,
          temperature: 0.35,
        }
      });

      const textOutput = response.text || "No response generated.";
      return res.json({ text: textOutput });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  const isCompiled = typeof (process as any).pkg !== "undefined";
  const isDev = process.env.NODE_ENV !== "production" && !isCompiled;

  if (isDev) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = getStaticDistPath(isCompiled);
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

export async function startServer(options: StartServerOptions = {}): Promise<{ server: Server; port: number; host: string }> {
  const app = await createApp();
  const port = options.port ?? Number(process.env.PORT || 3000);
  const host = options.host || process.env.HOST || "0.0.0.0";

  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      const address = server.address();
      const resolvedPort = typeof address === "object" && address ? address.port : port;
      console.log(`Engineer Assistant server ready at http://${host}:${resolvedPort}`);
      resolve({ server, port: resolvedPort, host });
    });
    server.on("error", reject);
  });
}

const invokedFile = process.argv[1] ? path.basename(process.argv[1]) : "";
if (process.env.START_SERVER === "true" || /^server\.(cjs|js|ts)$/.test(invokedFile)) {
  startServer().catch((error) => {
    console.error("Failed to start Engineer Assistant:", error);
    process.exit(1);
  });
}
