import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  BookOpen,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Download,
  FileText,
  GraduationCap,
  HardHat,
  Languages,
  LifeBuoy,
  PackageCheck,
  Plus,
  Search,
  Settings2,
  ShipWheel,
  TimerReset,
  Upload,
  Wrench,
  X
} from "lucide-react";
import { extractPdfText } from "../utils/pdfText";
import {
  DEFAULT_SHIP_PROFILE,
  buildBackup,
  calculateChemicalDoseLiters,
  calculateEngineSlipPercent,
  calculateFuelMtDay,
  calculateGeneratorLoadPercent,
  calculatePumpFlowM3Hour,
  calculateSfoc,
  calculateTransferTimeHours,
  decodeAlarm,
  emergencyChecklists,
  loadManualDocuments,
  loadShipProfile,
  parseBackup,
  saveManualDocuments,
  saveShipProfile,
  searchManualDocuments,
  trainingModules,
  type ManualDocument,
  type ShipProfile,
} from "../utils/shipAssistant";

type TabId =
  | "manuals"
  | "trees"
  | "safety"
  | "logbook"
  | "pms"
  | "spares"
  | "calculators"
  | "alarms"
  | "defects"
  | "photos"
  | "backup"
  | "emergency"
  | "training"
  | "language";

type LogEntry = {
  id: string;
  timestamp: string;
  watch: string;
  machinery: string;
  alarms: string;
  notes: string;
};

type PmsTask = {
  id: string;
  equipment: string;
  job: string;
  intervalHours: number;
  lastDoneHours: number;
  currentHours: number;
  risk: string;
};

type SpareItem = {
  id: string;
  item: string;
  partNo: string;
  location: string;
  qty: number;
  minQty: number;
};

type DefectReport = {
  id: string;
  equipment: string;
  fault: string;
  actions: string;
  risk: string;
  spares: string;
  recommendation: string;
};

type PhotoEvidence = {
  id: string;
  title: string;
  note: string;
  image: string;
  createdAt: string;
};

const STORAGE = {
  logbook: "engineer_logbook_entries",
  pms: "engineer_pms_tasks",
  spares: "engineer_spares_inventory",
  defects: "engineer_defect_reports",
  photos: "engineer_photo_evidence"
};

const tabs: Array<{ id: TabId; label: string; icon: React.ComponentType<any> }> = [
  { id: "manuals", label: "Manual Vault", icon: BookOpen },
  { id: "trees", label: "Troubleshooting", icon: ClipboardCheck },
  { id: "safety", label: "Safety / PTW", icon: HardHat },
  { id: "logbook", label: "Logbook", icon: FileText },
  { id: "pms", label: "PMS", icon: TimerReset },
  { id: "spares", label: "Spares", icon: PackageCheck },
  { id: "calculators", label: "Calculators", icon: Settings2 },
  { id: "alarms", label: "Alarm Decoder", icon: AlertTriangle },
  { id: "defects", label: "Defect Reports", icon: Wrench },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "backup", label: "Ship Profile / Backup", icon: ShipWheel },
  { id: "emergency", label: "Emergency", icon: LifeBuoy },
  { id: "training", label: "Training", icon: GraduationCap },
  { id: "language", label: "Language", icon: Languages },
];

const troubleshootingTrees = [
  {
    id: "omd",
    title: "Crankcase oil mist detector alarm",
    severity: "Critical",
    steps: [
      "Notify bridge and Chief Engineer immediately.",
      "Reduce or stop main engine according to SMS and maker instructions.",
      "Keep personnel clear of crankcase relief doors.",
      "Identify alarmed compartment on OMD display.",
      "Check bearing/crosshead temperatures and trend history remotely.",
      "Do not open crankcase doors until the required cooling period is complete.",
      "After safe cooling, engage turning gear and inspect with LOTO in force.",
      "Escalate to superintendent/OEM if overheating source is not obvious."
    ]
  },
  {
    id: "blackout",
    title: "Blackout recovery",
    severity: "Critical",
    steps: [
      "Confirm emergency generator started and emergency switchboard is live.",
      "Inform bridge of propulsion and steering status.",
      "Check main switchboard trip indications and generator protection alarms.",
      "Prepare one diesel generator for restart: fuel, LO pressure, cooling water, starting air/battery.",
      "Close generator breaker only when voltage/frequency are stable.",
      "Restore essential services first: steering gear, cooling pumps, fuel pumps, control air.",
      "Add non-essential loads gradually and monitor frequency/load sharing.",
      "Record root cause and actions in logbook."
    ]
  },
  {
    id: "generator-hunting",
    title: "Generator hunting / unstable frequency",
    severity: "High",
    steps: [
      "Reduce non-essential load if frequency swings are severe.",
      "Check fuel filter differential pressure and service tank level.",
      "Bleed air from fuel supply/return as per maker procedure.",
      "Inspect governor linkage/actuator for sticking or backlash.",
      "Verify magnetic pickup cleanliness and sensor gap.",
      "Check load sharing module and AVR stability if paralleled.",
      "Run unloaded/isolated test only if safe and operationally approved."
    ]
  },
  {
    id: "scavenge-fire",
    title: "Scavenge fire",
    severity: "Critical",
    steps: [
      "Notify bridge and reduce engine load immediately.",
      "Identify affected cylinder using scavenge/exhaust temperature trends.",
      "Cut fuel to affected cylinder if required by procedure.",
      "Keep scavenge doors shut; do not introduce fresh air.",
      "Stop auxiliary blowers when safe to reduce oxygen supply.",
      "Use fixed/local extinguishing connections as per SMS if temperature rises.",
      "Inspect piston rings, drains, deposits, and injector condition after safe cooling."
    ]
  }
];

