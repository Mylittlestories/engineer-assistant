export interface TroubleshootingRecord {
  id: string;
  category: "2-Stroke Propulsion" | "4-Stroke Generator" | "Auxiliary Machinery";
  makeModel: string; // e.g. "MAN B&W MC-C", "Sulzer RTA", "Yanmar EY26", "Alfa Laval S-Purifier"
  component: string;  // e.g. "Exhaust Valve", "Fuel Injection Pump", "OWS", "Burner Assembly"
  faultSymptom: string; // e.g. "Exhaust gas temperature deviation high"
  possibleCauses: string[];
  troubleshootingSteps: string[];
  safetyPrecautions: string[];
  difficulty: "Easy" | "Medium" | "High";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface SavedQaItem {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
  topic?: string;
}

