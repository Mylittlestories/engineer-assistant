import type { TroubleshootingRecord } from "../types";

export type TroubleshootingCaseInput = {
  equipment: string;
  alarm: string;
  symptom: string;
  readings: string;
  recentWork: string;
  checked: string;
  urgency: "normal" | "urgent" | "critical";
};

export type CauseGroup = {
  label: string;
  reason: string;
  checks: string[];
  proves: string;
  keywords: string[];
};

export type ExpertPack = {
  id: string;
  title: string;
  keywords: string[];
  safety: string[];
  questions: string[];
  causeGroups: CauseGroup[];
  stopCriteria: string[];
  manualNeeds: string[];
};

export type DiagnosticPlan = {
  title: string;
  packTitle: string;
  confidence: "High" | "Medium" | "Low";
  summary: string;
  immediateSafety: string[];
  missingQuestions: string[];
  likelyCauses: CauseGroup[];
  checksInOrder: string[];
  matchedRecords: TroubleshootingRecord[];
  manualNeeds: string[];
  stopCriteria: string[];
  logbookDraft: string;
  defectDraft: string;
  aiPrompt: string;
};

export const quickEquipmentOptions = [
  "Main engine",
  "Diesel generator",
  "Purifier",
  "Pump",
  "Compressor",
  "Boiler",
  "Steering gear",
  "Electrical / automation"
];

const generalSafety = [
  "Do not bypass alarms or interlocks unless the Chief Engineer formally approves a controlled test.",
  "Apply LOTO before opening covers, filters, strainers, electrical cabinets, hydraulic lines, or pressurized systems.",
  "Verify local gauges and physical condition before trusting a remote sensor reading.",
  "If fire, explosion, high-pressure fuel, steering loss, blackout, or flooding risk exists, stop diagnosis and move to the vessel emergency procedure."
];