const permitChecklists = [
  {
    title: "LOTO / zero energy",
    items: ["Identify all energy sources", "Stop and isolate equipment", "Apply personal locks and tags", "Release stored pressure/spring energy", "Verify zero energy locally", "Communicate permit boundaries"]
  },
  {
    title: "Hot work",
    items: ["Gas test completed", "Fire watch assigned", "Combustibles removed/covered", "Fire-fighting equipment ready", "Adjacent spaces checked", "Permit signed and time-limited"]
  },
  {
    title: "Enclosed space",
    items: ["Atmosphere tested", "Ventilation running", "Rescue plan ready", "Standby person assigned", "Communication checked", "Entry log maintained"]
  },
  {
    title: "High pressure fuel / hydraulic",
    items: ["Depressurized and drained", "Injection injury warning briefed", "Face/hand protection used", "No finger leak checks", "Shielding/guards restored", "Leak test from safe distance"]
  }
];

function loadList<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallback;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveList<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

function downloadText(filename: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function nowIso() {
  return new Date().toISOString().slice(0, 16);
}

function Field({ label, value, onChange, placeholder, textarea = false, type = "text" }: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} className="mt-1 w-full rounded-2xl border border-slate-700 bg-[#11223b] px-4 py-3 text-sm focus:border-cyan-400 focus:outline-none" />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-2xl border border-slate-700 bg-[#11223b] px-4 py-3 text-sm focus:border-cyan-400 focus:outline-none" />
      )}
    </label>
  );
}

function SectionCard({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: React.ComponentType<any> }) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-[#0b1424] p-4 md:p-5 shadow-xl shadow-black/10">
      <div className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-100">
        {Icon && <Icon className="h-5 w-5 text-cyan-300" />}
        {title}
      </div>
      {children}
    </div>
  );
}

