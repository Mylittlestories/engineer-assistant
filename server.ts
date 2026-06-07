import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Lazily initialized Gemini SDK client to prevent startup crashes when API keys are missing
let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please configure it in your Secrets / Settings panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // AI Troubleshooting endpoint
  app.post("/api/troubleshoot", async (req, res) => {
    try {
      const { prompt, chatHistory, selectedRecord } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      let aiClient;
      try {
        aiClient = getAI();
      } catch (keyError: any) {
        // Return a helper response to guide users on how to configure the API key
        return res.json({
          text: `### ⚠️ API Key Unconfigured\n\nI can see you're attempting to use the **AI Troubleshooting Assistant**, but the **GEMINI_API_KEY** secret is currently missing or unconfigured.\n\nTo use the AI feature:\n1. Open the **Secrets / Settings** panel in Google AI Studio.\n2. Add the variable \`GEMINI_API_KEY\` with a valid API key value from your developer account.\n\n**Meanwhile, you can still use the extensive offline database and download/export Excel troubleshooting guides completely offline by browsing the tabs above!**`
        });
      }

      // Prepare context from our offshore database if available
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

      // Convert conversation history into system content structure
      const systemInstruction = `You are a Chief Marine Engineer and Senior Technical Advisor holding a Class 1 Motor (Unlimited) Certificate of Competency.
You are helping a marine engineer in a ship's engine room. 
Your technical instructions must be:
1. Highly professional, authentic, precise, and practical.
2. Formatted with clear markdown headers, bold keywords, and clean bullet points.
3. Heavily focused on engineering safety. Always emphasize warnings such as "Wait 30 minutes for cooling to avoid crankcase explosion", "Close scavenge air cooler drains", "Verify zero energy state (LOTO) before turning engine on gear", or "Beware of fuel injection pressure under skin".
4. Focus only on the engineering domain (avoid fluff/unrelated discussions). If the answer involves steps, present them clearly as a step-by-step checklist.

Provide helpful advice. Expand upon the user's questions, providing diagnostic logic, component functions, visual indicators, and corrective actions.`;

      // Build messages array
      const contents = [];
      
      // Inject history
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const msg of chatHistory) {
          contents.push({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        }
      }

      // Add actual prompt with context
      const fullPrompt = selectedRecord 
        ? `${databaseContext}\n\nUser Question/Action: ${prompt}`
        : `User Question: ${prompt}`;

      contents.push({
        role: "user",
        parts: [{ text: fullPrompt }]
      });

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const textOutput = response.text || "No response generated.";
      return res.json({ text: textOutput });

    } catch (error: any) {
      console.error("Gemini API error:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // In development mode, we want Vite. In the compiled standalone executable, process.pkg is defined, meaning we are always offline production.
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
    // Elegant fallback to support both standard execution and single-file packaged binaries (pkg snapshot)
    let distPath = path.join(process.cwd(), "dist");
    
    try {
      // In bundled executables, __dirname represents the folder of the running script inside the package snapshot.
      // Since esbuild compiles server.ts to dist/server.cjs, __dirname corresponds exactly to the dist/ folder.
      if (isCompiled || (typeof __dirname !== "undefined" && (__dirname.includes("snapshot") || __dirname.includes("pkg")))) {
        distPath = __dirname;
      }
    } catch (e) {
      // Safeguard fallback if __dirname is un-instantiated at runtime
    }

    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Marine Engine server booted successfully on port ${PORT}`);
  });
}

startServer();
