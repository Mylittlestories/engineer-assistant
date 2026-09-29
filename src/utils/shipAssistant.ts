export type ManualDocument = {
  id: string;
  title: string;
  source: string;
  content: string;
  addedAt: string;
};

export type ManualSnippet = {
  documentId: string;
  title: string;
  source: string;
  excerpt: string;
  score: number;
};

export type ShipProfile = {
  vesselName: string;
  imo: string;
  mainEngine: string;
  auxEngines: string;
  boilers: string;
  purifiers: string;
  compressors: string;
  steeringGear: string;
  bwts: string;
  ows: string;
  notes: string;
};

export type EngineeringCalculation = {
  value: number;
  unit: string;
  label: string;
};

export const MANUAL_STORAGE_KEY = "engineer_manual_vault_documents";
export const SHIP_PROFILE_STORAGE_KEY = "engineer_ship_profile";

export const DEFAULT_SHIP_PROFILE: ShipProfile = {
  vesselName: "",
  imo: "",
  mainEngine: "",
  auxEngines: "",
  boilers: "",
  purifiers: "",
  compressors: "",
  steeringGear: "",
  bwts: "",
  ows: "",
  notes: ""
};

export function safeNumber(value: string | number, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function calculateFuelMtDay(kgPerHour: number) {
  return round((kgPerHour * 24) / 1000, 3);
}

export function calculateSfoc(fuelKgPerHour: number, powerKw: number) {
  if (powerKw <= 0) return 0;
  return round((fuelKgPerHour * 1000) / powerKw, 2);
}

export function calculateTransferTimeHours(volumeM3: number, pumpRateM3Hour: number) {
  if (pumpRateM3Hour <= 0) return 0;
  return round(volumeM3 / pumpRateM3Hour, 2);
}

export function calculateGeneratorLoadPercent(loadKw: number, ratedKw: number) {
  if (ratedKw <= 0) return 0;
  return round((loadKw / ratedKw) * 100, 1);
}

export function calculateEngineSlipPercent(theoreticalSpeedKnots: number, actualSpeedKnots: number) {
  if (theoreticalSpeedKnots <= 0) return 0;
  return round(((theoreticalSpeedKnots - actualSpeedKnots) / theoreticalSpeedKnots) * 100, 2);
}

export function calculatePumpFlowM3Hour(volumeM3: number, minutes: number) {
  if (minutes <= 0) return 0;
  return round((volumeM3 / minutes) * 60, 2);
}

export function calculateChemicalDoseLiters(volumeM3: number, ppmDose: number, chemicalStrengthPercent = 100) {
  if (chemicalStrengthPercent <= 0) return 0;
  // Approximation: ppm mg/L over m3 water; assumes density near water and liquid chemical strength percent.
  const activeKg = (volumeM3 * 1000 * ppmDose) / 1_000_000;
  return round(activeKg / (chemicalStrengthPercent / 100), 3);
}

export function buildBackup(payload: Record<string, unknown>) {
  return JSON.stringify({
    app: "Engineer Assistant",
    version: "2.2.0",
    exportedAt: new Date().toISOString(),
    ...payload
  }, null, 2);
}

export function parseBackup(raw: string) {
  const parsed = JSON.parse(raw);
  if (!parsed || parsed.app !== "Engineer Assistant") {
    throw new Error("This file is not an Engineer Assistant backup.");
  }
  return parsed;
}

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9α-ωάέήίόύώϊϋΐΰ.-]+/i)
    .map(token => token.trim())
    .filter(token => token.length > 2);
}

export function splitIntoChunks(content: string, chunkSize = 900) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  for (let index = 0; index < normalized.length; index += chunkSize) {
    chunks.push(normalized.slice(index, index + chunkSize));
  }
  return chunks;
}

export function searchManualDocuments(query: string, documents: ManualDocument[], limit = 5): ManualSnippet[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];

  const snippets: ManualSnippet[] = [];

  for (const document of documents) {
    const chunks = splitIntoChunks(document.content);
    chunks.forEach((chunk, chunkIndex) => {
      const lower = chunk.toLowerCase();
      const score = tokens.reduce((sum, token) => sum + (lower.includes(token) ? token.length : 0), 0);
      if (score > 0) {
        snippets.push({
          documentId: document.id,
          title: document.title,
          source: document.source || `Manual section ${chunkIndex + 1}`,
          excerpt: chunk,
          score
        });
      }
    });
  }

  return snippets.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function formatManualContext(snippets: ManualSnippet[]) {
  if (!snippets.length) return "";
  return snippets
    .map((snippet, index) => `[Manual ${index + 1}: ${snippet.title}${snippet.source ? ` / ${snippet.source}` : ""}]\n${snippet.excerpt}`)
    .join("\n\n");
}

