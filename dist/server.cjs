var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
import_dotenv.default.config();
var aiInstance = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please configure it in your Secrets / Settings panel.");
    }
    aiInstance = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiInstance;
}
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  const PORT = 3e3;
  app.post("/api/troubleshoot", async (req, res) => {
    try {
      const { prompt, chatHistory, selectedRecord } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }
      let aiClient;
      try {
        aiClient = getAI();
      } catch (keyError) {
        return res.json({
          text: `### \u26A0\uFE0F API Key Unconfigured

I can see you're attempting to use the **AI Troubleshooting Assistant**, but the **GEMINI_API_KEY** secret is currently missing or unconfigured.

To use the AI feature:
1. Open the **Secrets / Settings** panel in Google AI Studio.
2. Add the variable \`GEMINI_API_KEY\` with a valid API key value from your developer account.

**Meanwhile, you can still use the extensive offline database and download/export Excel troubleshooting guides completely offline by browsing the tabs above!**`
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
- Predefined Causes: ${selectedRecord.possibleCauses.join(", ")}
- Predefined Steps: ${selectedRecord.troubleshootingSteps.join(", ")}
- Predefined Safety: ${selectedRecord.safetyPrecautions.join(", ")}
`;
      }
      const systemInstruction = `You are a Chief Marine Engineer and Senior Technical Advisor holding a Class 1 Motor (Unlimited) Certificate of Competency.
You are helping a marine engineer in a ship's engine room. 
Your technical instructions must be:
1. Highly professional, authentic, precise, and practical.
2. Formatted with clear markdown headers, bold keywords, and clean bullet points.
3. Heavily focused on engineering safety. Always emphasize warnings such as "Wait 30 minutes for cooling to avoid crankcase explosion", "Close scavenge air cooler drains", "Verify zero energy state (LOTO) before turning engine on gear", or "Beware of fuel injection pressure under skin".
4. Focus only on the engineering domain (avoid fluff/unrelated discussions). If the answer involves steps, present them clearly as a step-by-step checklist.

Provide helpful advice. Expand upon the user's questions, providing diagnostic logic, component functions, visual indicators, and corrective actions.`;
      const contents = [];
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const msg of chatHistory) {
          contents.push({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        }
      }
      const fullPrompt = selectedRecord ? `${databaseContext}

User Question/Action: ${prompt}` : `User Question: ${prompt}`;
      contents.push({
        role: "user",
        parts: [{ text: fullPrompt }]
      });
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      const textOutput = response.text || "No response generated.";
      return res.json({ text: textOutput });
    } catch (error) {
      console.error("Gemini API error:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  const isCompiled = typeof process.pkg !== "undefined";
  const isDev = process.env.NODE_ENV !== "production" && !isCompiled;
  if (isDev) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    let distPath = import_path.default.join(process.cwd(), "dist");
    try {
      if (isCompiled || typeof __dirname !== "undefined" && (__dirname.includes("snapshot") || __dirname.includes("pkg"))) {
        distPath = __dirname;
      }
    } catch (e) {
    }
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Marine Engine server booted successfully on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
