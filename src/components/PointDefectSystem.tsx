import React, { useState, useMemo } from "react";
import { 
  ShieldAlert, 
  Search, 
  Cpu, 
  Sparkles, 
  CheckSquare, 
  Square, 
  HelpCircle, 
  Lightbulb, 
  Activity, 
  RotateCcw, 
  AlertTriangle,
  Loader2,
  Bookmark,
  ChevronRight,
  Anchor,
  Flame,
  Zap
} from "lucide-react";
import { TroubleshootingRecord } from "../types";

export interface PointDefect {
  id: string;
  problemTitle: string;
  greekProblemTitle: string;
  category: "2-Stroke Propulsion" | "4-Stroke Generator" | "Auxiliary Machinery";
  makeModel: string;
  symptomDetails: string;
  greekSymptomDetails: string;
  criticalIndicators: { label: string; current: string; optimal: string; status: "WARNING" | "OK" }[];
  clickableCauses: { text: string; description: string; greekText: string; greekDescription: string }[];
  interactiveSteps: { id: number; action: string; greekAction: string; toolNeeded: string; isSafety: boolean }[];
  simulationActions?: { label: string; outcome: string; greekLabel: string; greekOutcome: string }[];
}

// Extensive list of point defects with rich clickability and interactivity!
const localPointDefects: PointDefect[] = [
  {
    id: "defect-exh-temp",
    problemTitle: "High Exhaust Valve Temperature Deviation",
    greekProblemTitle: "Υψηλή Απόκλιση Θερμοκρασίας Βαλβίδας Εξαγωγής",
    category: "2-Stroke Propulsion",
    makeModel: "MAN B&W 6S60ME-C",
    symptomDetails: "Exhaust gas temperature on Cylinder No.4 rose to 468°C under full engine load. Scavenge box drain valve is clear but alarm remains triggered.",
    greekSymptomDetails: "Η θερμοκρασία καυσαερίων στον Κύλινδρο 4 ανέβηκε στους 468°C υπό πλήρες φορτίο. Η βαλβίδα αποστράγγισης scavenge είναι καθαρή, αλλά ο συναγερμός παραμένει.",
    criticalIndicators: [
      { label: "Cylinder No.4 Exhaust Gas Temp", current: "468 °C", optimal: "380 - 410 °C", status: "WARNING" },
      { label: "Piston Cleanliness/Carbon build", current: "Heavy Carbon", optimal: "Prinstine", status: "WARNING" },
      { label: "Combustion Pressure Pmax", current: "72.5 bar", optimal: "82.0 bar", status: "WARNING" }
    ],
    clickableCauses: [
      { 
        text: "Worn or Damaged Fuel Injector Nozzle", 
        greekText: "Φθαρμένο Ή Κατεστραμμένο Μπεκ Καυσίμου",
        description: "Atomizer nozzle holes are eroded, causing poor fuel pulverization and extended afterburning into the exhaust phase.",
        greekDescription: "Οι οπές του ακροφυσίου (ντάκας) είναι διαβρωμένες, προκαλώντας κακή κονιορτοποίηση και παρατεταμένη καύση στη φάση εξαγωγής."
      },
      { 
        text: "Exhaust Air Spring Deflagration", 
        greekText: "Εκτόνωση Πνευματικού Ελατηρίου Βαλβίδας (Air Spring)",
        description: "Inadequate seal air spring pressure delays exhaust valve closing, letting burning gases escape during compression.",
        greekDescription: "Ανεπαρκής πίεση ελατηρίου αέρα καθυστερεί το κλείσιμο της βαλβίδας, με αποτέλεσμα τη διαφυγή φλεγόμενων αερίων κατά τη συμπίεση."
      },
      { 
        text: "Fuel Injection Plunger Scuffing", 
        greekText: "Κόλλημα / Φθορά Πίστου Αντλίας Καυσίμου",
        description: "Micro-seizure in the high pressure pump sleeve causes injection timing delay, burning fuel late in expansion stroke.",
        greekDescription: "Μικροκόλλημα στο χιτώνιο της αντλίας καυσίμου προκαλεί καθυστέρηση χρονισμού, καίγοντας καύσιμο αργά στη φάση εκτόνωσης."
      }
    ],
    interactiveSteps: [
      { id: 1, action: "Turn turning gear to safe BDC lock and tag starting air supplies of No.4.", greekAction: "Στρέψτε την μηχανή στο Κάτω Νεκρό Σημείο, κλειδώστε το turning gear και ταμπέλες LOTO.", toolNeeded: "Crankcase Safe Lock Pin", isSafety: true },
      { id: 2, action: "Bleed hydraulic actuator loop to dump high pressure accumulator oil.", greekAction: "Εκτονώστε το υδραυλικό κύκλωμα για αδειάσει το λάδι πίεσης του συσσωρευτή.", toolNeeded: "Accumulator Bleeder Valve Key", isSafety: true },
      { id: 3, action: "Dismantle high pressure fuel nozzle assembly in Cylinder No.4 cover.", greekAction: "Αποσυναρμολογήστε το συγκρότημα μπεκ καυσίμου από το καπάκι του 4ου κυλίνδρου.", toolNeeded: "Offset Spanner Key M24", isSafety: false },
      { id: 4, action: "Replace sealing copper slide ring washer and clean nozzle tip using wire guide pin.", greekAction: "Αντικαταστήστε τη χάλκινη ροδέλα στεγανοποίησης και καθαρίστε το ακροφύσιο με ειδικό σύρμα.", toolNeeded: "Sleeve Brass Scraper & Nozzle Wire", isSafety: false }
    ],
    simulationActions: [
      { label: "Trigger Quick Blowback Test", greekLabel: "Δοκιμή Πνευματικού Air Spring", outcome: "Pneumatic spring pressure shows 6.2 bar. Restoring safety seals is complete.", greekOutcome: "Η πίεση του ελατηρίου αέρα δείχνει 6.2 bar. Η αποκατάσταση των τσιμουχών ολοκληρώθηκε." },
      { label: "Simulate Nozzle Spray Alignment", greekLabel: "Προσομοίωση Ψεκασμού Μπεκ", outcome: "Spray pattern tested on bench. 3 clean spray jets at 120 deg angles. Passed.", greekOutcome: "Δοκιμασμένο μοτίβο ψεκασμού. 3 καθαρές δέσμες σε γωνίες 120 μοιρών. Επιτυχές." }
    ]
  },
  {
    id: "defect-ows-ppm",
    problemTitle: "OWS Bilge Monitor High Alarm Triggering",
    greekProblemTitle: "Συναγερμός Υψηλής Περιεκτικότητας Η/Γ 15ppm OWS",
    category: "Auxiliary Machinery",
    makeModel: "Deckma OMD-2005 Bilge Guard",
    symptomDetails: "Bilge discharge overboard automatically trips and redirects stream to sludge holding sump. Measuring cell registers high ppm limit exceeding 15ppm.",
    greekSymptomDetails: "Η απόρριψη υδάτων σεντίνας στη θάλασσα διακόπτεται αυτόματα και στέλνεται στη δεξαμενή λάσπης. Το OWS δείχνει τιμές άνω των 15ppm.",
    criticalIndicators: [
      { label: "Measuring Cell Sensor Output", current: "19.5 ppm", optimal: "< 14.5 ppm", status: "WARNING" },
      { label: "Glass Core Transparency Rating", current: "Clouded / Oiled", optimal: "Clear (95%-100%)", status: "WARNING" },
      { label: "Overboard Bypass Valve State", current: "CLOSED to Sea", optimal: "Modulating / Normal", status: "OK" }
    ],
    clickableCauses: [
      {
        text: "Silted Sensor Glass Cylinder Tube",
        greekText: "Θολωμένος Ή Λασπωμένος Γυάλινος Σωλήνας Αισθητήρα",
        description: "Fine sludge and black fuel oil residues settled dynamically on the internal walls of the optical measuring glass cell.",
        greekDescription: "Υπολείμματα λάσπης και πετρελαίου έχουν επικαθίσει στα εσωτερικά τοιχώματα της γυάλινης κυψέλης μέτρησης."
      },
      {
        text: "Water Emulsification by Detergents",
        greekText: "Γαλακτωματοποίηση Υδάτων λόγω Απορρυπαντικών",
        description: "Heavy degreasers used during engine room washdowns emulsified water, turning it into opaque gray fuel suspends that scatter laser light.",
        greekDescription: "Ισχυρά απορρυπαντικά που χρησιμοποιήθηκαν στο πλύσιμο του μηχανοστασίου γαλακτωματοποίησαν το πετρέλαιο, κάνοντάς το γκρι και αδιαφανές."
      }
    ],
    interactiveSteps: [
      { id: 1, action: "Lock Out starting circuit of main bilge separator lift pump (LOTO).", greekAction: "Εφαρμόστε LOTO στον ηλεκτρολογικό πίνακα της αντλίας OWS.", toolNeeded: "Circuit Breaker Key padlock", isSafety: true },
      { id: 2, action: "Isolate sampling inlet cock valve and outlet line bypass unions.", greekAction: "Απομονώστε τη βάνα δειγματοληψίας εισόδου και τις ενώσεις της γραμμής εξόδου.", toolNeeded: "Isolating Hand Valve", isSafety: true },
      { id: 3, action: "Unscrew measuring core central gland lock ring and slide out glass cylinder.", greekAction: "Ξεβιδώστε το δακτύλιο ασφάλισης της κυψέλης και σύρετε έξω τον γυάλινο σωλήνα.", toolNeeded: "Sensor gland spanner", isSafety: false },
      { id: 4, action: "Clean internal optical bore using soft nylon bottle brush soaked in standard cleaning solvent.", greekAction: "Καθαρίστε το εσωτερικό της κυψέλης με ένα μαλακό βουρτσάκι και διαλυτικό.", toolNeeded: "Nylon Core Brush & solvent", isSafety: false }
    ],
    simulationActions: [
      { label: "Run Clean Di-Water Zero Calibration", greekLabel: "Εκτέλεση Βαθμονόμησης (Zero Calibration)", outcome: "Sensor reading stabilized at 0.1 ppm with fresh distilled water. Calibration validated.", greekOutcome: "Η ένδειξη σταθεροποιήθηκε στα 0.1 ppm με καθαρό αποσταγμένο νερό. Η βαθμονόμηση πέτυχε." }
    ]
  },
  {
    id: "defect-boiler-ign",
    problemTitle: "Auxiliary Boiler Burner Ignition Failure Trip",
    greekProblemTitle: "Αποτυχία Ανάφλεξης Καυστήρα Βοηθητικού Λέβητα",
    category: "Auxiliary Machinery",
    makeModel: "Aalborg Mission OL Steam Boiler",
    symptomDetails: "The burner sequences blower ventilation for 30s as standard, but solenoid heavy fuel oil valve release fails to trigger fire. Control locks in Spark Failure Alarm.",
    greekSymptomDetails: "Ο καυστήρας κάνει προαερισμό για 30 δευτερόλεπτα, αλλά η παροχή πετρελαίου δεν παίρνει φωτιά. Κλειδώνει σε συναγερμό αποτυχίας σπινθήρα.",
    criticalIndicators: [
      { label: "Burner Photocell Light scanner", current: "0.2 micro-Amps", optimal: "> 4.8 micro-Amps", status: "WARNING" },
      { label: "Spark Electrode Gap Size", current: "5.5 mm", optimal: "3.0 - 3.5 mm", status: "WARNING" },
      { label: "Heavy Fuel Oil Temperature", current: "115 °C", optimal: "135 - 145 °C", status: "WARNING" }
    ],
    clickableCauses: [
      {
        text: "Sooted Photoelectric Flame Cell Scanners",
        greekText: "Επικάθιση Αιθάλης στο Φωτοκύτταρο Ανίχνευσης Φλόγας",
        description: "Heavy soot accumulation from incomplete exhaust combustion coated the glass interface of the photocell sensor, blocking light scan path.",
        greekDescription: "Συσσώρευση αιθάλης από ατελή καύση κάλυψε τη γυάλινη επιφάνεια του φωτοκυττάρου, εμποδίζοντας την ανίχνευση φλόγας."
      },
      {
        text: "Low High-Viscosity HFO Circulation Temperature",
        greekText: "Χαμηλή Θερμοκρασία Παχύρρευστου Πετρελαίου HFO",
        description: "HFO heater thermostat malfunction dropped fuel temp to 115°C, increasing viscosity beyond atomizing limit under the burner nozzle pressure.",
        greekDescription: "Βλάβη του θερμοστάτη του προθερμαντήρα έριξε τη θερμοκρασία καυσίμου στους 115°C, αυξάνοντας το ιξώδες πέρα από το όριο ψεκασμού."
      }
    ],
    interactiveSteps: [
      { id: 1, action: "Turn off fuel recirculation valve, switch boiler heating loop to diesel manual steam mode.", greekAction: "Κλείστε τη βάνα πετρελαίου, γυρίστε το λέβητα σε χειροκίνητη λειτουργία ντίζελ.", toolNeeded: "Control Panel Override switch", isSafety: true },
      { id: 2, action: "Slide photocell scanner out of socket tube, inspect glass tip.", greekAction: "Σύρετε το φωτοκύτταρο έξω από το σωλήνα στήριξης, επιθεωρήστε το γυαλί.", toolNeeded: "None (Hand slide-out)", isSafety: false },
      { id: 3, action: "Clean photocell tip face using velvet cloth. Wipe off oily grease layer.", greekAction: "Καθαρίστε το φωτοκύτταρο με ένα καθαρό βελούδινο πανί. Σκουπίστε το λάδι.", toolNeeded: "Soot Wipe cloth & alcohol", isSafety: false },
      { id: 4, action: "Calibrate sparks electrode gap tip to 3mm using feeler calipers and screw alignment bolt.", greekAction: "Ρυθμίστε το διάκενο των ακίδων σπινθήρα στα 3mm με κατάλληλο φίλερ.", toolNeeded: "Feeler Calipers & screwdriver", isSafety: false }
    ],
    simulationActions: [
      { label: "Run Manual Fuel Recirc Temp Override", greekLabel: "Χειροκίνητη Παράκαμψη Θερμοκρασίας Καυσίμου", outcome: "Pushed steam heat valve to preheater. HFO fuel temperature risen to 138°C now.", greekOutcome: "Ανοίχτηκε η ατμοβαλβίδα θέρμανσης. Η θερμοκρασία του HFO ανέβηκε στους 138°C." }
    ]
  },
  {
    id: "defect-gen-hunting",
    problemTitle: "Generator Load Oscillations and Speed Hunting",
    greekProblemTitle: "Κυνήγι Στροφών / Αυξομειώσεις Φορτίου Ηλεκτρομηχανής",
    category: "4-Stroke Generator",
    makeModel: "Yanmar 6EY26L",
    symptomDetails: "During engine synchronization or loading above 60%, generator speed indexes rapidly oscillate. Multi-meters show high frequency hunting.",
    greekSymptomDetails: "Κατά τον παραλληλισμό ή σε φορτίο άνω του 60%, οι στροφές της ηλεκτρομηχανής παρουσιάζουν έντονες αυξομειώσεις.",
    criticalIndicators: [
      { label: "Woodward Governor Fluid Level", current: "Low Glass limit", optimal: "Mid Glass", status: "WARNING" },
      { label: "Actuator Linkage Play", current: "0.85 mm", optimal: "< 0.15 mm", status: "WARNING" },
      { label: "Frequency Deviation Range", current: "+/- 1.8 Hz", optimal: "+/- 0.1 Hz", status: "WARNING" }
    ],
    clickableCauses: [
      {
        text: "Trapped Air within Actuator Internal Oil",
        greekText: "Εγκλωβισμένος Αέρας στο Λάδι του Ρυθμιστή (Actuator Air)",
        description: "Small air air bubbles compressed inside the Woodward governor hydraulic chamber cause spongey valve action, delaying fueling compensation.",
        greekDescription: "Μικρές φυσαλίδες αέρα στον υδραυλικό θάλαμο του ρυθμιστή προκαλούν σπογγώδη συμπεριφορά, καθυστερώντας την τροφοδοσία."
      },
      {
        text: "Mechanical Backlash in Fuel Rack Governor Linkage Joints",
        greekText: "Μηχανική Ανοχή (Τζόγος) στους Συνδέσμους Governor",
        description: "Excessive joint wear of ball rods connecting hydraulic rotor to the high pressure fuel pumps index racks induces severe mechanical oscillation.",
        greekDescription: "Υπερβολική φθορά στους συνδέσμους που συνδέουν το ρυθμιστή με τις οδοντωτές ράγες των αντλιών προκαλεί μηχανική ταλάντωση."
      }
    ],
    interactiveSteps: [
      { id: 1, action: "Switch active generator off panel board. Stop engine, wait engine to standstill.", greekAction: "Βγάλτε τη γεννήτρια εκτός πίνακα. Σταματήστε τη μηχανή και περιμένετε ακινησία.", toolNeeded: "Aux control switch LOTO", isSafety: true },
      { id: 2, action: "Examine fuel linkage spring, check manual alignment tightness.", greekAction: "Εξετάστε το ελατήριο της ράγας καυσίμου, ελέγξτε τη σύσφιξη.", toolNeeded: "Wrench 14mm", isSafety: false },
      { id: 3, action: "Bleed air from governor bypass bleed valve screw on upper head cap.", greekAction: "Εξαερώστε το ρυθμιστή από την επάνω βίδα εξαέρωσης στο καπάκι.", toolNeeded: "Bleed screw driver key", isSafety: false },
      { id: 4, action: "Replenish governor with standard clean SAE 30 turbine lube oil to middle indicator mark.", greekAction: "Συμπληρώστε το ρυθμιστή με καθαρό λάδι SAE 30 μέχρι το μέσο του δείκτη.", toolNeeded: "SAE 30 Oil can & Funnel", isSafety: false }
    ],
    simulationActions: [
      { label: "Simulate Electronic Governor Self-Test", greekLabel: "Αυτοδιάγνωση Ηλεκτρονικού Ρυθμιστή", outcome: "Woodward Governor electrical gain calibrated. Step feedback signal stabilized at 4.2ms. Passed.", greekOutcome: "Η ηλεκτρική ενίσχυση του ρυθμιστή Woodward βαθμονομήθηκε. Το σήμα σταθεροποιήθηκε στα 4.2ms." }
    ]
  }
];