export function loadManualDocuments(): ManualDocument[] {
  try {
    const raw = localStorage.getItem(MANUAL_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveManualDocuments(documents: ManualDocument[]) {
  localStorage.setItem(MANUAL_STORAGE_KEY, JSON.stringify(documents));
}

export function loadShipProfile(): ShipProfile {
  try {
    const raw = localStorage.getItem(SHIP_PROFILE_STORAGE_KEY);
    return raw ? { ...DEFAULT_SHIP_PROFILE, ...JSON.parse(raw) } : DEFAULT_SHIP_PROFILE;
  } catch {
    return DEFAULT_SHIP_PROFILE;
  }
}

export function saveShipProfile(profile: ShipProfile) {
  localStorage.setItem(SHIP_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export const alarmPatterns = [
  {
    keywords: ["oil mist", "omd", "crankcase mist"],
    title: "Crankcase oil mist alarm",
    immediateAction: "Notify bridge, reduce/stop engine as per SMS, keep clear of relief doors, and do not open crankcase doors until the cooling period is complete.",
    checks: ["Identify unit on OMD", "Trend bearing temperatures", "Check crankcase pressure", "Prepare fire-fighting boundary cooling", "Inspect only after safe cooling and turning gear procedure"]
  },
  {
    keywords: ["scavenge fire", "scavenge temp", "scavenge high"],
    title: "Scavenge space fire risk",
    immediateAction: "Reduce engine load, cut fuel to affected cylinder if required, stop auxiliary blowers when safe, and prepare fixed/local extinguishing procedure.",
    checks: ["Confirm affected cylinder", "Monitor exhaust/scavenge temperatures", "Keep scavenge doors closed", "Check drains and fire boundary", "Inspect piston rings/scavenge deposits after safe condition"]
  },
  {
    keywords: ["blackout", "loss of power", "dead ship"],
    title: "Blackout / dead ship condition",
    immediateAction: "Confirm emergency generator status, restore essential services, inform bridge, and follow blackout recovery checklist.",
    checks: ["Emergency generator voltage/frequency", "Main switchboard trips", "Fuel and starting air to generators", "Cooling water and LO pressure", "Sequential load restoration"]
  },
  {
    keywords: ["generator hunting", "frequency fluctuation", "unstable load"],
    title: "Generator hunting / unstable frequency",
    immediateAction: "Avoid paralleling instability, reduce non-essential load if needed, and verify governor/fuel system before load sharing.",
    checks: ["Fuel filter differential pressure", "Air in fuel system", "Governor linkage", "Speed pickup gap", "Load sharing module"]
  },
  {
    keywords: ["fuel pressure low", "fo low", "booster low"],
    title: "Fuel oil low pressure",
    immediateAction: "Start standby pump if available, check filters/valves, and prepare for controlled load reduction if pressure is not restored.",
    checks: ["Booster pump status", "Filter differential pressure", "Tank suction valves", "Viscosity/temperature", "Leakage or return valve position"]
  }
];

export function decodeAlarm(input: string) {
  const lower = input.toLowerCase();
  const match = alarmPatterns.find(pattern => pattern.keywords.some(keyword => lower.includes(keyword)));
  return match || {
    title: "General machinery alarm",
    immediateAction: "Make the equipment safe, inform the watchkeeper/bridge as required, verify the alarm locally, and compare readings with maker limits.",
    checks: ["Confirm alarm source", "Check trend history", "Inspect for leaks/heat/noise/vibration", "Verify sensor and local gauge", "Escalate if safety-critical"]
  };
}

export const emergencyChecklists = [
  {
    id: "blackout",
    title: "Blackout",
    items: ["Inform bridge and Chief Engineer", "Verify emergency generator start and emergency switchboard supply", "Start standby generator when safe", "Restore main switchboard sequentially", "Start essential pumps and steering gear", "Log cause and actions"]
  },
  {
    id: "scavenge-fire",
    title: "Scavenge fire",
    items: ["Notify bridge and reduce engine load", "Cut fuel to affected cylinder if required", "Keep scavenge doors shut", "Stop auxiliary blowers when safe", "Use fixed/local extinguishing only as per SMS", "Inspect only after temperature is safe"]
  },
  {
    id: "crankcase-risk",
    title: "Crankcase explosion risk",
    items: ["Reduce/stop engine as per alarm procedure", "Keep clear of relief doors", "Do not open crankcase doors", "Allow cooling period", "Prepare turning gear/LO isolation procedure", "Inspect bearings/guides after safe condition"]
  },
  {
    id: "steering-failure",
    title: "Steering gear failure",
    items: ["Inform bridge immediately", "Start second steering gear pump", "Check local/remote control mode", "Inspect hydraulic level and leaks", "Prepare emergency steering procedure", "Record failure and recovery"]
  }
];

export const trainingModules = [
  {
    id: "purifier",
    title: "Purifier water carry-over basics",
    lesson: "Water carry-over usually comes from incorrect gravity disc/paring disc setup, high throughput, poor temperature control, dirty bowl, or incorrect interface position.",
    question: "What should you check first before opening a hot purifier bowl?",
    answer: "Stop safely, isolate power/steam/fuel as applicable, allow bowl to stop fully, depressurize, cool down, and follow maker opening procedure."
  },
  {
    id: "omd",
    title: "Oil mist alarm response",
    lesson: "Oil mist can indicate bearing overheating and crankcase explosion risk. The first priority is controlled engine safety and avoiding fresh air ingress.",
    question: "Why must crankcase doors remain closed immediately after an oil mist alarm?",
    answer: "Opening introduces oxygen into a hot oil mist atmosphere and can trigger an explosion."
  },
  {
    id: "generator-hunting",
    title: "Generator hunting",
    lesson: "Frequency hunting is commonly caused by fuel starvation, air in fuel, governor linkage issues, speed sensor problems, or load-sharing instability.",
    question: "Name two common checks for a hunting generator.",
    answer: "Fuel filter differential pressure/air in fuel and governor linkage/speed pickup condition."
  }
];
