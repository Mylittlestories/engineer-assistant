import React, { useState, useEffect } from "react";
import { 
  Gauge, 
  Thermometer, 
  Droplets, 
  Wrench, 
  ArrowLeftRight, 
  BookOpen, 
  Check, 
  Minimize2, 
  Maximize2 
} from "lucide-react";

interface UnitConverterProps {
  language: "EN" | "GR";
  isWidgetMode?: boolean;
  onCloseWidget?: () => void;
}

// ASTM D2161 formula for converting Kinematic Viscosity (cSt) to Saybolt Universal Seconds (SSU) at 100°F
export function convertCstToSsu(cSt: number): number {
  if (cSt <= 0) return 0;
  if (cSt > 70.4) {
    return cSt * 4.6347;
  }
  const num = 1.0 + 0.03264 * cSt;
  const den = (3930.2 + 262.7 * cSt + 23.97 * (cSt ** 2) + (cSt ** 3)) * 1e-5;
  const ssu = cSt * (4.6324 + num / den);
  return Math.round(ssu * 100) / 100;
}

// Converts Saybolt Universal Seconds (SSU) back to Kinematic Viscosity (cSt) using binary search solver
export function convertSsuToCst(ssu: number): number {
  if (ssu <= 0) return 0;
  let low = 0;
  let high = ssu; 
  let mid = 0;
  let iterations = 0;
  
  while (high - low > 0.001 && iterations < 50) {
    mid = (low + high) / 2;
    const calcSsu = convertCstToSsu(mid);
    if (calcSsu < ssu) {
      low = mid;
    } else {
      high = mid;
    }
    iterations++;
  }
  return Math.round(mid * 100) / 100;
}

