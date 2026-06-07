import React, { useState } from "react";
import { 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Layers, 
  HelpCircle, 
  Cpu, 
  Gauge, 
  ChevronRight, 
  Printer, 
  RotateCcw,
  BookOpen,
  Info,
  Flame,
  ShieldCheck,
  Droplet
} from "lucide-react";

export interface OverhaulStep {
  stepNumber: number;
  title: string;
  narrative: string;
  greekTitle: string;
  greekNarrative: string;
  safetyActionRequired: boolean;
  toolRequired: string;
}

export interface OverhaulManual {
  id: string;
  plateCode: string;
  machinery: string;
  greekMachinery: string;
  makeModel: string;
  torqueSpecs: { label: string; value: string; greekLabel: string }[];
  clearanceLimits: { name: string; standard: string; limit: string; unit: string; greekName: string }[];
  requiredTools: { name: string; greekName: string; iconIndex: number }[];
  steps: OverhaulStep[];
}

export const overhaulManualsData: OverhaulManual[] = [
  {
    id: "man-2s-overhaul",
    plateCode: "P-MAN-CYL-01",
    machinery: "MAN B&W MC-C/ME-C 2-Stroke Cylinder Unit",
    greekMachinery: "MAN B&W MC-C/ME-C Δίχρονο Συγκρότημα Κυλίνδρου",
    makeModel: "MAN B&W 6S60ME-C8.2 Propulsion (600mm bore / 2400mm stroke)",
    torqueSpecs: [
      { label: "Cylinder Cover Studs (Hydraulic Pressure)", value: "1500 bar", greekLabel: "Μπουζόνια Καπακιού Κυλίνδρου (Υδραυλική Πίεση)" },
      { label: "Piston Crown to Rod Studs Torque", value: "340 Nm + 90° angle", greekLabel: "Μπουζόνια Κεφαλής Εμβόλου προς Βάκτρο" },
      { label: "Crosshead Pin Nuts (Hydraulic Pressure)", value: "850 bar", greekLabel: "Παξιμάδια Σταυρού (Υδραυλική Πίεση)" },
      { label: "Exhaust Valve Housing Bolts", value: "620 Nm", greekLabel: "Βίδες Κελύφους Βαλβίδας Εξαγωγής" }
    ],
    clearanceLimits: [
      { name: "Cylinder Liner Wear Limit", standard: "600.00 mm", limit: "604.80 mm", unit: "mm", greekName: "Όριο Φθοράς Χιτωνίου Κυλίνδρου" },
      { name: "Piston Ring Axial Groove Clearance", standard: "0.40 mm", limit: "0.75 mm", unit: "mm", greekName: "Διάκενο Ελατηρίου Εμβόλου σε Αυλάκωση" },
      { name: "Cylinder Liner Lubricant Quill Alignment", standard: "0.0 mm deviation", limit: "0.2 mm deviation", unit: "mm", greekName: "Απόκλιση Ευθυγράμμισης Quill Λίπανσης" },
      { name: "Piston Ring Joint Butt Gap (Ring No.1)", standard: "4.5 mm", limit: "9.0 mm", unit: "mm", greekName: "Διάκενο Κλεισίματος Ελατηρίου (Νο.1)" }
    ],
    requiredTools: [
      { name: "Hydraulic Jack and Pump Kit (1500 bar)", greekName: "Υδραυλικά Τζακ & Αντλία (1500 bar)", iconIndex: 0 },
      { name: "Piston Lifting Crossbar & Eye Bolts", greekName: "Ζυγός Ανέλκυσης Εμβόλου & Κρίκοι M36", iconIndex: 1 },
      { name: "Liner Top Protection Guide Band", greekName: "Δακτύλιος Προστασίας Άκρου Χιτωνίου", iconIndex: 2 },
      { name: "Crankcase Safety Turnbar Holder", greekName: "Πείρος Ασφάλισης Μηχανισμού Στρέψης", iconIndex: 3 },
      { name: "Inside Micrometer (580-620mm)", greekName: "Εσωτερικό Μικρόμετρο χιτωνίων", iconIndex: 4 }
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Isolate Starting Air and Engage Turning Gear",
        greekTitle: "Απομόνωση Αέρα Εκκίνησης και Εμπλοκή Μηχανισμού Στρέψης",
        narrative: "Verify fuel oil supply is fully circulated at low pressure/temperature in bypass. Perform master lock-out/tag-out (LOTO) on remote AMS and shut main starting air distribution valve. Engage the turning gear pin and padlock the control handle in locked position so the crankshaft cannot rotate under any condition.",
        greekNarrative: "Επαληθεύστε ότι η παροχή πετρελαίου κυκλοφορεί σε χαμηλή πίεση/θερμοκρασία σε bypass. Εφαρμόστε Lock-out Tag-out (LOTO) στο AMS και κλείστε την κύρια βαλβίδα αέρα εκκίνησης. Εμπλέξτε τον πείρο τουTurning Gear και κλειδώστε τη χειρολαβή ελέγχου ώστε να είναι αδύνατη η περιστροφή του στροφάλου.",
        safetyActionRequired: true,
        toolRequired: "Crankcase Safety Turnbar Holder"
      },
      {
        stepNumber: 2,
        title: "Dismantle Exhaust Valve Connections & Hydraulic Pipes",
        greekTitle: "Λύσιμο Συνδέσεων Βαλβίδας Εξαγωγής & Υδραυλικών Σωλήνων",
        narrative: "Drain control air spring system from the exhaust valve actuator. Disconnect high pressure hydraulic drive oil lines (200 bar operating reservoir) and wrap flanges in blank caps. Disconnect high temperature electrical exhaust thermocouple leads and AMS proximity sensor cables.",
        greekNarrative: "Αποστραγγίστε το πνευματικό ελατήριο αέρα (air spring) από τον ενεργοποιητή της βαλβίδας. Αποσυνδέστε τους υδραυλικούς σωλήνες υψηλής πίεσης (λάδι σε πίεση 200 bar) και ταπώστε τις φλάντζες. Αποσυνδέστε τα θερμοστοιχεία θερμοκρασίας και τα καλώδια αισθητήρων του AMS.",
        safetyActionRequired: false,
        toolRequired: "Wrench Set"
      },
      {
        stepNumber: 3,
        title: "Pressurize Cylinder Cover Studs with Hydraulic Jacks",
        greekTitle: "Υδραυλική Εκτόνωση Μπουζονιών Καπακιού Κυλίνδρου",
        narrative: "Clean cover studs threads thoroughly. Screw on the four hydraulic jack collars onto cylinder cover studs. Install hydraulic high-pressure loop hoses to the pump manifold. Pressurize slowly to exactly 1500 bar. Verify zero pressure drops. Use tommy bars to spin back the heavy retaining nuts by hand.",
        greekNarrative: "Καθαρίστε σχολαστικά τα σπειρώματα των μπουζονιών. Βιδώστε τα τέσσερα υδραυλικά τζακ στα μπουζόνια του καπακιού. Συνδέστε τους εύκαμπτους σωλήνες υψηλής πίεσης στον συλλέκτη της αντλίας. Πρεσάρετε αργά στα 1500 bar ακριβώς. Χρησιμοποιήστε πείρους (tommy bars) για να ξεβιδώσετε τα βαρέα παξιμάδια με το χέρι.",
        safetyActionRequired: true,
        toolRequired: "Hydraulic Jack and Pump Kit (1500 bar)"
      },
      {
        stepNumber: 4,
        title: "Hoist Cylinder Cover and Exhaust Valve Unit",
        greekTitle: "Ανέλκυση Καπακιού Κυλίνδρου και Βαλβίδας Εξαγωγής",
        narrative: "Release pressure from hydraulic pump, remove jacks. Rig heavy lifting chains from engine room portal crane. Secure loops to cover lifting eyes. Lift the cover and exhaust valve unit slowly. Guard against swinging, and guide it to the wooden landing blocks on the upper engine room floor.",
        greekNarrative: "Εκτονώστε την πίεση, αφαιρέστε τα τζακ. Ριγκάρετε τις αλυσίδες του γερανού του μηχανοστασίου. Ασφαλίστε τους κρίκους ανέλκυσης του καπακιού. Σηκώστε το καπάκι μαζί με τη βαλβίδα εξαγωγής πολύ αργά. Προστατέψτε από ταλαντώσεις και οδηγήστε το στα ξύλινα βάθρα του άνω δαπέδου.",
        safetyActionRequired: false,
        toolRequired: "Lifting Eye Bolts & Crane"
      },
      {
        stepNumber: 5,
        title: "Mount Liner Top Protection Guide Band",
        greekTitle: "Τοποθέτηση Προστατευτικού Δακτυλίου στο Άκρο Χιτωνίου",
        narrative: "Clean carbon deposit ring ridge from the top of the cylinder liner using copper scrapers. Grease the upper sealing surface of the liner. Mount the top protection guide band. This prevents the piston rings from locking on the wear ridge or getting damaged during extraction.",
        greekNarrative: "Καθαρίστε τη στεφάνη άνθρακα (carbon ridge) από το άνω μέρος του χιτωνίου χρησιμοποιώντας χάλκινες ξύστρες. Γράσαρετε την άνω επιφάνεια του χιτωνίου. Τοποθετήστε τον προστατευτικό δακτύλιο άκρου. Αυτό εμποδίζει τα ελατήρια του εμβόλου να σκαλώσουν ή να καταστραφούν κατά την ανέλκυση.",
        safetyActionRequired: false,
        toolRequired: "Liner Top Protection Guide Band"
      },
      {
        stepNumber: 6,
        title: "Decouple Piston Rod and Mount Lifting Crossbar",
        greekTitle: "Αποσύνδεση Βάκτρου Εμβόλου & Τοποθέτηση Ζυγού Ανέλκυσης",
        narrative: "Descend into crosshead compartment of crankcase. Unscrew and remove piston rod locknuts from the crosshead pin assembly using small hydraulic jacks or manual torque keys. Fit and bolt the heavy structural lifting crossbar tool directly onto the piston crown thread points.",
        greekNarrative: "Κατεβείτε στο διαμέρισμα του σταυρού (crosshead cabinet). Ξεβιδώστε και αφαιρέστε τα παξιμάδια του βάκτρου από τον σταυρό με ειδικά εργαλεία. Τοποθετήστε και βιδώστε τον μεγάλο ζυγό ανέλκυσης απευθείας στα σημεία σπειρώματος της κεφαλής του εμβόλου.",
        safetyActionRequired: true,
        toolRequired: "Piston Lifting Crossbar & Eye Bolts"
      },
      {
        stepNumber: 7,
        title: "Slow-Hoist Piston Unit & Conduct Cylinder Wear Survey",
        greekTitle: "Αργή Ανέλκυση Εμβόλου & Μέτρηση Φθοράς Χιτωνίου",
        narrative: "Hook crane block to the piston lifting crossbar. Slowly hoist the piston out of the cylinder liner. Guide the piston rod carefully past the stuffing box seal housings. Once completely clear, secure piston on maintenance stand. Use inside micrometers at multiple heights and axes to survey cylinder wear.",
        greekNarrative: "Κρεμάστε τον γάντζο του γερανού στον ζυγό ανέλκυσης εμβόλου. Σηκώστε αργά το έμβολο έξω από το χιτώνιο. Οδηγήστε το βάκτρο προσεκτικά ώστε να περάσει χωρίς ζημιά από το stuffing box. Ασφαλίστε το έμβολο στη βάση συντήρησης. Χρησιμοποιήστε εσωτερικό μικρόμετρο σε διάφορα ύψη για μέτρηση της φθοράς.",
        safetyActionRequired: false,
        toolRequired: "Inside Micrometer (580-620mm)"
      }
    ]
  },
  {
    id: "sulzer-2s-overhaul",
    plateCode: "P-SUL-FI-02",
    machinery: "Wärtsilä Sulzer RT-flex Common Rail Fuel Injector & Actuator",
    greekMachinery: "Wärtsilä Sulzer RT-flex Κοινός Συλλέκτης Μπεκ & Ενεργοποιητής",
    makeModel: "Sulzer RT-flex60C / 50B common rail marine engines",
    torqueSpecs: [
      { label: "Fuel Rail Accumulator Cap Screws", value: "480 Nm", greekLabel: "Βίδες Καπακιού Συσσωρευτή Συλλέκτη Καυσίμου" },
      { label: "Injection Valve Holder Studs", value: "280 Nm", greekLabel: "Μπουζόνια Στήριξης Βαλβίδας Έγχυσης" },
      { label: "ICU Proportional Rail Solenoid Valve", value: "95 Nm", greekLabel: "Αναλογική Ηλεκτροβαλβίδα Μονάδας ICU" },
      { label: "Hydraulic Pump Drive Coupling Cover", value: "120 Nm", greekLabel: "Καπάκι Σύνδεσμου Αντλίας Υδραυλικού" }
    ],
    clearanceLimits: [
      { name: "ICU Control Valve Spool Clearance", standard: "0.012 mm", limit: "0.024 mm", unit: "mm", greekName: "Διάκενο Σύρτη Βαλβίδας Ελέγχου ICU" },
      { name: "Injector Needle Valve Guide Play", standard: "0.008 mm", limit: "0.018 mm", unit: "mm", greekName: "Τζόγος Οδηγού Βελόνας Μπεκ" },
      { name: "High Pressure Fuel Accumulator Nitrogren Precharge", standard: "120 bar", limit: "90 bar", unit: "bar", greekName: "Προφόρτιση Αζώτου Συσσωρευτών Υψηλής Πίεσης" }
    ],
    requiredTools: [
      { name: "Solenoid Coil Diagnostic Multimeter", greekName: "Πολύμετρο Διάγνωσης Πηνίων", iconIndex: 5 },
      { name: "HP Common Rail Bleeder Key Tool", greekName: "Κλειδί Εξαέρωσης HP Rail Καυσίμου", iconIndex: 6 },
      { name: "Injector Seat Reamer jig", greekName: "Φρεζοκεφαλή Καθαρισμού Έδρας Μπεκ", iconIndex: 7 },
      { name: "Tension Spring Puller Tool", greekName: "Εξολκέας Ελατηρίου Τάνυσης Μπεκ", iconIndex: 8 }
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Vent Servo System and Bleed HP Common Rail Pressure",
        greekTitle: "Εκτόνωση Συστήματος Servo και Εξαέρωση HP Common Rail",
        narrative: "DANGER: High risk of high velocity diesel penetration. Ensure all hydraulic servo pumps are turned OFF at the main switchboard and tagged. Use specialized common rail bleeder key tool to manually vent residual fuel rail energy. Monitor pressure indicators to verify system stands at exactly 0.0 bar before cracking flanges.",
        greekNarrative: "ΚΙΝΔΥΝΟΣ: Υψηλός κίνδυνος διείσδυσης ντίζελ στο δέρμα. Βεβαιωθείτε ότι οι αντλίες servo είναι OFF στον πίνακα και σημασμένες. Χρησιμοποιήστε το ειδικό εργαλείο-κλειδί εξαέρωσης για να εκτονώσετε χειροκίνητα την εναπομένουσα πίεση καυσίμου. Επιβεβαιώστε ότι η πίεση είναι 0.0 bar.",
        safetyActionRequired: true,
        toolRequired: "HP Common Rail Bleeder Key Tool"
      },
      {
        stepNumber: 2,
        title: "De-couple Electro-Hydraulic ICU Plugs & Cables",
        greekTitle: "Αποσύνδεση Φις & Καλωδίων Μονάδας ICU (Control Unit)",
        narrative: "Trace the 24V DC WECS-9520 system pilot cables heading to the ECU-box. Disconnect electrical multi-pins plugs slowly from proportional solenoid coils. Use Solenoid Coil Diagnostic Multimeter to test coil resistance across coil pins. Clean oil remnants from terminals with contact spray.",
        greekNarrative: "Εντοπίστε τα καλώδια πιλότους 24V DC του συστήματος WECS-9520 που καταλήγουν στο ECU-box. Αποσυνδέστε αργά τα ηλεκτρικά φις από τα πηνία των αναλογικών ηλεκτροβαλβίδων. Χρησιμοποιήστε το ψηφιακό πολύμετρο για να μετρήσετε την ωμική αντίσταση των πηνίων.",
        safetyActionRequired: false,
        toolRequired: "Solenoid Coil Diagnostic Multimeter"
      },
      {
        stepNumber: 3,
        title: "Extract Fuel Injector Valve Holder Studs",
        greekTitle: "Εξαγωγή Βαλβίδας Έγχυσης και Μπουζονιών Στήριξης",
        narrative: "Dismantle high pressure double-shield fuel lines linking ICU block to cylinder holder sleeves. Loosen fuel injector holder studs evenly in a diagonal sequence using direct offset keys. Rig mechanical extractor yoke and hoist active injector valve upward out of cylinder cover lid.",
        greekNarrative: "Λύστε τους σωλήνες καυσίμου διπλού τοιχώματος υψηλής πίεσης που συνδέουν το μπλοκ ICU με τα χιτώνια των μπεκ. Λασκάρετε τα μπουζόνια ομοιόμορφα χιαστί. Τοποθετήστε τον μηχανικό εξολκέα μπεκ και τραβήξτε την βαλβίδα έγχυσης (μπεκ) έξω από το καπάκι του κυλίνδρου.",
        safetyActionRequired: false,
        toolRequired: "Offset Ring Spanners"
      },
      {
        stepNumber: 4,
        title: "Clean Injector Port & Ream Metallic Seat Rings",
        greekTitle: "Καθαρισμός Θυρίδας Μπεκ & Φρεζάρισμα Μεταλλικής Έδρας",
        narrative: "Scrape carbon accumulations inside injection recess port in cylinder lid body. Blow out debris with air gun. Inspect copper profile seat ring. Insert the dedicated Injector Seat Reamer guide jig vertically, apply light axial pressure, and turn clockwise by hand to scrape away score lines or pits for optimal seat sealing.",
        greekNarrative: "Ξύστε τις ανθρακούχες επικαθίσεις μέσα στη θυρίδα του μπεκ στο καπάκι του κυλίνδρου. Φυσήξτε τα υπολείμματα με αέρα. Επιθεωρήστε τον χάλκινο δακτύλιο έδρασης. Εισάγετε τη φρεζοκεφαλή έδρας μπεκ κάθετα, εφαρμόστε ελαφρά πίεση και περιστρέψτε δεξιόστροφα με το χέρι για τέλεια στεγανοποίηση.",
        safetyActionRequired: false,
        toolRequired: "Injector Seat Reamer jig"
      },
      {
        stepNumber: 5,
        title: "Test Atomizing Needle Sealing and Opening Pressure",
        greekTitle: "Δοκιμή Στεγανότητας Βελόνας Μπεκ & Πίεσης Ψεκασμού",
        narrative: "Pop-test the rebuilt injector on workshop test bench. Confirm high pressure jet spray atomizes correctly, verify clean instant needle shut-off with no soot dripping. Crack pressure must match exactly 320 bar standard.",
        greekNarrative: "Δοκιμάστε το ανακατασκευασμένο μπεκ στο δοκιμαστήριο του μηχανοστασίου. Επιβεβαιώστε ότι η δέσμη ψεκασμού ψεκάζεται σωστά και ότι η βελόνα κλείνει ακαριαία χωρίς στάξιμο. Η πίεση ανοίγματος πρέπει να είναι ακριβώς 320 bar.",
        safetyActionRequired: true,
        toolRequired: "Workshop Injector Test Pump"
      }
    ]
  },
  {
    id: "yanmar-4s-overhaul",
    plateCode: "P-YAN-PSTN-03",
    machinery: "Yanmar 4-Stroke Auxiliary Generator Piston & Liner Pulling",
    greekMachinery: "Yanmar Τετράχρονη Βοηθητική Γεννήτρια - Ανέλκυση Εμβόλου & Χιτωνίου",
    makeModel: "Yanmar 6EY26L Auxiliary Engine Generator Set (720 RPM / 60Hz)",
    torqueSpecs: [
      { label: "Cylinder Head Main Bolts Torque", value: "650 Nm", greekLabel: "Κύριες Βίδες Κυλινδροκεφαλής" },
      { label: "Connecting Rod Big-End Bolts Torque", value: "480 Nm + 120°", greekLabel: "Βίδες Μεγάλου Άκρου Διωστήρα (Μπιέλας)" },
      { label: "Main Bearing Cap Screws", value: "520 Nm", greekLabel: "Βίδες Καπακιών Κυρίων Εδράνων" },
      { label: "Fuel Nozzle Sleeve Ring Torque", value: "110 Nm", greekLabel: "Δακτύλιος Χιτωνίου Μπεκ Καυσίμου" }
    ],
    clearanceLimits: [
      { name: "Cylinder Head Air Intake Valve Guide Clearance", standard: "0.06 mm", limit: "0.15 mm", unit: "mm", greekName: "Διάκενο Οδηγού Βαλβίδας Εισαγωγής Αέρα" },
      { name: "Connecting Rod Crankpin Journal Pin Diameter", standard: "190.00 mm", limit: "189.85 mm", unit: "mm", greekName: "Διάμετρος Κομβίου Στροφάλου (Μπιέλας)" },
      { name: "Lube Oil Pump Gear Tooth Backlash", standard: "0.12 mm", limit: "0.35 mm", unit: "mm", greekName: "Τζόγος Οδοντοτροχού Αντλίας Λαδιού" },
      { name: "Cylinder Liner Internal Diameter Max Wear", standard: "260.00 mm", limit: "261.20 mm", unit: "mm", greekName: "Μέγιστη Φθορά Εσωτερικής Διαμέτρου Χιτωνίου" }
    ],
    requiredTools: [
      { name: "Mechanical Eye Bolt lifting tool M24", greekName: "Μηχανικό Μπουζόνι Ανέλκυσης M24", iconIndex: 9 },
      { name: "Cylinder Liner Honing Brush Device", greekName: "Συσκευή Honing / Λειαντήρας Χιτωνίων", iconIndex: 10 },
      { name: "Piston Ring Expansion Plier Set", greekName: "Σετ Πενσών Διαστολής Ελατηρίων Εμβόλου", iconIndex: 11 },
      { name: "Crankcase Big-End Pin Defect Dial gauge", greekName: "Μικρόμετρο Ωρολογιακό για Κομβία Μπιελάς", iconIndex: 12 }
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Drain Cooling Water Grid & Fuel Oil Manifolds",
        greekTitle: "Αποστράγγιση Δικτύου Νερού Ψύξης & Σωλήνων Καυσίμου",
        narrative: "Isolate cooling lines inlet/outlet from central loop fresh water headers. Turn off generator panel heater current. Open engine drain cocks below cylinder liner block, purging all water into engine room recovery sump. Crack open high pressure fuel manifolds and isolate delivery taps.",
        greekNarrative: "Απομονώστε τις γραμμές ψύξης εισόδου/εξόδου. Απενεργοποιήστε τις αντιστάσεις προθέρμανσης της γεννήτριας. Ανοίξτε τα κρουνάκια αποστράγγισης κάτω από το μπλοκ του χιτωνίου, αδειάζοντας όλο το νερό στη δεξαμενή συλλογής. Λύστε τους σωλήνες καυσίμου υψηλής πίεσης.",
        safetyActionRequired: true,
        toolRequired: "Drain Valves & Core Key"
      },
      {
        stepNumber: 2,
        title: "Remove Rocker Arm and Cylinder Cover Head Layout",
        greekTitle: "Αφαίρεση Ζυγών Βαλβίδων & Κεφαλής Κυλίνδρου (Καπακιού)",
        narrative: "Remove sheet metal cylinder head covers. Loosen locknuts on rocker arms, retract valve guide pushrods. Unfasten high pressure injector sleeve connector. Attach heavy mechanical socket torque multipliers, loosed head bolts in spiral order. Hoist the cylinder cover assembly out.",
        greekNarrative: "Αφαιρέστε τα καπάκια των κυλινδροκεφαλών. Λασκάρετε τα παξιμάδια στους ζυγούς των βαλβίδων και αφαιρέστε τις ράβδους ώσης (pushrods). Αποσυνδέστε το μπεκ. Λύστε τα μπουζόνια της κεφαλής κυκλικά και ανασηκώστε την κυλινδροκεφαλή.",
        safetyActionRequired: false,
        toolRequired: "Rocker Arm Socket Multiplier Tool"
      },
      {
        stepNumber: 3,
        title: "Unfasten Connecting Rod Big-End Bearing Cap",
        greekTitle: "Λύσιμο Καπακιού Εδράνου Βάσεως Μπιέλας (Κάρτερ)",
        narrative: "Open crankcase access doors adjacent to cylinder line. Turn engine flywheel manually until selected cylinder piston reaches TDC position. Loosen connecting rod big-end bearing shell nut pairs using heavy impact pneumatic drivers. Extract lower shell bearing cup and store safely.",
        greekNarrative: "Ανοίξτε τις θύρες πρόσβασης κάρτερ του αντίστοιχου κυλίνδρου. Στρέψτε το βολάν χειροκίνητα μέχρι το έμβολο να φτάσει στο Άνω Νεκρό Σημείο (ΑΝΣ). Λασκάρετε τα παξιμάδια του καπακιού του εδράνου μπιέλας με αερόκλειδο. Αφαιρέστε το κάτω κουζινέτο εδράνου.",
        safetyActionRequired: true,
        toolRequired: "Pneumatic Impact Wrench & Sockets"
      },
      {
        stepNumber: 4,
        title: "Tap and Push Piston Rod out of Cylinder Liner",
        greekTitle: "Ώθηση & Εξαγωγή Εμβόλου από το Χιτώνιο Κυλίνδρου",
        narrative: "Clean hard carbon varnish ridge from the top of the liner bore. Rotate crankshaft slow so piston moves upward. Push up connecting rod shaft from the crankcase using solid dry wooden block guides. Once top rings emerge, fit lifting sling loops around piston crown, and hoist the unit safely.",
        greekNarrative: "Καθαρίστε το σκληρό στρώμα άνθρακα στο επάνω μέρος του χιτωνίου. Στρέψτε τον στρόφαλο αργά ώστε το έμβολο να μετακινηθεί προς τα πάνω. Σπρώξτε τη μπιέλα από το κάρτερ χρησιμοποιώντας έναν γερό ξύλινο τάκο. Μόλις βγουν τα ελατήρια, περάστε ιμάντα και σηκώστε το έμβολο.",
        safetyActionRequired: false,
        toolRequired: "Lifting Yokes & Sling Straps"
      }
    ]
  },
  {
    id: "alfa-purifier-overhaul",
    plateCode: "P-ALF-BOWL-04",
    machinery: "Alfa Laval S-Purifier Bowl Overhaul & Cleaning",
    greekMachinery: "Διαχωριστής Alfa Laval S-Purifier - Καθαρισμός & Επισκευή Τυμπάνου",
    makeModel: "Alfa Laval S-type centrifugal separators - S811 / S831 series",
    torqueSpecs: [
      { label: "Main Bowl Locking Ring Torque", value: "380 Nm + Solid Drift blow", greekLabel: "Δακτύλιος Ασφάλισης Κυρίως Τυμπάνου (Bowl Lock Ring)" },
      { label: "Separator Hood Clamping Bolts", value: "85 Nm", greekLabel: "Βίδες Σύσφιξης Καλύμματος Διαχωριστήρα (Καπάκι)" },
      { label: "Pilot Valve Assembly body plugs", value: "45 Nm", greekLabel: "Τάπες Πιλοτικών Βαλβίδων Λειτουργίας" }
    ],
    clearanceLimits: [
      { name: "Centrifugal Bowl Disc Stack Spatial Gap", standard: "0.60 mm", limit: "0.95 mm", unit: "mm", greekName: "Διάκενο Μεταξύ Δίσκων Τυμπάνου (Disc Stack)" },
      { name: "Bowl Spindle Axial Radial Runout Max Limit", standard: "0.03 mm", limit: "0.08 mm", unit: "mm", greekName: "Μέγιστη Αξονική Απόκλιση (Runout) Ατράκτου" },
      { name: "Operating Hydraulic Water Inlet Pressure", standard: "2.2 bar", limit: "1.8 bar", unit: "bar", greekName: "Πίεση Εισόδου Νερού Λειτουργίας (Operating Water)" }
    ],
    requiredTools: [
      { name: "Alfa Laval Bowl Lock ring Drift Hammer Tool", greekName: "Ειδικός Πείρος & Σφυρί Λυσίματος Bowl Lock Ring", iconIndex: 13 },
      { name: "Mechanical Bowl Lifter Hook jig", greekName: "Γάντζος/Ζυγός Ανύψωσης Τυμπάνου", iconIndex: 14 },
      { name: "Piston Slide Ring Spanner block", greekName: "Κλειδί Συναρμολόγησης Συρόμενου Δακτυλίου", iconIndex: 15 },
      { name: "Brass Scraper Core unit", greekName: "Ορειχάλκινη Ξύστρα Καθαρισμού Λάσπης", iconIndex: 16 }
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Engage Friction Brake and Ensure Standstill",
        greekTitle: "Εμπλοκή Μηχανικού Φρένου και Επιβεβαίωση Ακινησίας",
        narrative: "Shut off dirty oil feeding valves and electric line heaters. Wait for rotation speed monitor to show zero RPM. Engage the physical manual mechanical friction brake shaft. Visually observe spindle safety indicator pin. WARNING: High kinetic energy bowl rotates up to 9200 RPM - never crack casing until complete standstill.",
        greekNarrative: "Κλείστε τις βαλβίδες παροχής πετρελαίου και τις ηλεκτρικές αντιστάσεις. Περιμένετε ο αισθητήρας στροφών να δείξει μηδέν RPM. Εμπλέξτε το χειροκίνητο μηχανικό φρένο. Παρατηρήστε τον πείρο ασφαλείας. ΠΡΟΣΟΧΗ: Το τύμπανο περιστρέφεται στις 9200 RPM, μην λύνετε ποτέ το κάλυμμα πρόωρα.",
        safetyActionRequired: true,
        toolRequired: "Manual Friction Brake"
      },
      {
        stepNumber: 2,
        title: "Swing Open Separator Casing Clamps and Hood",
        greekTitle: "Άνοιγμα Σφιγκτήρων & Αναδίπλωση Κελύφους (Καπακιού)",
        narrative: "Undo heavy tension casing clamps around the separator body. Swing back active separation hood housing frame slowly. Lift splash protective plates. Unscrew water feeding piping unions and the level monitoring float brackets.",
        greekNarrative: "Λύστε τους σφιγκτήρες πίεσης περιφερειακά του σώματος. Αναδιπλώστε το άνω κάλυμμα (hood) του διαχωριστήρα αργά. Αφαιρέστε τα ελαστικά προστατευτικά. Ξεβιδώστε τις σωληνώσεις παροχής νερού λειτουργίας και τις βάσεις πλωτήρων.",
        safetyActionRequired: false,
        toolRequired: "Casing Span Socket"
      },
      {
        stepNumber: 3,
        title: "Unfasten and Back-Off Major Bowl Locking Ring",
        greekTitle: "Λύσιμο & Απομάκρυνση Μεγάλου Δακτυλίου Ασφάλισης Τυμπάνου",
        narrative: "Mount high durability structural bowl lock compression jig. Lubricate threads with anti-seize. Mount the heavy bronze drift on the lock ring notch, strike drift forcefully with copper sledgehammer to turn ring counter-clockwise (Left Hand Thread precaution). Remove lock-ring and hook lift yoke.",
        greekNarrative: "Τοποθετήστε τον ειδικό σφιγκτήρα συμπίεσης του τυμπάνου. Λιπάνετε τα σπειρώματα. Τοποθετήστε τον ορειχάλκινο πείρο (drift) στην εγκοπή του δακτυλίου ασφάλισης (lock ring) και χτυπήστε με χάλκινη ματσόλα αριστερόστροφα (Προσοχή: Αριστερό σπείρωμα). Αφαιρέστε τον δακτύλιο.",
        safetyActionRequired: true,
        toolRequired: "Alfa Laval Bowl Lock ring Drift Hammer Tool"
      },
      {
        stepNumber: 4,
        title: "Pull Separating Disc Stack and Clean of Sludge",
        greekTitle: "Ανέλκυση Δίσκων (Disc Stack) & Καθαρισμός Λάσπης",
        narrative: "Screw on mechanical bowl lifter hook tool onto the distributor core. Hoist bowl disc stack block out of active cavity. Place stack in kerosene cleaning tub. Use bronze scrapers to peel heavy mud sludge off individual stainless steel cone plates. Ensure individual flow distribution holes stand pristine.",
        greekNarrative: "Βιδώστε τον ειδικό γάντζο ανύψωσης τυμπάνου στον κεντρικό διανομέα (distributor). Σηκώστε το μπλοκ των δίσκων (disc stack) έξω. Τοποθετήστε το σε λεκάνη με φωτιστικό πετρέλαιο. Χρησιμοποιήστε ορειχάλκινη ξύστρα για να αφαιρέσετε τη λάσπη από τους δίσκους.",
        safetyActionRequired: false,
        toolRequired: "Mechanical Bowl Lifter Hook jig & Brass Scraper"
      }
    ]
  },
  {
    id: "boiler-burner-overhaul",
    plateCode: "P-BOI-BURN-05",
    machinery: "Auxiliary Boiler Burner & Electrodes Overhaul",
    greekMachinery: "Καυστήρας Βοηθητικού Λέβητα - Συντήρηση & Καθαρισμός",
    makeModel: "Aalborg Mission OL Boiler Burner Assembly",
    torqueSpecs: [
      { label: "Fuel Nozzle Connection fitting", value: "85 Nm", greekLabel: "Σύνδεσμος Ακροφυσίου Καυσίμου" },
      { label: "Electrode Clamp Fixing Screw", value: "12 Nm", greekLabel: "Βίδα Σύσφιξης Ηλεκτροδίου" },
      { label: "Ignition Transformer Terminal Studs", value: "8 Nm", greekLabel: "Μπουζόνια Μετασχηματιστή Ανάφλεξης" }
    ],
    clearanceLimits: [
      { name: "Ignition Electrode Spark Gap", standard: "3.00 mm", limit: "4.50 mm", unit: "mm", greekName: "Διάκενο Σπινθήρα Ηλεκτροδίων Ανάφλεξης" },
      { name: "Photocell Lens Distance to Nozzle Plane", standard: "150.00 mm", limit: "165.00 mm", unit: "mm", greekName: "Απόσταση Φωτοκυττάρου από το Επίπεδο Μπεκ" },
      { name: "Secondary Air Damper Backlash Play", standard: "0.20 mm", limit: "0.50 mm", unit: "mm", greekName: "Τζόγος Κλαπέτου Δευτερεύοντος Αέρα" }
    ],
    requiredTools: [
      { name: "Spark Gap Vernier Caliper", greekName: "Παχύμετρο Διάκενου Ηλεκτροδίων", iconIndex: 17 },
      { name: "High-Voltage Electrode Alignment Jig", greekName: "Οδηγός Ευθυγράμμισης Ηλεκτροδίων HV", iconIndex: 18 },
      { name: "Nozzle Seat Extraction Tool", greekName: "Εξολκέας Έδρας Ακροφυσίου", iconIndex: 19 }
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Isolate Electrical Inputs & Close Fuel Inlet Valves (LOTO)",
        greekTitle: "Ηλεκτρική Απομόνωση & Κλείσιμο Βαλβίδων Καυσίμου (LOTO)",
        narrative: "De-energize the 440V burner control panel at main switchboard. Shut the primary and secondary fuel inlet line booster valves. Secure padlock on handwheel and perform lockout tag-out. Blow-through fuel line to ensure zero hydrostatic pressure at nozzle head.",
        greekNarrative: "Απενεργοποιήστε τον πίνακα ελέγχου 440V του καυστήρα στον κύριο πίνακα. Κλείστε τις βαλβίδες καυσίμου της γραμμής τροφοδοσίας, ασφαλίστε με λουκέτο (LOTO) και κάντε εξαέρωση για μηδενισμό της πίεσης.",
        safetyActionRequired: true,
        toolRequired: "Nozzle Seat Extraction Tool"
      },
      {
        stepNumber: 2,
        title: "Swing Open Burner Door and Clean Soot Accumulations",
        greekTitle: "Άνοιγμα Θύρας Καυστήρα & Καθαρισμός Αιθάλης",
        narrative: "Remove hinge pin brackets locking the heavy furnace door. Swing door open carefully. Inspect refractory nozzle cone for thermal damage. Vacuum clean the soot, carbon scaling, and ash residues from the secondary air damper blades.",
        greekNarrative: "Αφαιρέστε τους πείρους και ανοίξτε τη θύρα του φούρνου. Επιθεωρήστε τον πυρίμαχο κώνο για ρωγμές. Καθαρίστε την αιθάλη (κάπνα) και τα κατάλοιπα από τα πτερύγια δευτερεύοντος αέρα με ηλεκτρική σκούπα.",
        safetyActionRequired: false,
        toolRequired: "Wrench Set"
      },
      {
        stepNumber: 3,
        title: "Extract Nozzle Assembly & Replace Nozzle Tips",
        greekTitle: "Εξαγωγή Ακροφυσίου & Αντικατάσταση Μπεκ",
        narrative: "Uncouple fuel oil pipe union on the lance back. Slide burner lance system out. Unscrew worn burner nozzle tip using specialized nozzle seat extractor tool. Wash burner tip screen filter in clean fuel oil. Fit replacement nozzle tips and tighten to exact maker torque profile.",
        greekNarrative: "Λύστε τον σύνδεσμο παροχής πετρελαίου στη λόγχη του καυστήρα και τραβήξτε τη λόγχη έξω. Ξεβιδώστε το μπεκ με το ειδικό κλειδί. Καθαρίστε τα φίλτρα και βιδώστε το νέο μπεκ με τη σωστή ροπή σύσφιξης.",
        safetyActionRequired: false,
        toolRequired: "Nozzle Seat Extraction Tool"
      },
      {
        stepNumber: 4,
        title: "Align Ignition Electrodes & Calibrate Spark Gap",
        greekTitle: "Ευθυγράμμιση Ηλεκτροδίων & Ρύθμιση Διάκενου",
        narrative: "Clean white ceramic electrode insulation casings of carbon film. Install high-voltage electrode alignment jig to seat tips. Use precision Spark Gap Vernier Caliper to gauge and correct the gap distance to exactly 3.0mm. Fix the electrode screws firmly to avoid misalignment from vibrations.",
        greekNarrative: "Καθαρίστε τα πορσελάνινα ηλεκτρόδια από κατάλοιπα άνθρακα. Τοποθετήστε τον οδηγό ευθυγράμμισης. Ρυθμίστε το διάκενο σπινθήρα στα 3.0mm ακριβώς με το ειδικό παχύμετρο (vernier caliper) και σφίξτε τις βίδες.",
        safetyActionRequired: false,
        toolRequired: "Spark Gap Vernier Caliper"
      }
    ]
  },
  {
    id: "ows-coalescer-overhaul",
    plateCode: "P-OWS-COAL-06",
    machinery: "Oily Water Separator Coalescer Pack Replacement",
    greekMachinery: "Διαχωριστής Πετρελαιοειδών Υδάτων (OWS) - Αντικατάσταση Φίλτρων",
    makeModel: "Jowa 3SEP / Deckma Bilge Water Separator Unit",
    torqueSpecs: [
      { label: "Main Cover Dome Nuts torque", value: "110 Nm", greekLabel: "Παξιμάδια Άνω Καπακιού Θαλάμου (Dome)" },
      { label: "Internal Filter Holding Clamp", value: "25 Nm", greekLabel: "Σφιγκτήρας Συγκράτησης Εσωτερικών Φίλτρων" }
    ],
    clearanceLimits: [
      { name: "Coalescer Differential Operating Pressure", standard: "0.20 bar", limit: "0.80 bar", unit: "bar", greekName: "Διαφορική Πίεση Λειτουργίας Coalescer" },
      { name: "15ppm Bilge Alarm Optical Transmittance Index", standard: "100 %", limit: "50 %", unit: "%", greekName: "Δείκτης Οπτικής Διαπερατότητας 15ppm Alarm" }
    ],
    requiredTools: [
      { name: "Duplex Pressure Gauge Calibrator", greekName: "Βαθμονομητής Διπλού Μανόμετρου", iconIndex: 20 },
      { name: "Filter Extraction Spindle", greekName: "Άτρακτος Εξαγωγής Στοιχείων Φίλτρου", iconIndex: 21 },
      { name: "15ppm Tube Cleaner Kit", greekName: "Σετ Καθαρισμού Οπτικού Σωλήνα 15ppm", iconIndex: 22 }
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Block Bilge Intake & Complete Safety Electrical LOTO",
        greekTitle: "Απομόνωση Εισαγωγής Σεντινών & Ηλεκτρικό LOTO",
        narrative: "Close dirty bilge water manifold valves and Lock-Out power at main control box. Switch on water recycle flush solenoid to purge separators of corrosive, toxic gases. Check gas concentration and vent chamber completely prior to unbolting any access covers.",
        greekNarrative: "Κλείστε τις βαλβίδες των σεντινών και απομονώστε την ηλεκτρική τροφοδοσία (LOTO). Ανοίξτε τη βάνα πλύσης με καθαρό νερό για να διώξετε τυχόν τοξικά αέρια. Επιβεβαιώστε ότι η πίεση του θαλάμου είναι μηδενική.",
        safetyActionRequired: true,
        toolRequired: "Filter Extraction Spindle"
      },
      {
        stepNumber: 2,
        title: "Dismantle Main Chamber Dome Cover Dome Plate",
        greekTitle: "Λύσιμο Άνω Καπακιού Κυρίως Διαμερίσματος OWS",
        narrative: "Unscrew heavy dome retaining nuts along the top plate perimeter using regular hand tools. Lift the heavy steel dome lid with local blocks and chains. Inspect internal separator elements for heavy oily sludge clogging.",
        greekNarrative: "Λασκάρετε τα παξιμάδια του άνω καλύμματος (dome plate) με γερμανοπολύγωνα κλειδιά. Σηκώστε το βαρύ χαλύβδινο καπάκι. Επιθεωρήστε το εσωτερικό για φραγές από λάσπη πετρελαίου.",
        safetyActionRequired: false,
        toolRequired: "Wrench Set"
      },
      {
        stepNumber: 3,
        title: "Extract Coalescer Elements with Extraction Spindle",
        greekTitle: "Εξαγωγή Φίλτρων Coalescer με την Άτρακτο Εξαγωγής",
        narrative: "Unbolt internal holding clamp. Screw on the custom Filter Extraction Spindle onto the dirty coalescer media center guide shaft. Hoist the saturated fibrous coalescer element up. Drain excessive oil slurry into sludge bucket and wash the chamber internal steel core.",
        greekNarrative: "Λύστε τον εσωτερικό σφιγκτήρα. Βιδώστε την άτρακτο εξαγωγής στον κεντρικό οδηγό του φίλτρου. Τραβήξτε το κορεσμένο φίλτρο coalescer έξω. Αποστραγγίστε τα πετρελαιοειδή κατάλοιπα σε κουβά.",
        safetyActionRequired: false,
        toolRequired: "Filter Extraction Spindle"
      },
      {
        stepNumber: 4,
        title: "Fit Replacement Coalescer Pack & Clean 15ppm Sensor",
        greekTitle: "Τοποθέτηση Νέου Coalescer & Καθαρισμός Αισθητήρα 15ppm",
        narrative: "Unwrap the new pristine fibrous coalescer pack. Grease the top and bottom rubber gaskets with clean light lube oil. Insert filter elements vertically and lock holding clamp. Clean the 15ppm bilge alarm optical core tube using dedicated wire tube cleaners to avoid early alarm trips.",
        greekNarrative: "Τοποθετήστε το νέο φίλτρο coalescer. Γράσαρετε τα ελαστικά παρεμβύσματα. Ασφαλίστε τον εσωτερικό σφιγκτήρα συγκράτησης. Καθαρίστε τον οπτικό σωλήνα του 15ppm bilge alarm με το ειδικό σετ καθαρισμού.",
        safetyActionRequired: false,
        toolRequired: "15ppm Tube Cleaner Kit"
      }
    ]
  }
];

