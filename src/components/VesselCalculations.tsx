import React, { useState } from "react";
import { 
  Compass, 
  Droplets, 
  FileText, 
  Gauge, 
  Activity, 
  Check, 
  Copy, 
  RefreshCw, 
  AlertTriangle,
  Play,
  TrendingDown,
  Clock
} from "lucide-react";

interface VesselCalculationsProps {
  language: "EN" | "GR";
}

export default function VesselCalculations({ language }: VesselCalculationsProps) {
  const isGr = language === "GR";
  const [activeSubTab, setActiveSubTab] = useState<"deflection" | "changeover" | "orb" | "auxiliary">("deflection");
  const [numCylinders, setNumCylinders] = useState<number>(6);

  // ==========================================
  // STATE 4: SEPARATOR GRAVITY DISC & BOILER CHEMICALS
  // ==========================================
  const [fuelDensity15, setFuelDensity15] = useState<number>(0.985); // g/ml at 15C
  const [purificationTemp, setPurificationTemp] = useState<number>(95); // degrees C
  const [oilFeedRate, setOilFeedRate] = useState<number>(3.5); // m³/h

  const [boilerPh, setBoilerPh] = useState<number>(8.5); // pH
  const [boilerChloride, setBoilerChloride] = useState<number>(180); // ppm Cl-
  const [boilerPhosphate, setBoilerPhosphate] = useState<number>(12); // ppm PO4---
  const [boilerSulfite, setBoilerSulfite] = useState<number>(8); // ppm SO3--

  // Purifier calculations
  const calculateGravityDisc = () => {
    const densityActual = fuelDensity15 - 0.00064 * (purificationTemp - 15);
    let recommendedDisc = "74 mm";
    let isAlcapRequired = false;
    
    if (densityActual >= 0.96) {
      recommendedDisc = "56 mm (ALCAP Needed)";
      isAlcapRequired = true;
    } else if (densityActual >= 0.94) {
      recommendedDisc = "62 mm";
    } else if (densityActual >= 0.92) {
      recommendedDisc = "65 mm";
    } else if (densityActual >= 0.90) {
      recommendedDisc = "70 mm";
    } else if (densityActual >= 0.88) {
      recommendedDisc = "74 mm";
    } else if (densityActual >= 0.86) {
      recommendedDisc = "78 mm";
    } else if (densityActual >= 0.84) {
      recommendedDisc = "82 mm";
    } else {
      recommendedDisc = "85 mm";
    }

    const rawInterval = Math.max(0.5, Math.min(12, 24 / ((fuelDensity15 - 0.80) * 15 + 1)));
    const purgeIntervalHours = Math.round(rawInterval * 10) / 10;

    return {
      densityActual,
      recommendedDisc,
      isAlcapRequired,
      purgeIntervalHours
    };
  };

  const diagnoseBoilerWater = () => {
    const diagnostics: { param: string; value: string; status: "OK" | "WARN" | "CRIT"; msg: string }[] = [];

    // pH check
    if (boilerPh >= 9.5 && boilerPh <= 11.0) {
      diagnostics.push({
        param: "pH Value",
        value: boilerPh.toFixed(1),
        status: "OK",
        msg: isGr ? "Εντός φυσιολογικών ορίων. Προλαμβάνει την όξινη διάβρωση." : "Within range. Safeguards against acidic corrosion."
      });
    } else if (boilerPh < 9.5) {
      diagnostics.push({
        param: "pH Value",
        value: boilerPh.toFixed(1),
        status: "CRIT",
        msg: isGr 
          ? "⚠️ ΠΟΛΥ ΧΑΜΗΛΟ pH! Κίνδυνος γενικής διάβρωσης του αυλού και των σωληνώσεων. Δοσολογήστε ΑΜΕΣΩΣ alkalinity control." 
          : "⚠️ PH TOO LOW! Severe risk of acidic tube scaling and corrosion. Dose Alkalinity Control booster immediately."
      });
    } else {
      diagnostics.push({
        param: "pH Value",
        value: boilerPh.toFixed(1),
        status: "WARN",
        msg: isGr 
          ? "⚠️ Υψηλό pH (>11.0). Κίνδυνος καυστικού ραγίσματος (caustic embrittlement) και αφρισμού (foaming)." 
          : "⚠️ PH TOO HIGH! Risk of caustic embrittlement and foaming at steam headers. Conduct surface blowdown."
      });
    }

    // Chloride check
    if (boilerChloride < 150) {
      diagnostics.push({
        param: "Chloride (Cl-)",
        value: `${boilerChloride} ppm`,
        status: "OK",
        msg: isGr ? "Χαμηλή αλατότητα. Δεν υπάρχει εισροή θαλασσινού νερού." : "Low salinity level. No active condenser sea-water contamination detected."
      });
    } else {
      diagnostics.push({
        param: "Chloride (Cl-)",
        value: `${boilerChloride} ppm`,
        status: "CRIT",
        msg: isGr 
          ? "⚠️ ΥΨΗΛΑ ΧΛΩΡΙΔΙΑ (>150 ppm)! Ύποπτη διαρροή στον συμπυκνωτή ή στο evaporator. Κάντε bottom blowdown για μείωση." 
          : "⚠️ HIGH CHLORIDES! Condenser/evaporator tube leak suspected. Perform continuous bottom bottom-blowdown immediately."
      });
    }

    // Phosphate check
    if (boilerPhosphate >= 20 && boilerPhosphate <= 45) {
      diagnostics.push({
        param: "Phosphate (PO4)",
        value: `${boilerPhosphate} ppm`,
        status: "OK",
        msg: isGr ? "Επαρκής κατακρήμνιση ασβεστίου σε μη-προσκολλημένη λάσπη." : "Sufficient scale-inhibitor level. Heavy metals precipitating as soft sludge."
      });
    } else if (boilerPhosphate < 20) {
      diagnostics.push({
        param: "Phosphate (PO4)",
        value: `${boilerPhosphate} ppm`,
        status: "WARN",
        msg: isGr 
          ? "⚠️ Χαμηλό φωσφορικό άλας. Κίνδυνος σκληρής επικαθίσεως αλάτων (scale build-up). Αυξήστε τη δοσολογία phosphate treatment." 
          : "⚠️ PHOSPHATE TOO LOW! Hard scale accumulation risk. Incrementally escalate phosphate water treatment chemical dose."
      });
    } else {
      diagnostics.push({
        param: "Phosphate (PO4)",
        value: `${boilerPhosphate} ppm`,
        status: "WARN",
        msg: isGr ? "Υπερβολικό φωσφορικό άλας. Δαπάνη χημικών χωρίς όφελος." : "Excessive phosphate level. Chemical overdose; monitor blowdown frequency."
      });
    }

    // Sulfite check
    if (boilerSulfite >= 15 && boilerSulfite <= 40) {
      diagnostics.push({
        param: "Sulfite (SO3)",
        value: `${boilerSulfite} ppm`,
        status: "OK",
        msg: isGr ? "Επαρκής δέσμευση οξυγόνου. Αποφυγή οξείδωσης Pitting." : "Adequate oxygen scavenging level. System immune to dry internal pitting corrosion."
      });
    } else if (boilerSulfite < 15) {
      diagnostics.push({
        param: "Sulfite (SO3)",
        value: `${boilerSulfite} ppm`,
        status: "WARN",
        msg: isGr 
          ? "⚠️ Χαμηλό θειώδες άλας. Κίνδυνος οξείδωσης pitting. Αυξήστε τη δοσολογία sulfite oxygen scavenger."
          : "⚠️ SULFITE TOO LOW! Active dissolved oxygen risk. Increase sulfite dose to prevent localized pitting corrosion."
      });
    } else {
      diagnostics.push({
        param: "Sulfite (SO3)",
        value: `${boilerSulfite} ppm`,
        status: "WARN",
        msg: isGr ? "Υψηλό θειώδες. Αυξάνει αδικαιολόγητα τα διαλυμένα στερεά." : "Chemical over-dose. Unnecessary increase in Total Dissolved Solids."
      });
    }

    const criticalsCount = diagnostics.filter(d => d.status === "CRIT").length;
    const warningsCount = diagnostics.filter(d => d.status === "WARN").length;
    let overallStatus: "COMPLIANT" | "CORRECTION_REQUIRED" | "CRITICAL_DANGER" = "COMPLIANT";
    if (criticalsCount > 0) {
      overallStatus = "CRITICAL_DANGER";
    } else if (warningsCount > 0) {
      overallStatus = "CORRECTION_REQUIRED";
    }

    return {
      diagnostics,
      overallStatus
    };
  };

  const [activeCyl, setActiveCyl] = useState<number>(1);
  
  // Deflections are measured in hundredths of a millimeter (e.g., +4 is +0.04mm)
  // Store dial gauge values for cylinders 1 to 8: T, BP, P, S, BS
  const [deflectionData, setDeflectionData] = useState<Record<number, { T: number; BP: number; P: number; S: number; BS: number }>>({
    1: { T: 2, BP: 0, P: 3, S: -1, BS: 1 },
    2: { T: 4, BP: 1, P: 5, S: -2, BS: 2 },
    3: { T: -1, BP: -1, P: 2, S: 1, BS: -2 },
    4: { T: 8, BP: 2, P: 6, S: -3, BS: 1 }, // cylinder 4 is problematic (high deflection)
    5: { T: 1, BP: 0, P: 1, S: 0, BS: 1 },
    6: { T: 3, BP: 2, P: 4, S: -1, BS: 2 },
    7: { T: 0, BP: 0, P: 0, S: 0, BS: 0 },
    8: { T: 0, BP: 0, P: 0, S: 0, BS: 0 },
  });

  const updateDeflectionValue = (cyl: number, position: "T" | "BP" | "P" | "S" | "BS", val: number) => {
    setDeflectionData(prev => ({
      ...prev,
      [cyl]: {
        ...prev[cyl],
        [position]: val
      }
    }));
  };

  const getDeflectionCalculations = (cyl: number) => {
    const data = deflectionData[cyl] || { T: 0, BP: 0, P: 0, S: 0, BS: 0 };
    // Vertical deflection difference: T - (BP + BS)/2
    const bottomAverage = (data.BP + data.BS) / 2;
    const vertVal = data.T - bottomAverage;
    // Horizontal deflection difference: P - S
    const horizVal = data.P - data.S;

    // Direct millimetre values
    const vertMm = vertVal / 100;
    const horizMm = horizVal / 100;

    // Status based on tolerances
    // Standard auxiliary engines: max vertical difference is usually 0.06mm, critical is 0.08mm+
    const absV = Math.abs(vertMm);
    const absH = Math.abs(horizMm);
    
    let status: "Excellent" | "Acceptable" | "Critical" = "Excellent";
    if (absV > 0.08 || absH > 0.08) {
      status = "Critical";
    } else if (absV > 0.04 || absH > 0.04) {
      status = "Acceptable";
    }

    return {
      vertical: vertVal,
      horizontal: horizVal,
      verticalMm: vertMm,
      horizontalMm: horizMm,
      status
    };
  };

  // ==========================================
  // STATE 2: MARPOL FUEL CHANGEOVER CALCULATOR
  // ==========================================
  const [tankCapacity, setTankCapacity] = useState<number>(3.0); // m³
  const [fuelConsumption, setFuelConsumption] = useState<number>(0.8); // m³/hour
  const [sulfurStart, setSulfurStart] = useState<number>(2.70); // % HFO
  const [sulfurLow, setSulfurLow] = useState<number>(0.05); // % LSMGO
  
  // Calculate changeover time using first-order dynamic logarithmic mixing formula:
  // t = - (V / F) * ln( (C_target - C_low) / (C_start - C_low) )
  const calculateChangeover = () => {
    const targetSulfur = 0.10; // fixed IMO ECA limit

    // Guards
    if (sulfurStart <= targetSulfur) {
      return { hours: 0, mins: 0, unreachable: false, alreadyCompliant: true, fuelUsed: 0 };
    }
    if (sulfurLow >= targetSulfur) {
      return { hours: 0, mins: 0, unreachable: true, alreadyCompliant: false, fuelUsed: 0 };
    }

    const ratio = (targetSulfur - sulfurLow) / (sulfurStart - sulfurLow);
    if (ratio <= 0) {
      return { hours: 0, mins: 0, unreachable: true, alreadyCompliant: false, fuelUsed: 0 };
    }

    const tHours = - (tankCapacity / fuelConsumption) * Math.log(ratio);
    const finalHours = Math.max(0, tHours);
    const mins = Math.round((finalHours % 1) * 60);
    const wholeHours = Math.floor(finalHours);
    const fuelUsed = finalHours * fuelConsumption;

    return {
      hours: wholeHours,
      mins,
      totalHoursDecimal: finalHours,
      unreachable: false,
      alreadyCompliant: false,
      fuelUsed: Math.round(fuelUsed * 100) / 100
    };
  };

  // ==========================================
  // STATE 3: OIL RECORD BOOK DRAFTER
  // ==========================================
  const [orbTemplate, setOrbTemplate] = useState<"incinerate" | "bilge_pump" | "ows_discharge" | "bunker">("incinerate");
  const [orbDate, setOrbDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [orbVolume, setOrbVolume] = useState<number>(1.2); // m³
  const [orbFromTank, setOrbFromTank] = useState<string>("Bilge Water Holding Tank");
  const [orbToTank, setOrbToTank] = useState<string>("Sludge Incinerator Tank");
  const [orbPositionStart, setOrbPositionStart] = useState<string>("37° 58' N, 023° 43' E");
  const [orbPositionEnd, setOrbPositionEnd] = useState<string>("38° 12' N, 024° 01' E");
  const [orbTimeStart, setOrbTimeStart] = useState<string>("08:00 UTC");
  const [orbTimeEnd, setOrbTimeEnd] = useState<string>("11:30 UTC");
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  const getORBLedgerLines = () => {
    switch (orbTemplate) {
      case "incinerate":
        return [
          { code: "C", item: "12", description: `Disposal of oil residues (sludge) by alternative methods.` },
          { code: "C", item: "12.3", description: `Burned in incinerator: ${orbVolume} m³ from ${orbFromTank}.` },
          { code: "C", item: "12.3", description: `Duration of operation: ${orbTimeStart} to ${orbTimeEnd}.` },
          { code: "", item: "", description: `Vessel Position: en-route in Mediterranean Sea (${orbPositionStart}).` },
          { code: "", item: "", description: `Signed: John Doe, 2nd Engineer  ||  Countersigned: George DeRVe, Chief Engineer` }
        ];
      case "bilge_pump":
        return [
          { code: "D", item: "13", description: `Transfer of bilge water between machinery space bilge wells and holding tanks.` },
          { code: "D", item: "13.0", description: `Transferred ${orbVolume} m³ from Engine Room Bilge Wells/Pockets.` },
          { code: "D", item: "13.0", description: `Received into: ${orbToTank} (Capacity: 12.0 m³).` },
          { code: "", item: "", description: `Operation: ${orbTimeStart} (Position: ${orbPositionStart}).` },
          { code: "", item: "", description: `Signed: John Doe, 2nd Engineer  ||  Countersigned: George DeRVe, Chief Engineer` }
        ];
      case "ows_discharge":
        return [
          { code: "H", item: "15", description: `Discharge overboard en route or disposal of bilge water accumulated in machinery spaces.` },
          { code: "H", item: "15.1", description: `Discharged ${orbVolume} m³ from Bilge Water Holding Tank through 15 ppm OWS.` },
          { code: "H", item: "15.2", description: `Started en-route at ${orbTimeStart} in Position: ${orbPositionStart}.` },
          { code: "H", item: "15.3", description: `Stopped en-route at ${orbTimeEnd} in Position: ${orbPositionEnd}.` },
          { code: "H", item: "15.4", description: `OWS system automatic monitoring: 15 ppm bilge alarm active and fully responsive.` },
          { code: "", item: "", description: `Signed: John Doe, 2nd Engineer  ||  Countersigned: George DeRVe, Chief Engineer` }
        ];
      case "bunker":
        return [
          { code: "H", item: "26", description: `Bunkering of fuel oil or lubricating oil.` },
          { code: "H", item: "26.1", description: `Bunkered: LSMGO (0.05% S) 45.0 metric tons receiving into No. 3 DB Tank.` },
          { code: "H", item: "26.2", description: `Bunkered: VLSFO (0.50% S) 120.0 metric tons receiving into No. 1 & 2 Wing Tanks.` },
          { code: "H", item: "26.3", description: `Completed at ${orbTimeStart} in Port of Piraeus, Greece.` },
          { code: "H", item: "26.4", description: `Representative fuel samples sealed and retained on board under MARPOL Annex VI regulations.` },
          { code: "", item: "", description: `Signed: John Doe, 2nd Engineer  ||  Countersigned: George DeRVe, Chief Engineer` }
        ];
    }
  };

  const copyOrbToClipboard = () => {
    const lines = getORBLedgerLines();
    const formatted = lines.map(l => `${orbDate}\t${l.code}\t${l.item}\t${l.description}`).join("\n");
    navigator.clipboard.writeText(formatted);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="bg-[#0a182a] border border-sky-500/30 rounded-xl shadow-xl overflow-hidden flex flex-col h-full" id="vessel-calc-desk-panel">
      {/* Tab Header Banner */}
      <div className="p-4 bg-[#111827] border-b border-sky-500/15 flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <Compass className="w-5 h-5 text-sky-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white font-display">
            {isGr ? "Υπολογιστικοί Πίνακες Πρώτου Μηχανικού" : "Chief Engineer Calculation & Logging Desk"}
          </h2>
          <span className="text-[9px] bg-sky-950 text-sky-400 border border-sky-850/40 py-0.5 px-2 rounded font-bold font-mono">
            STCW REG. III/2
          </span>
        </div>

        {/* Sub-Tabs Switchers */}
        <div className="flex gap-1 bg-slate-900 p-1 rounded border border-slate-800">
          <button
            onClick={() => setActiveSubTab("deflection")}
            className={`px-3 py-1.5 text-[10.5px] font-bold uppercase rounded font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "deflection"
                ? "bg-sky-500 text-slate-950 font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{isGr ? "Μέτρηση Στροφάλου" : "Crankshaft Deflection"}</span>
          </button>
          <button
            onClick={() => setActiveSubTab("changeover")}
            className={`px-3 py-1.5 text-[10.5px] font-bold uppercase rounded font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "changeover"
                ? "bg-sky-500 text-slate-950 font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>{isGr ? "Αλλαγή Καυσίμου ECA" : "ECA Changeover"}</span>
          </button>
          <button
            onClick={() => setActiveSubTab("orb")}
            className={`px-3 py-1.5 text-[10.5px] font-bold uppercase rounded font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "orb"
                ? "bg-sky-500 text-slate-950 font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isGr ? "Oil Record Book" : "Oil Record Book"}</span>
          </button>
          <button
            onClick={() => setActiveSubTab("auxiliary")}
            className={`px-3 py-1.5 text-[10.5px] font-bold uppercase rounded font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "auxiliary"
                ? "bg-sky-500 text-slate-950 font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isGr ? "Βοηθητικά Συστήματα" : "Aux Purifiers & Boiler"}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#040914] space-y-6">
        
        {/* ========================================================
            TAB 1: CRANKSHAFT DEFLECTION PLOTTER
            ======================================================== */}
        {activeSubTab === "deflection" && (
          <div className="space-y-6 animate-fade-in" id="deflection-plotting-tab">
            <div className="bg-sky-950/25 border border-sky-800/20 p-4 rounded text-xs text-slate-350 leading-relaxed flex gap-3">
              <Activity className="w-6 h-6 text-sky-400 shrink-0" />
              <div>
                <strong className="text-white block mb-0.5">CRANKSHAFT ALIGNMENT & WEB FLEX DIRECTORY:</strong>
                {isGr 
                  ? "Καταγράψτε τις ενδείξεις του μικρομέτρου (dial gauge) σε εκατοστά του χιλιοστού (+10 = +0.10mm) για κάθε κύλινδρο. Το σύστημα αναλύει τις αποκλίσεις V (κατακόρυφη) και H (οριζόντια) και υπολογίζει αν τα έδρανα βάσεως χρειάζονται επιθεώρηση ή αν υπάρχει κίνδυνος κόπωσης στροφάλου."
                  : "Insert dial gauge micro-meter readings in hundreths of a millimeter (e.g., +5 is +0.05mm) across cylinders. The system automatically plots and monitors vertical difference V and horizontal H, warning if values violate typical diesel manufacturer tolerances (+/- 0.08mm)."}
              </div>
            </div>

            {/* Config & Cylinder Selector Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Settings Plate */}
              <div className="lg:col-span-5 bg-[#090f1d] border border-slate-800 rounded-lg p-4 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex justify-between items-center font-mono">
                  <span>{isGr ? "Ενδείξεις Μικρομέτρου" : "DIAL GAUGE READINGS"}</span>
                  <span className="text-[10px] text-sky-400">CYLINDER {activeCyl}</span>
                </h3>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{isGr ? "Αριθμός Κυλίνδρων:" : "Engine Cylinders:"}</span>
                  <div className="flex gap-1.5">
                    {[5, 6, 8].map(num => (
                      <button
                        key={num}
                        onClick={() => {
                          setNumCylinders(num);
                          if (activeCyl > num) setActiveCyl(1);
                        }}
                        className={`w-7 h-7 text-xs font-bold font-mono rounded border cursor-pointer ${
                          numCylinders === num
                            ? "bg-sky-500 text-slate-950 border-sky-500"
                            : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cylinder Selector Indicators Row */}
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-1.5 pt-2">
                  {Array.from({ length: numCylinders }, (_, i) => i + 1).map(cyl => {
                    const calcs = getDeflectionCalculations(cyl);
                    return (
                      <button
                        key={cyl}
                        onClick={() => setActiveCyl(cyl)}
                        className={`p-2 rounded text-xs font-mono font-bold transition-all relative border cursor-pointer ${
                          activeCyl === cyl
                            ? "bg-[#11223b] border-sky-400 text-sky-300"
                            : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        <span>C{cyl}</span>
                        <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
                          calcs.status === "Critical" ? "bg-red-500" : calcs.status === "Acceptable" ? "bg-amber-400" : "bg-emerald-500"
                        }`} />
                      </button>
                    );
                  })}
                </div>

                {/* Microgauge inputs area for the active cylinder */}
                <div className="space-y-3.5 pt-3 border-t border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    {isGr ? "Προσαρμογή Θέσεων (1/100 mm):" : "POSITION ADJUSTMENTS (1/100 mm):"}
                  </span>

                  {[
                    { key: "T", label: isGr ? "T (Top - Άνω Νεκρό Σημείο)" : "T (Top Position)", desc: "Micrometer at 12 o'clock" },
                    { key: "BP", label: isGr ? "BP (Bottom Port - Κάτω Αριστερά)" : "BP (Bottom Port Position)", desc: "Clears connecting rod on left" },
                    { key: "P", label: isGr ? "P (Port - Αριστερά)" : "P (Port Position)", desc: "Micrometer at 9 o'clock" },
                    { key: "S", label: isGr ? "S (Starboard - Δεξιά)" : "S (Starboard Position)", desc: "Micrometer at 3 o'clock" },
                    { key: "BS", label: isGr ? "BS (Bottom Starboard - Κάτω Δεξιά)" : "BS (Bottom Starboard)", desc: "Clears connecting rod on right" },
                  ].map(pos => {
                    const currentVal = deflectionData[activeCyl]?.[pos.key as "T"| "BP" | "P" | "S" | "BS"] ?? 0;
                    return (
                      <div key={pos.key} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-850">
                        <div>
                          <span className="text-xs font-mono font-bold text-slate-300">{pos.label}</span>
                          <span className="block text-[9px] text-slate-500 font-mono italic">{pos.desc}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateDeflectionValue(activeCyl, pos.key as any, currentVal - 1)}
                            className="w-6 h-6 rounded bg-[#11223b] hover:bg-[#1b3254] text-sky-400 font-black text-xs cursor-pointer select-none"
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-mono text-xs text-white font-bold">
                            {currentVal > 0 ? `+${currentVal}` : currentVal}
                          </span>
                          <button
                            onClick={() => updateDeflectionValue(activeCyl, pos.key as any, currentVal + 1)}
                            className="w-6 h-6 rounded bg-[#11223b] hover:bg-[#1b3254] text-sky-400 font-black text-xs cursor-pointer select-none"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Graphical Visualizer Plate */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                
                {/* Result Statistics Summary */}
                <div className="bg-[#090f1d] border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {isGr ? "ΑΝΑΛΥΣΗ ΚΥΛΙΝΔΡΟΥ" : "CYLINDER DIAGNOSTIC DATA"}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Cylinder #{activeCyl} Alignment Limits
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 font-mono text-xs">
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                      <span className="text-[9px] text-slate-500 uppercase block font-bold">Vertical (V)</span>
                      <span className={`font-bold font-mono ${Math.abs(getDeflectionCalculations(activeCyl).verticalMm) > 0.08 ? "text-red-400" : "text-sky-300"}`}>
                        {getDeflectionCalculations(activeCyl).vertical > 0 ? `+` : ""}{getDeflectionCalculations(activeCyl).vertical} /100
                        <span className="text-[10px] text-slate-400 ml-1.5">({getDeflectionCalculations(activeCyl).verticalMm.toFixed(2)} mm)</span>
                      </span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                      <span className="text-[9px] text-slate-500 uppercase block font-bold">Horizontal (H)</span>
                      <span className={`font-bold font-mono ${Math.abs(getDeflectionCalculations(activeCyl).horizontalMm) > 0.08 ? "text-red-400" : "text-sky-300"}`}>
                        {getDeflectionCalculations(activeCyl).horizontal > 0 ? `+` : ""}{getDeflectionCalculations(activeCyl).horizontal} /100
                        <span className="text-[10px] text-slate-400 ml-1.5">({getDeflectionCalculations(activeCyl).horizontalMm.toFixed(2)} mm)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Crankshaft Flex Diagram Canvas Render (SVG) */}
                <div className="bg-slate-950 border border-slate-850 rounded-lg p-5 flex-1 flex flex-col justify-between min-h-[300px]">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      {isGr ? "ΣΧΗΜΑΤΙΚΗ ΑΝΑΠΑΡΑΣΤΑΣΗ ΙΣΟΡΡΟΠΙΑΣ ΣΤΡΟΦΑΛΟΥ" : "WEB OPEN / CLOSE DIAGRAM (STRETCH SCALED)"}
                    </span>
                    
                    {/* Status badge */}
                    {(() => {
                      const status = getDeflectionCalculations(activeCyl).status;
                      if (status === "Excellent") {
                        return <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded font-mono text-[9px] font-bold">IDEAL ALIGNMENT</span>;
                      } else if (status === "Acceptable") {
                        return <span className="bg-amber-950/80 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded font-mono text-[9px] font-bold">ACCEPTABLE RANGE</span>;
                      } else {
                        return <span className="bg-red-950/80 text-red-400 border border-red-800/40 px-2 py-0.5 rounded font-mono text-[9px] font-bold animate-pulse">ALIGNMENT WARNING</span>;
                      }
                    })()}
                  </div>

                  {/* SVG Drawing of Crankwebs showing deflection bending */}
                  <div className="flex items-center justify-center py-6">
                    {(() => {
                      const calcs = getDeflectionCalculations(activeCyl);
                      // Calculate delta for rendering.
                      // Positive Vertical deflection T - B > 0 means webs part outward at the top.
                      // Neg vertical means webs close inward.
                      const deflectionFactor = Math.min(30, Math.max(-30, calcs.vertical * 1.5));
                      
                      // Coordinates for Left Web and Right Web
                      // If parting is 0 (neutral), left web is completely straight.
                      const leftWebAngle = -deflectionFactor / 2;
                      const rightWebAngle = deflectionFactor / 2;

                      return (
                        <div className="relative w-full max-w-[280px] h-[180px] flex items-center justify-center bg-[#060a15] rounded border border-slate-900 p-4">
                          <svg width="240" height="160" viewBox="0 0 240 160" className="overflow-visible">
                            <defs>
                              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                              </marker>
                            </defs>

                            {/* Bearing centerline indicators */}
                            <line x1="10" y1="120" x2="230" y2="120" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
                            
                            {/* Main journals (Left & Right support brackets) */}
                            <rect x="25" y="110" width="30" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="2" rx="2" />
                            <rect x="185" y="110" width="30" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="2" rx="2" />
                            
                            {/* Crank Web Left */}
                            <g transform={`translate(55, 120)`}>
                              <g transform={`rotate(${leftWebAngle}, 0, 0)`}>
                                {/* Draw Left Crankweb block */}
                                <rect x="-10" y="-85" width="20" height="85" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" rx="3" />
                                {/* Micrometer pin hole on the inner side */}
                                <circle cx="10" cy="-60" r="2.5" fill="#fb7185" />
                              </g>
                            </g>

                            {/* Crank Web Right */}
                            <g transform={`translate(185, 120)`}>
                              <g transform={`rotate(${rightWebAngle}, 0, 0)`}>
                                {/* Draw Right Crankweb block */}
                                <rect x="-10" y="-85" width="20" height="85" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" rx="3" />
                                {/* Micrometer pin hole */}
                                <circle cx="-10" cy="-60" r="2.5" fill="#fb7185" />
                              </g>
                            </g>

                            {/* Crank Pin (connecting pin at the top) */}
                            {/* Let's shift it down based on the offset */}
                            <g transform={`translate(120, 35)`}>
                              <rect x="-15" y="-10" width="30" height="20" fill="#111827" stroke="#38bdf8" strokeWidth="1.5" rx="2" />
                            </g>

                            {/* Connection arms to crank pin */}
                            <line x1="55" y1="40" x2="105" y2="35" stroke="#475569" strokeWidth="3" />
                            <line x1="185" y1="40" x2="135" y2="35" stroke="#475569" strokeWidth="3" />

                            {/* Live dial indicator in distance between webs */}
                            {/* Dial gauge line */}
                            {/* Position Left Web point: Rotated from (55, 60) which is rotated by leftWebAngle around (55, 120) */}
                            {/* Position Right Web point: Rotated from (185, 60) which is rotated by rightWebAngle around (185, 120) */}
                            <line x1="68" y1="60" x2="172" y2="60" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="2 2" />
                            <rect x="95" y="48" width="50" height="22" fill="#0f172a" stroke="#f43f5e" strokeWidth="1" rx="2" />
                            <text x="120" y="63" fontSize="9" fontFamily="monospace" textAnchor="middle" fill="#f43f5e" fontWeight="bold">
                              {calcs.vertical > 0 ? `+` : ""}{calcs.vertical}
                            </text>

                            {/* Tension indicators (Arrows parting or pinching) */}
                            {calcs.vertical > 0 ? (
                              <>
                                <line x1="85" y1="13" x2="55" y2="13" stroke="#38bdf8" strokeWidth="1.5" markerStart="url(#arrow)" />
                                <line x1="155" y1="13" x2="185" y2="13" stroke="#38bdf8" strokeWidth="1.5" markerStart="url(#arrow)" />
                                <text x="120" y="16" fontSize="8" fontFamily="monospace" textAnchor="middle" fill="#38bdf8" fontWeight="bold">WEBS PARTING</text>
                              </>
                            ) : calcs.vertical < 0 ? (
                              <>
                                <line x1="55" y1="13" x2="85" y2="13" stroke="#f43f5e" strokeWidth="1.5" markerStart="url(#arrow)" />
                                <line x1="185" y1="13" x2="155" y2="13" stroke="#f43f5e" strokeWidth="1.5" markerStart="url(#arrow)" />
                                <text x="120" y="16" fontSize="8" fontFamily="monospace" textAnchor="middle" fill="#f43f5e" fontWeight="bold">WEBS INWARD</text>
                              </>
                            ) : (
                              <text x="120" y="16" fontSize="8" fontFamily="monospace" textAnchor="middle" fill="#475569" fontWeight="bold">BALANCED WEB</text>
                            )}
                          </svg>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Manual advisory checklist for alignment deviations */}
                  <div className="bg-[#090f1d] p-3 rounded border border-slate-850 text-[11px] text-slate-400 font-sans space-y-1.5 leading-relaxed">
                    <p className="font-bold text-slate-200">
                      {isGr ? "📋 Οδηγίες Επιθεώρησης Κατακόρυφης Απόκλισης:" : "📋 Diagnostic Interpretation Advisory:"}
                    </p>
                    {getDeflectionCalculations(activeCyl).vertical > 5 ? (
                      <p className="text-amber-300">
                        {isGr 
                          ? "⚠️ ΘΕΤΙΚΗ ΑΠΟΚΛΙΣΗ V > 0.05mm: Οι παρειές του στροφάλου ανοίγουν στο άνω σημείο. Υποδηλώνει πιθανή καθίζηση (wear down) των διπλανών κυρίων εδράνων ή υπερβολικό φορτίο."
                          : "⚠️ POSITIVE DEFLECTION (Webs parting at top): Suggests the adjacent main bearings are worn down or sitting lower than normal alignment. Schedule bridge micrometer check of main bearings."}
                      </p>
                    ) : getDeflectionCalculations(activeCyl).vertical < -4 ? (
                      <p className="text-amber-300">
                        {isGr 
                          ? "⚠️ ΑΡΝΗΤΙΚΗ ΑΠΟΚΛΙΣΗ V < -0.04mm: Οι παρειές κλείνουν στο πάνω σημείο. Υποδεικνύει ότι ο άξονας στηρίζεται ψηλότερα στο συγκεκριμένο σημείο, ίσως λόγω λανθασμένης ευθυγράμμισης."
                          : "⚠️ NEGATIVE DEFLECTION (Webs closing at top): Suggests shaft is elevated at this engine frame location. Check for bearing shell misplacement or structural frame tightening deformation."}
                      </p>
                    ) : (
                      <p className="text-emerald-400">
                        ✓ {isGr ? "Εντός συνιστώμενων κατασκευαστικών ορίων (tolerance < 0.04 mm). Συνεχίστε με την τυπική προφύλαξη." : "Within standard operational guidelines. Re-verify dial gauges and proceed to next scheduled cylinder."}
                      </p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: MARPOL FUEL CHANGEOVER CALCULATOR
            ======================================================== */}
        {activeSubTab === "changeover" && (
          <div className="space-y-6 animate-fade-in" id="fuel-changeover-tab">
            <div className="bg-sky-950/25 border border-sky-800/20 p-4 rounded text-xs text-slate-350 leading-relaxed flex gap-3">
              <Droplets className="w-6 h-6 text-sky-400 shrink-0" />
              <div>
                <strong className="text-white block mb-0.5">MARPOL ANNEX VI FUEL CHANGEOVER COMPUTATIONS:</strong>
                {isGr 
                  ? "Κατά την είσοδο σε Ζώνες Ελέγχου Εκπομπών (ECA - βόρεια και βαλτική θάλασσα, Αμερική), το θείο στο καύσιμο πρέπει να μειωθεί κάτω από 0.10%. Υπολογίστε τον ακριβή χρόνο που απαιτείται για να ξεπλυθεί το προηγούμενο καύσιμο (HFO 2.70%) και να επιτευχθεί ομαλή αραίωση με MGO (0.05%) πριν από την είσοδο στη γραμμή ECA."
                  : "Before entering Emission Control Areas (ECAs), your fuel system sulfur level must stay strictly below 0.10%. Use this calculator based on first-order dilution mixing logarithmic formulas to anticipate exactly when to sequence low-sulfur oil valves."}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Parameter Panel */}
              <div className="lg:col-span-5 bg-[#090f1d] border border-slate-800 rounded-lg p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-sky-400" />
                  <span>{isGr ? "Παράμετροι Συστήματος" : "MIXING SYSTEM INPUTS"}</span>
                </h3>

                {/* Dead Volume Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">{isGr ? "Όγκος service tank & σωληνώσεων (m³):" : "Dead-Zone Loop Volume (m³):"}</span>
                    <span className="text-white font-bold">{tankCapacity.toFixed(1)} m³</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.1"
                    value={tankCapacity}
                    onChange={(e) => setTankCapacity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-450"
                  />
                  <div className="flex justify-between text-[8px] text-slate-550 font-mono">
                    <span>0.5 m³ (Small Aux)</span>
                    <span>5.0 m³</span>
                    <span>10.0 m³ (Large Vessel)</span>
                  </div>
                </div>

                {/* Consumption Slider */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">{isGr ? "Κατανάλωση Κύριας Μηχανής (m³/ώρα):" : "Fuel Flow/Consumption (m³/hr):"}</span>
                    <span className="text-white font-bold">{fuelConsumption.toFixed(2)} m³/h</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.05"
                    value={fuelConsumption}
                    onChange={(e) => setFuelConsumption(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-450"
                  />
                  <div className="flex justify-between text-[8px] text-slate-550 font-mono">
                    <span>0.1 m³/h (Idle)</span>
                    <span>2.5 m³/h</span>
                    <span>5.0 m³/h (Full Out)</span>
                  </div>
                </div>

                {/* Sulfur Start */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-mono font-bold text-slate-300 block">
                    {isGr ? "Αρχικό Ποσοστό Θείου HFO/VLSFO (%):" : "Starting Fuel Sulfur Content (%):"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={sulfurStart}
                      onChange={(e) => setSulfurStart(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 text-white border border-slate-700 hover:border-slate-600 focus:border-sky-500 focus:outline-none p-2 rounded text-xs font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono">SULFUR %</span>
                  </div>
                </div>

                {/* Sulfur low */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-mono font-bold text-slate-300 block">
                    {isGr ? "Ποσοστό Θείου LSMGO (%):" : "Low-sulfur Diesel Sulfur Content (%):"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={sulfurLow}
                      onChange={(e) => setSulfurLow(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 text-white border border-slate-700 hover:border-slate-600 focus:border-sky-500 focus:outline-none p-2 rounded text-xs font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono">SULFUR %</span>
                  </div>
                </div>
              </div>

              {/* Right Output Dashboard */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                
                {/* Result Block Card */}
                {(() => {
                  const result = calculateChangeover();
                  return (
                    <div className="bg-[#0c1524] border border-sky-500/20 rounded-xl p-6 flex-1 flex flex-col justify-between space-y-6 shadow-inner">
                      
                      {/* Calculated Box */}
                      <div className="text-center space-y-2">
                        <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest block">
                          {isGr ? "ΑΠΑΙΤΟΥΜΕΝΟΣ ΧΡΟΝΟΣ ΞΕΠΛΥΜΑΤΟΣ (FLUSHING TIME)" : "MINIMUM COMPLIANT PIPELINE FLUSHING TIME"}
                        </span>
                        
                        {result.alreadyCompliant ? (
                          <div className="py-4 text-emerald-400 font-bold font-display text-lg uppercase">
                            ✓ {isGr ? "Ήδη Συμμορφούμενο (Θείο <= 0.10%)" : "ALREADY COMPLIANT (Sulfur <= 0.10%)"}
                          </div>
                        ) : result.unreachable ? (
                          <div className="py-4 text-red-400 font-bold text-sm uppercase flex items-center justify-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{isGr ? "ΜΗ ΕΦΙΚΤΟ: Το LSMGO υπερβαίνει το 0.10%!" : "UNREACHABLE: Low-sulfur Fuel exceeds 0.10%!"}</span>
                          </div>
                        ) : (
                          <div className="py-2 text-white font-display text-4xl font-extrabold tracking-tight">
                            {result.hours} <span className="text-lg text-slate-400 font-mono font-semibold">Hrs</span> {result.mins} <span className="text-lg text-slate-400 font-mono font-semibold">Mins</span>
                          </div>
                        )}
                      </div>

                      {/* Diagnostic chart representation */}
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-3.5">
                        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                          <span>Dilution Progress Indicator:</span>
                          <span className="text-[#dfb15b]">{sulfurStart.toFixed(2)}% → 0.10% → {sulfurLow.toFixed(2)}%</span>
                        </div>

                        {/* Visual graph line simulating sulfur decay */}
                        <div className="w-full h-8 bg-[#040813] border border-slate-900 rounded p-1 flex items-end relative overflow-hidden">
                          {/* Compliant region shade */}
                          <div className="absolute right-0 top-0 bottom-0 bg-emerald-950/20 w-[60%] border-l border-emerald-500/10 flex items-center justify-end pr-2">
                            <span className="text-[8px] text-emerald-400 font-mono font-black uppercase">ECA SAFE CO-ORDINATES</span>
                          </div>

                          {/* Line drawing representing dilution descent */}
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <path 
                              d="M 0,2 C 15,10 35,16 100,19" 
                              fill="none" 
                              stroke="#0284c7" 
                              strokeWidth="1.5" 
                            />
                            {/* Critical threshold line at S=0.10% */}
                            <line x1="0" y1="12" x2="100" y2="12" stroke="#ef4444" strokeWidth="1" strokeDasharray="1.5 1.5" />
                          </svg>

                          {/* Float visual tags */}
                          <span className="absolute left-2 top-0.5 text-[8px] text-red-400 font-mono uppercase font-semibold">Start: {sulfurStart.toFixed(2)}%</span>
                        </div>
                      </div>

                      {/* Numeric summary calculations */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div className="bg-slate-950 p-3 rounded border border-slate-850">
                          <span className="text-[9px] text-slate-500 uppercase block font-bold">{isGr ? "Καύσιμο κατά την Αραίωση" : "Changeover LSMGO Need"}</span>
                          <span className="font-bold text-white text-sm">
                            {result.alreadyCompliant ? "0.00" : result.unreachable ? "N/A" : result.fuelUsed} m³
                          </span>
                        </div>

                        <div className="bg-slate-950 p-3 rounded border border-slate-850">
                          <span className="text-[9px] text-slate-500 uppercase block font-bold">{isGr ? "Σύνσταση IMO Standard" : "ECA Limit Regulations"}</span>
                          <span className="font-bold text-[#dfb15b] text-sm">0.10 % S m/m</span>
                        </div>
                      </div>

                      {/* Technical checklist guidance */}
                      <div className="text-[11px] font-sans text-slate-400 leading-relaxed border-t border-slate-850/60 pt-4 flex gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <p>
                          {isGr 
                            ? "Συστήνεται η έναρξη της διαδικασίας τουλάχιστον 30 λεπτά νωρίτερα για να αντισταθμιστούν τυχόν διακυμάνσεις στο φορτίο της μηχανής κατά τη διάρκεια του changeover."
                            : "Pro-tip: Initiate the changeover 30-45 minutes earlier than calculated to buffer for combustion anomalies, main engine speed fluctuations, or pump circulation delays prior to line borders."}
                        </p>
                      </div>

                    </div>
                  );
                })()}

              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: OIL RECORD BOOK DRAFTER
            ======================================================== */}
        {activeSubTab === "orb" && (
          <div className="space-y-6 animate-fade-in" id="orb-drafter-tab">
            <div className="bg-sky-950/25 border border-sky-800/20 p-4 rounded text-xs text-slate-350 leading-relaxed flex gap-3">
              <FileText className="w-6 h-6 text-sky-400 shrink-0" />
              <div>
                <strong className="text-white block mb-0.5">IMO ORB PART I COMPILATION & DRAFTING SUITE:</strong>
                {isGr 
                  ? "Τα σφάλματα στη σύνταξη του Oil Record Book αποτελούν την κυριότερη αιτία προστίμων (Magic Pipe audits). Επιλέξτε μια δραστηριότητα, συμπληρώστε τις πραγματικές τιμές και το σύστημα θα δημιουργήσει το ακριβές κείμενο και τους επίσημους IMO κωδικούς προς αντιγραφή εκτός σύνδεσης."
                  : "Correct drafting inside the Oil Record Book Part I is paramount to evading corporate Port State fines. Populate details below to draft clean compliant narrative entry grids corresponding strictly to MEPC/Circ guidelines."}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Form config card */}
              <div className="lg:col-span-5 bg-[#090f1d] border border-slate-800 rounded-lg p-4 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
                  {isGr ? "Επιλογή & Παράμετροι Λειτουργίας" : "ORB OPERATION INPUTS"}
                </h3>

                {/* Choosing layout template */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    {isGr ? "Τύπος Δραστηριότητας:" : "Select Operation Template:"}
                  </label>
                  <select
                    value={orbTemplate}
                    onChange={(e) => setOrbTemplate(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                  >
                    <option value="incinerate">C 12.3 Burn sludge in Incinerator</option>
                    <option value="bilge_pump">D 13 Local bilge water transfer</option>
                    <option value="ows_discharge">H 15 Bilge discharge en route via 15ppm OWS</option>
                    <option value="bunker">H 26 Bunkering fuel oil in Port</option>
                  </select>
                </div>

                {/* Logging Variables Grid */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase block">{isGr ? "Ημερομηνία:" : "Logged Date:"}</label>
                    <input
                      type="date"
                      value={orbDate}
                      onChange={(e) => setOrbDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white mobile-text-input font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase block">{isGr ? "Όγκος (m³):" : "Volume (m³):"}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={orbVolume}
                      onChange={(e) => setOrbVolume(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white mobile-text-input font-mono font-bold"
                    />
                  </div>
                </div>

                {orbTemplate === "bunker" ? (
                  <div className="space-y-3.5 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 uppercase block">Port Location / Time UTC:</label>
                      <input
                        type="text"
                        value={orbTimeStart}
                        onChange={(e) => setOrbTimeStart(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 pt-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase block">{isGr ? "Έναρξη / Ώρα:" : "Start Time:"}</label>
                        <input
                          type="text"
                          value={orbTimeStart}
                          onChange={(e) => setOrbTimeStart(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase block">{isGr ? "Λήξη / Ώρα:" : "Stop Time:"}</label>
                        <input
                          type="text"
                          value={orbTimeEnd}
                          onChange={(e) => setOrbTimeEnd(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 uppercase block">{isGr ? "Αναχώρηση Από (Δεξαμενή):" : "Source Tank Space:"}</label>
                      <input
                        type="text"
                        value={orbFromTank}
                        onChange={(e) => setOrbFromTank(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>

                    {orbTemplate === "bilge_pump" && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase block">Destination Tank Space:</label>
                        <input
                          type="text"
                          value={orbToTank}
                          onChange={(e) => setOrbToTank(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase block">{isGr ? "Γεωγρ. Στίγμα Start:" : "Coordinates Start:"}</label>
                        <input
                          type="text"
                          value={orbPositionStart}
                          onChange={(e) => setOrbPositionStart(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                        />
                      </div>

                      {orbTemplate === "ows_discharge" && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase block">Coordinates Stop:</label>
                          <input
                            type="text"
                            value={orbPositionEnd}
                            onChange={(e) => setOrbPositionEnd(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right ledger render panel */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                
                {/* Ledger card */}
                <div className="bg-[#0b1424] border border-sky-500/25 rounded-xl shadow-lg p-5 flex-1 flex flex-col justify-between">
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest block">
                        {isGr ? "ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΦΥΛΛΟΥ LOGBOOK (IMO MEPC)" : "OFFICIAL ORB-I DRAFT PREVIEW LEDGER"}
                      </span>
                      <button
                        onClick={copyOrbToClipboard}
                        className="py-1 px-2.5 rounded bg-sky-950/40 hover:bg-sky-900/45 border border-sky-700/30 text-sky-400 font-mono text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1.5 transition-all select-none"
                      >
                        {copiedSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>COPIED DRAFT</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>COPY DRAFT LINES</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Official ledger table */}
                    <div className="overflow-x-auto border border-slate-800 rounded bg-[#050a14]">
                      <table className="w-full text-left font-mono text-[11px] leading-relaxed select-text">
                        <thead>
                          <tr className="bg-[#090f1d] border-b border-slate-800 text-slate-400">
                            <th className="py-2.5 px-3 border-r border-slate-800 w-20">Date</th>
                            <th className="py-2.5 px-2 border-r border-slate-800 w-12 text-center">Code</th>
                            <th className="py-2.5 px-2 border-r border-slate-800 w-12 text-center">Item</th>
                            <th className="py-2.5 px-3">Record of Operations & Officer Signature</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getORBLedgerLines().map((line, idx) => (
                            <tr key={idx} className="border-b border-slate-900 text-slate-200 hover:bg-slate-900/40">
                              <td className="py-2 px-3 border-r border-slate-800 text-slate-400 align-top">
                                {idx === 0 ? orbDate : ""}
                              </td>
                              <td className="py-2 px-2 border-r border-slate-800 text-center text-sky-400 font-black align-top">
                                {line.code}
                              </td>
                              <td className="py-2 px-2 border-r border-slate-800 text-center text-sky-400 font-bold align-top">
                                {line.item}
                              </td>
                              <td className="py-2 px-3 text-slate-300 align-top max-w-sm whitespace-pre-wrap">
                                {line.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Compliance note */}
                  <div className="bg-[#0e121a] p-3.5 rounded border border-slate-850 text-[10.5px] text-slate-450 leading-relaxed font-sans space-y-1 pt-4 mt-4">
                    <p className="font-bold text-slate-300">
                      MARPOL Compliance Notice:
                    </p>
                    <p>
                      Each complete page inside the active Oil Record Book Part I must be signed en-toto by the vessel Master. Entries must be handwritten in black or blue ink exactly to match automated telemetry logs stored inside the OWS system memories. Falsification is subject to heavy criminal prosecutions under PSC/USCG laws.
                    </p>
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: AUXILIARY MACHINERY PURIFIERS & BOILERS
            ======================================================== */}
        {activeSubTab === "auxiliary" && (
          <div className="space-y-6 animate-fade-in text-slate-200" id="auxiliary-systems-tab">
            <div className="bg-sky-950/25 border border-sky-800/20 p-4 rounded text-xs text-slate-350 leading-relaxed flex gap-3">
              <Activity className="w-6 h-6 text-sky-400 shrink-0" />
              <div>
                <strong className="text-white block mb-0.5">PURIFIER SYSTEMS & BOILER WATER TREATMENT ANALYSIS:</strong>
                {isGr 
                  ? "Επιβλέψτε τις βοηθητικές μηχανολογικές λειτουργίες. Υπολογίστε τον κατάλληλο δίσκο ρύθμισης (gravity disc) για τους φυγοκεντρικούς διαχωριστές ελαίου και αναλύστε τα δείγματα νερού του ατμολέβητα για την αποφυγή επικαθίσεων αλάτων και διάβρωσης."
                  : "Monitor and diagnose critical auxiliary machinery. Calculate optimal gravity disc diameters for centrifugal fuel purifiers and perform instant chemical diagnostic audits on low/high pressure auxiliary boiler steam systems."}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT INPUT COLUMN */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Purifier Settings */}
                <div className="bg-[#090f1d] border border-slate-800 rounded-lg p-4 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2 font-mono">
                    <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: "12s" }} />
                    <span>{isGr ? "Ροή & Διαχωριστής Καυσίμου" : "MINERAL OIL CENTRIFUGAL PURIFIER"}</span>
                  </h3>

                  <div className="space-y-4">
                    {/* Fuel Density slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">{isGr ? "Πυκνότητα Καυσίμου στους 15°C (g/ml):" : "Fuel Density @15°C (g/ml):"}</span>
                        <span className="text-white font-bold">{fuelDensity15.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.840"
                        max="0.995"
                        step="0.001"
                        value={fuelDensity15}
                        onChange={(e) => setFuelDensity15(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-450"
                      />
                      <div className="flex justify-between text-[8px] text-slate-550 font-mono">
                        <span>0.840 (MGO)</span>
                        <span>0.950 (ULSFO)</span>
                        <span>0.991 (HFO Max limit)</span>
                      </div>
                    </div>

                    {/* Operational Purification Temperature slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">{isGr ? "Θερμοκρασία Διαχωρισμού (°C):" : "Purification Temperature (°C):"}</span>
                        <span className="text-white font-bold">{purificationTemp}°C</span>
                      </div>
                      <input
                        type="range"
                        min="70"
                        max="98"
                        step="1"
                        value={purificationTemp}
                        onChange={(e) => setPurificationTemp(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-450"
                      />
                      <div className="flex justify-between text-[8px] text-slate-550 font-mono">
                        <span>70°C (Low density)</span>
                        <span>98°C (Max HFO Limit)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boiler Chemistry Settings */}
                <div className="bg-[#090f1d] border border-slate-800 rounded-lg p-4 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2 font-mono">
                    <Droplets className="w-4 h-4 text-sky-400" />
                    <span>{isGr ? "Χημική Ανάλυση Νερού Λέβητα" : "BOILER STEAM WATER CHEMISTRY"}</span>
                  </h3>

                  <div className="space-y-3 font-mono text-xs">
                    {/* pH level */}
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-850">
                      <div>
                        <span className="text-slate-300 font-bold">pH Level</span>
                        <span className="block text-[8px] text-slate-500">{isGr ? "Όριο: 9.5 – 11.0" : "Target range: 9.5 - 11.0"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setBoilerPh(p => Math.max(7.0, Math.round((p - 0.2) * 10) / 10))} className="w-6 h-6 rounded bg-slate-900 text-sky-400 font-black cursor-pointer">-</button>
                        <span className="w-10 text-center font-bold text-white">{boilerPh.toFixed(1)}</span>
                        <button onClick={() => setBoilerPh(p => Math.min(13.0, Math.round((p + 0.2) * 10) / 10))} className="w-6 h-6 rounded bg-slate-900 text-sky-400 font-black cursor-pointer">+</button>
                      </div>
                    </div>

                    {/* Chlorides level */}
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-850">
                      <div>
                        <span className="text-slate-300 font-bold">{isGr ? "Χλωρίδια (Cl-)" : "Chlorides (Cl-)"}</span>
                        <span className="block text-[8px] text-slate-500">{isGr ? "Όριο: < 150 ppm" : "Target range: < 150 ppm"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setBoilerChloride(c => Math.max(0, c - 10))} className="w-6 h-6 rounded bg-slate-900 text-sky-400 font-black cursor-pointer">-</button>
                        <span className="w-16 text-center font-bold text-white">{boilerChloride} ppm</span>
                        <button onClick={() => setBoilerChloride(c => Math.min(1000, c + 10))} className="w-6 h-6 rounded bg-slate-900 text-sky-400 font-black cursor-pointer">+</button>
                      </div>
                    </div>

                    {/* Phosphates level */}
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-850">
                      <div>
                        <span className="text-slate-300 font-bold">{isGr ? "Φωσφορικά (PO4)" : "Phosphate (PO4)"}</span>
                        <span className="block text-[8px] text-slate-500">{isGr ? "Όριο: 20 – 45 ppm" : "Target range: 20 - 45 ppm"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setBoilerPhosphate(p => Math.max(0, p - 2))} className="w-6 h-6 rounded bg-slate-900 text-sky-400 font-black cursor-pointer">-</button>
                        <span className="w-16 text-center font-bold text-white">{boilerPhosphate} ppm</span>
                        <button onClick={() => setBoilerPhosphate(p => Math.min(120, p + 2))} className="w-6 h-6 rounded bg-slate-900 text-sky-400 font-black cursor-pointer">+</button>
                      </div>
                    </div>

                    {/* Sulfite level */}
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-850">
                      <div>
                        <span className="text-slate-300 font-bold">{isGr ? "Θειώδη (SO3)" : "Sulfite (SO3)"}</span>
                        <span className="block text-[8px] text-slate-500">{isGr ? "Όριο: 15 – 40 ppm" : "Target range: 15 - 40 ppm"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setBoilerSulfite(s => Math.max(0, s - 2))} className="w-6 h-6 rounded bg-slate-900 text-sky-400 font-black cursor-pointer">-</button>
                        <span className="w-16 text-center font-bold text-white">{boilerSulfite} ppm</span>
                        <button onClick={() => setBoilerSulfite(s => Math.min(100, s + 2))} className="w-6 h-6 rounded bg-slate-900 text-sky-400 font-black cursor-pointer">+</button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT DIAGNOSTIC & TROUBLESHOOTING COLUMN */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Diagnostics Cards wrapper */}
                <div className="bg-[#0b1424] border border-sky-500/20 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest block">
                      {isGr ? "ΑΝΑΛΥΣΗ ΚΑΙ ΑΥΤΟΜΑΤΕΣ ΣΥΣΤΑΣΕΙΣ" : "INTELLIGENT DIAGNOSTIC METRICS"}
                    </span>
                    <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-mono">
                      OFFLINE PARSING
                    </span>
                  </div>

                  {/* Purifier output display */}
                  {(() => {
                    const pur = calculateGravityDisc();
                    return (
                      <div className="bg-[#050a14] p-4 rounded-lg border border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">{isGr ? "Υπολογισμένη Πυκνότητα Λειτουργίας:" : "ACTUAL OPERATING TEMPERATURE DENSITY:"}</p>
                          <p className="text-xl font-bold font-mono text-white mt-1">
                            {pur.densityActual.toFixed(4)} <span className="text-xs text-slate-500">g/ml</span>
                          </p>
                          <span className="text-[9px] text-slate-500 font-mono block mt-1">
                            {isGr ? "* Μειωμένη λόγω θερμικής διαστολής" : "* Corrected for expansion coefficients"}
                          </span>
                        </div>

                        <div className="bg-[#071324] p-3 rounded border border-sky-950 text-right flex flex-col justify-center">
                          <p className="text-[9px] font-mono font-bold text-sky-400 uppercase">{isGr ? "Συνιστώμενος Δίσκος Gravity Disc:" : "RECOMMENDED GRAVITY DISC SIZE:"}</p>
                          <p className="text-2xl font-black font-mono text-sky-400 mt-1">
                            {pur.recommendedDisc}
                          </p>
                          {pur.isAlcapRequired && (
                            <span className="text-[9px] text-rose-450 font-mono font-bold block animate-pulse">
                              {isGr ? "⚠️ ΑΠΑΙΤΕΙΤΑΙ ΣΥΣΤΗΜΑ ALCAP (DENSITY > 0.991)" : "⚠️ ALCAP PROCESS DETECTED"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Boiler output displays */}
                  {(() => {
                    const boil = diagnoseBoilerWater();
                    return (
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center bg-[#050a14] p-3 rounded-lg border border-slate-850">
                          <div>
                            <span className="text-xs font-bold text-slate-300 font-mono block">{isGr ? "Συνολική Κατάσταση Νερού Λέβητα:" : "Boiler Water Health Audit:"}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{isGr ? "Ευθυγραμμισμένο με τις οδηγίες της ALFA LAVAL / DREW" : "Cross-referenced with standard maritime engine water safety tolerances"}</span>
                          </div>
                          
                          {boil.overallStatus === "COMPLIANT" ? (
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 pr-3 pl-3 py-1 rounded font-mono text-xs font-extrabold uppercase">✓ Compliant</span>
                          ) : boil.overallStatus === "CORRECTION_REQUIRED" ? (
                            <span className="bg-amber-950 text-amber-400 border border-amber-800 pr-3 pl-3 py-1 rounded font-mono text-xs font-extrabold uppercase">⚠️ Correction Needed</span>
                          ) : (
                            <span className="bg-red-950 text-red-500 border border-red-800 pr-3 pl-3 py-1 rounded font-mono text-xs font-extrabold uppercase animate-pulse">☠️ ALARM STATUS</span>
                          )}
                        </div>

                        {/* Parameter detailed diagnostics ledger */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {boil.diagnostics.map((diag, index) => (
                            <div key={index} className="bg-slate-950 p-2.5 rounded border border-slate-900 space-y-1 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="font-mono font-bold text-slate-300">{diag.param}</span>
                                <span className={`font-mono font-black ${diag.status === "OK" ? "text-emerald-400" : diag.status === "WARN" ? "text-amber-400" : "text-rose-400"}`}>
                                  {diag.value}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400/90 leading-normal font-sans">
                                {diag.msg}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                </div>

                {/* ACTIVE SHIPBOARD TROUBLESHOOTING FLOWS */}
                <div className="bg-[#0b1424] border border-slate-800 rounded-lg p-5 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2 font-mono">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>{isGr ? "Διαδραστικός Οδηγός Αντιμετώπισης Βλαβών" : "EMERGENCY SHIPBOARD MACHINERY TROUBLESHOOTING"}</span>
                  </h3>

                  <div className="space-y-4 text-xs">
                    {/* Failure Scenario 1: Water in Clean Oil Outlet */}
                    <div className="border border-slate-800 rounded bg-[#050a14] overflow-hidden">
                      <div className="bg-slate-900 border-b border-slate-800 p-2.5 font-bold font-mono text-rose-400 flex items-center justify-between">
                        <span>❌ SYMPTOM: PURIFIER WATER IN OIL OUTLET / WATER SEAL BROKEN</span>
                        <span className="text-[8px] bg-rose-950/45 px-1.5 py-0.5 rounded font-bold uppercase">{isGr ? "ΥΨΗΛΗ ΚΡΙΣΙΜΟΤΗΤΑ" : "HIGH PRIORITY FORCE"}</span>
                      </div>
                      <div className="p-3 space-y-2 leading-relaxed text-slate-300 font-sans">
                        <p className="font-semibold text-slate-200">{isGr ? "Άμεσες Ενέργειες (SOP):" : "Official Engine Room Check Sequence (SOP):"}</p>
                        <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-400 list-inside">
                          <li>{isGr ? "Ελέγξτε τη θερμοκρασία καυσίμου στην είσοδο (αν έπεσε κάτω από 85°C, το ιξώδες σπάει το υδάτινο φράγμα)." : "Verify Inlet Fuel Temperature. Under-heating (below 85°C) spikes viscosity, causing the clean water seal to shear."}</li>
                          <li>{isGr ? "Ελέγξτε αν ο δίσκος gravity disc είναι πολύ μεγάλος (εάν ναι, η διεπιφάνεια μετατοπίζεται προς τα έξω)." : "Gravity Disc Sizing: Check if selected disc is too large, shifting the water seal interface too far outwards."}</li>
                          <li>{isGr ? "Ελέγξτε την πίεση του νερού στεγανοποίησης (operating/seal water) και αν η σωληνοειδής βαλβίδα κολλάει." : "Inspect Solenoids & Seal Water Pressure. Sluggish valves fail to lock the interface ring, causing early de-sludging breaks."}</li>
                          <li>{isGr ? "Επιθεωρήστε τα O-rings του τυμπάνου και την πλαστική βαλβίδα (distributing ring) για φθορά." : "Bowl Sealing Gaskets: Worn bowl body O-rings or distributing ring nylon pads cause constant gravity leakage."}</li>
                        </ol>
                      </div>
                    </div>

                    {/* Failure Scenario 2: High chlorides in boiler */}
                    <div className="border border-slate-800 rounded bg-[#050a14] overflow-hidden">
                      <div className="bg-slate-900 border-b border-slate-800 p-2.5 font-bold font-mono text-amber-500 flex items-center justify-between">
                        <span>⚠️ SYMPTOM: BOILER WATER HIGH CHLORIDES / SALINITY SPIKE</span>
                        <span className="text-[8px] bg-amber-950/45 px-1.5 py-0.5 rounded font-bold uppercase">{isGr ? "ΚΙΝΔΥΝΟΣ ΔΙΑΒΡΩΣΗΣ" : "TUBE CORROSION RISK"}</span>
                      </div>
                      <div className="p-3 space-y-2 leading-relaxed text-slate-300 font-sans">
                        <p className="font-semibold text-slate-200">{isGr ? "Άμεσες Ενέργειες (SOP):" : "Emergency Action Protocols:"}</p>
                        <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-400 list-inside">
                          <li>{isGr ? "Κάντε άμεσο συνεχόμενο bottom blowdown για την απομάκρυνση των συμπυκνωμένων αλάτων." : "Initiate Continuous Bottom Blowdown. Instantly flush mineral-dense sludge water from the bottom mud header."}</li>
                          <li>{isGr ? "Ελέγξτε το αδιαβροχοποιημένο νερό (condensate return) από τον συμπυκνωτή και το θερμοδοχείο (hotwell) για διαρροή θαλασσινού νερού." : "Check Condenser Tubes for Seawater Entry. A cracked condenser tube/evaporator gasket allows seawater backpressure."}</li>
                          <li>{isGr ? "Απομονώστε αμέσως τη μολυσμένη γραμμή επιστροφής ατμού εώς ότου εντοπιστεί η διαρροή." : "Isolate Steam Returns: Divert suspects (e.g. cargo heating, tank coils) to bilge wells until high chloride source is isolated."}</li>
                          <li>{isGr ? "Αυξήστε τη δοσολογία του χημικού Boiler Water Treatment μόλις επανέλθουν τα φυσιολογικά επίπεδα." : "Dose scale conditioner to lock remaining calcium/magnesium free ions as harmless non-adjective slurry mud."}</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