export const expertPacks: ExpertPack[] = [
  {
    id: "main-engine",
    title: "Main engine / propulsion",
    keywords: ["main engine", "me", "propulsion", "cylinder", "scavenge", "exhaust", "turbocharger", "bearing", "crankcase", "oil mist", "jacket", "piston", "fuel valve", "servo"],
    safety: [
      "Inform bridge and Chief Engineer before reducing load, stopping propulsion, or isolating a cylinder.",
      "Keep clear of crankcase relief doors and scavenge doors during oil mist, hot bearing, or scavenge fire risk.",
      "Never open crankcase or scavenge spaces until the required cooling/venting time and SMS procedure are satisfied.",
      "Treat high-pressure fuel, hydraulic/servo oil, starting air, and hot exhaust parts as life-threatening hazards."
    ],
    questions: [
      "Which cylinder/unit is abnormal, and is the deviation rising or stable?",
      "What changed recently: fuel changeover, injector work, exhaust valve work, cylinder lubrication change, load change?",
      "Are temperatures, pressures, vibration and turbocharger speed consistent with the alarm?",
      "Can the fault be safely compared with sister cylinders at the same load?"
    ],
    causeGroups: [
      {
        label: "Combustion or injection problem",
        keywords: ["exhaust", "temperature", "deviation", "smoke", "knocking", "fuel", "injector", "pmax", "pcomp"],
        reason: "Cylinder temperature, smoke and pressure changes often come from fuel valve leakage, poor atomisation, wrong timing, compression loss or overload.",
        checks: [
          "Compare affected unit with adjacent cylinders at same load.",
          "Check exhaust temperature trend, scavenge temperature, Pmax/Pcomp if available, and smoke colour.",
          "Inspect fuel injector leak-off, fuel pump/ELFI command, and recent fuel changeover condition.",
          "Reduce load or cut out the unit only according to maker/SMS procedure."
        ],
        proves: "Abnormal Pmax/Pcomp, smoke, leak-off, or temperature trend confirms combustion/injection direction."
      },
      {
        label: "Air path or scavenge problem",
        keywords: ["scavenge", "air", "turbo", "blower", "cooler", "pressure", "fire", "surging"],
        reason: "Restricted air, fouled cooler, turbocharger issue, scavenge deposits or fire changes combustion and temperature quickly.",
        checks: [
          "Compare scavenge pressure/temperature with normal load curves.",
          "Check turbocharger speed, air cooler differential, mist catcher drain and scavenge drains.",
          "Look for signs of scavenge fire: rapid temperature rise, smoke, smell, local hot spots.",
          "If fire suspected, stop oxygen/feed source and follow emergency checklist."
        ],
        proves: "Low scavenge pressure, high cooler differential, hot scavenge drain, or smoke points to air/scavenge fault."
      },
      {
        label: "Lubrication, bearing or friction heating",
        keywords: ["bearing", "oil mist", "lubrication", "temperature", "metal", "filter", "pressure", "crosshead", "crankpin"],
        reason: "Bearing distress can develop fast and may not be described by one manual alarm text.",
        checks: [
          "Check LO pressure, filter differential, sump level, bearing temperature trend and oil mist detector compartment.",
          "Check for metal particles in filters/strainers only when isolated and safe.",
          "Keep personnel away from relief doors; do not open crankcase early.",
          "Escalate immediately if temperature rises, mist persists, or metal is found."
        ],
        proves: "Rising bearing temperature, metal particles, OMD concentration or LO pressure drop confirms friction/lube path."
      }
    ],
    stopCriteria: [
      "Oil mist alarm, crankcase hot spot, scavenge fire, uncontrolled exhaust temperature, heavy knock, or high-pressure fuel leak.",
      "Any parameter continues to worsen after load reduction or safe first action.",
      "Maker limit is unknown and the next check requires opening hot/pressurized machinery."
    ],
    manualNeeds: [
      "Cylinder cut-out procedure and permitted load/RPM limits.",
      "Alarm limits for exhaust/scavenge/bearing temperatures and oil mist detector reset procedure.",
      "Fuel valve, exhaust valve and bearing inspection procedure/clearances."
    ]
  },
  {
    id: "generator",
    title: "Diesel generator / alternator",
    keywords: ["generator", "dg", "aux engine", "frequency", "voltage", "load", "hunting", "blackout", "avr", "governor", "alternator", "breaker"],
    safety: [
      "Inform bridge/ETO before load transfer, breaker operation, or governor/AVR adjustment.",
      "Do not work inside switchboards unless isolated, locked out, tested dead, and authorized.",
      "Stabilize essential services first: steering, cooling, fuel, control air, fire pumps as required.",
      "Avoid repeated start attempts without confirming LO pressure, fuel, cooling and overspeed/shutdown status."
    ],
    questions: [
      "Is frequency, voltage, or both unstable?",
      "Does it happen on no-load, single running, or only in parallel/load sharing?",
      "What is fuel pressure before/after filters and is there black smoke?",
      "Was there recent fuel filter change, governor/AVR work, load change, or blackout?"
    ],
    causeGroups: [
      {
        label: "Fuel supply instability",
        keywords: ["frequency", "hunting", "fuel", "filter", "black smoke", "load", "air", "pressure", "diesel"],
        reason: "Frequency hunting often starts with air ingress, clogged filters, low booster pressure, fuel rack sticking or unstable fuel quality.",
        checks: [
          "Check fuel pressure before/after filters and switch/clean filters if differential is high.",
          "Bleed air from the fuel system according to procedure.",
          "Check service tank level, quick-closing valve position and return temperature.",
          "Watch exhaust smoke and rack movement while load changes."
        ],
        proves: "Pressure fluctuation, high filter differential, air release or smoke/rack hunting confirms fuel path."
      },
      {
        label: "Governor, actuator or pickup issue",
        keywords: ["governor", "actuator", "pickup", "speed", "frequency", "hunting", "rpm"],
        reason: "The governor loop controls speed. A sticking actuator, bad magnetic pickup, linkage backlash or bad tuning can hunt without a manual-specific fault.",
        checks: [
          "Check actuator/linkage for sticking, backlash, loose joints or oil contamination.",
          "Verify magnetic pickup gap, cleanliness and cable tightness.",
          "Compare governor feedback with actual RPM/frequency.",
          "Do not change tuning until fuel and load causes are excluded."
        ],
        proves: "Unstable actuator command, pickup dropout, or mechanical sticking confirms governor loop."
      },
      {
        label: "AVR / load sharing / electrical load problem",
        keywords: ["voltage", "avr", "reactive", "load sharing", "parallel", "breaker", "kw", "kvar", "pf"],
        reason: "If voltage and frequency move together in parallel operation, the issue may be load sharing, AVR stability or a cycling load.",
        checks: [
          "Identify whether hunting occurs only in parallel or with a specific large consumer online.",
          "Check kW/kVAr sharing, power factor, AVR alarms and droop/cross-current settings.",
          "Look for a cycling compressor, bow thruster, cargo pump or reefer load.",
          "Stabilize bus load before changing control modules."
        ],
        proves: "Stable no-load/single mode but unstable parallel mode points to sharing/AVR/load interaction."
      }
    ],
    stopCriteria: [
      "Frequency/voltage outside safe bus limits, reverse power, overspeed, smoke/fire, breaker abnormality, or repeated blackout risk.",
      "Any switchboard work is required without isolation/permit.",
      "Generator cannot carry essential load steadily."
    ],
    manualNeeds: [
      "Governor and AVR setting limits.",
      "Protection trip values and reset sequence.",
      "Load sharing controller procedure and alternator insulation limits."
    ]
  },
  {
    id: "purifier",
    title: "Fuel/lube oil purifier",
    keywords: ["purifier", "separator", "alfa", "mitsubishi", "water", "transducer", "bowl", "sludge", "gravity disc", "interface", "discharge"],
    safety: [
      "Do not open the purifier until fully stopped, isolated, cooled and depressurized.",
      "Treat rotating bowl parts as stored-energy hazards; follow maker dismantling sequence.",
      "Beware hot oil, steam/heater surfaces, water hammer and slippery oil spills.",
      "Verify overflow/sludge tank condition before repeated discharge tests."
    ],
    questions: [
      "Is it water carry-over, oil in water outlet, vibration, high back pressure, or failed discharge?",
      "What feed temperature, throughput and back pressure are running?",
      "Was gravity disc, operating water, bowl seal, or feed type changed recently?",
      "Is the fault continuous or only after discharge/start-up?"
    ],
    causeGroups: [
      {
        label: "Wrong interface / separation condition",
        keywords: ["water", "carry", "interface", "gravity", "temperature", "back pressure", "density"],
        reason: "Water carry-over or oil loss is usually interface control: gravity disc, temperature, throughput, back pressure or density mismatch.",
        checks: [
          "Confirm feed temperature is stable and suitable for the fuel/oil grade.",
          "Check throughput and reduce temporarily to see if separation improves.",
          "Verify gravity disc/paring disc selection and back pressure setting.",
          "Check water transducer response and clean test water quality."
        ],
        proves: "Improvement after temperature/throughput/back-pressure correction confirms interface problem."
      },
      {
        label: "Bowl closing / operating water fault",
        keywords: ["discharge", "bowl", "closing", "operating water", "seal", "leak", "sludge"],
        reason: "Failed seal or repeated discharge can come from closing water, worn seals, clogged water channels or leaking discharge valve.",
        checks: [
          "Check operating/closing/opening water pressure and solenoid timing.",
          "Inspect water strainers and verify water reaches the purifier at the right time.",
          "If safe, run a controlled discharge test and observe sequence.",
          "Plan bowl inspection if water supply/timing is correct but seal fails."
        ],
        proves: "Wrong water timing/pressure or failed discharge sequence confirms operating water/bowl seal direction."
      },
      {
        label: "Mechanical fouling or vibration",
        keywords: ["vibration", "noise", "sludge", "dirty", "bearing", "bowl", "unbalance"],
        reason: "Sludge build-up, incorrect assembly, worn bearings or damaged bowl parts cause vibration and poor separation.",
        checks: [
          "Stop if vibration is abnormal; do not continue running to prove the fault.",
          "Check sludge discharge history and last cleaning date.",
          "Verify bowl assembly marks and locking after maintenance.",
          "Inspect bearings/gears only after safe shutdown and permit."
        ],
        proves: "Vibration change after discharge or dirty bowl inspection confirms fouling/unbalance."
      }
    ],
    stopCriteria: [
      "Abnormal vibration/noise, oil spray/leakage, repeated failed discharge, high temperature leak, or inability to maintain seal.",
      "Any bowl opening without full stop, isolation and maker sequence."
    ],
    manualNeeds: [
      "Gravity disc/interface selection chart.",
      "Operating water pressure/timing values.",
      "Bowl assembly torque, seal renewal and vibration limits."
    ]
  },
  {
    id: "pump",
    title: "Pump / hydraulic / cooling system",
    keywords: ["pump", "pressure", "flow", "suction", "discharge", "cavitation", "cooling", "seawater", "fresh water", "hydraulic", "strainer"],
    safety: [
      "Isolate and depressurize before opening filters, strainers, vents, drains, mechanical seals or hydraulic lines.",
      "Do not run a pump dry to prove a fault.",
      "Beware hot water, steam, chemical, fuel, oil and rotating coupling hazards.",
      "Confirm standby pump availability before stopping an essential service pump."
    ],
    questions: [
      "Is the problem low pressure, high pressure, no flow, overheating, leakage, noise or vibration?",
      "Are suction and discharge valves fully lined up?",
      "What changed recently: strainer cleaning, pump overhaul, valve operation, tank level?",
      "Does the standby pump give the same readings?"
    ],
    causeGroups: [
      {
        label: "Suction restriction or air ingress",
        keywords: ["low pressure", "no flow", "cavitation", "noise", "suction", "strainer", "air", "vacuum"],
        reason: "Most pump low-flow faults start at suction: closed valve, blocked strainer, low tank level, air leak or vapor lock.",
        checks: [
          "Check suction valve lineup, tank/sea chest level and strainer differential.",
          "Vent the pump casing if procedure allows and check for air release.",
          "Listen for cavitation and compare motor current with normal.",
          "Change to standby pump to separate pump fault from system fault."
        ],
        proves: "High suction vacuum, air release, dirty strainer or same fault on standby confirms system/suction problem."
      },
      {
        label: "Discharge blockage or control valve fault",
        keywords: ["high pressure", "low flow", "discharge", "valve", "cooler", "filter", "back pressure"],
        reason: "High discharge pressure with poor flow points to closed valve, blocked cooler/filter, stuck control valve or wrong bypass position.",
        checks: [
          "Trace discharge valve lineup and bypass/recirculation valves.",
          "Check filter/cooler differential pressure.",
          "Verify control valve position locally, not only on automation display.",
          "Compare temperatures before/after cooler or consumer."
        ],
        proves: "High differential pressure or wrong valve position confirms restriction/control issue."
      },
      {
        label: "Pump wear, seal leakage or coupling problem",
        keywords: ["seal", "leak", "vibration", "bearing", "coupling", "wear", "current", "overload"],
        reason: "If lineup is correct but performance remains poor, internal wear, damaged impeller, seal leak or coupling slip is likely.",
        checks: [
          "Check seal leakage, bearing temperature, vibration and coupling condition.",
          "Compare motor current to expected load.",
          "Check pump curve point if pressure/flow readings are available.",
          "Plan overhaul if standby pump performs normally."
        ],
        proves: "Standby pump normal plus abnormal vibration/current/leak confirms pump mechanical issue."
      }
    ],
    stopCriteria: [
      "Loss of essential cooling/lubrication, mechanical seal failure on hazardous fluid, severe vibration, motor overload, or hot bearing.",
      "Any opening of pressurized/hot/chemical system without permit and isolation."
    ],
    manualNeeds: [
      "Pump curve, normal suction/discharge pressure and motor current.",
      "Mechanical seal plan and bearing limits.",
      "Control valve/bypass normal position."
    ]
  },
  {
    id: "compressor",
    title: "Air compressor / starting air",
    keywords: ["compressor", "starting air", "air bottle", "unloader", "intercooler", "aftercooler", "moisture", "pressure", "relief valve"],
    safety: [
      "Starting air is stored energy; isolate, vent and prove zero pressure before opening any part.",
      "Never tighten fittings or open drains while standing in line with high-pressure air discharge.",
      "High air temperature, oil carry-over and leaking valves can create fire/explosion risk.",
      "Confirm enough starting air remains for propulsion/blackout recovery before extended testing."
    ],
    questions: [
      "Is the compressor slow to build pressure, tripping, overheating, leaking, or producing wet/oily air?",
      "What are stage pressures and intercooler/aftercooler temperatures?",
      "Do unloaders and auto drains operate correctly?",
      "When were suction/discharge valves last inspected?"
    ],
    causeGroups: [
      {
        label: "Valve leakage or stage imbalance",
        keywords: ["slow", "pressure", "stage", "valve", "temperature", "hot"],
        reason: "Worn suction/discharge valves cause low capacity, abnormal stage pressure and high temperature.",
        checks: [
          "Record each stage pressure and temperature during load run.",
          "Compare with normal trend and maker ratios.",
          "Check for hot valve covers or abnormal pulsation.",
          "Plan valve inspection only after isolation and pressure release."
        ],
        proves: "Abnormal stage pressure ratio and high discharge temperature confirm valve/stage issue."
      },
      {
        label: "Cooling or drain problem",
        keywords: ["temperature", "cooler", "water", "moisture", "condensate", "drain"],
        reason: "Poor cooling and failed drains increase discharge temperature and carry water/oil into bottles.",
        checks: [
          "Check cooling water flow and cooler inlet/outlet temperatures.",
          "Verify intercooler/aftercooler drains open and auto drains work.",
          "Check separator elements and condensate traps.",
          "Drain air bottles and inspect condensate quality."
        ],
        proves: "High cooler temperature differential problem or failed drain confirms cooling/drain direction."
      },
      {
        label: "Unloader, control or leakage problem",
        keywords: ["unloader", "start", "stop", "leak", "relief", "pressure switch", "auto"],
        reason: "Unloaders or pressure controls can prevent loading/unloading correctly, causing slow build-up or trips.",
        checks: [
          "Observe unloader sequence at start/stop and pressure switch cut-in/cut-out.",
          "Listen for leakage at relief valves, non-return valves and drains.",
          "Check motor current during loaded/unloaded operation.",
          "Verify automation signal with local pneumatic/mechanical position."
        ],
        proves: "Air leak, wrong cut-in/out or unloader stuck state confirms control/leak issue."
      }
    ],
    stopCriteria: [
      "High discharge temperature, relief valve lifting, oil carry-over, abnormal noise, insufficient starting air reserve, or repeated trips.",
      "Any high-pressure air opening without full depressurization."
    ],
    manualNeeds: [
      "Stage pressure/temperature limits.",
      "Valve overhaul procedure and unloader setting.",
      "Air bottle drain and safety valve test intervals."
    ]
  },
  {
    id: "boiler",
    title: "Boiler / burner / steam",
    keywords: ["boiler", "burner", "steam", "flame", "ignition", "fo pressure", "atomizing", "water level", "feed water", "uptake"],
    safety: [
      "Treat flame failure, furnace pressure, low water level and fuel leakage as serious fire/explosion risks.",
      "Purge furnace exactly as required before ignition attempts.",
      "Do not bypass burner management, flame scanner, low-low water, pressure or fuel trip interlocks.",
      "Isolate fuel/steam/air/electrical energy before opening burner or boiler mountings."
    ],
    questions: [
      "Is the fault ignition failure, flame failure during run, smoke, low steam pressure, or water level problem?",
      "What are fuel temperature/viscosity/pressure and atomizing medium readings?",
      "Is the flame scanner clean and seeing flame?",
      "Was burner/nozzle/filter/air register work done recently?"
    ],
    causeGroups: [
      {
        label: "Fuel atomization / ignition problem",
        keywords: ["flame", "ignition", "burner", "smoke", "fuel", "atomizing", "nozzle", "viscosity"],
        reason: "Bad atomization, wrong fuel temperature/viscosity, dirty nozzle, low atomizing pressure or ignition fault causes unstable flame.",
        checks: [
          "Confirm purge complete and no unburnt fuel accumulation.",
          "Check fuel pressure, temperature/viscosity and atomizing steam/air pressure.",
          "Inspect/clean burner nozzle, electrodes and flame scanner after isolation.",
          "Verify air register/damper position and fan operation."
        ],
        proves: "Restored stable flame after fuel/atomizing/nozzle correction confirms burner path."
      },
      {
        label: "Water level / feed control issue",
        keywords: ["water level", "feed", "low level", "high level", "steam pressure", "pump"],
        reason: "Feed pump, control valve, transmitter or gauge glass fault can cause unsafe level alarms.",
        checks: [
          "Verify gauge glass level locally and compare transmitter indication.",
          "Check feed pump discharge pressure and control valve movement.",
          "Blow through gauge glass according to safe procedure if readings conflict.",
          "Stop firing if low-low water or doubtful true level."
        ],
        proves: "Mismatch between gauge glass and transmitter or poor feed response confirms level/control issue."
      },
      {
        label: "Air/furnace/uptake restriction",
        keywords: ["smoke", "uptake", "draft", "fan", "air", "soot", "pressure"],
        reason: "Poor air supply or fouled gas path causes smoke, flame instability and poor steam production.",
        checks: [
          "Check forced draft fan, air damper position and furnace pressure.",
          "Observe smoke colour and uptake temperature.",
          "Check last soot blow and economizer/uptake condition if fitted.",
          "Reduce firing rate if combustion is unstable."
        ],
        proves: "Abnormal draft/air/furnace pressure or high uptake temperature confirms air/gas path."
      }
    ],
    stopCriteria: [
      "Low-low water, furnace explosion risk, repeated flame failure, visible fuel leak, failed purge, or flame scanner uncertainty.",
      "Any boiler mounting work without isolation and permit."
    ],
    manualNeeds: [
      "Burner sequence and purge timing.",
      "Fuel viscosity/temperature/pressure and atomizing settings.",
      "Water level control calibration and trip test procedure."
    ]
  },
  {
    id: "electrical-automation",
    title: "Electrical / automation / sensors",
    keywords: ["electrical", "automation", "plc", "sensor", "transmitter", "alarm", "signal", "breaker", "earth", "mccb", "contactor", "vfd", "motor"],
    safety: [
      "Only authorized personnel should open electrical panels; isolate, lock out, test dead and protect against arc flash.",
      "Do not force contactors, bridge safety inputs, or bypass trips except under formal controlled test approval.",
      "Confirm whether an alarm is real using local gauges/physical condition before assuming sensor failure.",
      "Keep essential standby equipment ready before testing controls."
    ],
    questions: [
      "Is the process actually abnormal, or only the displayed signal/alarm?",
      "Is the signal 4-20 mA, RTD/thermocouple, pressure switch, proximity switch or digital input?",
      "Does the fault move with sensor, cable, card or channel swap?",
      "Was there recent washing, vibration, panel work, blackout or insulation alarm?"
    ],
    causeGroups: [
      {
        label: "Real process fault vs bad signal",
        keywords: ["sensor", "transmitter", "alarm", "reading", "display", "wrong", "fluctuating"],
        reason: "Automation faults often need proof whether the machine is bad or the measurement path is bad.",
        checks: [
          "Verify with local gauge, thermometer, sight glass or independent portable instrument.",
          "Check sensor supply voltage, terminal tightness, moisture and cable damage.",
          "Compare raw signal/current with displayed value if safe and authorized.",
          "Trend the reading during steady condition to identify noise/dropout."
        ],
        proves: "Local value normal but signal abnormal confirms sensor/cable/input path."
      },
      {
        label: "Motor starter / breaker / overload problem",
        keywords: ["motor", "breaker", "trip", "overload", "contactor", "mccb", "vfd", "start"],
        reason: "Trips may come from true mechanical overload, phase loss, earth fault, bad contactor, overload setting or VFD fault.",
        checks: [
          "Check trip flag/code and motor current per phase before resetting repeatedly.",
          "Verify driven machine rotates freely and valves/dampers are not blocked.",
          "Check insulation/earth fault only with correct isolation and ETO procedure.",
          "Inspect contactor, overload and terminals for heat marks/loose connections."
        ],
        proves: "High current with mechanical resistance confirms load; normal load with protection trip points to electrical/protection path."
      },
      {
        label: "Control logic / interlock not satisfied",
        keywords: ["interlock", "plc", "not start", "permissive", "remote", "auto", "logic"],
        reason: "A machine may be healthy but blocked by a permissive: pressure, level, valve feedback, E-stop, local/remote or standby logic.",
        checks: [
          "List all start permissives and check each local feedback.",
          "Confirm local/remote selector, E-stop, control air and valve position feedback.",
          "Check PLC input status against actual switch state if authorized.",
          "Avoid forcing logic; find the missing permissive."
        ],
        proves: "One missing feedback/permissive explains no-start without mechanical fault."
      }
    ],
    stopCriteria: [
      "Arc flash risk, burning smell, repeated breaker trip, earth fault on essential system, unknown interlock bypass request, or no authorization.",
      "A displayed sensor fault conflicts with physical unsafe condition."
    ],
    manualNeeds: [
      "Electrical drawings, I/O list and cause/effect chart.",
      "Protection settings and VFD/PLC fault code list.",
      "Calibration range for transmitter/sensor."
    ]
  },
  {
    id: "general",
    title: "General first-principles diagnosis",
    keywords: ["unknown", "other", "general", "problem", "fault", "alarm", "temperature", "pressure", "vibration", "leak", "noise", "not working"],
    safety: generalSafety,
    questions: [
      "What changed immediately before the fault appeared?",
      "Which reading is abnormal compared with normal trend?",
      "Is the fault real locally, or only shown on automation?",
      "Does standby/parallel equipment show the same problem?"
    ],
    causeGroups: [
      {
        label: "Flow/pressure fault",
        keywords: ["pressure", "flow", "low", "high", "pump", "blocked", "filter", "strainer", "valve"],
        reason: "Pressure/flow faults reduce to restriction, leakage, pump/source weakness, wrong valve lineup, air ingress or bad sensor.",
        checks: [
          "Check valve lineup and local pressure before/after filters or coolers.",
          "Compare source pressure with consumer pressure.",
          "Use standby equipment if available to separate machine fault from system fault.",
          "Verify sensor with local gauge."
        ],
        proves: "Differential pressure, standby comparison and local gauge prove restriction/source/sensor direction."
      },
      {
        label: "Temperature fault",
        keywords: ["temperature", "hot", "overheat", "cooling", "cooler", "load"],
        reason: "Temperature rises from overload, poor cooling/flow, fouling, combustion/friction, wrong control valve or sensor error.",
        checks: [
          "Compare inlet/outlet temperatures and flow indicators.",
          "Reduce load if temperature is rising toward a trip limit.",
          "Check cooling medium pressure/temperature and control valve position locally.",
          "Verify the sensor with an independent instrument if readings are doubtful."
        ],
        proves: "Temperature drop after load/flow correction identifies cause group."
      },
      {
        label: "Vibration/noise/leak fault",
        keywords: ["vibration", "noise", "leak", "bearing", "seal", "coupling"],
        reason: "Mechanical faults need early stop decisions to prevent secondary damage.",
        checks: [
          "Check if vibration/noise is new, increasing or linked to load/speed.",
          "Inspect foundation, coupling, bearing temperature and leakage from a safe position.",
          "Stop if severe, then inspect under LOTO.",
          "Compare with standby machine if safe."
        ],
        proves: "Load/speed relation, bearing heat or standby comparison separates alignment/bearing/seal/process causes."
      },
      {
        label: "Control/sensor fault",
        keywords: ["sensor", "automation", "remote", "alarm", "display", "wrong", "signal", "interlock"],
        reason: "Many unexplained faults are bad feedback, stuck actuator, missing permissive or noisy signal.",
        checks: [
          "Verify the actual process locally.",
          "Check actuator position, control air/power supply and feedback switch.",
          "Compare local/manual mode if allowed by SMS.",
          "Check trend for spikes/dropouts."
        ],
        proves: "Local process normal but signal abnormal confirms control/sensor path."
      }
    ],
    stopCriteria: [
      "Unknown fault is worsening, safety limit is unknown, or the next check requires opening live/hot/pressurized equipment.",
      "Any fire, flooding, steering, propulsion, blackout, toxic gas, high-pressure fuel/hydraulic or electrical hazard."
    ],
    manualNeeds: [
      "Normal operating limits and trip values.",
      "Cause/effect or interlock list.",
      "Maker maintenance procedure before opening equipment."
    ]
  }
];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9α-ωάέήίόύώϊϋΐΰ°./ -]+/gi, " ");
}