export default function StepByStepOverhauls({ language = "EN" }: { language?: "EN" | "GR" }) {
  const [selectedManualId, setSelectedManualId] = useState<string>("man-2s-overhaul");
  const [userLinerInput, setUserLinerInput] = useState<string>("");
  const [userRingInput, setUserRingInput] = useState<string>("");
  
  // Track step check status
  const [checkedSteps, setCheckedSteps] = useState<Record<string, Record<number, boolean>>>({});
  // Track tool bag inventory selection
  const [equippedTools, setEquippedTools] = useState<Record<string, Record<string, boolean>>>({});

  // Safety Lock-out Tag-out (LOTO) states for each machinery module plate
  const [isolatedComponents, setIsolatedComponents] = useState<Record<string, boolean>>({
    "P-MAN-CYL-01": false,
    "P-SUL-FI-02": false,
    "P-YAN-PSTN-03": false,
    "P-ALF-BOWL-04": false,
    "P-BOI-BURN-05": false,
    "P-OWS-COAL-06": false,
  });

  const [lotoViolationError, setLotoViolationError] = useState<string | null>(null);

  const activeManual = overhaulManualsData.find(m => m.id === selectedManualId) || overhaulManualsData[0];
  const isGr = language === "GR";

  const toggleStep = (manualId: string, stepNo: number) => {
    const manual = overhaulManualsData.find(m => m.id === manualId);
    if (manual) {
      const isIsolated = isolatedComponents[manual.plateCode];
      if (!isIsolated) {
        setLotoViolationError(
          isGr 
            ? `ΠΑΡΑΒΙΑΣΗ ΑΣΦΑΛΕΙΑΣ (SecurityException): Το στοιχείο [${manual.plateCode}] ΔΕΝ ΕΧΕΙ ΑΠΟΜΟΝΩΘΕΙ! Εγκαταστήστε LOTO (Lockout/Tagout) πριν ξεκινήσετε την επισκευή!`
            : `SAFETY INTERLOCK VIOLATION (SecurityException): Component [${manual.plateCode}] is NOT isolated! Ensure LOTO is fully applied before performing this step!`
        );
        setTimeout(() => setLotoViolationError(null), 5500);
        return;
      }
    }

    setCheckedSteps(prev => {
      const currentManual = prev[manualId] || {};
      const updatedManual = { ...currentManual, [stepNo]: !currentManual[stepNo] };
      return { ...prev, [manualId]: updatedManual };
    });
  };

  const toggleTool = (manualId: string, toolName: string) => {
    setEquippedTools(prev => {
      const currentManual = prev[manualId] || {};
      const updatedManual = { ...currentManual, [toolName]: !currentManual[toolName] };
      return { ...prev, [manualId]: updatedManual };
    });
  };

  const activeManualCheckedSteps = checkedSteps[activeManual.id] || {};
  const activeManualEquippedTools = equippedTools[activeManual.id] || {};

  const totalStepsCount = activeManual.steps.length;
  const completedStepsCount = Object.values(activeManualCheckedSteps).filter(Boolean).length;
  const overhaulsPercent = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0;

  // Manual Liner limit checker state
  const getLinerStatus = () => {
    const parsed = parseFloat(userLinerInput);
    if (isNaN(parsed)) return null;
    
    // Limits
    const wearLimit = activeManual.id === "man-2s-overhaul" ? 604.80 : 261.20;
    const std = activeManual.id === "man-2s-overhaul" ? 600.00 : 260.00;

    if (parsed < std - 0.5) {
      return { 
        status: "Error", 
        color: "text-red-500 border-red-900/50 bg-red-950/20",
        message: isGr ? "Τιμή κάτω από την εργοστασιακή στάνταρ!" : "Value measured below factory standard standard size!" 
      };
    }
    if (parsed >= wearLimit) {
      return {
        status: "CRITICAL WEAR",
        color: "text-red-400 border-red-700/50 bg-red-950/40 animate-pulse font-black",
        message: isGr ? "ΥΠΕΡΒΑΣΗ ΟΡΙΟΥ ΦΘΟΡΑΣ! Απαιτείται αντικατάσταση χιτωνίου κυλίνδρου." : "WEAR EXCEEDED! Immediate cylinder liner replacement/honing recommended."
      };
    }
    if (parsed > std + 2.0) {
      return {
        status: "MODERATE WEAR",
        color: "text-amber-400 border-amber-800/40 bg-amber-950/30",
        message: isGr ? "Ενδιάμεση φθορά. Παρακολουθήστε τον ρυθμό λίπανσης." : "Moderate wear detected. Monitor cylinder lubrication feed rates."
      };
    }
    return {
      status: "OPTIMAL/SAFE",
      color: "text-[#22e4ac] border-emerald-900/40 bg-emerald-950/20",
      message: isGr ? "Εξαιρετική κατάσταση χιτωνίου κυλίνδρου." : "Optimal sizing. Liner inner core fits perfectly within safe design limits."
    };
  };

  const getRingStatus = () => {
    const parsed = parseFloat(userRingInput);
    if (isNaN(parsed)) return null;
    const limit = activeManual.id === "man-2s-overhaul" ? 0.75 : 0.15;
    if (parsed >= limit) {
      return {
        status: "EXCESSIVE PLAY",
        color: "text-red-400 bg-red-950/30 border-red-900/40 font-bold",
        message: isGr ? "Όριο διάκενου ξεπεράστηκε! Κίνδυνος blow-by καυσαερίων." : "Groove wear limit exceeded! High risk of hot blow-by of combustion gas."
      };
    }
    return {
      status: "SAFE GAP",
      color: "text-[#22e4ac] bg-emerald-950/20 border-emerald-900/40",
      message: isGr ? "Σωστό διάκενο ελατηρίων." : "Ring axial clearance stands within perfect marine class tolerances."
    };
  };

  const linerStatus = getLinerStatus();
  const ringStatus = getRingStatus();

  return (
    <div className="flex flex-col gap-6" id="overhauls-dashboard">
      
      {/* Shipboard Manual Title / Top Panel */}
      <div className="bg-[#0b1d33] border-2 border-sky-500/30 rounded-xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="overhaul-spec-header">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-gradient-to-br from-sky-450 to-[#113054] rounded flex items-center justify-center text-white font-black shadow-lg">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-white font-display uppercase tracking-tight flex items-center gap-2">
              {isGr ? "Manuals Επισκευών & Διαδικασίες Μεγάλων Overhauls" : "Shipboard Repair Manuals & Major Overhaul Procedures"}
            </h2>
            <p className="text-xs text-sky-400 font-semibold font-mono tracking-wider">
              {isGr ? "ΠΡΟΔΙΑΓΡΑΦΕΣ ΚΑΤΑΣΚΕΥΑΣΤΗ // ΔΙΑΔΡΑΣΤΙΚΟΙ ΟΔΗΓΟΙ ΣΥΜΜΟΡΦΩΣΗΣ STCW CODE CODE III/2" : "MAKER ENGINEERING BLUEPRINTS // DIRECT STCW CODE III/2 COMPLIANT STEP GUIDES"}
            </p>
          </div>
        </div>

        {/* Manual Select Tab Links styled like brass metal plates */}
        <div className="flex flex-wrap gap-2 bg-[#040c18] p-1.5 rounded-lg border border-slate-800">
          {overhaulManualsData.map(manual => (
            <button
              key={manual.id}
              onClick={() => {
                setSelectedManualId(manual.id);
                setUserLinerInput("");
                setUserRingInput("");
              }}
              className={`px-3 py-1.5 rounded text-[10.5px] uppercase font-bold tracking-wide transition-all cursor-pointer ${
                selectedManualId === manual.id
                  ? "bg-sky-500 text-white shadow-md font-black animate-none"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {manual.id === "man-2s-overhaul" ? (isGr ? "MAN Δίχρονη" : "MAN 2-Stroke") :
               manual.id === "sulzer-2s-overhaul" ? (isGr ? "Sulzer Ράγα" : "Sulzer Flex") : 
               manual.id === "yanmar-4s-overhaul" ? (isGr ? "Yanmar Η/Γ" : "Yanmar Gen") : 
               manual.id === "alfa-purifier-overhaul" ? (isGr ? "Alfa Laval" : "Alfa Purifier") :
               manual.id === "boiler-burner-overhaul" ? (isGr ? "Καυστήρας" : "Boiler Burner") :
               (isGr ? "Διαχωριστής" : "OWS Coalescer")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="overhaul-scaffold">
        
        {/* LEFT COLUMN: ACTIVE MAKER DATA SHEET: TORQUES, SIZES, TOOL SELECTION (SPAN 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="overhaul-left-pane">
          
          {/* Section 1: Official Blueprint Specifications */}
          <div className="bg-[#0c1a2e] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers className="w-5 h-5 text-sky-400" />
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase font-bold block">{isGr ? "ΜΟΝΤΕΛΟ ΜΗΧΑΝΗΣ" : "Vessel Engine Model"}</span>
                <h3 className="text-xs font-black text-slate-200 font-display uppercase tracking-wider">{activeManual.makeModel}</h3>
              </div>
            </div>

            {/* Torque Specifications Card */}
            <div>
              <h4 className="text-[10.5px] font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Gauge className="w-4 h-4 text-sky-400" />
                {isGr ? "Ροπές Σύσφιξης & Πιέσεις (Torque Specifications)" : "Torque & Hydraulic Pressure Specifications"}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {activeManual.torqueSpecs.map((spec, idx) => (
                  <div key={idx} className="bg-[#050e18] p-2.5 rounded border border-sky-500/10 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium font-sans">{isGr ? spec.greekLabel : spec.label}</span>
                    <span className="font-mono font-bold text-white bg-slate-900 border border-slate-700 py-0.5 px-2 rounded">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cylinder / Sump Wear Metric Guidelines */}
            <div>
              <h4 className="text-[10.5px] font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Compass className="w-4 h-4 text-sky-400 animate-pulse" />
                {isGr ? "Όρια Φθορών & Διαστάσεις (Clearance limits)" : "Operational Clearance Defect Thresholds"}
              </h4>
              <div className="bg-[#050e18] border border-slate-800 rounded-lg p-3 space-y-3">
                <div className="grid grid-cols-12 text-[10px] uppercase font-mono font-bold text-slate-500">
                  <span className="col-span-6">{isGr ? "Παράμετρος" : "Metric Dimension"}</span>
                  <span className="col-span-3 text-center">{isGr ? "Στάνταρ" : "Std Size"}</span>
                  <span className="col-span-3 text-right">{isGr ? "Όριο" : "Limit"}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {activeManual.clearanceLimits.map((limit, idx) => (
                    <div key={idx} className="grid grid-cols-12 text-xs border-t border-slate-900 pt-2 items-center">
                      <span className="col-span-6 text-slate-300 font-medium font-sans truncate">{isGr ? limit.greekName : limit.name}</span>
                      <span className="col-span-3 text-center font-mono text-slate-400">{limit.standard}</span>
                      <span className="col-span-3 text-right font-mono text-red-400 font-bold">{limit.limit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Tolerance Checker Simulator */}
          <div className="bg-[#0c1a2e] border-2 border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Cpu className="w-5 h-5 text-[#22e4ac]" />
              <div>
                <h4 className="text-xs font-black text-white font-display uppercase tracking-wider">{isGr ? "Δοκιμαστήριο Ορίων & Φθορών" : "Interactive Mechanical Clearance Tester"}</h4>
                <p className="text-[10px] text-slate-400 font-sans">{isGr ? "Καταχωρήστε πραγματικές μετρήσεις για έλεγχο ορίων." : "Verify caliper measurements against the maker's limits instantly"}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* Field 1: Liner Wear */}
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                  1. {activeManual.id === "man-2s-overhaul" 
                    ? (isGr ? "Εσωτερική Διάμετρος Χιτωνίου (mm) [standard: 600.00]" : "Cylinder Liner Bore Diameter (mm) [std: 600.00]")
                    : (isGr ? "Εσωτερική Διάμετρος Χιτωνίου (mm) [standard: 260.00]" : "Cylinder Liner Bore Diameter (mm) [std: 260.00]")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 601.25"
                    value={userLinerInput}
                    onChange={(e) => setUserLinerInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white font-mono font-semibold text-center focus:outline-none focus:border-cyan-400"
                  />
                  {userLinerInput && (
                    <button onClick={() => setUserLinerInput("")} className="px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-xs py-1">Clear</button>
                  )}
                </div>
                {linerStatus && (
                  <div className={`mt-2.5 p-2 rounded border text-xs leading-relaxed ${linerStatus.color}`}>
                    <div className="font-bold flex items-center gap-1.5 uppercase font-mono text-[10.5px]">
                      <span className="w-1.5 h-1.5 bg-current rounded-full" />
                      <span>{linerStatus.status}</span>
                    </div>
                    <p className="mt-0.5 font-medium">{linerStatus.message}</p>
                  </div>
                )}
              </div>

              {/* Field 2: Ring Play */}
              {activeManual.id !== "alfa-purifier-overhaul" && activeManual.id !== "sulzer-2s-overhaul" && (
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                    2. {activeManual.id === "man-2s-overhaul"
                      ? (isGr ? "Διάκενο Αυλάκωσης Ελατηρίου (mm) [std: 0.40]" : "Piston Ring Axial Groove Play (mm) [std: 0.40]")
                      : (isGr ? "Διάκενο Οδηγού Βαλβίδας (mm) [std: 0.06]" : "Air Valve Intake Guide Play (mm) [std: 0.06]")}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.001"
                      placeholder="e.g. 0.42"
                      value={userRingInput}
                      onChange={(e) => setUserRingInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white font-mono font-semibold text-center focus:outline-none focus:border-cyan-400"
                    />
                    {userRingInput && (
                      <button onClick={() => setUserRingInput("")} className="px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-xs py-1">Clear</button>
                    )}
                  </div>
                  {ringStatus && (
                    <div className={`mt-2.5 p-2 rounded border text-xs leading-relaxed ${ringStatus.color}`}>
                      <div className="font-bold flex items-center gap-1.5 uppercase font-mono text-[10.5px]">
                        <span className="w-1.5 h-1.5 bg-current rounded-full" />
                        <span>{ringStatus.status}</span>
                      </div>
                      <p className="mt-0.5 font-medium">{ringStatus.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: LOTO Safety & Isolation Interlock Unit */}
          <div className="bg-[#0b1425] border border-red-900/40 rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-red-900/30 pb-3">
              <ShieldCheck className="w-5 h-5 text-red-500 animate-pulse" />
              <div>
                <h4 className="text-xs font-black text-white font-display uppercase tracking-wider">
                  {isGr ? "Μονάδα Ασφάλισης LOTO (Lockout/Tagout)" : "LOTO Safety Isolation Panel"}
                </h4>
                <p className="text-[10px] text-slate-400 font-sans">
                  {isGr ? "Απομόνωση στοιχείου για ασφαλή εργασία STCW Code" : "Mandatory STCW machinery energy isolation control"}
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg border text-center transition-all ${
              isolatedComponents[activeManual.plateCode]
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                : "bg-red-950/20 border-red-500/30 text-red-400 animate-pulse"
            }`}>
              <div className="font-mono text-xs font-bold uppercase tracking-widest mb-1">
                {isGr ? "ΚΩΔΙΚΟΣ ΣΤΟΙΧΕΙΟΥ:" : "MODULE CODE:"} {activeManual.plateCode}
              </div>
              <div className="text-sm font-black font-mono tracking-wide uppercase mb-3">
                {isolatedComponents[activeManual.plateCode] 
                  ? (isGr ? "🔓 ΑΠΟΜΟΝΩΜΕΝΟ / ΑΣΦΑΛΕΣ" : "🔓 ISOLATED / SAFE LOTO") 
                  : (isGr ? "🔒 ΕΝΕΡΓΟ / ΜΗ ΑΣΦΑΛΕΣ" : "🔒 ENERGIZED / DANGER")}
              </div>

              <button
                onClick={() => {
                  setIsolatedComponents(prev => ({
                    ...prev,
                    [activeManual.plateCode]: !prev[activeManual.plateCode]
                  }));
                  setLotoViolationError(null);
                }}
                className={`w-full py-2 px-4 rounded text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isolatedComponents[activeManual.plateCode]
                    ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md"
                    : "bg-red-650 hover:bg-red-700 text-white shadow-lg shadow-red-950/50"
                }`}
              >
                {isolatedComponents[activeManual.plateCode] 
                  ? (isGr ? "ΕΠΑΝΑΦΟΡΑ ΣΕ ΛΕΙΤΟΥΡΓΙΑ" : "DE-ISOLATE MACHINERY") 
                  : (isGr ? "ΕΓΚΑΤΑΣΤΑΣΗ LOTO" : "APPLY LOTO LOCKOUT")}
              </button>
            </div>

            <div className="text-[10px] text-slate-400 font-sans leading-relaxed border-t border-slate-800 pt-3">
              <span className="font-bold text-slate-305 block mb-1">⚠️ LOTO Isolation Safety Rules:</span>
              {isGr ? "Όλες οι πηγές ενέργειας (υδραυλικές, ηλεκτρικές, πίεση καυσίμου) πρέπει να απομονωθούν και να ασφαλιστούν με λουκέτο πριν συμπληρωθεί οποιοδήποτε βήμα επισκευής." : "Standard marine security protocols state that electrical, hydraulic, and diesel injection inputs must be physically closed and padlocked before maintenance tasks can be ticked."}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE REPAIR CHECKLIST PORTLET (SPAN 7) */}
        <div className="lg:col-span-7 bg-[#0c1a2e] border-2 border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between" id="overhaul-right-pane">
          
          <div className="space-y-5">
            {/* Action Header block */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-white font-display uppercase tracking-tight flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  {isGr ? "Βήματα Συντήρησης & Ανακατασκευής" : "Step-by-Step Procedure Checklist"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  {isGr ? "Ολοκληρώστε τα βήματα με τη σειρά, εξοπλίζοντας τα απαραίτητα εργαλεία." : "Follow exact repair sequences. Equipping correct tools is required to proceed."}
                </p>
              </div>

              {/* Progress visual bar */}
              <div className="flex items-center gap-3 bg-slate-950 p-2 px-3 rounded border border-slate-850 w-full sm:w-auto text-right font-mono shrink-0">
                <div className="flex-1 sm:flex-initial">
                  <div className="flex justify-between text-[10px] font-bold text-sky-400 mb-1">
                    <span>{isGr ? "ΠΡΟΟΔΟΣ" : "STATUS"}</span>
                    <span>{overhaulsPercent}%</span>
                  </div>
                  <div className="w-32 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-sky-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${overhaulsPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* LOTO Interlock Violation Banner Alert */}
            {lotoViolationError && (
              <div className="bg-red-950/80 border-2 border-red-500 text-red-100 p-4 rounded-lg flex items-start gap-3 animate-bounce shadow-lg shadow-red-950/60 leading-relaxed font-sans">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <div className="font-extrabold text-[#fda4af] font-mono uppercase text-xs tracking-wider">
                    {isGr ? "ΠΡΟΣΟΧΗ: ΑΠΑΙΤΕΙΤΑΙ ΑΠΟΜΟΝΩΣΗ" : "CRITICAL: ISOLATION REQUIRED"}
                  </div>
                  <p className="text-xs font-semibold mt-1">{lotoViolationError}</p>
                </div>
              </div>
            )}

            {/* Toolbag Inventory check before tasks - clickable tool buttons */}
            <div className="bg-[#05101a] border border-slate-850 rounded-lg p-3.5">
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider block mb-2.5">
                ⚓ {isGr ? "ΕΡΓΑΛΕΙΟΘΗΚΗ ΜΗΧΑΝΙΚΟΥ - ΕΠΙΛΕΞΤΕ ΓΙΑ ΕΞΟΠΛΙΣΜΟ:" : "ENGINEER TOOLBAG INVENTORY - TAP TO EQUIP:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {activeManual.requiredTools.map((tool, idx) => {
                  const isEquipped = activeManualEquippedTools[tool.name];
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleTool(activeManual.id, tool.name)}
                      className={`text-slate-200 transition-all cursor-pointer font-bold border rounded-lg p-2.5 flex items-center gap-2 text-2xs uppercase shadow-sm ${
                        isEquipped
                          ? "bg-sky-500/10 border-sky-500 text-sky-400 ring-1 ring-sky-500"
                          : "bg-[#0b1424]/60 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                      }`}
                    >
                      <span>🛠️</span>
                      <span>{isGr ? tool.greekName : tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Overhauling Steps Container */}
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1" id="overhaul-steps-stack">
              {activeManual.steps.map((step) => {
                const isStepCompleted = activeManualCheckedSteps[step.stepNumber];
                const isRequiredToolEquipped = activeManualEquippedTools[step.toolRequired] || step.toolRequired === "Wrench Set" || step.toolRequired === "Offset Ring Spanners" || step.toolRequired === "Lifting Eye Bolts & Crane" || step.toolRequired === "Lifting Yokes & Sling Straps" || step.toolRequired === "Casing Span Socket" ? true : false;
                
                // Allow completion ONLY if required custom tools are equipped
                const isClickable = isRequiredToolEquipped;

                return (
                  <div 
                    key={step.stepNumber}
                    onClick={() => {
                      if (isClickable) {
                        toggleStep(activeManual.id, step.stepNumber);
                      }
                    }}
                    className={`border rounded-lg p-4 transition-all flex gap-3.5 relative select-none cursor-pointer ${
                      isStepCompleted
                        ? "bg-[#0a231c]/20 border-emerald-500/40 text-slate-100"
                        : isClickable 
                          ? "bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-sky-500/50 text-slate-350"
                          : "bg-slate-950/20 border-slate-900 opacity-60 text-slate-500 hover:bg-slate-950/40"
                    }`}
                  >
                    {/* Step Check Box Circle */}
                    <div className="mt-1 shrink-0">
                      {isStepCompleted ? (
                        <CheckCircle2 className="w-5.5 h-5.5 text-[#22e4ac]" />
                      ) : (
                        <div className={`w-5.5 h-5.5 rounded-full border-2 ${
                          isClickable 
                            ? "border-slate-700 group-hover:border-sky-500/80" 
                            : "border-slate-800"
                        }`} />
                      )}
                    </div>

                    {/* Step texts */}
                    <div className="flex-1 min-w-0 font-sans">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-tight text-white flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-sky-400">[{isGr ? "ΒΗΜΑ" : "STEP"} {step.stepNumber}]</span>
                          {isGr ? step.greekTitle : step.title}
                        </h4>
                        
                        {/* Warnings */}
                        {step.safetyActionRequired && (
                          <span className="text-[9px] font-mono bg-red-950 text-red-400 border border-red-800/20 rounded px-1.5 py-0.5 tracking-wider font-extrabold flex items-center gap-1 uppercase">
                            <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
                            CRITICAL Safety
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-350 leading-relaxed mt-2 text-justify">
                        {isGr ? step.greekNarrative : step.narrative}
                      </p>

                      {/* Tool Restriction Tag */}
                      <div className="mt-3.5 flex flex-wrap gap-2 items-center text-[10.5px] font-semibold">
                        <span className="text-slate-500 font-mono uppercase">{isGr ? "Απαραίτητο Εργαλείο:" : "Required Tool:"}</span>
                        <span className={`px-2 py-0.5 rounded font-mono border font-bold ${
                          isRequiredToolEquipped 
                            ? "bg-slate-900 text-slate-200 border-slate-750" 
                            : "bg-amber-950/80 text-amber-500 border-amber-800/40 animate-pulse"
                        }`}>
                          {step.toolRequired}
                        </span>
                        {!isRequiredToolEquipped && (
                          <span className="text-amber-500 font-mono text-[9px] font-medium uppercase animate-pulse">⇦ {isGr ? "ΕΞΟΠΛΙΣΤΕ ΓΙΑ ΕΝΕΡΓΟΠΟΙΗΣΗ ΒΗΜΑΤΟΣ" : "EQUIP THIS TOOL IN INVENTORY TO TICK COMPLETED"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset button inside checklist column footer */}
          <div className="mt-5 border-t border-slate-800 pt-4 flex justify-between items-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{isGr ? "VERIFICATION: STCW-95 COMPLIANCE ACTIVE" : "VERIFICATION: CERTIFIED STCW-95 OFFSHORE"}</span>
            <button
              onClick={() => {
                if (window.confirm(isGr ? "Επανεκκίνηση όλων των βημάτων;" : "Are you sure you want to completely clear and reset the overhauling checklist steps state?")) {
                  setCheckedSteps(prev => ({ ...prev, [activeManual.id]: {} }));
                }
              }}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded border border-slate-800 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>{isGr ? "ΕΠΑΝΕΚΚΙΝΗΣΗ" : "RESET PROCEDURES"}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