export function UnitConverter({ language, isWidgetMode = false, onCloseWidget }: UnitConverterProps) {
  const [activeCategory, setActiveCategory] = useState<"pressure" | "temperature" | "viscosity" | "torque">("pressure");
  
  // State for Pressure
  const [pressureBar, setPressureBar] = useState<string>("30");
  const [pressurePsi, setPressurePsi] = useState<string>("435.11");
  
  // State for Temperature
  const [tempC, setTempC] = useState<string>("82");
  const [tempF, setTempF] = useState<string>("179.6");

  // State for Viscosity
  const [viscCst, setViscCst] = useState<string>("35");
  const [viscSsu, setViscSsu] = useState<string>("163.68");

  // State for Torque
  const [torqueNm, setTorqueNm] = useState<string>("1500");
  const [torqueLbft, setTorqueLbft] = useState<string>("1106.34");

  // Flash confirmation when a preset is applied
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null);

  // Localization resources
  const dict = {
    EN: {
      headerTitle: "MARINE UNIT CONVERTER",
      headerSub: "Quick shipboard standard calculations & engineering limits",
      tabPressure: "Pressure",
      tabTemp: "Temperature",
      tabVisc: "Viscosity",
      tabTorque: "Torque",
      lblBar: "Pressure in/out (bar)",
      lblPsi: "Pressure in/out (psi)",
      lblCel: "Temperature (°C)",
      lblFah: "Temperature (°F)",
      lblCst: "Viscosity at 100°F (cSt)",
      lblSsu: "Viscosity at 100°F (SSU)",
      lblNm: "Torque (Newton-meters - Nm)",
      lblLbft: "Torque (Pound-feet - lb-ft)",
      titlePresets: "Engine Room Standards & Reference Values",
      applyPreset: "Apply",
      formulaUsed: "Calculation Basis:",
      viscCaution: "SSU values are computed using non-linear ASTM D2161 kinematic curves at 100°F. The reverse conversion uses an iterative mathematical solver.",
      widgetModeLabel: "Converter Overlay Monitor",
      closeWidget: "Close Utility Desk",
      enterValue: "Key in values to sync units live",
      quickSlide: "Quick Adjuster Slider"
    },
    GR: {
      headerTitle: "ΜΕΤΑΤΡΟΠΕΑΣ ΜΟΝΑΔΩΝ",
      headerSub: "Γρήγοροι υπολογισμοί προδιαγραφών μηχανοστασίου & όρια",
      tabPressure: "Πίεση",
      tabTemp: "Θερμοκρασία",
      tabVisc: "Ιξώδες",
      tabTorque: "Ροπή",
      lblBar: "Πίεση σε bar",
      lblPsi: "Πίεση σε psi",
      lblCel: "Θερμοκρασία σε βαθμούς Κελσίου (°C)",
      lblFah: "Θερμοκρασία σε βαθμούς Φαρενάιτ (°F)",
      lblCst: "Ιξώδες στους 100°F σε cSt",
      lblSsu: "Ιξώδες στους 100°F σε SSU",
      lblNm: "Ροπή σε Newton-meters (Nm)",
      lblLbft: "Ροπή σε Pound-feet (lb-ft)",
      titlePresets: "Πρότυπα Μηχανοστασίου & Τιμές Αναφοράς",
      applyPreset: "Εφαρμογή",
      formulaUsed: "Μαθηματική Βάση:",
      viscCaution: "Οι τιμές SSU υπολογίζονται βάσει καμπυλών ASTM D2161 στους 100°F. Η αντίστροφη μετατροπή χρησιμοποιεί αριθμητικό επαναληπτικό επιλύτη.",
      widgetModeLabel: "Τοπικός Υπολογιστής Μονάδων",
      closeWidget: "Κλείσιμο",
      enterValue: "Εισάγετε τιμές για αυτόματη αμφίδρομη μετάφραση",
      quickSlide: "Μπάρα Γρήγορης Ρύθμισης"
    }
  };

  const t = dict[language];

  // Sync Pressure conversions
  const handlePressureChange = (value: string, unit: "bar" | "psi") => {
    if (unit === "bar") {
      setPressureBar(value);
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        setPressurePsi((parsed * 14.5037738).toFixed(2));
      } else {
        setPressurePsi("");
      }
    } else {
      setPressurePsi(value);
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        setPressureBar((parsed * 0.0689475729).toFixed(2));
      } else {
        setPressureBar("");
      }
    }
  };

  // Sync Temperature conversions
  const handleTempChange = (value: string, unit: "C" | "F") => {
    if (unit === "C") {
      setTempC(value);
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        setTempF(((parsed * 9/5) + 32).toFixed(1));
      } else {
        setTempF("");
      }
    } else {
      setTempF(value);
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        setTempC(((parsed - 32) * 5/9).toFixed(1));
      } else {
        setTempC("");
      }
    }
  };

  // Sync Viscosity conversions
  const handleViscChange = (value: string, unit: "cSt" | "SSU") => {
    if (unit === "cSt") {
      setViscCst(value);
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        setViscSsu(convertCstToSsu(parsed).toFixed(2));
      } else {
        setViscSsu("");
      }
    } else {
      setViscSsu(value);
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        setViscCst(convertSsuToCst(parsed).toFixed(2));
      } else {
        setViscCst("");
      }
    }
  };

  // Sync Torque conversions
  const handleTorqueChange = (value: string, unit: "Nm" | "lbft") => {
    if (unit === "Nm") {
      setTorqueNm(value);
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        setTorqueLbft((parsed * 0.737562149).toFixed(2));
      } else {
        setTorqueLbft("");
      }
    } else {
      setTorqueLbft(value);
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        setTorqueNm((parsed * 1.355817948).toFixed(2));
      } else {
        setTorqueNm("");
      }
    }
  };

  // Preset data tailored to practical ship operations
  const presets = {
    pressure: [
      {
        id: "p1",
        labelEN: "Main Engine Starting Air (SOLAS max limit)",
        labelGR: "Αέρας Εκκίνησης Κύριας Μηχανής (Όριο SOLAS)",
        valBar: 30,
        valPsi: 435.1,
        descEN: "Minimum vessel pressure should enable at least 12 starts for reversible engines (SOLAS Ch. II-1). Check regulatory state if pressure falls below 18 bar.",
        descGR: "Η ελάχιστη πίεση πρέπει να εξασφαλίζει τουλάχιστον 12 εκκινήσεις (κανονισμός SOLAS). Κρίσιμη επιθεώρηση αν πέσει κάτω από 18 bar."
      },
      {
        id: "p2",
        labelEN: "Control Air System (Interlock feed)",
        labelGR: "Αέρας Ελέγχου & Πνευματικά Συστήματα",
        valBar: 7.0,
        valPsi: 101.5,
        descEN: "Standard operating pressure for pneumatic actuator rods, control valves, and engine interlock logics.",
        descGR: "Τυπική πίεση λειτουργίας για πνευματικούς ενεργοποιητές, βαλβίδες ελέγχου και ενδοασφάλειες (interlocks)."
      },
      {
        id: "p3",
        labelEN: "Fuel Oil Booster / Engine Injection Feed",
        labelGR: "Τροφοδοσία Καυσίμου Κινητήρα ME-C / MC-C",
        valBar: 10.0,
        valPsi: 145.0,
        descEN: "Pressure inside fuel booster circulation system to prevent gassing of water-fuel mixtures at 135°C.",
        descGR: "Πίεση στο σύστημα κυκλοφορίας booster για την αποφυγή αεριοποίησης του μίγματος HFO στους 135°C."
      },
      {
        id: "p4",
        labelEN: "Common Rail Fuel Line (Heavy load peak)",
        labelGR: "Συλλέκτης Καυσίμου Common Rail (RT-flex)",
        valBar: 900.0,
        valPsi: 13053.4,
        descEN: "Operating peak pressure within the heavy fuel accumulators or hydraulic control blocks.",
        descGR: "Πίεση αιχμής στους συλλέκτες καυσίμου υψηλής πίεσης (common rail accumulators) κατά τη λειτουργία φορτίου."
      },
      {
        id: "p5",
        labelEN: "Main Crankshaft Lubricating Oil (Engine inlet)",
        labelGR: "Λάδι Λίπανσης Στροφάλου (Είσοδος Μηχανής)",
        valBar: 3.0,
        valPsi: 43.5,
        descEN: "Continuous lubrication pressure target at main engine inlet. Trip trigger set commonly below 1.5 bar.",
        descGR: "Στοχευόμενη πίεση συνεχούς λίπανσης στην είσοδο της μηχανής. Συναγερμός / Trip συνήθως κάτω από 1.5 bar."
      }
    ],
    temperature: [
      {
        id: "t1",
        labelEN: "Exhaust Gas Receiver Outlet (MAN design limit)",
        labelGR: "Έξοδος Καυσαερίων (Όριο Σχεδιασμού MAN)",
        valC: 380,
        valF: 716,
        descEN: "Warning limit for turbine entry exhaust. Continuous temperatures above 450°C indicate severe ignition delay or high load.",
        descGR: "Όριο συναγερμού εισόδου στροβίλου. Συνεχόμενη θερμοκρασία άνω των 450°C υποδεικνύει καθυστέρηση ανάφλεξης ή υπερφόρτωση."
      },
      {
        id: "t2",
        labelEN: "Heavy Fuel Oil (HFO 380 cSt) Purifier Intake",
        labelGR: "Είσοδος Διαχωριστή Βαρέος Πετρελαίου (HFO)",
        valC: 98,
        valF: 208.4,
        descEN: "Optimal separation temperature to minimize density difference between oil and water phases.",
        descGR: "Βέλτιστη θερμοκρασία διαχωρισμού για ελαχιστοποίηση της διαφοράς πυκνότητας της φάσης πετρελαίου-νερού."
      },
      {
        id: "t3",
        labelEN: "Cylinder Jacket Cooling Water (Outlet Target)",
        labelGR: "Νερό Ψύξης Χιτωνίων (Στόχος Εξόδου)",
        valC: 82,
        valF: 179.6,
        descEN: "Standard operating temperature. Below 75°C can trigger thermal stress fractures; above 90°C risks boiling/aeration.",
        descGR: "Τυπική θερμοκρασία λειτουργίας. Κάτω από 75°C προκαλούνται θερμικά στρες· άνω των 90°C υπάρχει κίνδυνος βρασμού."
      },
      {
        id: "t4",
        labelEN: "Scavenge Air Intake (After cooler)",
        labelGR: "Θερμοκρασία Αέρα Σάρωσης (Μετά το ψυγείο)",
        valC: 43,
        valF: 109.4,
        descEN: "Controlled to prevent liquid water droplets condensation while preserving cylinder scavenging density.",
        descGR: "Ελεγχόμενη τιμή για την αποφυγή υγροποίησης σταγονιδίων νερού, διατηρώντας ταυτόχρονα την πυκνότητα."
      }
    ],
    viscosity: [
      {
        id: "v1",
        labelEN: "HFO Viscosity at Separation (Purifier Feed)",
        labelGR: "Ιξώδες HFO κατά τον διαχωρισμό (Βέλτιστο)",
        valCst: 35.0,
        valSsu: 163.7,
        descEN: "Optimal kinematic parameters inside fuel oil separators to maintain proper disk flow separation.",
        descGR: "Βέλτιστο ιξώδες μέσα στον διαχωριστή καυσίμου για σωστό και αποδοτικό διαχωρισμό στους δίσκους."
      },
      {
        id: "v2",
        labelEN: "Engine Fuel Valve Injection (Upper Viscosity Limit)",
        labelGR: "Έγχυση Καυσίμου στο Μπεκ (Ανώτατο Όριο Ιξώδους)",
        valCst: 15.0,
        valSsu: 77.2,
        descEN: "Maximum recommended viscosity at the engine valve to ensure adequate atomization pattern and clean combustion.",
        descGR: "Μέγιστο συνιστώμενο ιξώδες στα μπεκ για εξασφάλιση σωστού σχήματος ψεκασμού και καθαρής καύσης."
      },
      {
        id: "v3",
        labelEN: "Engine Fuel Valve Injection (Lower Viscosity Limit)",
        labelGR: "Έγχυση Καυσίμου στο Μπεκ (Κατώτατο Όριο)",
        valCst: 10.0,
        valSsu: 59.3,
        descEN: "Viscosity below 10 cSt at injection may cause plunger fuel leakage, booster pump slippage, or high pump wear.",
        descGR: "Ιξώδες κάτω από 10 cSt μπορεί να προκαλέσει διαρροή στα έμβολα της αντλίας, απώλειες ή γρήγορη φθορά."
      },
      {
        id: "v4",
        labelEN: "Standard System Crankcase Oil (SAE 30 at 45°C)",
        labelGR: "Τυπικό Λάδι Συστήματος (SAE 30 στους 45°C)",
        valCst: 110.0,
        valSsu: 510.3,
        descEN: "Approximate operating state of main engine system oil inside bearing pipelines.",
        descGR: "Προσεγγιστικό ιξώδες λειτουργίας λαδιού συστήματος κινητήρα στους αγωγούς των κυρίων εδράνων."
      }
    ],
    torque: [
      {
        id: "tq1",
        labelEN: "MAN 50-Bore Cylinder Head Stud Bolt",
        labelGR: "Μπουλόνι Κυλινδροκεφαλής MAN 50-bore",
        valNm: 2800,
        valLbft: 2065.2,
        descEN: "Standard class tightening torque. Over-torqueing causes elastic stud deformation; under-torqueing allows gas leaks.",
        descGR: "Τυπική ροπή σύσφιξης. Η υπερβολική ροπή παραμορφώνει τα μπουλόνια· η χαμηλή ροπή επιτρέπει διαφυγή αερίων."
      },
      {
        id: "tq2",
        labelEN: "Cylinder Head Fuel Valve Assembly Nuts",
        labelGR: "Παξιμάδια Στερέωσης Μπεκ (Κυλινδροκεφαλή)",
        valNm: 150,
        valLbft: 110.6,
        descEN: "Tightened in sequence with double-locking nuts to avoid mechanical stress misalignment on fuel nozzle seats.",
        descGR: "Σφίγγονται διαδοχικά για την αποφυγή μηχανικών στρεβλώσεων στην έδρα του ακροφυσίου ψεκασμού."
      },
      {
        id: "tq3",
        labelEN: "Crankpin Connecting Rod Bearing Bolts",
        labelGR: "Μπουλόνια Εδράνων Βάσεως Μπιέλας (Crankpin)",
        valNm: 1850,
        valLbft: 1364.5,
        descEN: "Critical structural bolts. Checked during crankcase routine inspections for security markings.",
        descGR: "Κρίσιμα δομικά μπουλόνια. Ελέγχονται κατά τις επιθεωρήσεις κάρτερ για την ακεραιότητα των σημαδιών ασφαλείας."
      },
      {
        id: "tq4",
        labelEN: "Crosshead Bearing Shell Cover Studs",
        labelGR: "Μπουλόνια Καπακιού Εδράνων Σταυρού (Crosshead)",
        valNm: 1500,
        valLbft: 1106.3,
        descEN: "Tightened with calibrated hydraulic jacks or torque wrenches to prevent eccentric crankshaft loading.",
        descGR: "Σφίγγονται με διακριβωμένα υδραυλικά έμβολα ή ροπόκλειδα για την αποφυγή έκκεντρων καταπονήσεων στροφάλου."
      }
    ]
  };

  const applyPresetValue = (preset: any) => {
    setAppliedPresetId(preset.id);
    setTimeout(() => setAppliedPresetId(null), 1200);

    if (activeCategory === "pressure") {
      setPressureBar(preset.valBar.toString());
      setPressurePsi(preset.valPsi.toString());
    } else if (activeCategory === "temperature") {
      setTempC(preset.valC.toString());
      setTempF(preset.valF.toString());
    } else if (activeCategory === "viscosity") {
      setViscCst(preset.valCst.toString());
      setViscSsu(preset.valSsu.toString());
    } else if (activeCategory === "torque") {
      setTorqueNm(preset.valNm.toString());
      setTorqueLbft(preset.valLbft.toString());
    }
  };

  return (
    <div 
      className={`bg-[#0a182a] text-slate-150 rounded-xl border border-sky-500/30 shadow-2xl overflow-hidden flex flex-col ${
        isWidgetMode ? "h-[580px] w-full" : "min-h-[600px]"
      }`}
      id={`module-unit-converter-${isWidgetMode ? "widget" : "dashboard"}`}
    >
      {/* Title Bar styled inside metal console plate header */}
      <div className="bg-gradient-to-r from-[#0d2238] to-[#0a182a] p-4 border-b border-sky-500/30 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-sky-500/10 border border-sky-450/30 flex items-center justify-center text-sky-400">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              {t.headerTitle}
              {isWidgetMode && (
                <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-1.5 py-0.5 rounded font-bold uppercase">
                  MONITOR
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {t.headerSub}
            </p>
          </div>
        </div>
        {isWidgetMode && onCloseWidget && (
          <button 
            onClick={onCloseWidget}
            className="p-1 px-2.5 rounded bg-sky-950/40 border border-sky-600/30 hover:bg-sky-900/60 text-sky-400 text-[10px] font-mono font-bold uppercase cursor-pointer flex items-center gap-1.5 transition-all"
            title={t.closeWidget}
          >
            <Minimize2 className="w-3 h-3" />
            <span>{language === "GR" ? "ΚΛΕΙΣΙΜΟ" : "HIDE"}</span>
          </button>
        )}
      </div>

      {/* Categories submenus */}
      <div className="bg-[#07111e] border-b border-sky-500/15 px-3 py-2 flex items-center overflow-x-auto gap-1.5 shrink-0 select-none">
        <button
          onClick={() => setActiveCategory("pressure")}
          className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold font-mono transition-all border cursor-pointer ${
            activeCategory === "pressure"
              ? "bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-inner"
              : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>{t.tabPressure}</span>
        </button>

        <button
          onClick={() => setActiveCategory("temperature")}
          className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold font-mono transition-all border cursor-pointer ${
            activeCategory === "temperature"
              ? "bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-inner"
              : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Thermometer className="w-3.5 h-3.5" />
          <span>{t.tabTemp}</span>
        </button>

        <button
          onClick={() => setActiveCategory("viscosity")}
          className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold font-mono transition-all border cursor-pointer ${
            activeCategory === "viscosity"
              ? "bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-inner"
              : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>{t.tabVisc}</span>
        </button>

        <button
          onClick={() => setActiveCategory("torque")}
          className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold font-mono transition-all border cursor-pointer ${
            activeCategory === "torque"
              ? "bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-inner"
              : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>{t.tabTorque}</span>
        </button>
      </div>

      {/* Main input & conversion segment */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#050914] scrollbar-thin">
        
        {/* Converter Panel Core */}
        <div className="bg-[#0c1524] p-4 rounded-lg border border-slate-800/60 shadow-inner">
          <div className="text-[10px] text-sky-400 font-mono uppercase tracking-wider mb-3 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            {t.enterValue}
          </div>

          {/* PRESSURE CALCULATOR COMPONENT */}
          {activeCategory === "pressure" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unit A: bar */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-300 block">
                  {t.lblBar}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={pressureBar}
                    onChange={(e) => handlePressureChange(e.target.value, "bar")}
                    className="w-full bg-[#050914] text-white border border-slate-700 hover:border-slate-600 focus:border-[#cca45c]/70 focus:outline-none p-2.5 px-3 rounded text-sm font-mono font-bold"
                    placeholder="e.g. 30"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold font-mono text-slate-500 select-none">
                    BAR
                  </span>
                </div>
                {/* Visual meter bar indicator based on typical safe operating boundaries */}
                <div className="pt-2">
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0 bar</span>
                    <span>15 bar</span>
                    <span>30 bar (Air Max)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#050914] rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        parseFloat(pressureBar) > 30 ? "bg-red-500" : parseFloat(pressureBar) < 18 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, (parseFloat(pressureBar) || 0) / 30 * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Unit B: psi */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-300 block">
                  {t.lblPsi}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={pressurePsi}
                    onChange={(e) => handlePressureChange(e.target.value, "psi")}
                    className="w-full bg-[#050914] text-white border border-slate-700 hover:border-slate-600 focus:border-[#cca45c]/70 focus:outline-none p-2.5 px-3 rounded text-sm font-mono font-bold"
                    placeholder="e.g. 435.1"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold font-mono text-slate-500 select-none">
                    PSI
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TEMPERATURE CALCULATOR COMPONENT */}
          {activeCategory === "temperature" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unit A: Celsius */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-300 block">
                  {t.lblCel}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={tempC}
                    onChange={(e) => handleTempChange(e.target.value, "C")}
                    className="w-full bg-[#050914] text-white border border-slate-700 hover:border-slate-600 focus:border-[#cca45c]/70 focus:outline-none p-2.5 px-3 rounded text-sm font-mono font-bold"
                    placeholder="e.g. 82"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold font-mono text-slate-500 select-none">
                    °C
                  </span>
                </div>
                {/* Visual heat gauge bar indicator */}
                <div className="pt-2">
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0°C</span>
                    <span>140°C (HFO)</span>
                    <span>450°C (Limit)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#050914] rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-red-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (parseFloat(tempC) || 0) / 450 * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Unit B: Fahrenheit */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-300 block">
                  {t.lblFah}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={tempF}
                    onChange={(e) => handleTempChange(e.target.value, "F")}
                    className="w-full bg-[#050914] text-white border border-slate-700 hover:border-slate-600 focus:border-[#cca45c]/70 focus:outline-none p-2.5 px-3 rounded text-sm font-mono font-bold"
                    placeholder="e.g. 179.6"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold font-mono text-slate-500 select-none">
                    °F
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VISCOSITY CALCULATOR COMPONENT */}
          {activeCategory === "viscosity" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unit A: cSt */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-slate-300 block">
                    {t.lblCst}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={viscCst}
                      onChange={(e) => handleViscChange(e.target.value, "cSt")}
                      className="w-full bg-[#050914] text-white border border-slate-700 hover:border-slate-600 focus:border-[#cca45c]/70 focus:outline-none p-2.5 px-3 rounded text-sm font-mono font-bold"
                      placeholder="e.g. 35"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold font-mono text-slate-500 select-none">
                      cSt
                    </span>
                  </div>
                </div>

                {/* Unit B: SSU */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-slate-300 block">
                    {t.lblSsu}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={viscSsu}
                      onChange={(e) => handleViscChange(e.target.value, "SSU")}
                      className="w-full bg-[#050914] text-white border border-slate-700 hover:border-slate-600 focus:border-[#cca45c]/70 focus:outline-none p-2.5 px-3 rounded text-sm font-mono font-bold"
                      placeholder="e.g. 163.6"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold font-mono text-slate-500 select-none">
                      SSU
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider for quick viscosity sweep */}
              <div className="bg-[#080e1b] p-3 rounded border border-slate-800">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                  <span>{t.quickSlide}</span>
                  <span className="text-[#dfb15b] font-bold">{(parseFloat(viscCst) || 0).toFixed(1)} cSt</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="400"
                  value={parseFloat(viscCst) || 35}
                  onChange={(e) => handleViscChange(e.target.value, "cSt")}
                  className="w-full accent-[#cca45c] cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-slate-550 font-mono mt-0.5">
                  <span>2 cSt (Diesel Low)</span>
                  <span>100 cSt (Sys Oil Option)</span>
                  <span>400 cSt (MGO Fuel Spec)</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono bg-[#090e1a] hover:bg-[#0c1425] p-3 rounded border border-l-2 border-l-[#cca45c] border-slate-850 leading-relaxed shadow-inner">
                {t.viscCaution}
              </div>
            </div>
          )}

          {/* TORQUE CALCULATOR COMPONENT */}
          {activeCategory === "torque" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unit A: Nm */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-300 block">
                  {t.lblNm}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={torqueNm}
                    onChange={(e) => handleTorqueChange(e.target.value, "Nm")}
                    className="w-full bg-[#050914] text-white border border-slate-700 hover:border-slate-600 focus:border-[#cca45c]/70 focus:outline-none p-2.5 px-3 rounded text-sm font-mono font-bold"
                    placeholder="e.g. 1500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold font-mono text-slate-500 select-none">
                    Nm
                  </span>
                </div>
                {/* Visual torque limit scale */}
                <div className="pt-2">
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0 Nm</span>
                    <span>1500 Nm (Bearing studs)</span>
                    <span>3000 Nm (Head Cover)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#050914] rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (parseFloat(torqueNm) || 0) / 3000 * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Unit B: lb-ft */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-300 block">
                  {t.lblLbft}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={torqueLbft}
                    onChange={(e) => handleTorqueChange(e.target.value, "lbft")}
                    className="w-full bg-[#050914] text-white border border-slate-700 hover:border-slate-600 focus:border-[#cca45c]/70 focus:outline-none p-2.5 px-3 rounded text-sm font-mono font-bold"
                    placeholder="e.g. 1106.3"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold font-mono text-slate-500 select-none">
                    lb-ft
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* References & Presets Panel */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-200 border-b border-slate-800 pb-2">
            <BookOpen className="w-4 h-4 text-[#cca45c]" />
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-200">
              {t.titlePresets}
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {presets[activeCategory].map((preset) => {
              const isApplied = appliedPresetId === preset.id;
              return (
                <div 
                  key={preset.id} 
                  className={`p-3 rounded-lg border text-xs font-sans transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                    isApplied 
                      ? "bg-[#cca45c]/15 border-[#cca45c]/50 text-[#dfb15b] scale-[1.01]" 
                      : "bg-[#090f1d] border-slate-800/80 text-slate-300 hover:border-slate-75 *0"
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-slate-100 flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#cca45c] shrink-0" />
                      {language === "GR" ? preset.labelGR : preset.labelEN}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic md:max-w-2xl">
                      {language === "GR" ? preset.descGR : preset.descEN}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <span className="font-mono text-[11px] font-bold bg-[#040a14] text-[#cca45c] py-1 px-2.5 rounded border border-slate-800/80">
                      {activeCategory === "pressure" && `${preset.valBar} bar / ${preset.valPsi} psi`}
                      {activeCategory === "temperature" && `${preset.valC}°C / ${preset.valF}°F`}
                      {activeCategory === "viscosity" && `${preset.valCst} cSt / ${preset.valSsu} SSU`}
                      {activeCategory === "torque" && `${preset.valNm} Nm / ${preset.valLbft} lb-ft`}
                    </span>
                    <button
                      onClick={() => applyPresetValue(preset)}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
                        isApplied 
                          ? "bg-emerald-800 hover:bg-emerald-750 text-white" 
                          : "bg-[#11223b] hover:bg-[#1b3254] text-[#dfb15b] border border-[#cca45c]/30"
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>LOADED</span>
                        </>
                      ) : (
                        <span>{t.applyPreset}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Formula Display Card */}
        <div className="bg-[#090f1d] border border-slate-800/80 p-3 rounded-lg text-[10px] font-mono text-slate-450 leading-relaxed flex items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-300 uppercase block mb-0.5">{t.formulaUsed}</span>
            {activeCategory === "pressure" && "1 Bar = 14.50377 psi  ||  1 Psi = 0.068947 bar"}
            {activeCategory === "temperature" && " °F = (°C × 9/5) + 32  ||  °C = (°F − 32) × 5/9"}
            {activeCategory === "viscosity" && "ASTM D-2161 Saybolt Seconds curve solver models at 100°F (37.8°C)"}
            {activeCategory === "torque" && "1 Nm = 0.73756 lb-ft  ||  1 lb-ft = 1.3558 Nm"}
          </div>
          <span className="text-[14px] opacity-70">⚙️</span>
        </div>

      </div>
    </div>
  );
}
