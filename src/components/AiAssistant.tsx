import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  AlertTriangle,
  Bot,
  Cloud,
  Cpu,
  Database,
  KeyRound,
  Save,
  Send,
  Settings,
  ShieldAlert,
  Trash2,
  Wifi,
  WifiOff,
  X
} from "lucide-react";
import { generateWithBrowserGemini } from "../ai/browserGemini";
import {
  formatManualContext,
  loadManualDocuments,
  loadShipProfile,
  searchManualDocuments,
} from "../utils/shipAssistant";

interface AiAssistantProps {
  selectedRecord: any;
  onClearSelectedRecord: () => void;
  language: "EN" | "GR";
  offlineRecords: any[];
}

type ChatMessage = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
};

type ApiStatus = {
  available: boolean | null;
  configured: boolean;
  keyPreview?: string;
  model?: string;
  configPath?: string;
  envKeyActive?: boolean;
};

const DEFAULT_MODEL = "gemini-2.5-flash";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const BROWSER_AI_KEY_STORAGE_KEY = "engineer_browser_gemini_api_key";
const BROWSER_AI_MODEL_STORAGE_KEY = "engineer_browser_gemini_model";

function apiUrl(path: string) {
  const cleanPath = path.replace(/^\//, "");
  return API_BASE_URL ? `${API_BASE_URL}/${cleanPath}` : cleanPath;
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function loadStoredValue(key: string, fallback = "") {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function saveStoredValue(key: string, value: string) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    // Ignore storage failures; AI falls back to offline database mode.
  }
}

function maskKey(key: string) {
  if (!key) return "";
  if (key.length <= 10) return "••••••••";
  return `${key.slice(0, 5)}…${key.slice(-4)}`;
}

function getSearchText(record: any) {
  return [
    record?.category,
    record?.makeModel,
    record?.component,
    record?.faultSymptom,
    ...(record?.possibleCauses || []),
    ...(record?.troubleshootingSteps || []),
    ...(record?.safetyPrecautions || [])
  ].filter(Boolean).join(" ").toLowerCase();
}

function scoreRecord(record: any, prompt: string) {
  const haystack = getSearchText(record);
  const words = prompt
    .toLowerCase()
    .split(/[^a-z0-9°.-]+/i)
    .map(word => word.trim())
    .filter(word => word.length > 2);

  if (!words.length) return 0;

  return words.reduce((score, word) => {
    if (haystack.includes(word)) return score + Math.min(4, word.length / 3);
    return score;
  }, 0);
}

function bulletList(items: string[] = [], fallback: string) {
  const usable = items.filter(Boolean).slice(0, 6);
  if (!usable.length) return `- ${fallback}`;
  return usable.map(item => `- ${item}`).join("\n");
}

function buildOfflineAdvice(prompt: string, selectedRecord: any, offlineRecords: any[], reason?: string) {
  const ranked = offlineRecords
    .map(record => ({ record, score: selectedRecord?.id === record.id ? Number.MAX_SAFE_INTEGER : scoreRecord(record, prompt) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const primary = selectedRecord || ranked[0]?.record;
  const related = ranked
    .filter(item => item.record?.id !== primary?.id)
    .slice(0, 3)
    .map(item => item.record);

  const reasonText = reason ? `\n\n**AI connection note:** ${reason}` : "";

  if (!primary) {
    return `### Offline advisor mode${reasonText}\n\nI am using the onboard database only. I could not find a close record for: **${prompt}**.\n\n#### Immediate safe approach\n- Stop and make the equipment safe before touching guards, covers, drains, filters, or electrical cabinets.\n- Apply LOTO, verify zero energy, and confirm pressure/temperature has decayed.\n- Check the local maker manual for exact alarm limits, clearances, torque values, and reset procedure.\n- Use the search box with the equipment name, component, alarm text, or symptom.\n\n#### Good search examples\n- \"scavenge fire\"\n- \"servo oil low pressure\"\n- \"generator hunting frequency\"\n- \"oil mist detector alarm\"`;
  }

  return `### Offline advisor mode${reasonText}\n\nI matched your question against the onboard troubleshooting database. Use this as a shipboard checklist and always verify maker-specific limits in the vessel manual.\n\n**Matched equipment:** ${primary.category || "Marine machinery"}\n**Make / model:** ${primary.makeModel || "Not specified"}\n**Component:** ${primary.component || "Not specified"}\n**Symptom:** ${primary.faultSymptom || prompt}\n\n#### Immediate safety actions\n${bulletList(primary.safetyPrecautions, "Apply LOTO, verify zero energy, and wait for hot or pressurized parts to cool/depressurize before inspection.")}\n\n#### Likely causes to check\n${bulletList(primary.possibleCauses, "Compare actual readings against trend history and maker limits.")}\n\n#### Step-by-step checks\n${bulletList(primary.troubleshootingSteps, "Start with visual checks, confirm sensor readings locally, then isolate one cause at a time.")}\n\n${related.length ? `#### Related database matches\n${related.map(record => `- **${record.component}** — ${record.faultSymptom}`).join("\n")}\n\n` : ""}#### When to stop\n- Stop work and escalate to the Chief Engineer, superintendent, or OEM if readings are outside safe limits, if a crankcase/scavenge/fire risk exists, or if high-pressure fuel/hydraulic leakage is suspected.`;
}

export default function AiAssistant({ selectedRecord, onClearSelectedRecord, language, offlineRecords }: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello. I'm your Chief Engineer AI. On GitHub Pages I can use Browser Gemini with your own API key, or I can work offline from the built-in troubleshooting database.",
      timestamp: nowTime()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ available: null, configured: false, model: DEFAULT_MODEL });
  const [showSettings, setShowSettings] = useState(false);
  const [desktopApiKeyInput, setDesktopApiKeyInput] = useState("");
  const [browserApiKey, setBrowserApiKey] = useState(() => loadStoredValue(BROWSER_AI_KEY_STORAGE_KEY));
  const [browserApiKeyInput, setBrowserApiKeyInput] = useState("");
  const [settingsModel, setSettingsModel] = useState(() => loadStoredValue(BROWSER_AI_MODEL_STORAGE_KEY, DEFAULT_MODEL));
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const browserAiConfigured = Boolean(browserApiKey);
  const placeholder = language === "GR" ? "Ρωτήστε για βλάβη, συναγερμό ή διαδικασία..." : "Ask about a fault, alarm, component, or procedure...";

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2500);

    fetch(apiUrl("/api/settings/status"), { signal: controller.signal })
      .then(async res => {
        if (!res.ok) throw new Error(`Status endpoint returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!active) return;
        setApiStatus({
          available: true,
          configured: Boolean(data.configured),
          keyPreview: data.keyPreview,
          model: data.model || DEFAULT_MODEL,
          configPath: data.configPath,
          envKeyActive: Boolean(data.envKeyActive)
        });
        if (!browserAiConfigured) setSettingsModel(data.model || DEFAULT_MODEL);
      })
      .catch(() => {
        if (!active) return;
        setApiStatus({ available: false, configured: false, model: DEFAULT_MODEL });
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [browserAiConfigured]);

  useEffect(() => {
    if (selectedRecord) {
      const msg: ChatMessage = {
        id: `focus-${Date.now()}`,
        sender: "assistant",
        text: `Focused on **${selectedRecord.component}**. Ask for causes, safety checks, test sequence, or corrective actions.`,
        timestamp: nowTime()
      };
      setMessages(prev => [...prev, msg]);
    }
  }, [selectedRecord]);

  const saveDesktopSettings = async () => {
    if (!apiStatus.available) return;
    setSettingsSaving(true);
    setSettingsMessage("");

    try {
      const res = await fetch(apiUrl("/api/settings/api-key"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: desktopApiKeyInput, model: settingsModel || DEFAULT_MODEL })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Settings endpoint returned ${res.status}`);
      setApiStatus({
        available: true,
        configured: Boolean(data.configured),
        keyPreview: data.keyPreview,
        model: data.model || settingsModel || DEFAULT_MODEL,
        configPath: apiStatus.configPath,
        envKeyActive: false
      });
      setDesktopApiKeyInput("");
      setSettingsMessage("Desktop/server key saved. The local backend will answer through Gemini.");
    } catch (error: any) {
      setSettingsMessage(error?.message || "Could not save desktop/server settings.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const saveBrowserSettings = () => {
    const keyToSave = browserApiKeyInput.trim() || browserApiKey;
    const modelToSave = (settingsModel || DEFAULT_MODEL).trim();

    if (!keyToSave || keyToSave.length < 20) {
      setSettingsMessage("Paste a valid Gemini API key first.");
      return;
    }

    setBrowserApiKey(keyToSave);
    saveStoredValue(BROWSER_AI_KEY_STORAGE_KEY, keyToSave);
    saveStoredValue(BROWSER_AI_MODEL_STORAGE_KEY, modelToSave);
    setSettingsModel(modelToSave);
    setBrowserApiKeyInput("");
    setSettingsMessage("Browser Gemini saved for this browser. It will work on GitHub Pages without a Node backend.");
  };

  const clearBrowserSettings = () => {
    setBrowserApiKey("");
    setBrowserApiKeyInput("");
    saveStoredValue(BROWSER_AI_KEY_STORAGE_KEY, "");
    setSettingsMessage("Browser Gemini key removed from this browser.");
  };

  const buildAiContext = (prompt: string) => {
    const manualSnippets = searchManualDocuments(prompt, loadManualDocuments(), 4);
    const manualContext = formatManualContext(manualSnippets);
    const profile = loadShipProfile();
    const shipProfileContext = Object.entries(profile)
      .filter(([, value]) => String(value || "").trim())
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    return { manualContext, shipProfileContext };
  };

  const callServerAi = async (prompt: string) => {
    const { manualContext, shipProfileContext } = buildAiContext(prompt);
    const res = await fetch(apiUrl("/api/troubleshoot"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        selectedRecord,
        chatHistory: messages.slice(-8),
        manualContext,
        shipProfileContext
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `AI endpoint returned ${res.status}`);
    return data.text || "I couldn't generate a response.";
  };

  const callBrowserAi = async (prompt: string) => {
    const { manualContext, shipProfileContext } = buildAiContext(prompt);
    return generateWithBrowserGemini({
      apiKey: browserApiKey,
      model: settingsModel || DEFAULT_MODEL,
      prompt,
      selectedRecord,
      chatHistory: messages.slice(-8),
      manualContext,
      shipProfileContext
    });
  };

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt,
      timestamp: nowTime()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let responseText = "";
    let connectionError = "";

    try {
      if (apiStatus.available && apiStatus.configured) {
        responseText = await callServerAi(prompt);
      } else if (browserAiConfigured) {
        responseText = await callBrowserAi(prompt);
      } else {
        throw new Error("No Gemini key is configured. Open AI Settings to enable Browser Gemini on GitHub Pages.");
      }
    } catch (error: any) {
      connectionError = error?.message || "Live AI is unavailable.";

      if (apiStatus.available && apiStatus.configured && browserAiConfigured) {
        try {
          responseText = await callBrowserAi(prompt);
          connectionError = "";
        } catch (browserError: any) {
          connectionError = browserError?.message || connectionError;
        }
      }
    }

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: "assistant",
      text: responseText || buildOfflineAdvice(prompt, selectedRecord, offlineRecords, connectionError),
      timestamp: nowTime()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      sender: "assistant",
      text: "Chat cleared. How can I help you?",
      timestamp: nowTime()
    }]);
    onClearSelectedRecord();
  };

  const statusLabel = apiStatus.available && apiStatus.configured
    ? "Desktop Gemini"
    : browserAiConfigured
      ? "Browser Gemini"
      : apiStatus.available
        ? "Key needed"
        : "Offline database";

  const statusClass = apiStatus.available && apiStatus.configured
    ? "bg-emerald-950/70 text-emerald-300 border-emerald-800"
    : browserAiConfigured
      ? "bg-cyan-950/70 text-cyan-200 border-cyan-800"
      : apiStatus.available
        ? "bg-amber-950/70 text-amber-300 border-amber-800"
        : "bg-slate-900 text-slate-300 border-slate-700";

  const StatusIcon = apiStatus.available && apiStatus.configured ? Wifi : browserAiConfigured ? Cloud : apiStatus.available ? KeyRound : WifiOff;

  return (
    <div className="relative flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-[#0b1424] gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Bot className="w-5 h-5 text-[#22d3ee] shrink-0" />
          <span className="font-medium truncate">Chief Engineer AI</span>
          <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] uppercase tracking-wide ${statusClass}`}>
            <StatusIcon className="w-3 h-3" />
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowSettings(true)} className="p-1.5 hover:bg-[#11223b] rounded-xl" title="AI settings">
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={clearChat} className="p-1.5 hover:bg-[#11223b] rounded-xl" title="Clear chat">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {selectedRecord && (
        <div className="px-4 py-2 bg-cyan-950/25 border-b border-cyan-900/40 text-xs text-cyan-100 flex items-center justify-between gap-2">
          <span className="truncate"><Database className="w-3.5 h-3.5 inline mr-1" /> Focus: {selectedRecord.component} — {selectedRecord.faultSymptom}</span>
          <button onClick={onClearSelectedRecord} className="text-cyan-300 hover:text-white shrink-0">Clear</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : ""}`}>
            <div className={`max-w-[90%] px-4 py-3 rounded-2xl shadow-sm ${msg.sender === "user" ? "bg-[#22d3ee] text-[#0a111f]" : "bg-[#11223b] text-slate-100"}`}>
              <div className="markdown-body">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              <div className={`text-[10px] mt-2 ${msg.sender === "user" ? "text-slate-700" : "text-slate-500"}`}>{msg.timestamp}</div>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-slate-400 flex items-center gap-2"><Bot className="w-4 h-4 animate-pulse" /> Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700 bg-[#0b1424]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={placeholder}
            className="flex-1 bg-[#11223b] border border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#22d3ee]"
            disabled={isLoading}
          />
          <button onClick={sendMessage} disabled={!input.trim() || isLoading} className="px-5 bg-[#22d3ee] text-[#0a111f] rounded-2xl disabled:opacity-50" title="Send">
            <Send className="w-4 h-4" />
          </button>
        </div>
        {!browserAiConfigured && !(apiStatus.available && apiStatus.configured) && (
          <p className="mt-2 text-[11px] text-slate-500">
            GitHub Pages ready: open AI Settings and save your own Gemini key, or continue with offline database guidance.
          </p>
        )}
      </div>

      {showSettings && (
        <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#071524] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold"><Settings className="w-4 h-4 text-[#22d3ee]" /> AI Settings</div>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-xl hover:bg-[#11223b]"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4 text-sm max-h-[78vh] overflow-y-auto">
              <div className={`rounded-2xl border p-3 ${statusClass}`}>
                <div className="font-semibold flex items-center gap-2"><StatusIcon className="w-4 h-4" /> {statusLabel}</div>
                <p className="text-xs mt-1 opacity-90">
                  {apiStatus.available && apiStatus.configured
                    ? `Desktop/server Gemini is configured${apiStatus.keyPreview ? ` (${apiStatus.keyPreview})` : ""}.`
                    : browserAiConfigured
                      ? `Static GitHub Pages mode is ready with Browser Gemini (${maskKey(browserApiKey)}) using ${settingsModel || DEFAULT_MODEL}.`
                      : "No live AI key is configured yet. The app will answer from its offline database."}
                </p>
              </div>

              <section className="rounded-2xl border border-cyan-800/60 bg-cyan-950/20 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Cloud className="w-5 h-5 text-cyan-300 mt-0.5" />
                  <div>
                    <div className="font-semibold text-cyan-100">GitHub Pages AI: Browser Gemini</div>
                    <p className="text-xs text-cyan-100/75 leading-relaxed mt-1">
                      Works on static hosting because requests are sent directly from the browser to Gemini. Your key is saved only in this browser, never committed to the repo.
                    </p>
                  </div>
                </div>
                <label className="block">
                  <span className="text-xs text-slate-400">Gemini API key for this browser</span>
                  <input
                    type="password"
                    value={browserApiKeyInput}
                    onChange={(event) => setBrowserApiKeyInput(event.target.value)}
                    placeholder={browserAiConfigured ? `Saved: ${maskKey(browserApiKey)}` : "Paste Google AI Studio API key"}
                    className="mt-1 w-full bg-[#11223b] border border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#22d3ee]"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400">Gemini model</span>
                  <input
                    type="text"
                    value={settingsModel}
                    onChange={(event) => setSettingsModel(event.target.value)}
                    placeholder={DEFAULT_MODEL}
                    className="mt-1 w-full bg-[#11223b] border border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#22d3ee]"
                  />
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={saveBrowserSettings}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#22d3ee] text-[#0a111f] rounded-2xl font-semibold"
                  >
                    <Save className="w-4 h-4" /> Save Browser Gemini
                  </button>
                  {browserAiConfigured && (
                    <button onClick={clearBrowserSettings} className="px-4 py-3 rounded-2xl border border-slate-700 hover:bg-[#11223b]">
                      Remove key
                    </button>
                  )}
                </div>
                <div className="rounded-xl border border-amber-700/50 bg-amber-950/25 p-3 text-xs text-amber-100/85 flex gap-2 leading-relaxed">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>For public apps, restrict this key in Google Cloud by HTTP referrer and monitor quota. For production without a browser-visible key, use the desktop/server backend or Firebase AI Logic.</span>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-700 bg-[#0b1424] p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-emerald-300 mt-0.5" />
                  <div>
                    <div className="font-semibold">Desktop/server Gemini</div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      Best for the desktop app or a private server. The key is stored outside the browser and API calls go through the local Node backend.
                    </p>
                  </div>
                </div>
                {apiStatus.available ? (
                  <>
                    <label className="block">
                      <span className="text-xs text-slate-400">Backend Gemini API key</span>
                      <input
                        type="password"
                        value={desktopApiKeyInput}
                        onChange={(event) => setDesktopApiKeyInput(event.target.value)}
                        placeholder="Paste key for desktop/server backend"
                        className="mt-1 w-full bg-[#11223b] border border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#22d3ee]"
                      />
                    </label>
                    {apiStatus.envKeyActive && (
                      <p className="text-xs text-amber-300">An environment variable key is active and takes priority over saved settings.</p>
                    )}
                    {apiStatus.configPath && (
                      <p className="text-[11px] text-slate-500 break-all">Settings file: {apiStatus.configPath}</p>
                    )}
                    <button
                      onClick={saveDesktopSettings}
                      disabled={!desktopApiKeyInput.trim() || settingsSaving}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-400 text-emerald-950 rounded-2xl font-semibold disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" /> {settingsSaving ? "Saving..." : "Save backend key"}
                    </button>
                  </>
                ) : (
                  <div className="rounded-xl border border-slate-700 bg-[#11223b] p-3 text-xs text-slate-300 leading-relaxed">
                    No backend is detected, which is normal on GitHub Pages. Use Browser Gemini above for static hosting.
                  </div>
                )}
              </section>

              {settingsMessage && <p className="text-xs text-slate-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-[#22d3ee]" /> {settingsMessage}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
