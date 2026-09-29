import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Clipboard,
  ClipboardCheck,
  Database,
  FileText,
  History,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench
} from "lucide-react";
import type { TroubleshootingRecord } from "../types";
import {
  buildDiagnosticPlan,
  quickEquipmentOptions,
  type DiagnosticPlan,
  type TroubleshootingCaseInput
} from "../utils/realTroubleshooting";

type SavedCase = {
  id: string;
  createdAt: string;
  input: TroubleshootingCaseInput;
  plan: DiagnosticPlan;
};

const STORAGE_KEY = "engineer_real_troubleshooting_cases";

const blankInput: TroubleshootingCaseInput = {
  equipment: "",
  alarm: "",
  symptom: "",
  readings: "",
  recentWork: "",
  checked: "",
  urgency: "normal"
};

function loadSavedCases(): SavedCase[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 6) : [];
  } catch {
    return [];
  }
}

function saveCases(cases: SavedCase[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases.slice(0, 6)));
  } catch {
    // Offline storage can be disabled; the diagnostic plan still works.
  }
}

function Field({ label, value, onChange, placeholder, textarea = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="rt-field">
      <span>{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      )}
    </label>
  );
}

function PlanList({ title, icon: Icon, items, tone = "default" }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  tone?: "default" | "safe" | "warn";
}) {
  return (
    <section className={`rt-plan-card rt-plan-${tone}`}>
      <h3><Icon className="h-4 w-4" /> {title}</h3>
      <ol>
        {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
      </ol>
    </section>
  );
}

function planAsText(plan: DiagnosticPlan) {
  return [
    `TROUBLESHOOTING PLAN: ${plan.title}`,
    `Matched pack: ${plan.packTitle}`,
    `Confidence: ${plan.confidence}`,
    "",
    plan.summary,
    "",
    "IMMEDIATE SAFETY:",
    ...plan.immediateSafety.map((item, index) => `${index + 1}. ${item}`),
    "",
    "QUESTIONS TO ANSWER:",
    ...plan.missingQuestions.map((item, index) => `${index + 1}. ${item}`),
    "",
    "LIKELY CAUSES:",
    ...plan.likelyCauses.map((cause, index) => `${index + 1}. ${cause.label}: ${cause.reason} Proves/disproves: ${cause.proves}`),
    "",
    "CHECKS IN ORDER:",
    ...plan.checksInOrder.map((item, index) => `${index + 1}. ${item}`),
    "",
    "STOP / ESCALATE IF:",
    ...plan.stopCriteria.map((item, index) => `${index + 1}. ${item}`),
    "",
    "LOGBOOK DRAFT:",
    plan.logbookDraft,
    "",
    "DEFECT DRAFT:",
    plan.defectDraft
  ].join("\n");
}

export default function RealTroubleshooter({ records, onOpenFaults, onAskAi }: {
  records: TroubleshootingRecord[];
  onOpenFaults: (query: string) => void;
  onAskAi: (prompt: string) => void;
}) {
  const [input, setInput] = useState<TroubleshootingCaseInput>(blankInput);
  const [plan, setPlan] = useState<DiagnosticPlan | null>(null);
  const [savedCases, setSavedCases] = useState<SavedCase[]>(() => loadSavedCases());
  const [copyMessage, setCopyMessage] = useState("");

  const canBuild = useMemo(() => {
    return Boolean(input.equipment.trim() || input.alarm.trim() || input.symptom.trim() || input.readings.trim());
  }, [input]);

  const update = <K extends keyof TroubleshootingCaseInput>(key: K, value: TroubleshootingCaseInput[K]) => {
    setInput(current => ({ ...current, [key]: value }));
  };

  const buildPlan = () => {
    if (!canBuild) return;
    const nextPlan = buildDiagnosticPlan(input, records);
    setPlan(nextPlan);
    const saved: SavedCase = {
      id: `case-${Date.now()}`,
      createdAt: new Date().toISOString(),
      input,
      plan: nextPlan
    };
    const nextCases = [saved, ...savedCases].slice(0, 6);
    setSavedCases(nextCases);
    saveCases(nextCases);
    setCopyMessage("");
  };

  const resetCase = () => {
    setInput(blankInput);
    setPlan(null);
    setCopyMessage("");
  };

  const copyPlan = async () => {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(planAsText(plan));
      setCopyMessage("Plan copied.");
    } catch {
      setCopyMessage("Copy is blocked by this browser. Use the drafts below manually.");
    }
  };

  const loadCase = (item: SavedCase) => {
    setInput(item.input);
    setPlan(item.plan);
    setCopyMessage("");
  };

  const clearHistory = () => {
    setSavedCases([]);
    saveCases([]);
  };

  return (
    <section className="rt-shell">
      <div className="rt-header">
        <div>
          <div className="ea-eyebrow"><Sparkles className="h-4 w-4" /> Real troubleshooting mode</div>
          <h2>Describe the problem. Get a safe diagnostic path.</h2>
          <p>No big PDF upload needed. The app uses built-in expert packs, first-principles reasoning, and the fault database. Manuals are only for exact maker limits.</p>
        </div>
      </div>

      <div className="rt-form-card">
        <div className="rt-step-title"><span>1</span> What equipment?</div>
        <div className="rt-choice-row">
          {quickEquipmentOptions.map(option => (
            <button key={option} type="button" onClick={() => update("equipment", option)} className={input.equipment === option ? "active" : ""}>
              {option}
            </button>
          ))}
        </div>
        <Field label="Equipment / maker / unit" value={input.equipment} onChange={(value) => update("equipment", value)} placeholder="DG1, ME cyl. 4, Alfa Laval purifier, SW cooling pump..." />

        <div className="rt-two-col">
          <Field label="Alarm text / code" value={input.alarm} onChange={(value) => update("alarm", value)} placeholder="Exact alarm if available" />
          <label className="rt-field">
            <span>Urgency</span>
            <select value={input.urgency} onChange={(event) => update("urgency", event.target.value as TroubleshootingCaseInput["urgency"])}>
              <option value="normal">Normal diagnosis</option>
              <option value="urgent">Urgent / worsening</option>
              <option value="critical">Critical / emergency risk</option>
            </select>
          </label>
        </div>

        <div className="rt-step-title"><span>2</span> What is happening?</div>
        <Field label="Main symptom" value={input.symptom} onChange={(value) => update("symptom", value)} textarea placeholder="Example: DG frequency hunts under load, purifier water carry-over after gravity disc change, pump pressure low after strainer cleaning..." />
        <Field label="Readings and trend" value={input.readings} onChange={(value) => update("readings", value)} textarea placeholder="Pressures, temperatures, current, vibration, cylinder/unit, normal vs actual readings..." />

        <details className="rt-details">
          <summary>Optional but useful: recent work and what you already checked</summary>
          <div className="rt-two-col mt-3">
            <Field label="Recent work / change" value={input.recentWork} onChange={(value) => update("recentWork", value)} textarea placeholder="Filter changed, fuel changed, overhaul, blackout, valve operated, cleaned strainer..." />
            <Field label="Already checked" value={input.checked} onChange={(value) => update("checked", value)} textarea placeholder="What was checked and what result changed / did not change..." />
          </div>
        </details>

        <div className="rt-actions">
          <button type="button" onClick={buildPlan} disabled={!canBuild} className="ea-button ea-button-primary"><Wrench className="h-4 w-4" /> Build troubleshooting plan</button>
          <button type="button" onClick={resetCase} className="ea-button ea-button-secondary"><RotateCcw className="h-4 w-4" /> Reset</button>
        </div>
      </div>

      {plan && (
        <div className="rt-result">
          <div className="rt-result-head">
            <div>
              <span className="rt-confidence">{plan.confidence} confidence • {plan.packTitle}</span>
              <h3>{plan.title}</h3>
              <p>{plan.summary}</p>
            </div>
            <div className="rt-actions compact">
              <button type="button" onClick={() => onAskAi(plan.aiPrompt)} className="ea-button ea-button-primary"><Bot className="h-4 w-4" /> Ask AI with this case</button>
              <button type="button" onClick={() => onOpenFaults(`${input.equipment} ${input.alarm} ${input.symptom}`)} className="ea-button ea-button-secondary"><Search className="h-4 w-4" /> Search database</button>
              <button type="button" onClick={copyPlan} className="ea-button ea-button-secondary"><Clipboard className="h-4 w-4" /> Copy plan</button>
            </div>
          </div>
          {copyMessage && <div className="rt-copy-message">{copyMessage}</div>}

          <div className="rt-plan-grid">
            <PlanList title="Immediate safety" icon={ShieldCheck} items={plan.immediateSafety} tone="safe" />
            <PlanList title="Questions before invasive work" icon={AlertTriangle} items={plan.missingQuestions} tone="warn" />
            <section className="rt-plan-card">
              <h3><Wrench className="h-4 w-4" /> Likely causes</h3>
              <div className="rt-cause-list">
                {plan.likelyCauses.map(cause => (
                  <article key={cause.label}>
                    <strong>{cause.label}</strong>
                    <p>{cause.reason}</p>
                    <small>{cause.proves}</small>
                  </article>
                ))}
              </div>
            </section>
            <PlanList title="Checks in safest order" icon={ClipboardCheck} items={plan.checksInOrder} />
            <PlanList title="Manual/OEM data needed" icon={FileText} items={plan.manualNeeds} />
            <PlanList title="Stop and escalate if" icon={AlertTriangle} items={plan.stopCriteria} tone="warn" />
          </div>

          {plan.matchedRecords.length > 0 && (
            <section className="rt-plan-card">
              <h3><Database className="h-4 w-4" /> Closest built-in fault records</h3>
              <div className="rt-record-matches">
                {plan.matchedRecords.map(record => (
                  <button key={record.id} type="button" onClick={() => onOpenFaults(record.faultSymptom)}>
                    <strong>{record.component}</strong>
                    <span>{record.makeModel}</span>
                    <small>{record.faultSymptom}</small>
                  </button>
                ))}
              </div>
            </section>
          )}

          <details className="rt-drafts">
            <summary>Logbook and defect drafts</summary>
            <div className="rt-two-col mt-3">
              <label className="rt-field"><span>Logbook draft</span><textarea readOnly value={plan.logbookDraft} rows={8} /></label>
              <label className="rt-field"><span>Defect draft</span><textarea readOnly value={plan.defectDraft} rows={8} /></label>
            </div>
          </details>
        </div>
      )}

      {savedCases.length > 0 && (
        <details className="rt-history">
          <summary><History className="h-4 w-4" /> Recent local cases</summary>
          <div className="rt-history-list">
            {savedCases.map(item => (
              <button type="button" key={item.id} onClick={() => loadCase(item)}>
                <strong>{item.plan.title}</strong>
                <span>{new Date(item.createdAt).toLocaleString()} • {item.plan.packTitle}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={clearHistory} className="rt-clear-history">Clear local case history</button>
        </details>
      )}
    </section>
  );
}