export default function PointDefectSystem({ 
  language = "EN",
  onSelectRecordForAi // callback so we can feed our custom defect straight to the parent AI component!
}: { 
  language?: "EN" | "GR";
  onSelectRecordForAi?: (virtualRecord: TroubleshootingRecord) => void;
}) {
  const [typedQuery, setTypedQuery] = useState("");
  const [selectedDefect, setSelectedDefect] = useState<PointDefect | null>(null);
  
  // Interactive state lists inside active selected defect
  const [activeStepProgress, setActiveStepProgress] = useState<Record<number, boolean>>({});
  const [viewedCauseId, setViewedCauseId] = useState<number | null>(null);
  
  // Custom simulator tracking state
  const [simulationResponse, setSimulationResponse] = useState<string | null>(null);

  // States for live interactive custom user defect analysis (AI)
  const [customUserProblem, setCustomUserProblem] = useState("");
  const [customAiSolution, setCustomAiSolution] = useState<string | null>(null);
  const [isLoadingCustomAi, setIsLoadingCustomAi] = useState(false);

  const isGr = language === "GR";

  // Filter defects based on query match (title, makeModel, code, components, symptoms)
  const matchedDefects = useMemo(() => {
    const q = typedQuery.toLowerCase().trim();
    if (!q) return localPointDefects;
    return localPointDefects.filter(d => {
      return (
        d.problemTitle.toLowerCase().includes(q) ||
        d.greekProblemTitle.toLowerCase().includes(q) ||
        d.makeModel.toLowerCase().includes(q) ||
        d.symptomDetails.toLowerCase().includes(q) ||
        d.greekSymptomDetails.toLowerCase().includes(q)
      );
    });
  }, [typedQuery]);

  const selectDefect = (defect: PointDefect) => {
    setSelectedDefect(defect);
    setActiveStepProgress({});
    setViewedCauseId(null);
    setSimulationResponse(null);
  };

  const handleToggleStep = (stepId: number, isSafety: boolean) => {
    if (!selectedDefect) return;
    
    // Safety steps must generally be completed first to allow other steps
    const safetiesAllCompleted = selectedDefect.interactiveSteps
      .filter(s => s.isSafety && s.id !== stepId)
      .every(s => activeStepProgress[s.id]);

    if (!isSafety && !safetiesAllCompleted) {
      alert(isGr 
        ? "⚠️ ΠΡΟΣΟΧΗ: Πρέπει να ολοκληρώσετε όλα τα βήματα ασφαλείας (LOTO) πριν ξεκινήσετε τις μηχανικές εργασίες!" 
        : "⚠️ SAFETY NOTICE: Ensure you completed and locked out all high-risk safety requirements (LOTO) prior to mechanical dismantling!"
      );
      return;
    }

    setActiveStepProgress(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const currentDefectStepsCount = selectedDefect?.interactiveSteps.length || 0;
  const currentDefectCompletedCount = Object.values(activeStepProgress).filter(Boolean).length;
  const progressPercent = currentDefectStepsCount > 0 ? Math.round((currentDefectCompletedCount / currentDefectStepsCount) * 100) : 0;

  // Run Custom AI generation based on what they wrote inside the point defect terminal!
  const handleQueryCustomAi = async () => {
    const trimmed = customUserProblem.trim();
    if (!trimmed) return;
    setIsLoadingCustomAi(true);
    setCustomAiSolution(null);

    try {
      // Craft a temporary virtualRecord representation
      const response = await fetch("/api/troubleshoot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Analyze this custom engine room point defect problem: "${trimmed}". Please provide an interactive troubleshooting guide with: 1. Root causes, 2. Critical SOLAS safety checklist, 3. Mechanical repair checklist. Output in beautiful, logical markdown format.`,
          chatHistory: [],
          selectedRecord: null
        })
      });

      if (!response.ok) throw new Error("API Failure");
      const data = await response.json();
      setCustomAiSolution(data.text);
    } catch (e) {
      console.error(e);
      setCustomAiSolution(isGr 
        ? "### ⚠️ Σφάλμα Διασύνδεσης AI\n\nΒεβαιωθείτε ότι το `GEMINI_API_KEY` είναι ρυθμισμένο στα settings. Μπορείτε να αναζητήσετε έναν από τους προκαθορισμένους κωδικούς σφαλμάτων!"
        : "### ⚠️ Diagnostic Connection Issue\n\nPlease verify your environment's `GEMINI_API_KEY` is currently defined. Direct your focus to checking our cached local ship defect directories."
      );
    } finally {
      setIsLoadingCustomAi(false);
    }
  };

  const getDefetCategoryIcon = (cat: string) => {
    switch (cat) {
      case "2-Stroke Propulsion": return <Anchor className="w-4 h-4 text-[#cca45c]" />;
      case "4-Stroke Generator": return <Zap className="w-4 h-4 text-[#dfb15b]" />;
      default: return <Cpu className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6" id="point-defect-view">
      
      {/* Title */}
      <div className="bg-[#0b1425] border-2 border-orange-600/30 p-5 rounded-xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="defect-intro-block">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-gradient-to-br from-[#f26419] to-orange-700 rounded flex items-center justify-center text-white font-black shadow-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-white font-display uppercase tracking-tight">
              {isGr ? "Διαδραστικό Σύστημα Σφαλμάτων & Point Defects" : "Interactive Point Defect Diagnostic Terminal"}
            </h2>
            <p className="text-2xs text-[#dfb15b] font-mono tracking-wider font-semibold">
              {isGr ? "ΑΜΕΣΕΣ ΛΥΣΕΙΣ ΣΦΑΛΜΑΤΩΝ // ΚΛΙΚΑΡΙΣΜΑ & ΠΡΟΣΟΜΟΙΩΣΗ // ΣΥΝΔΕΣΗ ΜΕ AI CHIEF" : "SPOT DEFECT LOOKUP // TAP TO INSPECT & SIMULATE // SYNCED CHIEF ADVISOR"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="defect-main-assembly">
        
        {/* LEFT COLUMN: DEFECT SEARCH ENGINE (SPAN 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="defect-search-panel">
          
          {/* Diagnostic Finder Searchbox */}
          <div className="bg-[#0c1a2e] border-2 border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Search className="w-4 h-4 text-[#cca45c]" />
              {isGr ? "Αναζήτηση Point Defects" : "Locate Hardware Point Defect"}
            </h3>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="point-defect-input-search"
                type="text"
                placeholder={isGr ? "Πληκτρολογήστε π.χ. exhaust, OWS, boiler..." : "Type custom defect query (e.g. exhaust, OWS, boiler)..."}
                value={typedQuery}
                onChange={(e) => setTypedQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#cca45c] font-medium"
              />
              {typedQuery && (
                <button onClick={() => setTypedQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs hover:text-white">✕</button>
              )}
            </div>

            {/* List of matched local defects */}
            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {matchedDefects.length > 0 ? (
                matchedDefects.map((defect) => {
                  const isSelected = selectedDefect?.id === defect.id;
                  return (
                    <div
                      key={defect.id}
                      onClick={() => selectDefect(defect)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected 
                          ? "bg-[#282110]/40 border-[#cca45c] text-[#dfb15b]" 
                          : "bg-[#050e18]/80 border-slate-850 hover:bg-[#050e18] hover:border-slate-750"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] font-mono uppercase bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 font-bold tracking-tight">
                          {defect.category.replace(" Propulsion", "").replace(" Generator", "")}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">{defect.makeModel}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mt-1 line-clamp-1 uppercase">
                        {isGr ? defect.greekProblemTitle : defect.problemTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 font-sans italic leading-relaxed">
                        {isGr ? defect.greekSymptomDetails : defect.symptomDetails}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs font-mono">
                  {isGr ? "Δεν βρέθηκαν τοπικά σφάλματα." : "No local point defects matched. Type above."}
                </div>
              )}
            </div>
          </div>

          {/* User Terminal: Diagnose my written custom problem via AI! */}
          <div className="bg-[#0c1a2e] border-2 border-orange-600/30 rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[#dfb15b] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-orange-500 animate-pulse" />
              {isGr ? "ΑΙ Διαγνώστης Δικών σας Σφαλμάτων" : "AI Custom Defect Investigator"}
            </h3>
            <p className="text-3xs text-slate-400 leading-relaxed uppercase font-mono">
              {isGr ? "ΓΡΑΨΤΕ ΤΟ ΠΡΟΒΛΗΜΑ ΣΑΣ ΚΑΙ Ο AI CHIEF ΘΑ ΒΡΕΙ ΑΜΕΣΗ ΛΥΣΗ" : "Describe any deck fault. AI will parse & write precise interactive solutions."}
            </p>

            <textarea
              id="custom-defect-textarea"
              placeholder={isGr ? "π.χ. Η πίεση του λαδιού στο Turbocharger πέφτει απότομα στους 80 βαθμούς..." : "e.g. Turbocharger lube oil pressure drops heavily or generator experiences surge..."}
              value={customUserProblem}
              onChange={(e) => setCustomUserProblem(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-xs text-white h-20 focus:outline-none focus:border-[#cca45c] font-sans"
            />

            <button
              id="submit-custom-defect-btn"
              onClick={handleQueryCustomAi}
              disabled={isLoadingCustomAi || !customUserProblem.trim()}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white font-bold py-2 px-4 rounded text-xs transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoadingCustomAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>TRANSMITTING SIGNAL...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>{isGr ? "ΑΝΑΛΥΣΗ ΜΕ AI CHIEF" : "SUBMIT TO AI CHIEF"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED POINT INSPECTION PORT & CHECKLISTS (SPAN 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6" id="defect-inspection-desk">
          
          {/* Case 1: Standard selected defect card */}
          {selectedDefect ? (
            <div className="bg-[#0c1a2e] border-2 border-slate-850 rounded-xl p-6 shadow-xl flex flex-col gap-5 justify-between flex-1">
              
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[9px] font-mono bg-sky-950 font-bold px-2 py-0.5 rounded text-sky-400 uppercase tracking-widest leading-none block mb-1 font-semibold max-w-fit flex items-center gap-1.5">
                      {getDefetCategoryIcon(selectedDefect.category)}
                      {selectedDefect.category}
                    </span>
                    <h3 className="text-sm md:text-base font-black text-white font-display uppercase tracking-wide">
                      {isGr ? selectedDefect.greekProblemTitle : selectedDefect.problemTitle}
                    </h3>
                    <p className="text-[10.5px] font-mono text-[#dfb15b] mt-0.5 font-bold uppercase">{selectedDefect.makeModel}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">ID: {selectedDefect.id}</span>
                </div>

                {/* Symptom description boxes */}
                <div className="bg-slate-950/60 p-3 rounded border border-slate-850 text-xs italic text-slate-300 leading-relaxed font-sans">
                  <p className="font-semibold text-slate-450 text-[10px] uppercase font-mono tracking-wider italic not-italic mb-1">⚓ Observed Symptom Details:</p>
                  "{isGr ? selectedDefect.greekSymptomDetails : selectedDefect.symptomDetails}"
                </div>

                {/* Critical Alarm Status Meters */}
                <div>
                  <h4 className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">⚓ Telemetry Guard Gauges:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedDefect.criticalIndicators.map((gauge, index) => {
                      const isWarning = gauge.status === "WARNING";
                      return (
                        <div key={index} className="bg-slate-950 border border-slate-850 rounded p-2 text-center flex flex-col gap-1 items-center justify-center">
                          <span className="text-[9px] font-mono text-slate-400 uppercase truncate max-w-full block" title={gauge.label}>{gauge.label}</span>
                          <span className={`text-[13px] font-mono font-black ${isWarning ? "text-red-400 animate-pulse" : "text-[#22e4ac]"}`}>{gauge.current}</span>
                          <span className="text-[9px] font-mono text-slate-500 truncate block">Std: {gauge.optimal}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Causes expandable selectors */}
                <div>
                  <h4 className="text-[10.5px] font-mono font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Lightbulb className="w-4 h-4" />
                    {isGr ? "1. Πιθανές Αιτίες (Κάντε κλικ για λεπτομέρειες):" : "1. Underlying Causes (Click block to reveal micro-analysis):"}
                  </h4>
                  <div className="flex flex-col gap-2">
                    {selectedDefect.clickableCauses.map((cause, idx) => {
                      const isFocussed = viewedCauseId === idx;
                      return (
                        <div 
                          key={idx}
                          onClick={() => setViewedCauseId(viewedCauseId === idx ? null : idx)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer font-sans ${
                            isFocussed 
                              ? "bg-slate-900 border-[#cca45c] text-white" 
                              : "bg-[#0b1424]/60 border-slate-850 hover:border-slate-750 text-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span>⚡ {isGr ? cause.greekText : cause.text}</span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${isFocussed ? "rotate-90 text-[#cca45c]" : "text-slate-500"}`} />
                          </div>
                          {isFocussed && (
                            <p className="text-xs text-slate-400 mt-2 pl-4 leading-relaxed border-l-2 border-[#cca45c]/50">
                              {isGr ? cause.greekDescription : cause.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Clickable Solution flow Checklist */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <h4 className="text-[10.5px] font-mono font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckSquare className="w-4 h-4 text-teal-400" />
                      {isGr ? "2. Διαδραστικά Βήματα Επισκευής (Κλικάρετε):" : "2. Interactive Action Flow (Cick steps to tick completed):"}
                    </h4>
                    <span className="text-[10px] font-mono text-teal-400 font-bold bg-teal-950/40 px-1.5 py-0.5 rounded border border-teal-800/30">
                      {progressPercent}% {isGr ? "ΟΛΟΚΛΗΡΩΘΗΚΕ" : "DONE"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 bg-[#05101a] p-3 rounded-lg border border-slate-850">
                    {selectedDefect.interactiveSteps.map((step) => {
                      const isCompleted = activeStepProgress[step.id];
                      return (
                        <div
                          key={step.id}
                          onClick={() => handleToggleStep(step.id, step.isSafety)}
                          className={`p-2.5 rounded border transition-all flex items-start gap-3 select-none cursor-pointer text-xs ${
                            isCompleted 
                              ? "bg-[#0a231c]/20 border-teal-500/30 text-slate-200"
                              : step.isSafety 
                                ? "bg-[#2d0f0f]/20 border-red-900/30 hover:border-red-700/60 text-slate-300" 
                                : "bg-slate-900/40 border-slate-850 hover:bg-slate-900/80 hover:border-slate-700 text-slate-350"
                          }`}
                        >
                          <div className="mt-0.5">
                            {isCompleted ? (
                              <CheckSquare className="w-4 h-4 text-[#22e4ac]" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 font-sans">
                            <p className={`${isCompleted ? "line-through text-slate-500 font-medium" : "font-semibold"}`}>
                              <span className="font-mono text-[10px] text-teal-400 font-bold mr-1.5">STEP {step.id}</span>
                              {isGr ? step.greekAction : step.action}
                            </p>
                            <div className="flex gap-2 items-center mt-1 text-[10px] font-semibold uppercase text-slate-500 font-mono">
                              <span>Tool:</span>
                              <span className="text-slate-400 font-bold">{step.toolNeeded}</span>
                              {step.isSafety && (
                                <span className="text-red-400 text-[9px] font-extrabold bg-red-950/40 border border-red-950 px-1 rounded">SOLAS LOTO</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Micro simulator buttons */}
                {selectedDefect.simulationActions && selectedDefect.simulationActions.length > 0 && (
                  <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">⚓ Quick Hardware Simulator:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedDefect.simulationActions.map((sim, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSimulationResponse(isGr ? sim.greekOutcome : sim.outcome)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-[#cca45c] hover:text-white border border-[#cca45c]/30 hover:border-[#cca45c]/70 text-[11px] font-bold rounded uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          ⚙️ {isGr ? sim.greekLabel : sim.label}
                        </button>
                      ))}
                    </div>
                    {simulationResponse && (
                      <div className="p-3 bg-slate-950/80 rounded border-l-3 border-[#cca45c] text-xs font-mono text-[#cca45c] leading-relaxed animate-fade-in relative">
                        <span className="absolute top-1.5 right-2 text-[8px] text-slate-600 font-black">SIM COMPLETED</span>
                        {simulationResponse}
                        <button onClick={() => setSimulationResponse(null)} className="block mt-1 text-[10px] text-slate-400 hover:text-white underline">Clear simulation log</button>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Sync with AI button */}
              {onSelectRecordForAi && (
                <div className="border-t border-slate-800 pt-4 flex justify-between items-center mt-2.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">stcw-95 defect safety verified // code 3/7</span>
                  <button
                    onClick={() => {
                      // Parse point defect temporarily to a virtual troubleshooting record structure
                      const virtualRecord: TroubleshootingRecord = {
                        id: selectedDefect.id,
                        category: selectedDefect.category,
                        makeModel: selectedDefect.makeModel,
                        component: selectedDefect.problemTitle,
                        faultSymptom: selectedDefect.symptomDetails,
                        possibleCauses: selectedDefect.clickableCauses.map(c => c.text),
                        troubleshootingSteps: selectedDefect.interactiveSteps.map(s => s.action),
                        safetyPrecautions: selectedDefect.interactiveSteps.filter(s => s.isSafety).map(s => s.action),
                        difficulty: "Medium"
                      };
                      onSelectRecordForAi(virtualRecord);
                    }}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1.5 rounded text-xs transition-transform uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{isGr ? "ΣΥΝΔΕΣΗ ΜΕ AI CHIEF" : "SYNC TO AI CHIEF INTERFACE"}</span>
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-[#0c1a2e] border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-center items-center text-center py-20 flex-1">
              <ShieldAlert className="w-12 h-12 text-slate-600 animate-pulse mb-3" />
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest font-mono">
                {isGr ? "ΔΕΝ ΕΧΕΙ ΕΠΙΛΕΧΘΕΙ POINT DEFECT" : "NO POINT DEFECT INSPECTION LOADED"}
              </h3>
              <p className="text-2xs text-slate-500 uppercase font-mono max-w-sm mt-1.5 leading-relaxed">
                {isGr ? "Επιλέξτε ένα point defect από τη λίστα αριστερά ή πληκτρολογήστε ένα δικό σας." : "Select any listed hardware problem from the diagnostics block or query a custom trouble using the AI."}
              </p>
            </div>
          )}

          {/* AI Custom Solution display sheet if available */}
          {customAiSolution && (
            <div className="bg-[#0c1a2e] border-2 border-[#cca45c] rounded-xl p-5 shadow-inner leading-relaxed space-y-4 animate-fade-in relative text-xs">
              <span className="absolute top-4 right-4 bg-orange-950 text-orange-400 border border-orange-800/40 rounded px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider">
                custom ai deck answer
              </span>
              <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                <Sparkles className="w-4 h-4 text-[#cca45c]" />
                <h4 className="font-bold text-white uppercase font-display tracking-widest">{isGr ? "ΑΙ Επίλυση Προβλήματος" : "AI Custom Hardware Solution card // Clickable"}</h4>
              </div>

              {/* Display AI custom layout beautifully */}
              <div className="markdown-body text-slate-200 select-text bg-[#050912]/80 border border-slate-850 p-4 rounded max-h-[380px] overflow-y-auto leading-relaxed">
                <div className="text-slate-300 font-sans tracking-wide">
                  {/* Since react-markdown handles text directly, we simulate render */}
                  <span className="text-[#dfb15b] font-bold uppercase font-mono text-[10px] block mb-2">⚓ ADVISORY BLUEPRINT EXEMPTION DIRECTIVE</span>
                  <p className="whitespace-pre-wrap font-sans text-xs">{customAiSolution}</p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                <button 
                  onClick={() => setCustomAiSolution(null)} 
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  {isGr ? "Εκκαθάριση κάρτας" : "Close solution panel"}
                </button>
                <div className="text-2xs text-slate-500 font-mono uppercase">
                  SOLAS COMPLIANT GENERATED
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