export default function EngineerSuite() {
  const [activeTab, setActiveTab] = useState<TabId>("manuals");
  const [manuals, setManuals] = useState<ManualDocument[]>(() => loadManualDocuments());
  const [manualTitle, setManualTitle] = useState("");
  const [manualSource, setManualSource] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [manualSearch, setManualSearch] = useState("");
  const [manualImportStatus, setManualImportStatus] = useState("");
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [logbook, setLogbook] = useState<LogEntry[]>(() => loadList(STORAGE.logbook, []));
  const [logDraft, setLogDraft] = useState<LogEntry>({ id: "", timestamp: nowIso(), watch: "00-04", machinery: "", alarms: "", notes: "" });
  const [pmsTasks, setPmsTasks] = useState<PmsTask[]>(() => loadList(STORAGE.pms, [
    { id: "pms-dg-250", equipment: "Diesel Generator", job: "250 h inspection", intervalHours: 250, lastDoneHours: 0, currentHours: 0, risk: "Medium" },
    { id: "pms-purifier", equipment: "Fuel Oil Purifier", job: "Bowl cleaning", intervalHours: 1000, lastDoneHours: 0, currentHours: 0, risk: "Medium" },
  ]));
  const [spares, setSpares] = useState<SpareItem[]>(() => loadList(STORAGE.spares, []));
  const [spareDraft, setSpareDraft] = useState<SpareItem>({ id: "", item: "", partNo: "", location: "", qty: 0, minQty: 0 });
  const [alarmInput, setAlarmInput] = useState("Oil mist detector alarm unit 3");
  const alarmDecoded = useMemo(() => decodeAlarm(alarmInput), [alarmInput]);
  const [defects, setDefects] = useState<DefectReport[]>(() => loadList(STORAGE.defects, []));
  const [defectDraft, setDefectDraft] = useState<DefectReport>({ id: "", equipment: "", fault: "", actions: "", risk: "", spares: "", recommendation: "" });
  const [photos, setPhotos] = useState<PhotoEvidence[]>(() => loadList(STORAGE.photos, []));
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoNote, setPhotoNote] = useState("");
  const [shipProfile, setShipProfile] = useState<ShipProfile>(() => loadShipProfile());
  const [importMessage, setImportMessage] = useState("");
  const [calc, setCalc] = useState({ fuelKgH: "850", powerKw: "6000", volumeM3: "120", pumpRate: "45", minutes: "90", ratedKw: "1000", loadKw: "650", theoreticalKn: "15", actualKn: "13.8", ppm: "40", strength: "25" });

  const manualSnippets = useMemo(() => searchManualDocuments(manualSearch, manuals, 6), [manualSearch, manuals]);

  const persistManuals = (next: ManualDocument[]) => {
    setManuals(next);
    saveManualDocuments(next);
  };

  const addManual = () => {
    if (!manualTitle.trim() || !manualContent.trim()) return;
    const next = [{ id: `manual-${Date.now()}`, title: manualTitle.trim(), source: manualSource.trim(), content: manualContent.trim(), addedAt: new Date().toISOString() }, ...manuals];
    persistManuals(next);
    setManualTitle("");
    setManualSource("");
    setManualContent("");
  };

  const handleManualFile = async (file?: File) => {
    if (!file) return;
    setManualImportStatus(`Reading ${file.name}...`);

    try {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const text = isPdf ? await extractPdfText(file) : await file.text();
      setManualTitle(file.name.replace(/\.[^.]+$/, ""));
      setManualSource(isPdf ? `${file.name} (PDF.js extracted text)` : file.name);
      setManualContent(text.slice(0, 180000));
      setManualImportStatus(isPdf ? "PDF.js extraction complete. Review the text, then add it to the vault." : "File loaded. Review the text, then add it to the vault.");
    } catch (error: any) {
      setManualImportStatus(error?.message || "Could not read this file. Try exporting the PDF as text and paste it manually.");
    }
  };

  const addLog = () => {
    const entry = { ...logDraft, id: `log-${Date.now()}` };
    const next = [entry, ...logbook];
    setLogbook(next);
    saveList(STORAGE.logbook, next);
    setLogDraft({ id: "", timestamp: nowIso(), watch: logDraft.watch, machinery: "", alarms: "", notes: "" });
  };

  const addSpare = () => {
    if (!spareDraft.item.trim()) return;
    const next = [{ ...spareDraft, id: `spare-${Date.now()}` }, ...spares];
    setSpares(next);
    saveList(STORAGE.spares, next);
    setSpareDraft({ id: "", item: "", partNo: "", location: "", qty: 0, minQty: 0 });
  };

  const addDefect = () => {
    if (!defectDraft.equipment.trim() || !defectDraft.fault.trim()) return;
    const next = [{ ...defectDraft, id: `defect-${Date.now()}` }, ...defects];
    setDefects(next);
    saveList(STORAGE.defects, next);
    setDefectDraft({ id: "", equipment: "", fault: "", actions: "", risk: "", spares: "", recommendation: "" });
  };

  const handlePhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = [{ id: `photo-${Date.now()}`, title: photoTitle || file.name, note: photoNote, image: String(reader.result), createdAt: new Date().toISOString() }, ...photos].slice(0, 12);
      setPhotos(next);
      saveList(STORAGE.photos, next);
      setPhotoTitle("");
      setPhotoNote("");
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    saveShipProfile(shipProfile);
    setImportMessage("Ship profile saved locally.");
  };

  const exportAll = () => {
    downloadText("engineer-assistant-backup.json", buildBackup({ manuals, shipProfile, logbook, pmsTasks, spares, defects, photos }), "application/json");
  };

  const importBackup = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = parseBackup(await file.text());
      if (Array.isArray(parsed.manuals)) persistManuals(parsed.manuals);
      if (parsed.shipProfile) { setShipProfile({ ...DEFAULT_SHIP_PROFILE, ...parsed.shipProfile }); saveShipProfile({ ...DEFAULT_SHIP_PROFILE, ...parsed.shipProfile }); }
      if (Array.isArray(parsed.logbook)) { setLogbook(parsed.logbook); saveList(STORAGE.logbook, parsed.logbook); }
      if (Array.isArray(parsed.pmsTasks)) { setPmsTasks(parsed.pmsTasks); saveList(STORAGE.pms, parsed.pmsTasks); }
      if (Array.isArray(parsed.spares)) { setSpares(parsed.spares); saveList(STORAGE.spares, parsed.spares); }
      if (Array.isArray(parsed.defects)) { setDefects(parsed.defects); saveList(STORAGE.defects, parsed.defects); }
      if (Array.isArray(parsed.photos)) { setPhotos(parsed.photos); saveList(STORAGE.photos, parsed.photos); }
      setImportMessage("Backup imported successfully.");
    } catch (error: any) {
      setImportMessage(error?.message || "Import failed.");
    }
  };

  const renderManuals = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <SectionCard title="Upload or paste vessel manuals" icon={Upload}>
        <div className="space-y-3">
          <input type="file" accept=".pdf,.txt,.md,.csv,.json,.log,.xml,.html" onChange={(event) => handleManualFile(event.target.files?.[0])} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:font-semibold file:text-slate-950" />
          {manualImportStatus && <div className="rounded-2xl border border-slate-700 bg-[#11223b] p-3 text-xs text-slate-300">{manualImportStatus}</div>}
          <div className="rounded-2xl border border-cyan-800 bg-cyan-950/25 p-3 text-xs leading-relaxed text-cyan-100/85">
            PDF.js is bundled in the static GitHub Pages build, so manuals can be parsed locally in the browser before being added to the offline vault.
          </div>
          <Field label="Manual title" value={manualTitle} onChange={setManualTitle} placeholder="MAN B&W ME-C operating manual" />
          <Field label="Source / page / section" value={manualSource} onChange={setManualSource} placeholder="PDF name, page range, maker bulletin..." />
          <Field label="Manual text / excerpt" value={manualContent} onChange={setManualContent} textarea placeholder="Paste text manually or upload a PDF/text file. PDF.js extracts text locally for static GitHub Pages." />
          <button onClick={addManual} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950"><Plus className="h-4 w-4" /> Add to vault</button>
        </div>
      </SectionCard>
      <SectionCard title="Manual search and AI citations" icon={Search}>
        <Field label="Search manuals" value={manualSearch} onChange={setManualSearch} placeholder="oil mist alarm bearing temperature" />
        <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {manualSnippets.length ? manualSnippets.map(snippet => (
            <div key={`${snippet.documentId}-${snippet.excerpt.slice(0, 12)}`} className="rounded-2xl border border-slate-700 bg-[#11223b] p-3">
              <div className="text-sm font-semibold text-cyan-100">{snippet.title}</div>
              <div className="text-[11px] text-slate-400">{snippet.source}</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">{snippet.excerpt}</p>
            </div>
          )) : <p className="text-sm text-slate-400">Manual snippets matching AI questions are automatically sent as context to Browser Gemini/Desktop Gemini.</p>}
        </div>
      </SectionCard>
      <SectionCard title={`Vault documents (${manuals.length})`} icon={Archive}>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {manuals.map(doc => (
            <div key={doc.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-700 bg-[#11223b] p-3">
              <div>
                <div className="font-semibold text-slate-100">{doc.title}</div>
                <div className="text-xs text-slate-400">{doc.source || "Local note"} • {Math.round(doc.content.length / 1000)}k chars</div>
              </div>
              <button onClick={() => persistManuals(manuals.filter(item => item.id !== doc.id))} className="rounded-xl p-1.5 text-slate-400 hover:bg-red-950 hover:text-red-200"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );

  const renderTrees = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {troubleshootingTrees.map(tree => (
        <SectionCard key={tree.id} title={tree.title} icon={ClipboardCheck}>
          <div className="mb-3 inline-flex rounded-full border border-red-800 bg-red-950/50 px-3 py-1 text-xs font-bold text-red-200">{tree.severity}</div>
          <ol className="space-y-2">
            {tree.steps.map((step, index) => {
              const key = `${tree.id}-${index}`;
              return (
                <li key={key} className="flex gap-3 rounded-2xl border border-slate-700 bg-[#11223b] p-3 text-sm">
                  <button onClick={() => setCheckedSteps(prev => ({ ...prev, [key]: !prev[key] }))} className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border ${checkedSteps[key] ? "border-emerald-400 bg-emerald-400" : "border-slate-500"}`}>{checkedSteps[key] && <CheckCircle2 className="h-5 w-5 text-emerald-950" />}</button>
                  <span>{step}</span>
                </li>
              );
            })}
          </ol>
        </SectionCard>
      ))}
    </div>
  );

  const renderSafety = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {permitChecklists.map(checklist => (
        <SectionCard key={checklist.title} title={checklist.title} icon={HardHat}>
          <ul className="space-y-2">
            {checklist.items.map(item => <li key={item} className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> {item}</li>)}
          </ul>
        </SectionCard>
      ))}
    </div>
  );

  const renderLogbook = () => (
    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5">
      <SectionCard title="New watch handover entry" icon={FileText}>
        <div className="space-y-3">
          <Field label="Timestamp" value={logDraft.timestamp} onChange={value => setLogDraft({ ...logDraft, timestamp: value })} type="datetime-local" />
          <Field label="Watch" value={logDraft.watch} onChange={value => setLogDraft({ ...logDraft, watch: value })} placeholder="00-04" />
          <Field label="Running machinery status" value={logDraft.machinery} onChange={value => setLogDraft({ ...logDraft, machinery: value })} textarea />
          <Field label="Active alarms / defects" value={logDraft.alarms} onChange={value => setLogDraft({ ...logDraft, alarms: value })} textarea />
          <Field label="Notes and pending jobs" value={logDraft.notes} onChange={value => setLogDraft({ ...logDraft, notes: value })} textarea />
          <button onClick={addLog} className="rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950">Save log entry</button>
        </div>
      </SectionCard>
      <SectionCard title="Logbook history" icon={Archive}>
        <button onClick={() => downloadText("watch-logbook.csv", ["timestamp,watch,machinery,alarms,notes", ...logbook.map(e => [e.timestamp, e.watch, e.machinery, e.alarms, e.notes].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n"), "text/csv")} className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-3 py-2 text-xs"><Download className="h-4 w-4" /> Export CSV</button>
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {logbook.map(entry => <div key={entry.id} className="rounded-2xl border border-slate-700 bg-[#11223b] p-3 text-sm"><div className="font-semibold text-cyan-100">{entry.timestamp} • Watch {entry.watch}</div><p className="mt-2 whitespace-pre-wrap text-slate-300">{entry.machinery}</p><p className="mt-2 whitespace-pre-wrap text-amber-200">{entry.alarms}</p><p className="mt-2 whitespace-pre-wrap text-slate-400">{entry.notes}</p></div>)}
        </div>
      </SectionCard>
    </div>
  );

  const renderPms = () => (
    <SectionCard title="Running-hour maintenance planner" icon={TimerReset}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-xs uppercase text-slate-400"><tr><th className="p-2">Equipment</th><th className="p-2">Job</th><th className="p-2">Interval h</th><th className="p-2">Last done h</th><th className="p-2">Current h</th><th className="p-2">Due in</th><th className="p-2">Risk</th></tr></thead>
          <tbody>
            {pmsTasks.map(task => {
              const dueIn = task.lastDoneHours + task.intervalHours - task.currentHours;
              return <tr key={task.id} className="border-t border-slate-800"><td className="p-2"><input value={task.equipment} onChange={e => { const next = pmsTasks.map(t => t.id === task.id ? { ...t, equipment: e.target.value } : t); setPmsTasks(next); saveList(STORAGE.pms, next); }} className="w-full rounded-xl bg-[#11223b] p-2" /></td><td className="p-2"><input value={task.job} onChange={e => { const next = pmsTasks.map(t => t.id === task.id ? { ...t, job: e.target.value } : t); setPmsTasks(next); saveList(STORAGE.pms, next); }} className="w-full rounded-xl bg-[#11223b] p-2" /></td><td className="p-2"><input type="number" value={task.intervalHours} onChange={e => { const next = pmsTasks.map(t => t.id === task.id ? { ...t, intervalHours: Number(e.target.value) } : t); setPmsTasks(next); saveList(STORAGE.pms, next); }} className="w-24 rounded-xl bg-[#11223b] p-2" /></td><td className="p-2"><input type="number" value={task.lastDoneHours} onChange={e => { const next = pmsTasks.map(t => t.id === task.id ? { ...t, lastDoneHours: Number(e.target.value) } : t); setPmsTasks(next); saveList(STORAGE.pms, next); }} className="w-24 rounded-xl bg-[#11223b] p-2" /></td><td className="p-2"><input type="number" value={task.currentHours} onChange={e => { const next = pmsTasks.map(t => t.id === task.id ? { ...t, currentHours: Number(e.target.value) } : t); setPmsTasks(next); saveList(STORAGE.pms, next); }} className="w-24 rounded-xl bg-[#11223b] p-2" /></td><td className={`p-2 font-bold ${dueIn <= 0 ? "text-red-300" : dueIn < 50 ? "text-amber-300" : "text-emerald-300"}`}>{dueIn} h</td><td className="p-2">{task.risk}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
      <button onClick={() => { const next = [{ id: `pms-${Date.now()}`, equipment: "", job: "", intervalHours: 250, lastDoneHours: 0, currentHours: 0, risk: "Medium" }, ...pmsTasks]; setPmsTasks(next); saveList(STORAGE.pms, next); }} className="mt-4 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950">Add PMS task</button>
    </SectionCard>
  );

  const renderSpares = () => (
    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5">
      <SectionCard title="Add spare / special tool" icon={PackageCheck}>
        <div className="space-y-3"><Field label="Item" value={spareDraft.item} onChange={v => setSpareDraft({ ...spareDraft, item: v })} /><Field label="Part no / drawing no" value={spareDraft.partNo} onChange={v => setSpareDraft({ ...spareDraft, partNo: v })} /><Field label="Location" value={spareDraft.location} onChange={v => setSpareDraft({ ...spareDraft, location: v })} /><Field label="Quantity" value={spareDraft.qty} onChange={v => setSpareDraft({ ...spareDraft, qty: Number(v) })} type="number" /><Field label="Minimum quantity" value={spareDraft.minQty} onChange={v => setSpareDraft({ ...spareDraft, minQty: Number(v) })} type="number" /><button onClick={addSpare} className="rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950">Add spare</button></div>
      </SectionCard>
      <SectionCard title="Inventory and reorder warnings" icon={Archive}>
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">{spares.map(item => <div key={item.id} className="rounded-2xl border border-slate-700 bg-[#11223b] p-3"><div className="font-semibold">{item.item}</div><div className="text-xs text-slate-400">{item.partNo} • {item.location}</div><div className={`mt-2 text-sm font-bold ${item.qty <= item.minQty ? "text-red-300" : "text-emerald-300"}`}>Stock {item.qty} / Minimum {item.minQty}</div></div>)}</div>
      </SectionCard>
    </div>
  );

  const renderCalculators = () => {
    const fuelMtDay = calculateFuelMtDay(Number(calc.fuelKgH));
    const sfoc = calculateSfoc(Number(calc.fuelKgH), Number(calc.powerKw));
    const transferTime = calculateTransferTimeHours(Number(calc.volumeM3), Number(calc.pumpRate));
    const pumpFlow = calculatePumpFlowM3Hour(Number(calc.volumeM3), Number(calc.minutes));
    const genLoad = calculateGeneratorLoadPercent(Number(calc.loadKw), Number(calc.ratedKw));
    const slip = calculateEngineSlipPercent(Number(calc.theoreticalKn), Number(calc.actualKn));
    const chemicalDose = calculateChemicalDoseLiters(Number(calc.volumeM3), Number(calc.ppm), Number(calc.strength));
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><SectionCard title="Fuel and power" icon={Settings2}><div className="grid grid-cols-2 gap-3"><Field label="Fuel kg/h" value={calc.fuelKgH} onChange={v => setCalc({ ...calc, fuelKgH: v })} type="number" /><Field label="Power kW" value={calc.powerKw} onChange={v => setCalc({ ...calc, powerKw: v })} type="number" /></div><div className="mt-4 rounded-2xl bg-[#11223b] p-4 text-sm"><div>Consumption: <b className="text-cyan-200">{fuelMtDay} mt/day</b></div><div>SFOC: <b className="text-cyan-200">{sfoc} g/kWh</b></div></div></SectionCard><SectionCard title="Transfer / pump" icon={Settings2}><div className="grid grid-cols-3 gap-3"><Field label="Volume m³" value={calc.volumeM3} onChange={v => setCalc({ ...calc, volumeM3: v })} type="number" /><Field label="Pump m³/h" value={calc.pumpRate} onChange={v => setCalc({ ...calc, pumpRate: v })} type="number" /><Field label="Minutes" value={calc.minutes} onChange={v => setCalc({ ...calc, minutes: v })} type="number" /></div><div className="mt-4 rounded-2xl bg-[#11223b] p-4 text-sm"><div>Transfer time: <b className="text-cyan-200">{transferTime} h</b></div><div>Actual flow: <b className="text-cyan-200">{pumpFlow} m³/h</b></div></div></SectionCard><SectionCard title="Generator / propulsion" icon={Settings2}><div className="grid grid-cols-2 gap-3"><Field label="Load kW" value={calc.loadKw} onChange={v => setCalc({ ...calc, loadKw: v })} type="number" /><Field label="Rated kW" value={calc.ratedKw} onChange={v => setCalc({ ...calc, ratedKw: v })} type="number" /><Field label="Theoretical knots" value={calc.theoreticalKn} onChange={v => setCalc({ ...calc, theoreticalKn: v })} type="number" /><Field label="Actual knots" value={calc.actualKn} onChange={v => setCalc({ ...calc, actualKn: v })} type="number" /></div><div className="mt-4 rounded-2xl bg-[#11223b] p-4 text-sm"><div>Generator load: <b className="text-cyan-200">{genLoad}%</b></div><div>Approx. slip: <b className="text-cyan-200">{slip}%</b></div></div></SectionCard><SectionCard title="Water treatment dose" icon={Settings2}><div className="grid grid-cols-3 gap-3"><Field label="Volume m³" value={calc.volumeM3} onChange={v => setCalc({ ...calc, volumeM3: v })} type="number" /><Field label="Dose ppm" value={calc.ppm} onChange={v => setCalc({ ...calc, ppm: v })} type="number" /><Field label="Strength %" value={calc.strength} onChange={v => setCalc({ ...calc, strength: v })} type="number" /></div><div className="mt-4 rounded-2xl bg-[#11223b] p-4 text-sm">Approx. chemical amount: <b className="text-cyan-200">{chemicalDose} L or kg equivalent</b><p className="mt-2 text-xs text-amber-200">Verify dosing against chemical supplier instructions and vessel water-test result.</p></div></SectionCard></div>;
  };

  const renderAlarms = () => <SectionCard title="Alarm code / text decoder" icon={AlertTriangle}><Field label="Alarm text" value={alarmInput} onChange={setAlarmInput} placeholder="DG1 frequency fluctuation / FO booster low pressure / blackout" /><div className="mt-4 rounded-3xl border border-amber-800 bg-amber-950/25 p-4"><div className="text-lg font-bold text-amber-100">{alarmDecoded.title}</div><p className="mt-2 text-sm text-amber-50/90">{alarmDecoded.immediateAction}</p><ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">{alarmDecoded.checks.map(check => <li key={check}>{check}</li>)}</ul></div></SectionCard>;

  const renderDefects = () => <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5"><SectionCard title="Create defect report" icon={Wrench}><div className="space-y-3"><Field label="Equipment" value={defectDraft.equipment} onChange={v => setDefectDraft({ ...defectDraft, equipment: v })} /><Field label="Fault / symptom" value={defectDraft.fault} onChange={v => setDefectDraft({ ...defectDraft, fault: v })} textarea /><Field label="Actions taken" value={defectDraft.actions} onChange={v => setDefectDraft({ ...defectDraft, actions: v })} textarea /><Field label="Risk / limitation" value={defectDraft.risk} onChange={v => setDefectDraft({ ...defectDraft, risk: v })} textarea /><Field label="Required spares" value={defectDraft.spares} onChange={v => setDefectDraft({ ...defectDraft, spares: v })} /><Field label="Recommendation" value={defectDraft.recommendation} onChange={v => setDefectDraft({ ...defectDraft, recommendation: v })} textarea /><button onClick={addDefect} className="rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950">Save defect</button></div></SectionCard><SectionCard title="Reports" icon={Archive}><div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">{defects.map(report => <div key={report.id} className="rounded-2xl border border-slate-700 bg-[#11223b] p-3 text-sm"><div className="font-bold text-cyan-100">{report.equipment}</div><p className="mt-2 whitespace-pre-wrap">{report.fault}</p><button onClick={() => downloadText(`defect-${report.equipment || report.id}.txt`, `DEFECT REPORT\n\nEquipment: ${report.equipment}\nFault: ${report.fault}\nActions: ${report.actions}\nRisk: ${report.risk}\nSpares: ${report.spares}\nRecommendation: ${report.recommendation}`)} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-1.5 text-xs"><Download className="h-4 w-4" /> Export</button></div>)}</div></SectionCard></div>;

  const renderPhotos = () => <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-5"><SectionCard title="Attach evidence photo" icon={Camera}><div className="space-y-3"><Field label="Title" value={photoTitle} onChange={setPhotoTitle} placeholder="DG1 fuel leak before repair" /><Field label="Note" value={photoNote} onChange={setPhotoNote} textarea /><input type="file" accept="image/*" onChange={e => handlePhoto(e.target.files?.[0])} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:font-semibold file:text-slate-950" /></div></SectionCard><SectionCard title="Photo evidence" icon={Archive}><div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">{photos.map(photo => <div key={photo.id} className="rounded-2xl border border-slate-700 bg-[#11223b] p-3"><img src={photo.image} alt={photo.title} className="h-40 w-full rounded-xl object-cover" /><div className="mt-2 font-semibold">{photo.title}</div><p className="text-xs text-slate-400">{photo.note}</p></div>)}</div></SectionCard></div>;

  const renderBackup = () => <div className="grid grid-cols-1 lg:grid-cols-2 gap-5"><SectionCard title="Ship profile" icon={ShipWheel}><div className="space-y-3">{(Object.keys(shipProfile) as Array<keyof ShipProfile>).map(key => <Field key={key} label={key.replace(/([A-Z])/g, " $1")} value={shipProfile[key]} onChange={v => setShipProfile({ ...shipProfile, [key]: v })} textarea={key === "notes"} />)}<button onClick={saveProfile} className="rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950">Save profile</button></div></SectionCard><SectionCard title="Offline backup / restore" icon={Database}><div className="space-y-4"><p className="text-sm text-slate-300">Export all manuals, logs, PMS, spares, defects, photos, and vessel profile as one local JSON file.</p><button onClick={exportAll} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950"><Download className="h-4 w-4" /> Export backup</button><div><input type="file" accept="application/json,.json" onChange={e => importBackup(e.target.files?.[0])} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-[#11223b] file:px-3 file:py-2 file:font-semibold file:text-cyan-100" /></div>{importMessage && <div className="rounded-2xl border border-slate-700 bg-[#11223b] p-3 text-sm text-slate-300">{importMessage}</div>}</div></SectionCard></div>;

  const renderEmergency = () => <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{emergencyChecklists.map(checklist => <div key={checklist.id} className="rounded-3xl border border-red-800 bg-red-950/30 p-5"><div className="mb-3 flex items-center gap-2 text-xl font-black text-red-100"><LifeBuoy className="h-6 w-6" /> {checklist.title}</div><ol className="space-y-2">{checklist.items.map((item, idx) => <li key={item} className="rounded-2xl bg-[#071524]/80 p-3 text-sm text-slate-100"><b className="text-red-300">{idx + 1}.</b> {item}</li>)}</ol></div>)}</div>;

  const renderTraining = () => <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{trainingModules.map(module => <SectionCard key={module.id} title={module.title} icon={GraduationCap}><p className="text-sm leading-relaxed text-slate-300">{module.lesson}</p><div className="mt-4 rounded-2xl border border-slate-700 bg-[#11223b] p-3"><div className="text-xs font-bold uppercase text-cyan-200">Quiz</div><p className="mt-1 text-sm">{module.question}</p><details className="mt-2 text-sm text-emerald-200"><summary className="cursor-pointer">Show answer</summary><p className="mt-2">{module.answer}</p></details></div></SectionCard>)}</div>;

  const renderLanguage = () => <SectionCard title="Technical language helper" icon={Languages}><div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-[#11223b] p-4"><div className="font-bold text-cyan-100">English → Greek core terms</div><ul className="mt-3 space-y-2 text-slate-300"><li>Lock out tag out — Απομόνωση και σήμανση</li><li>Scavenge space — Χώρος σάρωσης</li><li>Crankcase — Στροφαλοθάλαμος</li><li>Starting air — Αέρας εκκίνησης</li><li>Fuel injector — Μπεκ καυσίμου</li></ul></div><div className="rounded-2xl bg-[#11223b] p-4"><div className="font-bold text-cyan-100">Rule</div><p className="mt-3 text-slate-300">Critical safety terms stay in English plus translation to avoid confusion during multinational watchkeeping.</p></div></div></SectionCard>;

  const content = {
    manuals: renderManuals,
    trees: renderTrees,
    safety: renderSafety,
    logbook: renderLogbook,
    pms: renderPms,
    spares: renderSpares,
    calculators: renderCalculators,
    alarms: renderAlarms,
    defects: renderDefects,
    photos: renderPhotos,
    backup: renderBackup,
    emergency: renderEmergency,
    training: renderTraining,
    language: renderLanguage,
  }[activeTab];

  return (
    <section className="rounded-[2rem] border border-slate-700/80 bg-[#071524] p-3 md:p-5 shadow-2xl shadow-black/20">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-700 bg-cyan-950/30 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-100">
            <Wrench className="h-4 w-4" /> Professional Engineer Suite
          </div>
          <h2 className="mt-2 text-2xl font-black text-white">Daily tools, emergencies, reports, manuals, and maintenance</h2>
          <p className="mt-1 text-sm text-slate-400">Everything saves locally for offline use and can be exported as a shipboard backup.</p>
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`shrink-0 inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition-colors ${activeTab === tab.id ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-slate-700 bg-[#11223b] text-slate-300 hover:border-cyan-700"}`}><Icon className="h-4 w-4" /> {tab.label}</button>;
        })}
      </div>

      {content()}
    </section>
  );
}
