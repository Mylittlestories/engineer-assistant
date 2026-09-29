type ChatMessage = {
  id?: string;
  sender: "user" | "assistant";
  text: string;
};

export type BrowserGeminiRequest = {
  apiKey: string;
  model: string;
  prompt: string;
  chatHistory?: ChatMessage[];
  selectedRecord?: any;
  manualContext?: string;
  shipProfileContext?: string;
};

const GEMINI_API_VERSION = "v1beta";

function selectedRecordContext(selectedRecord: any) {
  if (!selectedRecord) return "";

  return `
You are currently providing support on a specific marine machinery issue:
- Equipment Class: ${selectedRecord.category || "Unknown"}
- Make/Model: ${selectedRecord.makeModel || "Unknown"}
- Component: ${selectedRecord.component || "Unknown"}
- Fault Symptom: ${selectedRecord.faultSymptom || "Unknown"}
- Predefined Causes: ${(selectedRecord.possibleCauses || []).join(", ") || "Not supplied"}
- Predefined Steps: ${(selectedRecord.troubleshootingSteps || []).join(", ") || "Not supplied"}
- Predefined Safety: ${(selectedRecord.safetyPrecautions || []).join(", ") || "Not supplied"}
`;
}

function buildSystemInstruction() {
  return `You are a Chief Marine Engineer and Senior Technical Advisor holding a Class 1 Motor (Unlimited) Certificate of Competency.
You are helping a marine engineer in a ship's engine room.
Your technical instructions must be:
1. Highly professional, authentic, precise, and practical.
2. Formatted with clear markdown headers, bold keywords, and clean bullet points.
3. Heavily focused on engineering safety: LOTO, zero-energy verification, hot surfaces, stored pressure, crankcase/scavenge/fire risk, high-pressure fuel injection injury, and manufacturer's manual limits.
4. Focus only on the engineering domain. If the answer involves steps, present them as a step-by-step checklist.
5. Clearly separate immediate safety action, diagnostic logic, likely causes, tests/measurements, corrective actions, and when to stop and call superintendent/OEM.

Provide helpful advice, diagnostic reasoning, component functions, visual indicators, and corrective actions. Never invent exact torque values, clearances, or alarm limits unless the user supplies the maker/manual data; tell the user to verify against the vessel-specific manual.`;
}

function buildContents({ prompt, chatHistory, selectedRecord, manualContext: manualContextInput, shipProfileContext: shipProfileContextInput }: BrowserGeminiRequest) {
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  for (const msg of (chatHistory || []).slice(-10)) {
    if (!msg?.text || msg.id === "welcome") continue;
    contents.push({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: String(msg.text).slice(0, 8000) }]
    });
  }

  const context = selectedRecordContext(selectedRecord);
  const manualContext = manualContextInput ? `\n\nRelevant uploaded manual excerpts:\n${manualContextInput}` : "";
  const shipProfileContext = shipProfileContextInput ? `\n\nVessel profile context:\n${shipProfileContextInput}` : "";
  const userText = selectedRecord
    ? `${context}${manualContext}${shipProfileContext}\n\nUser Question/Action: ${prompt}`
    : `${manualContext}${shipProfileContext}\n\nUser Question: ${prompt}`;

  contents.push({
    role: "user",
    parts: [{ text: userText }]
  });

  return contents;
}

function extractText(data: any) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((part: any) => part?.text || "").filter(Boolean).join("\n").trim();

  if (text) return text;

  const blockReason = data?.promptFeedback?.blockReason;
  if (blockReason) {
    return `The model blocked this request (${blockReason}). Rephrase the question and avoid including sensitive personal data.`;
  }

  return "No response generated.";
}

export async function generateWithBrowserGemini(request: BrowserGeminiRequest) {
  const model = request.model || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(request.apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildSystemInstruction() }]
      },
      contents: buildContents(request),
      generationConfig: {
        temperature: 0.35
      }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || `Gemini browser request failed with HTTP ${response.status}`;
    throw new Error(message);
  }

  return extractText(data);
}
