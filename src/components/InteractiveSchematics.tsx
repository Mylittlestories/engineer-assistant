import React, { useState } from "react";
import { 
  Anchor, 
  Zap, 
  Activity, 
  Bot, 
  Settings, 
  Compass, 
  Layers, 
  Info, 
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { troubleshootingDatabase } from "../database";
import { TroubleshootingRecord } from "../types";
import { recordTranslations, uiTranslations } from "../translations";

// Types for hotspot nodes
interface SchematicHotspot {
  id: string;
  name: string;
  x: string; // precentage left
  y: string; // percentage top
  description: string;
  functions: string[];
  operationalMetrics: string;
  linkedComponents: string[]; // for matching database component names
}

interface EngineSchematic {
  id: string;
  title: string;
  code: string;
  type: "2-Stroke Propulsion" | "4-Stroke Generator" | "Auxiliary Machinery";
  systemDescription: string;
  colorTheme: string;
  hotspots: SchematicHotspot[];
}

interface InteractiveSchematicsProps {
  onSelectRecordForAi: (record: TroubleshootingRecord) => void;
  onOpenManual: (record: TroubleshootingRecord) => void;
  language?: "EN" | "GR";
}

// Schematics text translations helper
const schematicsTranslations: Record<"GR", Record<string, {
  title?: string;
  code?: string;
  systemDescription?: string;
  name?: string;
  description?: string;
  functions?: string[];
  operationalMetrics?: string;
}>> = {
  GR: {
    "man-2s": {
      title: "MAN B&W 6S60ME-C8.2 Κύρια Μηχανή Πρόωσης",
      code: "2-Χρονη Μηχανή Diesel Crosshead",
      systemDescription: "Δίχρονη κύρια μηχανή crosshead εξαιρετικά μεγάλου εμβολισμού με υδραυλικό έλεγχο (βαλβίδες FIVA) για τον χρονισμό εξαγωγής και τη λίπανση κυλίνδρων. Χωρίς οδοντωτροχούς στροφάλου.",
    },
    "man-exh-valve": {
      name: "Συγκρότημα Βαλβίδας Εξαγωγής",
      description: "Πνευματικός έλεγχος ανοίγματος της βαλβίδας εξαγωγής μέσω εντολών WECS με χρήση υδραυλικών παλμών λαδιού servo. Χρησιμοποιεί ελατήριο αέρα (air spring) για την επιτάχυνση του κλεισίματος.",
      functions: [
        "Θερμικός έλεγχος εξαγωγής καυσαερίων κυλίνδρου",
        "Πνευματικό ελατήριο αέρα στεγανοποίησης & επαναφοράς",
        "Στεγανοποίηση διαδρομής υδραυλικού εμβόλου ενεργοποίησης"
      ],
      operationalMetrics: "Κανονική θερμ: 340°C - 380°C. Όριο συναγερμού: >450°C. Πίεση λαδιού servo: 200 bar"
    },
    "man-scavenge": {
      name: "Χώρος Αέρα Σάρωσης & Υποδοχή",
      description: "Υπό πίεση θάλαμος που παρέχει φρέσκο αέρα σάρωσης μέσω των θυρίδων του σκελετού της μηχανής. Επιρρεπής σε πυρκαγιές αν υπάρχουν διαρροές ελατηρίων εμβόλου.",
      functions: [
        "Δεξαμενή παροχής αέρα καύσης",
        "Απομόνωση και στεγανοποίηση επιστροφής καυσαερίων",
        "Αποστράγγιση συμπυκνωμάτων νερού και υπολειμμάτων λαδιού"
      ],
      operationalMetrics: "Πίεση: 1.8 - 2.5 bar. Θερμοκρασία: 40°C - 50°C. Όριο κινδύνου φωτιάς: >80°C"
    },
    "man-crankcase": {
      name: "Στροφαλοθάλαμος & Κύρια Έδρανα",
      description: "Πλαίσιο που συγκρατεί τον στροφαλοφόρο άξονα, τα έδρανα και τους οδηγούς του crosshead. Παρακολουθείται συνεχώς από ανιχνευτή νέφους ελαίου (Oil Mist Detector).",
      functions: [
        "Μετάδοση δυναμικής ροπής στρέψης",
        "Λίπανση εδράνων και τριβέων ώσης",
        "Οπτική παρακολούθηση συγκέντρωσης νέφους ελαίου"
      ],
      operationalMetrics: "Όριο νέφους: <1.5% LEL. Μέγιστη θερμ. εδράνων: 75°C - 80°C"
    },
    "man-liner": {
      name: "Χιτώνιο Κυλίνδρου & Ελατήρια",
      description: "Χυτοσιδηρό χιτώνιο κυλίνδρου υψηλής αντοχής εξοπλισμένο με ακροφύσια λίπανσης (quills). Αντέχει ακραίες κατακόρυφες δυνάμεις.",
      functions: [
        "Θερμικός περιορισμός αερίων υψηλής πίεσης και θερμοκρασίας",
        "Οδηγός ολίσθησης ελατηρίων εμβόλου",
        "Εξουδετέρωση οξέων μέσω ψεκασμού κυλινδρέλαιου"
      ],
      operationalMetrics: "Ρυθμός λίπανσης: 0.7 - 1.2 g/kWh. Συναγερμός θερμοκρασίας: >115°C"
    },
    "sulzer-2s": {
      title: "Wärtsilä Sulzer RT-flex65C Common Rail",
      code: "2-Χρονη Μηχανή Electronic Common Rail",
      systemDescription: "Ηλεκτρονική μηχανή common-rail χωρίς παραδοσιακό εκκεντροφόρο, με εγχυτήρες καυσίμου υψηλής πίεσης και απευθείας ηλεκτροαναλογικούς σερβομηχανισμούς (WECS-9520).",
    },
    "sulzer-fuel-rail": {
      name: "HP Common Fuel Rail (Αυλός Καυσίμου)",
      description: "Σωλήνας συσσώρευσης καυσίμου υπό τεράστια πίεση. Τροφοδοτείται από παλινδρομικές αντλίες καυσίμου υψηλής πίεσης.",
      functions: [
        "Σταθεροποίηση πίεσης και όγκου καυσίμου καύσης",
        "Τροφοδοσία των τριπλών εγχυτήρων ανά κύλινδρο",
        "Εκτόνωση πίεσης συστήματος μέσω βαλβίδας ασφαλείας"
      ],
      operationalMetrics: "Πίεση λειτουργίας αυλού: 800 - 1050 bar. Όριο αισθητήρα διαρροής: 50 ml/min"
    },
    "sulzer-servo-pump": {
      name: "Υδραυλική Τροφοδοσία Λαδιού Servo",
      description: "Συγκρότημα αντλιών λαδιού που χρησιμοποιεί το λάδι της μηχανής για την ενεργοποίηση των βαλβίδων εξαγωγής και των εγχυτήρων.",
      functions: [
        "Παροχή υδραυλικής ισχύος ενεργοποίησης βαλβίδων",
        "Διπλό φιλτράρισμα ασφαλείας λαδιού servo",
        "Ρύθμιση πίεσης λαδιού servo μέσω πνευματικών βαλβίδων"
      ],
      operationalMetrics: "Πίεση συστήματος: 160 - 200 bar. Πλέγμα φίλτρου: 10 microns"
    },
    "sulzer-exh-vcu": {
      name: "Μονάδα Ελέγχου Βαλβίδων (VCU)",
      description: "Ηλεκτρονικό στοιχείο που περιέχει τις ηλεκτροβαλβίδες υψηλής ταχύτητας για τον έλεγχο των βαλβίδων εξαγωγής.",
      functions: [
        "Επεξεργασία ψηφιακών εντολών WECS",
        "Έλεγχος χρονισμού έδρασης βαλβίδων",
        "Απόσβεση υδραυλικών κραδασμών"
      ],
      operationalMetrics: "Αντίσταση πηνίου: 18 - 24 Ohms. Πίεση αζώτου συσσωρευτή N2: 130 bar"
    },
    "yanmar-4s": {
      title: "Βοηθητική Ηλεκτρογεννήτρια Yanmar 6EY26L",
      code: "4-Χρονη Υπερτροφοδοτούμενη Γεννήτρια",
      systemDescription: "Τετράχρονη βοηθητική γεννήτρια υψηλής ταχύτητας για την παραγωγή ηλεκτρικής ισχύος στο πλοίο. Διαθέτει ρυθμιστές Woodward και ξεχωριστά χιτώνια.",
    },
    "yan-governor": {
      name: "Υδραυλικός Ρυθμιστής Woodward (Governor)",
      description: "Μονάδα ελέγχου στροφών που ρυθμίζει την κίνηση της κτένας καυσίμου με βάση το φορτίο, διατηρώντας σταθερή συχνότητα (60Hz / 450V).",
      functions: [
        "Σταθεροποίηση ταχύτητας και συχνότητας ηλεκτρικού δικτύου",
        "Μηχανικός έλεγχος σύνδεσης κτένας καυσίμου",
        "Ανατροφοδότηση από μαγνητικό αισθητήρα στροφών"
      ],
      operationalMetrics: "Στροφές: 720 RPM. Εύρος συχνότητας: 59.8Hz - 60.2Hz. Τζόγος κτένας: <0.2mm"
    },
    "yan-lube-oil": {
      name: "Αναρρόφηση & Φίλτρο Λιπαντικού Λαδιού",
      description: "Υγρό κάρτερ που τροφοδοτεί με λάδι τα έδρανα του στροφάλου και του εκκεντροφόρου μέσω διπλών φίλτρων (auto duplex filter).",
      functions: [
        "Φιλτράρισμα στερεών μεταλλικών σωματιδίων",
        "Απαγωγή θερμότητας των τριβέων",
        "Θερμοστατικός έλεγχος θερμοκρασίας λαδιού"
      ],
      operationalMetrics: "Πίεση εισόδου στα έδρανα: 3.5 - 4.5 bar. Όριο θερμοκρασίας: 45°C - 55°C"
    },
    "yan-jacket-water": {
      name: "Συλλέκτης Ψύξης Νερού Χιτωνίων (Jacket Water)",
      description: "Κύκλωμα γλυκού νερού ψύξης για την απορρόφηση της θερμότητας των χιτωνίων και των κεφαλών κυλίνδρων.",
      functions: [
        "Ψύξη των κεφαλών και των χιτωνίων κυλίνδρων",
        "Ρύθμιση παράκαμψης ψύξης (bypass) μέσω τρίοδης θερμοστατικής",
        "Εξαέρωση θυλάκων ατμού υψηλής θερμοκρασίας"
      ],
      operationalMetrics: "Κανονική θερμ. εξόδου: 78°C - 84°C. Όριο συναγερμού υψηλής θερμ: 90°C"
    },
    "yan-nozzle": {
      name: "Μπεκ Ψεκασμού Υψηλής Πίεσης (Nozzle)",
      description: "Μηχανική βελόνα έγχυσης καυσίμου πολλαπλών οπών, που ψεκάζει το καύσιμο στο θάλαμο καύσης.",
      functions: [
        "Λεπτός ψεκασμός καυσίμου (atomization) στο θάλαμο καύσης",
        "Σφράγιση έδρας βελόνας με ελατήριο",
        "Εξισορρόπηση φορτίου ανά κύλινδρο"
      ],
      operationalMetrics: "Πίεση ανοίγματος εγχυτήρα: 280 - 320 bar. Όριο θερμοκρασίας καυσαερίων: 420°C"
    },
    "bwts-aux": {
      title: " ballast / DE-ballasting & Φιλτράρισμα Ballast",
      code: "Περιβαλλοντικό Σύστημα Επεξεργασίας Ballast",
      systemDescription: "Σύστημα επεξεργασίας θαλάσσιου έρματος με αυτόματα φίλτρα αυτοκαθαρισμού (backwash), αντιδραστήρες UV και ηλεκτρόλυση.",
    },
    "bwts-filter": {
      name: "Σίτα Αυτόματου Καθαρισμού Φίλτρου",
      description: "Μηχανική σίτα πολλαπλών στρωμάτων που κατακρατεί φερτά υλικά και θαλάσσιους οργανισμούς μεγαλύτερους από 40 microns.",
      functions: [
        "Διαχωρισμός αδρών ιζημάτων",
        "Έναρξη αυτόματου κύκλου καθαρισμού (backwash)",
        "Παρακολούθηση διαφορικής πίεσης εισόδου-εξόδου"
      ],
      operationalMetrics: "Διαφορική πίεση (καθαρό): <0.15 bar. Σκανδαλισμός backwash: 0.5 - 0.8 bar"
    },
    "bwts-uv": {
      name: "Αντιδραστήρας Απολύμανσης UV",
      description: "Ανθεκτικός θάλαμος που φιλοξενεί λάμπες UV υψηλής έντασης μέσα σε προστατευτικούς σωλήνες χαλαζία.",
      functions: [
        "Καταστροφή DNA μικροοργανισμών",
        "Αυτόματος χημικός καθαρισμός (CIP)",
        "Παρακολούθηση θερμοκρασίας για αποφυγή υπερθέρμανσης"
      ],
      operationalMetrics: "Ελάχιστη διαπερατότητα UV: 45%. Συναγερμός θερμοκρασίας: >95°C"
    },
    "bwts-electro": {
      name: "Θάλαμος Ηλεκτρόλυσης Seawater",
      description: "Σύστημα ηλεκτροχλωρίωσης για την παραγωγή υποχλωριώδους νατρίου από το θαλασσινό νερό.",
      functions: [
        "Παραγωγή ενεργού απολυμαντικού μέσου",
        "Συνεχής εξαερισμός υδρογόνου για ασφάλεια",
        "Αυτόματη εξισορρόπηση τάσης-ρεύματος κυψέλης"
      ],
      operationalMetrics: "Όριο ασφαλείας αερίου υδρογόνου: >1.0% LEL. Ελάχιστη αλμυρότητα: 15 PSU"
    }
  }
};

export const InteractiveSchematics: React.FC<InteractiveSchematicsProps> = ({ 
  onSelectRecordForAi,
  onOpenManual,
  language = "EN"
}) => {
  const [selectedEngineId, setSelectedEngineId] = useState<string>("man-2s");
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>("man-exh-valve");

  const engines: EngineSchematic[] = [
    {
      id: "man-2s",
      title: "MAN B&W 6S60ME-C8.2 Main Propulsion",
      code: "2-Stroke Crosshead Marine Diesel Engine",
      type: "2-Stroke Propulsion",
      systemDescription: "Ultra-long-stroke crosshead diesel engine utilizing hydraulic command loops (FIVA valves) for exhaust timing and cylinder lubrication. Zero crankshaft gears.",
      colorTheme: "text-cyan-400 border-cyan-550 bg-cyan-950/20",
      hotspots: [
        {
          id: "man-exh-valve",
          name: "Exhaust Valve Assembly",
          x: "50%",
          y: "15%",
          description: "Pneumatically opened exhaust valve via direct WECS command utilizing servo oil pulses. Utilizes air spring for closing acceleration.",
          functions: [
            "Thermal gas exhaust extraction control",
            "Pneumatic sealing air spring feedback",
            "Hydraulic piston actuator stroke sealing"
          ],
          operationalMetrics: "Normal temp: 340°C - 380°C. High temperature trip: >450°C. Hydraulic seal pressure: 200 bar",
          linkedComponents: ["Exhaust Valve Assembly", "VCU", "Exhaust Valve Control Unit (VCU)"]
        },
        {
          id: "man-scavenge",
          name: "Scavenge Air Space & Box",
          x: "24%",
          y: "40%",
          description: "Pressurized compartment supplying fresh scavenge air through engine frame ports. Highly prone to combustible oil accumulation if rings leak.",
          functions: [
            "Combustion air supply reservoir",
            "Exhaust gas isolation blowback sealing",
            "Condensate water mist extraction drainage"
          ],
          operationalMetrics: "Pressure: 1.8 - 2.5 bar. Temperature: 40°C - 50°C. Fire hazard threshold: >80°C",
          linkedComponents: ["Scavenge Space"]
        },
        {
          id: "man-crankcase",
          name: "Crankcase & Main Bearings",
          x: "48%",
          y: "75%",
          description: "Sub-frame holding the crankshaft, main journals, and crosshead sliding guides. Constantly monitored by oil mist optical light columns.",
          functions: [
            "Dynamic torque transmission",
            "Thrust pads lubrication journal",
            "Oil mist concentrations optical monitoring"
          ],
          operationalMetrics: "Mist Level limit: <1.5% LEL. Bearings maximum operating threshold: 75°C - 80°C",
          linkedComponents: ["Crankcase Assembly & Bearings", "Crankcase & Main Bearings", "Servo Oil & Lubricating System"]
        },
        {
          id: "man-liner",
          name: "Cylinder Liner & Ring Belt",
          x: "50%",
          y: "28%",
          description: "High-wear internal cast iron liner fitted with lubrication oil feed injectors (quills). Tolerates extreme vertical load forces.",
          functions: [
            "High pressure hot-gas thermal confinement",
            "Reciprocating piston rings sliding tract",
            "Acids neutralization via cylinder lubricator oil quills"
          ],
          operationalMetrics: "Lubricating rate: 0.7 - 1.2 g/kWh. Temperature sensor alarm: >115°C",
          linkedComponents: ["Cylinder Liner & Rings", "Cylinder Liner & Ring Belt"]
        }
      ]
    },
    {
      id: "sulzer-2s",
      title: "Wärtsilä Sulzer RT-flex65C Common Rail",
      code: "2-Stroke Common Rail Electronic Engine",
      type: "2-Stroke Propulsion",
      systemDescription: "Valveless electronic common-rail propulsion engine featuring high-pressure fuel injectors and direct computer-driven servo hydraulic manifolds (WECS-9520).",
      colorTheme: "text-sky-400 border-sky-600 bg-sky-950/20",
      hotspots: [
        {
          id: "sulzer-fuel-rail",
          name: "HP Common Fuel Rail",
          x: "30%",
          y: "22%",
          description: "Accumulator pipe holding clean diesel fuel under massive potential energy. Fed by unidirectional supply reciprocating plunger pumps.",
          functions: [
            "Combustion fuel volumetric stabilization",
            "Triple-injector high-pressure supply lines feeding",
            "Solenoid timing command pressure relief"
          ],
          operationalMetrics: "Rail Operating pressure: 800 - 1050 bar. Shock leak sensor limits: 50 ml/min",
          linkedComponents: ["Common Rail System", "Fuel Injection Valve"]
        },
        {
          id: "sulzer-servo-pump",
          name: "Servo Oil Hydraulic Supply",
          x: "72%",
          y: "65%",
          description: "Multi-pump hydraulic block using main engine lube oil to actuate high speed valves and driving common rail plungers.",
          functions: [
            "System mechanical actuation power driver",
            "Fine duplex system filtering control",
            "Pneumatic servo-oil pressure regulation loops"
          ],
          operationalMetrics: "System pressure: 160 - 200 bar. Fine safety inlet filter mesh: 10 microns",
          linkedComponents: ["Servo Oil & Lubricating System", "Servo Oil Hydraulic Supply", "Servo hydraulic pump"]
        },
        {
          id: "sulzer-exh-vcu",
          name: "Valve Control Unit (VCU)",
          x: "65%",
          y: "32%",
          description: "Electronic module holding the high-speed solenoid valves governing pilot oil streams to control cylinder exhaust timing.",
          functions: [
            "WECS digital commands processing",
            "High speed valve seating timing controls",
            "Hydraulic shock absorbing buffers"
          ],
          operationalMetrics: "Solenoid coil resistance: 18 - 24 Ohms. Pre-charge gas accumulator N2: 130 bar",
          linkedComponents: ["Exhaust Valve Control Unit (VCU)", "VCU Solenoid Valve"]
        }
      ]
    },
    {
      id: "yanmar-4s",
      title: "Yanmar 6EY26L Auxiliary Generator",
      code: "4-Stroke High Speed Turbocharged Engine",
      type: "4-Stroke Generator",
      systemDescription: "High-speed 4-stroke marine dynamic generator block providing electric power. Features direct governors, gear-driven pumps, and individual injector sleeves.",
      colorTheme: "text-amber-400 border-amber-600 bg-amber-950/20",
      hotspots: [
        {
          id: "yan-governor",
          name: "Hydraulic Woodward Governor",
          x: "20%",
          y: "50%",
          description: "Speed control module governing fuel rack position based on load changes. Maintains standard electrical frequency (60Hz / 450V).",
          functions: [
            "Grid engine speed balancing stabilization",
            "Mechanical power fuel linkages driving",
            "Magnetic speed sensor feedback coupling"
          ],
          operationalMetrics: "Speed limit: 720 RPM. Frequency range: 59.8Hz - 60.2Hz. Fuel linkage play: <0.2mm",
          linkedComponents: ["Governor & Fuel Control Linkage", "Governor"]
        },
        {
          id: "yan-lube-oil",
          name: "Lube Oil Suction & Filter",
          x: "52%",
          y: "85%",
          description: "Crankcase wet sump feeding lubricating oil to crank, connecting-rod, and camshaft journals via auto duplex filter units.",
          functions: [
            "Solid metallic particles filtration",
            "Lining thermal heat removal",
            "Wax thermostatic control loop direction"
          ],
          operationalMetrics: "Inlet pressure to bearings: 3.5 - 4.5 bar. Temperature limit: 45°C - 55°C",
          linkedComponents: ["Lubricating Oil System", "Lube Oil Suction & Filter"]
        },
        {
          id: "yan-jacket-water",
          name: "Jacket Water Cooling Manifold",
          x: "50%",
          y: "35%",
          description: "Circulating high-freshwater manifold absorbing thermal cylinder heat. Regulated by heavy engine-driven centrifugal pumps.",
          functions: [
            "Cylinder heads thermal heat transfer",
            "Recirculation cooling bypass governance",
            "High temperature steam pockets venting"
          ],
          operationalMetrics: "Standard output temperature: 78°C - 84°C. High temperature alarm: 90°C",
          linkedComponents: ["Cooling Water System", "Jacket Water Cooling Manifold"]
        },
        {
          id: "yan-nozzle",
          name: "High-Pressure Injector Nozzle",
          x: "50%",
          y: "18%",
          description: "Multi-hole mechanical needle valve atomizing heavy oil into the high compression chamber. Requires high sealing pressures.",
          functions: [
            "Atomization of oil into fine diesel jet mist",
            "Popping spring shut-off sealing",
            "Single-cylinder load delivery balance"
          ],
          operationalMetrics: "Injection cracking pressure: 280 - 320 bar. Cylinder output exhaust limit: 420°C",
          linkedComponents: ["Fuel Injection Valve", "High-Pressure Injector Nozzle"]
        }
      ]
    },
    {
      id: "bwts-aux",
      title: "Ballast Water Treatment & Filtration Loop",
      code: "Ecological Environmental Deck Machinery",
      type: "Auxiliary Machinery",
      systemDescription: "High-volume vessel de-ballasting sterilization layout integrating automatic mechanical backwash filter elements, UV reactors, and saline electrolysis cells.",
      colorTheme: "text-teal-400 border-teal-600 bg-teal-950/20",
      hotspots: [
        {
          id: "bwts-filter",
          name: "Filter Backwash Screen",
          x: "25%",
          y: "40%",
          description: "Mechanical multi-layer screen filtering out suspended silt and biological organisms larger than 40 microns.",
          functions: [
            "Coarse sediment solids separation",
            "Automatic backwash cycle initiation",
            "Differential hydraulic pressure feedback monitoring"
          ],
          operationalMetrics: "Clean pressure drop: <0.15 bar. Alarm trip backwash trigger: 0.5 - 0.8 bar",
          linkedComponents: ["Ballast Filter Backwash Unit", "Backwash Screen", "Filters"]
        },
        {
          id: "bwts-uv",
          name: "UV Chemical Disinfection Reactor",
          x: "50%",
          y: "35%",
          description: "Corrosion-resistant reactor chamber housing high-intensity UV lamps protected inside sealed quartz tubes.",
          functions: [
            "Invasive micro-flora DNA destruction",
            "Self-cleaning chemical CIP flushing",
            "Thermal safety cooling monitoring"
          ],
          operationalMetrics: "Minimum transmission threshold: 45%. Lamp temperature alarm: >95°C",
          linkedComponents: ["UV Reactor & Quartz Sleeves", "UV Reactor", "Oily Water Separator & 15ppm Monitor"]
        },
        {
          id: "bwts-electro",
          name: "Electrolysis Chamber Grid",
          x: "75%",
          y: "50%",
          description: "Saline electro-chlorination cell generating sodium hypochlorite directly from seawater to eliminate harmful bacteria.",
          functions: [
            "Active substance disinfectant production",
            "Continuous hydrogen ventilation extraction",
            "Cell voltage-current auto balancing"
          ],
          operationalMetrics: "Hydrogen gas safety trip: >1.0% LEL. Salinity intake minimum: 15 PSU",
          linkedComponents: ["Electrolysis Chamber & Hydrogen Ventilation", "Electrolysis Chamber"]
        }
      ]
    }
  ];

  const translatedEngines = engines.map(eng => {
    const isGr = language === "GR";
    const transEng = isGr ? schematicsTranslations.GR[eng.id] : null;
    return {
      ...eng,
      title: transEng?.title || eng.title,
      code: transEng?.code || eng.code,
      systemDescription: transEng?.systemDescription || eng.systemDescription,
      hotspots: eng.hotspots.map(hs => {
        const transHs = isGr ? schematicsTranslations.GR[hs.id] : null;
        return {
          ...hs,
          name: transHs?.name || hs.name,
          description: transHs?.description || hs.description,
          functions: transHs?.functions || hs.functions,
          operationalMetrics: transHs?.operationalMetrics || hs.operationalMetrics,
        };
      })
    };
  });

  const activeEngine = translatedEngines.find(e => e.id === selectedEngineId) || translatedEngines[0];
  const activeHotspot = activeEngine.hotspots.find(h => h.id === selectedHotspotId) || activeEngine.hotspots[0];

  // Search local database for records that relate to selected hotspot details
  const getLinkedDatabaseRecords = (hotspot: SchematicHotspot): TroubleshootingRecord[] => {
    return troubleshootingDatabase.filter(record => {
      // match by category type, and either linked component strings or matching text
      if (record.category !== activeEngine.type) return false;
      
      const componentMatches = hotspot.linkedComponents.some(name => 
         record.component.toLowerCase().includes(name.toLowerCase()) || 
         record.makeModel.toLowerCase().includes(name.toLowerCase())
      );
      
      const textMatches = 
        record.faultSymptom.toLowerCase().includes(hotspot.name.toLowerCase()) ||
        record.component.toLowerCase().includes(hotspot.name.toLowerCase());

      return componentMatches || textMatches;
    });
  };

  const linkedRecords = getLinkedDatabaseRecords(activeHotspot);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full" id="interactive-schematics-layout">
      {/* LEFT COLUMN: Engine / System Selection & Live Canvas Grid */}
      <div className="xl:col-span-8 flex flex-col bg-[#0d1425] border border-slate-800 rounded-xl overflow-hidden shadow-xl" id="diagram-canvas-pane">
        
        {/* Navigation Selector Bar */}
        <div className="p-3 bg-[#111827] border-b border-slate-800 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider text-white font-display">
              {language === "GR" ? "Διαδραστικά Διαγνωστικά Σχέδια & Μοντέλα Μηχανών" : "Interactive Diagnostic Schematics & Engine Models"}
            </span>
          </div>

          <div className="flex gap-1.5 bg-slate-900 p-1 rounded border border-slate-800">
            {translatedEngines.map(engine => (
              <button
                key={engine.id}
                onClick={() => {
                  setSelectedEngineId(engine.id);
                  setSelectedHotspotId(engine.hotspots[0].id);
                }}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded transition-all cursor-pointer ${
                  selectedEngineId === engine.id
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {engine.id === "man-2s" ? (language === "GR" ? "MAN δίχρονη" : "MAN 2-Stroke") : 
                 engine.id === "sulzer-2s" ? (language === "GR" ? "Sulzer δίχρονη" : "Sulzer 2-Stroke") :
                 engine.id === "yanmar-4s" ? (language === "GR" ? "Yanmar τετράχρονη" : "Yanmar 4-Stroke") : 
                 (language === "GR" ? "Βοηθητικό BWTS" : "BWTS Aux Loop")}
              </button>
            ))}
          </div>
        </div>

        {/* Engine Description Panel */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800 flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 px-1.5 py-0.5 bg-cyan-950 border border-cyan-800/20 rounded">
                {activeEngine.type.toUpperCase() === "4-STROKE GENERATOR" 
                  ? (language === "GR" ? "4-ΧΡΟΝΗ ΓΕΝΝΗΤΡΙΑ" : "4-STROKE GENERATOR")
                  : activeEngine.type.toUpperCase() === "2-STROKE PROPULSION"
                    ? (language === "GR" ? "2-ΧΡΟΝΗ ΠΡΟΩΣΗ" : "2-STROKE PROPULSION")
                    : (language === "GR" ? "ΒΟΗΘΗΤΙΚΟ ΜΗΧΑΝΗΜΑ" : "AUXILIARY MACHINERY")}
              </span>
              <h3 className="text-sm font-bold text-white font-display uppercase">{activeEngine.title}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">{activeEngine.systemDescription}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">{language === "GR" ? "ΠΡΟΔΙΑΓΡΑΦΗ" : "Class Spec"}</span>
            <span className="text-xs font-mono font-bold text-slate-300">{activeEngine.code}</span>
          </div>
        </div>

        {/* VISUAL DIAGRAM CANVAS AREA with interactive Node elements */}
        <div className="flex-1 relative min-h-[350px] bg-radial from-[#0d1c2d] to-[#040810] flex items-center justify-center p-6 border-b border-slate-800 overflow-hidden" id="diagram-stage">
          
          {/* Subtle Grid Watermark Overlay */}
          <div className="absolute inset-0 bg-transparent opacity-[0.03] grid grid-cols-12 gap-1 pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          
          {/* Mock Schematic Drawing Line-Art using CSS layout blocks */}
          <div className="w-full max-w-xl h-72 border border-slate-800/30 bg-slate-900/10 rounded-2xl relative flex flex-col justify-between p-6">
            
            {/* Header Block corresponding to cylinder cover area */}
            <div className="h-6 w-3/5 mx-auto bg-slate-800/40 border border-slate-700/60 rounded flex items-center justify-center text-[10px] font-mono text-slate-500">
              {language === "GR" ? "ΣΥΓΚΡΟΤΗΜΑ ΚΑΠΑΚΙΟΥ ΚΥΛΙΝΔΡΟΥ" : "CYLINDER COVER TOP HEADER ASSEMBLY"}
            </div>

            {/* Piston & Stroke Path line indicator */}
            <div className="flex-1 w-2/5 mx-auto border-x border-dashed border-slate-700/40 relative my-4 flex flex-col justify-around items-center">
              <div className="w-full h-0.5 bg-slate-800/50" />
              <div className="w-5/6 h-12 bg-gradient-to-b from-slate-800/80 to-slate-950 border border-slate-600/40 rounded flex items-center justify-center font-mono text-3xs text-slate-500">
                {language === "GR" ? "Κεφαλή Εμβόλου" : "Piston Crown"}
              </div>
              <div className="w-1.5 h-20 bg-slate-700/40 border-x border-slate-600/30" />
              <div className="w-full h-0.5 bg-slate-800/50" />
            </div>

            {/* Bedplate frame */}
            <div className="h-10 w-full bg-slate-950/60 border border-slate-850 rounded flex items-center justify-between px-4 font-mono text-4xs text-slate-600">
              <span>{language === "GR" ? "Ελαιολεκάνη Στροφάλου" : "Aft Sump Bedplate"}</span>
              <div className="w-8 h-8 rounded-full border border-dashed border-slate-700/60 flex items-center justify-center text-4xs">{language === "GR" ? "Στρόφαλος" : "Crank"}</div>
              <span>{language === "GR" ? "Σύνδεσμος Σπονδύλου" : "Flywheel coupling"}</span>
            </div>

            {/* SVG Interactive Linking Lines drawing backgrounds */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <path d="M 120 70 L 260 70" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
              <path d="M 400 120 L 280 200" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
              <path d="M 330 240 L 450 240" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
            </svg>

            {/* Render absolute hotspot dot indicators */}
            {activeEngine.hotspots.map(hotspot => {
              const isSelected = hotspot.id === selectedHotspotId;
              return (
                <button
                  key={hotspot.id}
                  onClick={() => setSelectedHotspotId(hotspot.id)}
                  style={{ left: hotspot.x, top: hotspot.y }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer transition-all duration-300 z-10`}
                  id={`hotspot-${hotspot.id}`}
                >
                  <span className={`absolute inline-flex h-8 w-8 rounded-full opacity-60 animate-ping ${
                    isSelected ? "bg-cyan-500" : "bg-slate-600"
                  }`} />
                  
                  <span className={`relative rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold border shadow-md font-mono ${
                    isSelected 
                      ? "bg-cyan-400 text-slate-950 border-cyan-200 scale-125" 
                      : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500"
                  }`}>
                    •
                  </span>
                  
                  {/* Floating tooltip label */}
                  <span className={`absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[9px] font-mono border font-semibold ${
                    isSelected 
                      ? "bg-cyan-500 text-slate-950 border-cyan-200 font-bold" 
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}>
                    {hotspot.name}
                  </span>
                </button>
              );
            })}

          </div>

        </div>

        {/* Live System Legend / Advisory Info */}
        <div className="p-3 bg-slate-950 text-[10px] font-mono text-slate-500 flex justify-between items-center uppercase tracking-wider">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 font-bold text-cyan-400 animate-pulse">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              {language === "GR" ? "ΣΥΓΧΡΟΝΙΣΜΟΣ ΣΗΜΕΙΩΝ ΜΕ ΒΑΣΗ ΔΕΔΟΜΕΝΩΝ" : "HOTSPOT SELECTION SYNCHRONIZED WITH DATABASE"}
            </span>
            <span>{language === "GR" ? `ΕΝΕΡΓΑ ΣΗΜΕΙΑ: ${activeEngine.hotspots.length}` : `Active Hotspots Count: ${activeEngine.hotspots.length}`}</span>
          </div>
          <span>{language === "GR" ? "ΕΠΙΛΕΞΤΕ ΣΗΜΕΙΑ (•) ΣΤΟ ΔΙΑΓΡΑΜΜΑ ΓΙΑ ΛΕΠΤΟΜΕΡΕΙΕΣ" : "Select hotspots (•) on diagram to scan linked logs"}</span>
        </div>

      </div>

      {/* RIGHT COLUMN: Scanned Detail Card & Linked Database Fault Logs */}
      <div className="xl:col-span-4 flex flex-col gap-4" id="diagram-linked-data-pane">
        
        {/* Component Specification Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Settings className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">{language === "GR" ? "ΕΝΕΡΓΟ ΜΕΛΟΣ ΕΞΑΡΤΗΜΑΤΟΣ" : "Active Labeled Part"}</span>
              <h3 className="text-sm font-bold text-white font-display uppercase tracking-tight">{activeHotspot.name}</h3>
            </div>
          </div>

          <p className="text-xs text-slate-350 leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-850">
            {activeHotspot.description}
          </p>

          <div className="space-y-2">
            <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider">
              {language === "GR" ? "Κύριες Λειτουργίες Λειτουργίας:" : "Core Operations Functions:"}
            </span>
            <div className="flex flex-col gap-1">
              {activeHotspot.functions.map((fn, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300 font-medium font-sans">
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span>{fn}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-1 p-2.5 bg-slate-900 border border-slate-800 rounded flex gap-2 items-start text-xs">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] uppercase font-mono text-slate-500 font-bold block">
                {language === "GR" ? "Όρια Τηλεμετρίας / Δοκιμαστηρίου" : "Telemetry / Test Bench Limits"}
              </span>
              <p className="text-slate-300 font-mono text-[11px] font-semibold mt-0.5">{activeHotspot.operationalMetrics}</p>
            </div>
          </div>
        </div>

        {/* Linked Database Fault Logs Column */}
        <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col min-h-[250px] overflow-hidden">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white font-display uppercase tracking-wide">
                {language === "GR" ? `Συνδεδεμένες Βλάβες (${linkedRecords.length})` : `Linked Database Logs (${linkedRecords.length})`}
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase">{activeEngine.id.toUpperCase()} Matches</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {linkedRecords.map(record => {
              const gIndex = recordTranslations[record.id];
              const rComponent = (language === "GR" && gIndex) ? gIndex.component : record.component;
              const rModel = (language === "GR" && gIndex) ? gIndex.makeModel : record.makeModel;
              const rSymptom = (language === "GR" && gIndex) ? gIndex.faultSymptom : record.faultSymptom;
              
              const translatedDifficulty = language === "GR" 
                ? (record.difficulty === "High" ? "ΚΡΙΣΙΜΟ" : record.difficulty === "Medium" ? "ΜΕΣΑΙΟ" : "ΡΟΥΤΙΝΑΣ")
                : record.difficulty.toUpperCase();

              return (
                <div 
                  key={record.id}
                  className="p-3 bg-[#111827] border border-slate-800 hover:border-slate-700 rounded transition-all flex flex-col gap-2 relative group"
                  id={`linked-log-${record.id}`}
                >
                  {/* Header info */}
                  <div className="flex justify-between items-center bg-slate-900/30 px-2 py-1 rounded">
                    <span className="text-[10px] font-mono font-bold text-cyan-400">
                      {record.id.toUpperCase()}
                    </span>
                    <span className={`text-[8px] font-mono font-bold uppercase px-1.5 rounded border ${
                      record.difficulty === "High"
                        ? "text-red-400 border-red-900/40 bg-red-950/20"
                        : record.difficulty === "Medium"
                          ? "text-amber-400 border-amber-900/40 bg-amber-950/20"
                          : "text-cyan-400 border-cyan-900/40 bg-cyan-950/20"
                    }`}>
                      {translatedDifficulty}
                    </span>
                  </div>

                  <div className="px-1 text-slate-100 font-sans">
                    <h5 className="text-[11px] font-bold text-white leading-tight">
                      {rComponent}
                    </h5>
                    <p className="text-[11px] text-slate-450 italic mt-0.5 font-mono">
                      {rModel}
                    </p>
                    <p className="text-xs text-slate-350 mt-1.5 leading-relaxed">
                      <strong>{language === "GR" ? "Σύμπτωμα:" : "Symptom:"}</strong> {rSymptom}
                    </p>
                  </div>

                  {/* Micro Actions bar inside card */}
                  <div className="flex justify-between items-center border-t border-slate-800/60 pt-2 mt-1">
                    <button
                      onClick={() => onOpenManual(record)}
                      className="text-[10px] font-semibold text-slate-400 hover:text-cyan-400 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{language === "GR" ? "Οδηγίες" : "Read Steps"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onSelectRecordForAi(record)}
                      className="text-[10px] font-bold text-cyan-400 hover:text-white flex items-center gap-1 py-0.5 px-2 bg-cyan-950/40 border border-cyan-800/30 rounded cursor-pointer"
                    >
                      <Bot className="w-3 h-3" />
                      <span>{language === "GR" ? "Σύμβουλος AI" : "AI Advise"}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {linkedRecords.length === 0 && (
              <div className="py-8 text-center text-slate-550 flex flex-col items-center justify-center gap-2">
                <ShieldAlert className="w-8 h-8 text-slate-600 animate-pulse" />
                <span className="text-xs text-slate-400 font-mono italic max-w-xs leading-relaxed font-sans">
                  {language === "GR" 
                    ? "Δεν βρέθηκαν καταγεγραμμένες βλάβες στη βάση δεδομένων για αυτό το εξάρτημα. Επιλέξτε άλλο σημείο."
                    : "No explicit offline fault logs specifically mapped to this mechanical joint. Touch other hotspots to scan database."}
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
