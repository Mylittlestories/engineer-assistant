import React, { useState } from "react";
import { 
  Laptop, 
  Cpu, 
  Terminal, 
  Download, 
  CheckCircle2, 
  FolderOpen, 
  FileCode, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Play
} from "lucide-react";

interface PcDesktopTabProps {
  language: "EN" | "GR";
}

export default function PcDesktopTab({ language }: PcDesktopTabProps) {
  const isGr = language === "GR";
  
  // Interactive Simulation states
  const [appName, setAppName] = useState("DRV-Engineer-Assistant");
  const [localPort, setLocalPort] = useState("3000");
  const [targetArch, setTargetArch] = useState("win-x64");
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildSuccess, setBuildSuccess] = useState(false);

  const triggerSimulationBuild = () => {
    setIsBuilding(true);
    setBuildProgress(0);
    setBuildSuccess(false);
    setBuildLogs([
      isGr ? "⏳ Έναρξη διαδικασίας μεταγλώττισης για PC..." : "⏳ Initiating standalone build process for PC...",
      `🔧 Application: ${appName}.exe`,
      `🔧 Selected Port Ingress: 0.0.0.0:${localPort}`,
      `🔧 Target Platform: Node20-${targetArch}`,
      "🔍 Επαλήθευση αρχείων κώδικα (database.ts, StepByStepOverhauls.tsx...)",
      "🔍 Verifying offline core assets & Greek/English translation sets...",
    ]);

    const steps = [
      { prg: 20, log: isGr ? "📦 Εκτέλεση παραγωγικού build: `npm run build`..." : "📦 Running production build command: `npm run build`..." },
      { prg: 40, log: isGr ? "⚡ Μεταγλώττιση διακομιστή Express & Vite σε dist/..." : "⚡ Bundling Express + Vite server into dist/server.cjs..." },
      { prg: 65, log: isGr ? "💼 Εμπλοκή μηχανισμού PKG (Packager) της Node.js..." : "💼 Activating Node.js PKG Packager engine..." },
      { prg: 85, log: isGr ? "🛡️ Ενσωμάτωση τοπικής βάσης δεδομένων & περιβάλλοντος SOLAS..." : "🛡️ Embedding offline relational worksheets and SOLAS guidelines..." },
      { prg: 100, log: isGr ? "✅ Η μεταγλώττιση ολοκληρώθηκε! Παράχθηκε το αρχείο: " : "✅ Bundling complete! Standalone binary produced: " }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setBuildProgress(step.prg);
        setBuildLogs(prev => [
          ...prev, 
          step.log + (step.prg === 100 ? `${appName}.exe` : "")
        ]);
        if (step.prg === 100) {
          setIsBuilding(false);
          setBuildSuccess(true);
        }
      }, (index + 1) * 1000);
    });
  };

  return (
    <div className="flex flex-col gap-6" id="pc-desktop-tool-module">
      
      {/* HEADER SECTION */}
      <div className="bg-[#0b1d33] border-2 border-sky-500/30 rounded-xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-gradient-to-br from-sky-450 to-[#113054] rounded flex items-center justify-center text-white font-black shadow-lg">
            <Laptop className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-white font-display uppercase tracking-tight">
              {isGr ? "Λειτουργία PC & Standalone EXE Πακέτο" : "PC Standalone & Offline EXE Packaging Desk"}
            </h2>
            <p className="text-xs text-sky-400 font-semibold font-mono tracking-wider">
              {isGr ? "ΤΟΠΙΚΗ ΕΓΚΑΤΑΣΤΑΣΗ ΣΕ ΥΠΟΛΟΓΙΣΤΗ ΠΛΟΙΟΥ // ΑΥΤΟΝΟΜΗ ΛΕΙΤΟΥΡΓΙΑ SCREEN" : "SHIPBOARD COMPUTER DEPLOYMENT & DOUBLE-CLICK SANDBOX INTEGRITY"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: INTERACTIVE BUNDLER PANEL */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#0c1a2e] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-5">
            <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-400" />
              <h3 className="text-xs font-black text-white font-display uppercase tracking-wider">
                {isGr ? "Προσομοιωτής Μεταγλώττισης Standalone EXE" : "Standalone EXE Compiler Control"}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                  {isGr ? "Όνομα Εκτελέσιμου (.exe)" : "Target Executable Name"}
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                  disabled={isBuilding}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                  {isGr ? "Τοπική Θύρα Δικτύου (Port)" : "Local Web Port Ingress"}
                </label>
                <input
                  type="number"
                  value={localPort}
                  onChange={(e) => setLocalPort(e.target.value)}
                  disabled={isBuilding}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono font-semibold"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                  {isGr ? "Αρχιτεκτονική Συστήματος Στόχου" : "Target System Architecture"}
                </label>
                <select
                  value={targetArch}
                  onChange={(e) => setTargetArch(e.target.value)}
                  disabled={isBuilding}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono font-semibold focus:outline-none"
                >
                  <option value="win-x64">Windows x64 Standalone Binary (Most Common Ship PC)</option>
                  <option value="win-x86">Windows x86 legacy Marine Terminal</option>
                  <option value="linux-x64">Linux Core Server (Industrial Touchscreen Panel)</option>
                </select>
              </div>
            </div>

            <button
              onClick={triggerSimulationBuild}
              disabled={isBuilding}
              className={`w-full py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isBuilding 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-sky-500 hover:bg-sky-600 text-slate-950 shadow-md font-black"
              }`}
            >
              <Cpu className={`w-4 h-4 ${isBuilding ? "animate-spin" : ""}`} />
              <span>{isBuilding ? (isGr ? "ΜΕΤΑΓΛΩΤΤΙΣΗ ΣΕ ΕΞΕΛΙΞΗ..." : "BUILDING STANDALONE STREAM...") : (isGr ? "ΕΝΑΡΞΗ ΔΗΜΙΟΥΡΓΙΑΣ EXE" : "COMPILE STANDALONE EXE")}</span>
            </button>

            {/* Simulated Live Console Log */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-[10.5px] leading-relaxed relative overflow-hidden">
              <div className="flex justify-between items-center text-slate-550 border-b border-slate-900 pb-2 mb-2">
                <span>DRV_COMPILER_BUS_CLIENT // CONSOLE LOGS</span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isBuilding ? "bg-amber-400 animate-pulse" : buildSuccess ? "bg-emerald-400" : "bg-sky-400"}`} />
                  {isBuilding ? "COMPILING" : buildSuccess ? "SUCCESS" : "READY"}
                </span>
              </div>

              {isBuilding && (
                <div className="mb-3.5">
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-1 transition-all duration-300" style={{ width: `${buildProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                {buildLogs.length === 0 ? (
                  <p className="text-slate-500 italic">{isGr ? "Πατήστε 'ΕΝΑΡΞΗ ΔΗΜΙΟΥΡΓΙΑΣ EXE' για δοκιμή..." : "Press 'COMPILE STANDALONE EXE' to initiate packaging mockup..."}</p>
                ) : (
                  buildLogs.map((log, idx) => (
                    <p key={idx} className={log.includes("✅") ? "text-emerald-400 font-bold" : log.includes("⏳") ? "text-amber-300" : "text-sky-300/80"}>
                      &gt; {log}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MANUAL ARCHIVAL / PDF COPIES */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Section 1: Physical Scripts Explanation */}
          <div className="bg-[#0c1a2e] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-sky-400" />
              <h3 className="text-xs font-black text-white font-display uppercase tracking-wider">
                {isGr ? "Αρχεία Εκκίνησης & Scripts" : "Local Workspace Packaging Files"}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isGr 
                ? "Τα ακόλουθα αρχεία έχουν δημιουργηθεί στο ριζικό φάκελο της εφαρμογής για να επιτρέψουν την πλήρη standalone μετατροπή στον υπολογιστή σας:"
                : "The following configuration files are verified present in your root directory. Copy the codebase folder to a PC with Node.js installed to deploy locally:"}
            </p>

            <div className="space-y-3 font-sans">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-sky-400" />
                    generate-exe.bat
                  </span>
                  <span className="text-[9px] bg-sky-950 text-sky-400 px-1.5 py-0.5 rounded font-mono font-bold">AUTOMATOR</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {isGr 
                    ? "Διπλό κλικ σε υπολογιστή με Windows. Εγκαθιστά αυτόματα το `pkg` και μεταγλωττίζει την εφαρμογή σε ένα μόνο αρχείο .exe."
                    : "Automates static bundling, server compiling, and binary assembly inside a single compact executable on Windows."}
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    run-offline.bat
                  </span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">LAUNCHER</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {isGr 
                    ? "Εκκινεί την εφαρμογή offline σε τοπικό server χωρίς να χρειάζεται compiling, ανοίγοντας απευθείας τον πλοηγό."
                    : "Instantly boots the Node.js Express server locally on port 3000 in your browser without packaging waittimes."}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Instructions Manual */}
          <div className="bg-[#0c1a2e] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h3 className="text-xs font-black text-white font-display uppercase tracking-wider">
                {isGr ? "Οδηγίες Εγκατάστασης Πλοίου" : "Shipboard Deployment Checklist"}
              </h3>
            </div>

            <ol className="text-xs text-slate-350 space-y-2 list-decimal pl-4 leading-relaxed font-sans">
              <li>
                <strong>{isGr ? "Λήψη Αρχείων Εφαρμογής:" : "Export Application Files:"}</strong> {isGr ? "Κάντε κλικ στο εικονίδιο Settings (Ρυθμίσεις) πάνω δεξιά στην οθόνη του Google AI Studio, και επιλέξτε 'Export to ZIP' για να κατεβάσετε ολόκληρο τον κώδικα στον υπολογιστή σας." : "Click on the Settings menu in the top right of Google AI Studio and select 'Export to ZIP' to download the entire compiled source code workspace to your machine."}
              </li>
              <li>
                <strong>{isGr ? "Μεταφορά στο Πλοίο:" : "Transfer to Vessel PC:"}</strong> {isGr ? "Αποσυμπιέστε το αρχείο ZIP και μεταφέρετε όλο το φάκελο με ένα USB στικάκι στον υπολογιστή της γέφυρας, του γραφείου μηχανής ή του Control Room." : "Extract the downloaded ZIP package and transfer the folders to your offline bridge or engine control room workstation using a USB drive."}
              </li>
              <li>
                <strong>{isGr ? "Εγκατάσταση Node.js:" : "Install Node.js Framework:"}</strong> {isGr ? "Κατεβάστε και εγκαταστήστε την έκδοση Node.js v20 (LTS) στον υπολογιστή." : "Ensure Node.js v20 LTS is installed on the terminal computer."}
              </li>
              <li>
                <strong>{isGr ? "Εκτέλεση του generate-exe.bat:" : "Double-click generate-exe.bat:"}</strong> {isGr ? "Αυτό θα δημιουργήσει ένα αρχείο " : "This initiates compilation, outputting your custom "}<code className="bg-slate-900 border border-slate-800 text-sky-400 px-1 py-0.5 rounded text-[10px] font-mono">DRV-Engineer-Assistant.exe</code>{isGr ? " έτοιμο για διπλό κλικ." : " binary."}
              </li>
              <li>
                <strong>{isGr ? "Έτοιμο για Χρήση:" : "Sandbox Standalone Run:"}</strong> {isGr ? "Διπλό κλικ στο αρχείο .exe για να ανοίξει η εφαρμογή χωρίς ίντερνετ οπουδήποτε στον ωκεανό." : "Launch the produced tool to host the app off-grid with 0% cloud dependencies."}
              </li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
}
