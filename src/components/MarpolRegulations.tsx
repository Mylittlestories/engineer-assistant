import React, { useState } from "react";
import { Scale, Droplets, Flame, ShieldAlert, FileText, CheckSquare, Search } from "lucide-react";

interface Regulation {
  annex: string;
  title: string;
  scope: string;
  keyControls: string[];
  equipmentRequirements: string[];
  loggingChecks: string[];
  severePenalties: string;
}

export const MarpolRegulationsComply: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeAnnex, setActiveAnnex] = useState<string>("All");

  const regulations: Regulation[] = [
    {
      annex: "Annex I",
      title: "Prevention of Pollution by Oil (OWS & Bilge)",
      scope: "Discharge of oily bilge water, fuel tank sludge, and engine room machinery space drainage.",
      keyControls: [
        "Strict maximum of 15 ppm (parts per million) oil-in-water discharge content.",
        "OWS must be running with an active, locked, typified 15ppm bilge alarm and automatic 3-way diversion valve.",
        "Discharge must ONLY occur while the vessel is en route/underway."
      ],
      equipmentRequirements: [
        "Calibrated 15ppm Bilge Monitor matching IMO MEPC.107(49) with memory logging capabilities.",
        "Auto-stop or recirculation device redirecting off-spec water (>15ppm) back to bilge holding tanks.",
        "Locked physical locks on sample outlet lines to prevent clean-water injection bypass tampering."
      ],
      loggingChecks: [
        "Every operation must be manually logged in the Oil Record Book (ORB) Part I with precise UTC time and coordinates.",
        "Entries must include: Bilge pump starts/stops, sludge transfers to shore or incinerator, and OWS automated runs.",
        "Each active entry must be signed by the officer in charge (usually 3rd/2nd Engineer) and page-signed by the Chief Engineer and Master."
      ],
      severePenalties: "Class A criminal felony in many jurisdictions (such as US Coast Guard Magic Pipe audits). Civil fines can exceed $25,000,000 and crew imprisonment."
    },
    {
      annex: "Annex IV",
      title: "Prevention of Pollution by Sewage from Ships",
      scope: "Discharge of human wastes, graywater mixtures from toilets, medical drains, and livestock holds.",
      keyControls: [
        "Prohibited to discharge untreated sewage within 12 nautical miles from the nearest land.",
        "Completely comminuted and disinfected sewage can be discharged >3 nautical miles from land.",
        "Approved sewage treatment holding systems allow discharge anywhere if effluents do not produce blue/black visible floating solids."
      ],
      equipmentRequirements: [
        "Sewage treatment plant operating with biological digestion chambers and chlorine/UV sterilizers.",
        "Integrated macerator and disinfection holding system with regulated flow metering limits."
      ],
      loggingChecks: [
        "Document chlorine dosing levels daily in the machinery logbook.",
        "Log GPS coordinates and ship speed whenever opening the direct discharge valve (overboard bypass).",
        "Record sludge suction transfers to port reception vessels."
      ],
      severePenalties: "Port State Control detention, heavy detention fines, and blacklisting of the vessel."
    },
    {
      annex: "Annex VI",
      title: "Prevention of Air Pollution & Incinerator Control",
      scope: "Exhaust emissions (SOx, NOx, PM), ozone-depleting substances, and thermal waste destruction.",
      keyControls: [
        "Fuel sulfur content limit at 0.50% m/m globally, and 0.10% m/m in Emission Control Areas (ECAs - Baltic, North Sea, US/Canada).",
        "Incinerator burning is banned while the vessel is inside ports, harbors, and inland estuaries.",
        "Banned substances to burn: PCB compounds, toxic heavy-metal ashes, refined plastic materials, halogenated organics."
      ],
      equipmentRequirements: [
        "Incinerators certified under IMO MEPC.76(40) or MEPC.244(66).",
        "Primary combustion chamber operating between 850°C and 1200°C to guarantee complete thermal destruction.",
        "Interlock switch preventing sludge burner firing unless draft fan negative pressure matches safe limits."
      ],
      loggingChecks: [
        "Log the start and stop burner combustion times, sludge quantity burned (liters/m³), and peak flame temperature.",
        "Document fuel-changeover logs (switching to low-sulfur MGO/HFO) when entering/exiting an ECA region.",
        "Keep continuous automated recording charts of flue-gas thermal discharge for up to 3 years."
      ],
      severePenalties: "ECA environmental fine penalties per cylinder deviation, severe Port State detention, and corporate MARPOL sanctions."
    },
    {
      annex: "D-2 Standard",
      title: "Ballast Water Management System (BWTS) Standards",
      scope: "Sterilization and filtration of sea ballast water to restrict invasive aquatic micro-organisms.",
      keyControls: [
        "Discharge ballast water must contain less than 10 viable organisms per cubic meter (size >= 50 micrometers).",
        "Discharge must contain less than 10 viable organisms per milliliter (size 10 to 50 micrometers).",
        "Indicator microbes restrictions: Vibrio cholerae (< 1 CFU/100ml), E. Coli (< 250 CFU/100ml), Enterococci (< 100 CFU/100ml)."
      ],
      equipmentRequirements: [
        "Operational Type-Approved Ballast Water Treatment System (utilizing automatic filtration + UV or Electrolysis disinfection).",
        "Continuous automated sample data logging recording real-time water turbidity, GPS position, and active system electrical inputs."
      ],
      loggingChecks: [
        "Log every ballasting, de-ballasting, and bypass washing sequence in the Ballast Water Record Book.",
        "Document physical pre-treatment filtration pressure values and CIP descaling chemical washes.",
        "Prepare BWTS active-operation worksheets for boarding Port State Control bio-compliance inspector sweeps."
      ],
      severePenalties: "Fines up to $100,000 per unauthorized bypass discharge, refusal of port entry, and heavy vessel detention fees."
    }
  ];

  const filteredRegs = regulations.filter((reg) => {
    const matchesSearch =
      reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.annex.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeAnnex === "All") return matchesSearch;
    return reg.annex === activeAnnex && matchesSearch;
  });

  return (
    <div className="bg-[#0d1425] border border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col h-full" id="marpol-regs-panel">
      {/* Search and Filter Panel */}
      <div className="p-4 bg-[#111827] border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white font-display">
            MARPOL & Offshore Ecological Compliance Directory
          </h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search regulations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-full md:w-60 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex gap-1 bg-slate-900 p-1 rounded border border-slate-800">
            {["All", "Annex I", "Annex IV", "Annex VI", "D-2 Standard"].map((annex) => (
              <button
                key={annex}
                onClick={() => setActiveAnnex(annex)}
                className={`px-2 py-1 text-[10px] font-bold uppercase rounded transition-colors ${
                  activeAnnex === annex
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {annex.replace(" Standard", "")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Regulation list view */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="bg-cyan-950/20 border border-cyan-800/30 p-3.5 rounded text-xs text-slate-300 leading-relaxed flex gap-3">
          <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <strong>CRITICAL LEGAL PROTOCOL:</strong> Every marine engineer is personally responsible under the **STCW and IMO conventions** for strict verification of offshore logs. Manipulating oily-water separators (OWS), bypassing filters, or submitting falsified logs triggers swift vessel detention and criminal action. Consult this reference checklist during daily operations.
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredRegs.map((reg, index) => (
            <div 
              key={index}
              className="bg-[#0f172a] border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition-all shadow-md"
              id={`marpol-card-${reg.annex.replace(" ", "-")}`}
            >
              {/* Header */}
              <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-cyan-950 text-cyan-400 text-[10px] font-mono font-bold tracking-wider rounded border border-cyan-800/30">
                    {reg.annex}
                  </span>
                  <h3 className="text-sm font-bold text-white font-display">
                    {reg.title}
                  </h3>
                </div>
                {reg.annex === "Annex I" || reg.annex === "D-2 Standard" ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-400 font-mono">
                    <Droplets className="w-3 h-3 text-red-405 animate-pulse" />
                    Liquid Effluent Limit
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 font-mono">
                    <Flame className="w-3 h-3 text-amber-450 animate-pulse" />
                    Combust/Emission Limit
                  </span>
                )}
              </div>

              {/* Grid content */}
              <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300">
                
                {/* Left side: Scope and Core controls */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-405" />
                      Scope & Machinery Coverage
                    </h4>
                    <p className="leading-relaxed bg-slate-950/45 p-2.5 rounded border border-slate-850">
                      {reg.scope}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-yellow-550" />
                      Strict Ecological Controls
                    </h4>
                    <ul className="list-disc pl-4 space-y-1.5 leading-relaxed text-slate-250">
                      {reg.keyControls.map((ctrl, codeIdx) => (
                        <li key={codeIdx}>{ctrl}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right side: Machinery specs & logs */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
                      Equipment Specifications
                    </h4>
                    <ul className="list-decimal pl-4 space-y-1.5 leading-relaxed text-slate-250">
                      {reg.equipmentRequirements.map((req, reqIdx) => (
                        <li key={reqIdx}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-450" />
                      Mandatory Boarding / ORB Checks
                    </h4>
                    <ul className="list-disc pl-4 space-y-1.5 leading-relaxed text-slate-250">
                      {reg.loggingChecks.map((log, logIdx) => (
                        <li key={logIdx}>{log}</li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>

              {/* Penalty alert footer */}
              <div className="p-3.5 bg-red-950/20 border-t border-slate-800 text-[11px] text-red-300 font-medium flex items-center gap-2">
                <span className="bg-red-950 text-red-400 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-red-900/30 font-mono shrink-0">
                  PENALTY FOCUS
                </span>
                <span className="italic leading-relaxed">{reg.severePenalties}</span>
              </div>
            </div>
          ))}

          {filteredRegs.length === 0 && (
            <div className="py-12 text-center text-slate-550 font-medium text-xs">
              No shipboard MARPOL regulations match active filter text.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