function combinedCaseText(input: TroubleshootingCaseInput) {
  return normalize([
    input.equipment,
    input.alarm,
    input.symptom,
    input.readings,
    input.recentWork,
    input.checked,
    input.urgency
  ].filter(Boolean).join(" "));
}

function scoreKeywords(text: string, keywords: string[]) {
  return keywords.reduce((score, keyword) => {
    const key = normalize(keyword).trim();
    if (!key) return score;
    if (text.includes(key)) return score + Math.max(2, key.length / 4);
    const words = key.split(/\s+/).filter(Boolean);
    return score + words.filter(word => word.length > 3 && text.includes(word)).length;
  }, 0);
}

function recordText(record: TroubleshootingRecord) {
  return normalize([
    record.category,
    record.makeModel,
    record.component,
    record.faultSymptom,
    ...(record.possibleCauses || []),
    ...(record.troubleshootingSteps || []),
    ...(record.safetyPrecautions || [])
  ].filter(Boolean).join(" "));
}

function uniq(items: string[], limit = 8) {
  return Array.from(new Set(items.filter(Boolean))).slice(0, limit);
}

function choosePack(text: string) {
  const scored = expertPacks
    .map(pack => ({ pack, score: scoreKeywords(text, pack.keywords) }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score > 1 ? scored[0] : { pack: expertPacks[expertPacks.length - 1], score: 0 };
}

function rankCauseGroups(pack: ExpertPack, text: string) {
  const ranked = pack.causeGroups
    .map(group => ({ group, score: scoreKeywords(text, group.keywords) }))
    .sort((a, b) => b.score - a.score);

  const matched = ranked.filter(item => item.score > 0).map(item => item.group);
  return (matched.length ? matched : ranked.map(item => item.group)).slice(0, 4);
}

function rankRecords(records: TroubleshootingRecord[], text: string) {
  return records
    .map(record => {
      const haystack = recordText(record);
      const words = text.split(/\s+/).filter(word => word.length > 3);
      const score = words.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0);
      return { record, score };
    })
    .filter(item => item.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.record);
}

function buildSummary(input: TroubleshootingCaseInput, pack: ExpertPack, causes: CauseGroup[], records: TroubleshootingRecord[]) {
  const symptom = input.symptom || input.alarm || "reported abnormal condition";
  const mainCause = causes[0]?.label || "system fault";
  const recordHint = records[0] ? ` Closest database match: ${records[0].component}.` : "";
  return `Treat this as a ${pack.title.toLowerCase()} case. Start by proving whether ${mainCause.toLowerCase()} is present, while keeping the equipment safe.${recordHint} Manuals are only needed for exact limits and disassembly/reset steps.`;
}

function buildMissingQuestions(input: TroubleshootingCaseInput, pack: ExpertPack) {
  const questions: string[] = [];
  if (!input.equipment.trim()) questions.push("Which equipment, maker/model and unit number is affected?");
  if (!input.alarm.trim()) questions.push("What is the exact alarm text/code and time of first alarm?");
  if (!input.readings.trim()) questions.push("What are the current readings compared with normal trend?");
  if (!input.recentWork.trim()) questions.push("What changed recently: maintenance, filter change, fuel change, valve operation, blackout, weather/load change?");
  if (!input.checked.trim()) questions.push("What has already been checked, and what changed after each check?");
  return uniq([...questions, ...pack.questions], 7);
}

function buildChecks(input: TroubleshootingCaseInput, causes: CauseGroup[], records: TroubleshootingRecord[]) {
  const base = [
    "Confirm the alarm/reading locally with an independent indication where possible.",
    "Make the system safe before touching anything: correct PPE, communication, LOTO/permit if required.",
    "Compare with normal trend, sister unit, standby equipment, or adjacent cylinder/machine at the same load."
  ];
  const causeChecks = causes.flatMap(cause => cause.checks);
  const recordChecks = records.flatMap(record => record.troubleshootingSteps || []).slice(0, 5);
  const close = [
    "Change only one variable at a time and record the result.",
    "If a check requires opening hot, live, rotating or pressurized machinery, stop and use the maker/SMS procedure."
  ];
  return uniq([...base, ...causeChecks, ...recordChecks, ...close], 12);
}

function buildDrafts(input: TroubleshootingCaseInput, planTitle: string, causes: CauseGroup[], checks: string[]) {
  const now = new Date().toISOString();
  const likely = causes.map(cause => cause.label).join("; ");
  const logbookDraft = [
    `Time: ${now}`,
    `Case: ${planTitle}`,
    `Equipment: ${input.equipment || "not specified"}`,
    `Alarm/symptom: ${input.alarm || input.symptom || "not specified"}`,
    `Readings: ${input.readings || "not recorded"}`,
    `Recent work/change: ${input.recentWork || "not recorded"}`,
    `Already checked: ${input.checked || "not recorded"}`,
    `Likely directions: ${likely}`,
    `Next safe checks: ${checks.slice(0, 4).join(" | ")}`
  ].join("\n");

  const defectDraft = [
    `DEFECT / TROUBLESHOOTING NOTE`,
    `Equipment: ${input.equipment || "TBC"}`,
    `Fault: ${input.alarm || input.symptom || "TBC"}`,
    `Risk: ${input.urgency === "critical" ? "Critical - immediate escalation" : input.urgency === "urgent" ? "High - monitor and escalate if worsening" : "Operational - continue controlled diagnosis"}`,
    `Suspected causes: ${likely}`,
    `Evidence/readings: ${input.readings || "TBC"}`,
    `Actions already taken: ${input.checked || "TBC"}`,
    `Recommended next action: ${checks[0] || "Verify locally and follow maker/SMS procedure."}`,
    `Manual/OEM info needed: exact limits, reset/disassembly procedure, calibration data.`
  ].join("\n");

  return { logbookDraft, defectDraft };
}

function buildAiPrompt(input: TroubleshootingCaseInput, pack: ExpertPack, causes: CauseGroup[], checks: string[], records: TroubleshootingRecord[]) {
  return [
    "Act as a careful Chief Engineer helping with real shipboard troubleshooting. Do not assume the manual has this exact fault. Use first-principles reasoning, ask missing questions first, and keep safety/LOTO before invasive checks.",
    "",
    `Equipment/system: ${input.equipment || pack.title}`,
    `Alarm text/code: ${input.alarm || "not provided"}`,
    `Main symptom: ${input.symptom || "not provided"}`,
    `Readings/trends: ${input.readings || "not provided"}`,
    `Recent work/change: ${input.recentWork || "not provided"}`,
    `Already checked: ${input.checked || "not provided"}`,
    `Urgency: ${input.urgency}`,
    "",
    `Offline expert pack matched: ${pack.title}`,
    `Likely cause groups: ${causes.map(cause => cause.label).join(", ")}`,
    `Closest built-in records: ${records.map(record => `${record.component} - ${record.faultSymptom}`).join(" | ") || "none"}`,
    "",
    "Give me:",
    "1. Immediate safety actions.",
    "2. Questions you need answered before invasive work.",
    "3. Ranked likely causes with reasoning.",
    "4. Checks in the safest order, including what reading proves/disproves each cause.",
    "5. When to stop and escalate to Chief Engineer/OEM.",
    "",
    `Starting checks already suggested by offline engine: ${checks.slice(0, 8).join(" | ")}`
  ].join("\n");
}

export function buildDiagnosticPlan(input: TroubleshootingCaseInput, records: TroubleshootingRecord[]): DiagnosticPlan {
  const text = combinedCaseText(input);
  const { pack, score } = choosePack(text);
  const likelyCauses = rankCauseGroups(pack, text);
  const matchedRecords = rankRecords(records, text);
  const title = input.equipment || input.alarm || input.symptom || "New troubleshooting case";
  const immediateSafety = uniq([
    ...(input.urgency === "critical" ? ["Critical case: inform bridge/Chief Engineer now and stabilize the plant before diagnosis."] : []),
    ...pack.safety,
    ...matchedRecords.flatMap(record => record.safetyPrecautions || []).slice(0, 4),
    ...generalSafety.slice(0, 2)
  ], 9);
  const missingQuestions = buildMissingQuestions(input, pack);
  const checksInOrder = buildChecks(input, likelyCauses, matchedRecords);
  const manualNeeds = uniq([...pack.manualNeeds, ...matchedRecords.map(record => `${record.makeModel}: exact limits/procedure for ${record.component}`)], 7);
  const stopCriteria = uniq([...pack.stopCriteria, ...generalSafety.slice(3)], 7);
  const { logbookDraft, defectDraft } = buildDrafts(input, title, likelyCauses, checksInOrder);
  const confidence: DiagnosticPlan["confidence"] = score > 8 || matchedRecords.length > 0 ? "High" : score > 2 ? "Medium" : "Low";
  const summary = buildSummary(input, pack, likelyCauses, matchedRecords);
  const aiPrompt = buildAiPrompt(input, pack, likelyCauses, checksInOrder, matchedRecords);

  return {
    title,
    packTitle: pack.title,
    confidence,
    summary,
    immediateSafety,
    missingQuestions,
    likelyCauses,
    checksInOrder,
    matchedRecords,
    manualNeeds,
    stopCriteria,
    logbookDraft,
    defectDraft,
    aiPrompt
  };
}
