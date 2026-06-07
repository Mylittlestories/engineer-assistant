import { TroubleshootingRecord } from "./types";

export const troubleshootingDatabase: TroubleshootingRecord[] = [
  // ==================== 2-STROKE PROPULSION ENGINES ====================
  {
    id: "2s-man-01",
    category: "2-Stroke Propulsion",
    makeModel: "MAN B&W ME-C / MC-C series",
    component: "Crankcase Assembly & Bearings",
    faultSymptom: "High Crankcase Oil Mist / Mist Detector Alarm Activation",
    possibleCauses: [
      "Overheating of main bearing, crankpin bearing, or crosshead guide shoes.",
      "Piston blow-by leaking hot combustion gases into the crankcase.",
      "Frictional overheating of the piston rod stuffing box garter rings.",
      "Malfunctioning of the Graviner oil mist detector unit or fouled sample tubes."
    ],
    troubleshootingSteps: [
      "Immediately notify the bridge and reduce main engine RPM to slow down frictional heat development.",
      "Check the oil mist detector (OMD) display to identify which crankcase compartment has high mist concentration.",
      "Verify auxiliary indicators: Monitor main bearing, crankpin bearing, and crosshead temperatures if sensors are fitted.",
      "Keep a safe distance from the crankcase explosion relief valves; do NOT stand in their direct path.",
      "Let the engine cool down for at least 20 to 30 minutes before taking further actions. Do NOT open any crankcase doors yet to prevent fresh air ingress, which can trigger a catastrophic crankcase explosion."
    ],
    safetyPrecautions: [
      "DANGER: Opening doors prematurely introduces oxygen into a flammable fuel-air-heat mixture, leading to severe explosions.",
      "Apply the 30-minute cooling rule.",
      "Verify the engine is on turning gear during inspections if safe.",
      "Wear full personal protective equipment (PPE) including safety goggles and thermal overalls."
    ],
    difficulty: "High"
  },
  {
    id: "2s-man-02",
    category: "2-Stroke Propulsion",
    makeModel: "MAN B&W MC-C Propulsion",
    component: "Exhaust Valve Assembly",
    faultSymptom: "Exhaust Gas High Temperature and Single Cylinder Deviation Alarm",
    possibleCauses: [
      "Pneumatic air spring pressure loss, leading to slow or incomplete valve closure.",
      "Fouling of exhaust valve seat or spindle face with carbon deposits (heavy fuel oil ash).",
      "Leaking or sticking exhaust valve high-pressure hydraulic actuator.",
      "Damaged or worn piston rings on the corresponding cylinder, resulting in compression loss."
    ],
    troubleshootingSteps: [
      "Check the sealing air pressure and hydraulic pump oil pressure to the exhaust valves.",
      "Check the exhaust valve stroke sensor signal on the AMS (Alarm Monitoring System) to verify valve timings.",
      "Perform a 'Pmax/Pcomp' combustion analysis using a cylinder indicator instrument or electronic pressure analyzer.",
      "Verify cylinder lubrication rate and scavenge port condition if a port inspection was completed recently.",
      "If the exhaust gas temperature exceeds the safety threshold limits (usually >450°C), cut out the fuel injection to that specific cylinder and prepare to overhaul the exhaust valve at the next port of call."
    ],
    safetyPrecautions: [
      "Exhaust valve housings operate at extremely high temperature; avoid touching bare parts.",
      "Isolate hydraulic oil supply and control air supply before performing any hands-on inspection."
    ],
    difficulty: "Medium"
  },
  {
    id: "2s-man-03",
    category: "2-Stroke Propulsion",
    makeModel: "MAN B&W ME-B / ME-C series",
    component: "Scavenge Space",
    faultSymptom: "Scavenge Box Temperature High / Scavenge Fire Alarm",
    possibleCauses: [
      "Excessive blow-by of hot gases past worn, sticking or broken piston rings.",
      "Accumulation of unburnt cylinder lubricating oil and fuel in the scavenge space due to fuel injector dripping.",
      "Overloading of the cylinder due to faulty fuel injection timing or worn fuel valve nozzles.",
      "Fouled scavenge air cooler and water mist catcher leading to poor air flow."
    ],
    troubleshootingSteps: [
      "Immediately notify the bridge and stop or slowly reduce engine speed to dead slow.",
      "Cut out the fuel injection to the affected cylinder to stop supplying heat.",
      "Increase cylinder lubrication feed rate to the maximum rate to prevent piston seizure.",
      "Locate the scavenge fire drain valves and close them to prevent fire from propagating to the engine room floor.",
      "Inject CO2 or dry powder through the auxiliary scavenge space extinguishing connections if the temperature continues to rise rapidly.",
      "Verify that the auxiliary blowers are stopped to prevent fresh oxygen from feeding the fire."
    ],
    safetyPrecautions: [
      "Never attempt manual open-door inspection during a scavenge fire.",
      "Wear heat-resistant safety gloves and breathing apparatus if smoke is detected in the engine room floor.",
      "Check fire-fighting station readiness."
    ],
    difficulty: "High"
  },
  {
    id: "2s-sulzer-01",
    category: "2-Stroke Propulsion",
    makeModel: "Wärtsilä / Sulzer RT-flex series",
    component: "Common Rail System",
    faultSymptom: "Fluctuations in Fuel Rail Pressure / FlexView Error",
    possibleCauses: [
      "Malfunctioning flow control valves (WECS-9520 controller signals) driving the hydraulic rail-valve actuator.",
      "Internal leakage in three-way control valves of the fuel electro-hydraulic injectors.",
      "Leaking high-pressure supply pumps (unidirectional or double-acting radial reciprocating pumps).",
      "Air pockets in the fuel rail or failure in pressure transducer signal cables."
    ],
    troubleshootingSteps: [
      "Monitor the rail pressure feedback curves on the main control desk FlexView terminal.",
      "Verify fuel pump actuators' hydraulic linkages and look for visible diesel leaks from HP pipes.",
      "Purge the fuel high-pressure circuit using the manual bleed bolts on the suction and rail headers.",
      "Switch over/clean the fuel oil auto-backwash filter to verify no flow restriction on the suction side.",
      "Inspect electrical connections at the rail pressure sensors and solenoid valves for vibration-induced wire breaks."
    ],
    safetyPrecautions: [
      "Warning: Common-rail fuel lines occupy pressures above 1000 bar. NEVER crack open fittings while the rail is pressurized.",
      "Wear full-face protective shield during inspection of hot high-pressure diesel lines to prevent oil penetration injuries."
    ],
    difficulty: "High"
  },
  {
    id: "2s-sulzer-02",
    category: "2-Stroke Propulsion",
    makeModel: "Wärtsilä Sulzer RTA series",
    component: "Servo Oil & Lubricating System",
    faultSymptom: "Servo Oil Pump Low Discharge Pressure Alarm",
    possibleCauses: [
      "Inadequate suction pressure of system oil feeding the servo pumps.",
      "Clogged servo oil automatic backwash filter or fine duplex safety filters.",
      "Wear on the swashplate or piston elements of the axial piston servo pumps.",
      "Pressure regulating valve (proportional valve) stickiness or electrical driver fault."
    ],
    troubleshootingSteps: [
      "Verify that the inlet system oil pressure to the servo pumps is within 2.5 to 3.5 bar range.",
      "Clean or inspect the servo oil safety duplex filters for metallic particles, which indicate internal wear.",
      "Operate the standby servo oil pump if pressure drops below manual trigger (usually 45-60 bar).",
      "Verify WECS-9520 system electrical output signals to the pilot proportional valve coil using a multimeter.",
      "Perform a physical check on pump bypass lines to ensure there is no leak back to the sump."
    ],
    safetyPrecautions: [
      "Servo hydraulic oil runs at pressures up to 200 bar. Secure all fittings and do not stand close to high-pressure flanges."
    ],
    difficulty: "Medium"
  },

  // ==================== 4-STROKE DIESEL GENERATORS ====================
  {
    id: "4s-yanmar-01",
    category: "4-Stroke Generator",
    makeModel: "Yanmar EY26 / EY18 series",
    component: "Governor & Fuel Control Linkage",
    faultSymptom: "Engine Hunting / Unstable Load and Frequency Fluctuations",
    possibleCauses: [
      "Air bubbles trapped inside the fuel injection pump suction galleries or fuel supply line.",
      "Mechanical governor linkage sticking, tight, or has excessive backlash due to wear.",
      "Water content in the Marine Gas Oil (MGO) or Heavy Fuel Oil (HFO).",
      "Electronic governor actuator coil degradation or dirty magnetic pick-up speed sensor."
    ],
    troubleshootingSteps: [
      "Inspect the governor/fuel control linkage for smooth movement. Apply heat-resistant dry lube if tight.",
      "Bleed air from the fuel filters, fuel injection pump manifolds, and return lines using the priming valves.",
      "Inspect the oil level, condition, and oil specification in the woodward hydraulic governor (if equipped).",
      "Clean the magnetic pick-up speed sensor tip located near the flywheel ring gear and re-verify the sensor gap (usually 1.0 to 1.5mm).",
      "Drain water from the auxiliary service and settling fuel oil tanks via the self-closing drain valves."
    ],
    safetyPrecautions: [
      "Never block governor linkages by hand when the engine is running or when syncing to the MSB (Main Switchboard)."
    ],
    difficulty: "Medium"
  },
  {
    id: "4s-daihatsu-01",
    category: "4-Stroke Generator",
    makeModel: "Daihatsu DK-20 / DK-28 series",
    component: "Lubricating Oil System",
    faultSymptom: "Low Lubricating Oil Inlet Pressure to Bearings",
    possibleCauses: [
      "Clogging of the main lubricating oil automatic backwash duplex filter.",
      "Main engine-driven gear-type lubricating oil pump cavitation or internal wear.",
      "Thermostatic valve sticking in fully open-by-pass position, overheating the LO and dropping viscosity.",
      "Suction pipe leak in the oil sump allowing air suction."
    ],
    troubleshootingSteps: [
      "Verify actual pressure on the mechanical pressure gauge directly mounted on the engine manifold (crosscheck with remote sensor).",
      "Instantly switch to the manual standby LO pump and start it to avoid automatic generator trip.",
      "Verify the automatic backwash filter differential pressure. If high, force a manual blowdown and isolate to clean.",
      "Control the fresh water cooling valve to lower the LO sump temperature back to design limits (45-55°C).",
      "Take a sample of crankcase oil to perform a quick visual check for viscosity breakdown or water dilution."
    ],
    safetyPrecautions: [
      "If oil pressure falls below 1.2 bar, press emergency stop; running with dry journals leads to crankshaft damage and crankcase explosion."
    ],
    difficulty: "Medium"
  },
  {
    id: "4s-yanmar-02",
    category: "4-Stroke Generator",
    makeModel: "Yanmar / Daihatsu Generators",
    component: "Cooling Water System",
    faultSymptom: "High Jacket Cooling Water Temperature Alert",
    possibleCauses: [
      "Faulty thermostatic valve (Wax type or pneumatic type) failing to expand/redirect water to the central cooler.",
      "Fouling on secondary sea-water side of plate heat exchanger.",
      "Broken impellers or slip on the jacket water recirculation centrifugal pump shaft.",
      "Loss of cooling expansion tank head, allowing air locks in the cylinder heads."
    ],
    troubleshootingSteps: [
      "Top up the cooling water expansion tank and bleed air from the vented cylinder heads.",
      "Manually override the thermostatic override linkage to direct 100% jacket water flow into the cooler.",
      "Check auxiliary sea water pressure to the main coolers. If low, start standby SW pump.",
      "Measure inlet and outlet temperature of the freshwater and seawater across the cooler using an infrared thermometer to verify thermal efficiency.",
      "Reduce load on the generator by transferring kilowatt/amperage allocation to another running alternator."
    ],
    safetyPrecautions: [
      "Never open thermal expansion tank pressure caps when steam is discharging or water is bubbling. High temperature steam will erupt."
    ],
    difficulty: "Easy"
  },
  {
    id: "4s-wartsila-01",
    category: "4-Stroke Generator",
    makeModel: "Wärtsilä 20 series",
    component: "Fuel Injection Valve",
    faultSymptom: "Black Smoke Emission and High Exhaust Gas Temperature on Single cylinder",
    possibleCauses: [
      "Fouled fuel injector nozzle holes or carbon crown formation (carbon trumpet).",
      "Broken or fatigued injector nozzle tension spring, lowering injection pressure.",
      "Eroded injector spindle needle guide leading to fuel dripping.",
      "Leaking high-pressure fuel sleeve connection inside cylinder head cover."
    ],
    troubleshootingSteps: [
      "Locate the high-temperature cylinder line and isolate/shut off the high-pressure fuel pump fuel rack.",
      "Record the exhaust gas temperature change after dropping fuel supply to double-confirm the fault.",
      "Stop the generator engine, follow lockdown and tagging procedures.",
      "Pull out the faulty injector assembly using official Wärtsilä hydraulic extraction tools.",
      "Test the injector on the workshop test bench for popping pressure (design limit), needle sealing efficiency, and spray pattern. Overhaul with new nozzle tip."
    ],
    safetyPrecautions: [
      "Be careful of high velocity fuel sprays. Diesel penetrating under-skin tissue causes dangerous blood poisoning.",
      "Wear protective safety visor during pressure bench tests."
    ],
    difficulty: "Medium"
  },

  // ==================== AUXILIARY MACHINERY ====================
  {
    id: "aux-boiler-01",
    category: "Auxiliary Machinery",
    makeModel: "Aalborg / Mission / Kangrim Auxiliary Boiler",
    component: "Burner Assembly & Flame Sensor",
    faultSymptom: "Flame Failure during Ignition Cycle / Photocell Trip",
    possibleCauses: [
      "Dirty, soot-coated, or damaged photocell flame receptor lens.",
      "Improper fuel-to-air combustion ratio (too much primary air blowing the flame front away).",
      "Heavy fuel oil temperature too low at the burner manifold, resulting in poor atomization.",
      "Carbon deposition build-up on the ignition electrodes, grounding the high-voltage spark."
    ],
    troubleshootingSteps: [
      "Isolate the boiler control panel and carefully pull out the photocell. Wipe the glass lens clean of oil drops and soot.",
      "Verify the ignition HV electrodes' spatial gap (generally 2 to 3mm spacing) and wipe clean of grease/fuel crusts.",
      "Verify clean flow through the heavy fuel oil burner oil heaters and check that fuel recirculation temp is around 110-130°C.",
      "Purge the boiler combustion chamber using the forced draft fan for 2-3 minutes to clear flammable gas remnants before retrying ignition."
    ],
    safetyPrecautions: [
      "DANGER: Never manually override burner ignition or hold spark buttons repeatedly without absolute purging. Unburnt fuel vapor accumulation cause boiler furnace gas explosions (puff-backs)."
    ],
    difficulty: "Medium"
  },
  {
    id: "aux-ows-01",
    category: "Auxiliary Machinery",
    makeModel: "Jowa / Deckma / Alfa Laval OWS",
    component: "Oily Water Separator & 15ppm Monitor",
    faultSymptom: "15ppm Bilge Alarm Trigger / 3-Way Recirculation Valve Stuck on Sump Recirc",
    possibleCauses: [
      "Coalescer filter element or oil absorption cartridge saturated with mud, rust, and heavy oils.",
      "High detergent concentration (emulsified oils) in the bilge water holding tank.",
      "Dirty sample cell glass tube in the Deckma 15ppm monitor, causing false optical readings.",
      "Malfunctioning 15ppm discharge solenoids or air-driven three-way valve diaphragm."
    ],
    troubleshootingSteps: [
      "Check the 15ppm monitor display for status. Open the flushing valve to supply clean domestic freshwater to verify if readings drop below 15ppm (confirms cell cleanliness).",
      "If water continues high on clean stream, disassemble the sample lens chamber and scrub inside with the soft fiber brush using liquid soap.",
      "Ensure Bilge water is not treated with heavy household soap, which breaks up normal separation; switch suction to clean bilge sector.",
      "Unscrew first-stage mechanical coalescer filter housing and rinse/clean or replace inner fibrous elements.",
      "Verify air command lines feed correct pneumatics to the 2-way bilge-to-discharge and bilge-to-recirculation solenoid valve sets."
    ],
    safetyPrecautions: [
      "Strict legal warning: Do not attempt to bypass, loop, or block the 15ppm recorder line. Any manipulation carries extreme MARPOL fines and imprisonment.",
      "Wear protective chemicals-grade nitrile gloves when handling nasty chemical bilge oils."
    ],
    difficulty: "Medium"
  },
  {
    id: "aux-inc-01",
    category: "Auxiliary Machinery",
    makeModel: "TeamTec / Atlas Incinerator",
    component: "Combustion Chamber & Sludge Burner",
    faultSymptom: "High Flue Gas Temperature Alarm / Flame Sudden Shutdown",
    possibleCauses: [
      "Sludge water-content too low, feeding highly volatile light chemical oil in sludge tank.",
      "Broken refractory lining insulation block collapsing into the primary chamber floor.",
      "Defective exhaust draft fan or choked flue gas damper restrictor plate.",
      "Sludge dosing pump speed too high, causing excessive sludge volumetric flow rate."
    ],
    troubleshootingSteps: [
      "Reduce the dosing pump speed settings to limit fuel feed rate to the incinerator combustion nozzle.",
      "Examine flue gas damper status and ensure negative pressure inside the incinerator is within normal range (-5 to -15 Pa).",
      "Clean out secondary air inlet dampers with a metal brush to facilitate cold air draft mixing.",
      "Shutdown sludge circulation, allow incinerator to cool to ambient room temperature before inspecting refractory bricks for damage."
    ],
    safetyPrecautions: [
      "Incinerator shell operates above 800°C. Do not operate ports or handles while hot.",
      "Ensure ash removal is only done using appropriate dust masks to avoid toxic heavy-metal ash inhalation."
    ],
    difficulty: "Medium"
  },
  {
    id: "aux-pumps-01",
    category: "Auxiliary Machinery",
    makeModel: "Shinko / Taiko Kikai Centrifugal Pumps",
    component: "Seawater Cooling Centrifugal Pump",
    faultSymptom: "Centrifugal Pump Loss of Suction / Pressure Fluctuations / No Flow",
    possibleCauses: [
      "Air ingress into pump casing via dried mechanical shaft seal or loose gland packing.",
      "Suction sea chest strainer heavily choked with fish, marine growth, or plastic debits.",
      "Defective central priming system (vacuum pump or air-ejector failing to extract air).",
      "Cavitation due to oversized flow rate or high sea-water inlet temperatures."
    ],
    troubleshootingSteps: [
      "Check suction and discharge pressure gauges. Low pressure with fluctuating needle suggests air locks.",
      "Open the venting petcock on the top of the pump volute casing to release trapped air until a solid, steady stream of seawater discharges.",
      "Change over/isolate the ship sea-chest valves (high chest to low chest or vice-versa) and clean the sea basket strainer.",
      "Check prime device air solenoids to ensure vacuum is generated on high start-up.",
      "Examine the mechanical shaft seal for continuous dripping of water (more than 1 drop per second indicates degradation)."
    ],
    safetyPrecautions: [
      "Isolate electricity (lock-out tag-out at MSB) before any close rotating shaft inspection.",
      "Ensure suction/discharge isolation valves are secured in case of pump housing maintenance."
    ],
    difficulty: "Easy"
  },
  {
    id: "aux-purifier-01",
    category: "Auxiliary Machinery",
    makeModel: "Alfa Laval S-type / Westfalia Separators",
    component: "Bowl Outer Shell & De-sludging Valve",
    faultSymptom: "No Discharge / Clean Fuel Escaping through Water/Sludge Outlet (Broken Interface)",
    possibleCauses: [
      "Defective gravity disc/discharge ring size (wrong selection for oil density).",
      "Damaged or stiff main lubricating bowl sealing rings (O-rings) failing to seal during hydraulic closing block.",
      "Insufficient sealing water flow pressure to force bowl sealing ring up.",
      "Fouling of bowl disc stack with severe asphaltic compounds, choking oil passage."
    ],
    troubleshootingSteps: [
      "Check supply of hydraulic sealing water (operating water tank level and pressure feed gauge).",
      "Measure viscosity and density of incoming fuel. Utilize correct gravity disc selection tables specified in operating manual.",
      "Perform manual de-sludge cycle (shooting the bowl) to clear possible temporary sediment blockages.",
      "If failure persists, completely shutdown supply, apply mechanical friction brake to stop bowl rotation.",
      "Disassemble and wash the complete bowl block, clean individual steel plates in chemical wash bath and replace major bowl periphery rubber seals."
    ],
    safetyPrecautions: [
      "High kinetic warning: Alfa Laval purifiers rotate at up to 10,000 RPM. NEVER attempt to open hoods or apply brakes when high centrifugal vibration is felt.",
      "Ensure bowl is at an absolute standstill (verify via speed pin gauge) before unlocking hood bolts."
    ],
    difficulty: "High"
  },
  {
    id: "aux-comp-01",
    category: "Auxiliary Machinery",
    makeModel: "Sperre / Tanabe reciprocating air compressors",
    component: "High Pressure Pistons & Cooler",
    faultSymptom: "Slow Charging Time and Choked Delivery Temperature",
    possibleCauses: [
      "Leaking or heavily carbon-coated reed suction/delivery valves on the 2nd stage head.",
      "Worn piston rings leading to combustion-like blowback into the crank sump.",
      "Air cooler tubes blocked with saltwater calcification (lime scalings), reducing inter-cooler cooling.",
      "Suction air filter element plugged with oil mist and dust."
    ],
    troubleshootingSteps: [
      "Shut off automatic high pressure line and drain intermediate block connections.",
      "Disassemble the stage-1 and stage-2 valve cover plates, extract valve seats and inspect for copper fractures or carbon blocks. Clean using fine solvent.",
      "Wash water cooling tubes of the compressor cooler block using mild chemical descaling acid if water flow is restricted.",
      "Measure charging duration to air bottles (standard recharge must take less than 30 minutes from 15 bar to 30 bar)."
    ],
    safetyPrecautions: [
      "Compressor lines occupy 30 bar. Fully drain all auxiliary valves before cracking any connection bolts."
    ],
    difficulty: "Medium"
  },
  {
    id: "aux-bwts-01",
    category: "Auxiliary Machinery",
    makeModel: "Alfa Laval PureBallast / Wärtsilä AQUARIUS BWTS",
    component: "UV Reactor & Quartz Sleeves",
    faultSymptom: "UV Intensity / Sensor Transmission Low (Below 45% Limit)",
    possibleCauses: [
      "Inorganic scaling (calcium carbonate) or organic bio-fouling forming on the quartz warning sleeves.",
      "Turbid ballast intake water containing high suspended sediments (such as in river ports, dredging areas).",
      "Aging/lifetime degradation of high-intensity ultraviolet combustion lamps.",
      "Chemical fouling of the reference UV sensor lens plate."
    ],
    troubleshootingSteps: [
      "Initiate manual CIP (Clean-in-Place) cycle using the system's citric acid solution tank to chemical-wash quartz surfaces.",
      "If cleaning fails to raise UV intensity, completely drain the Reactor box, verify power lockout, and withdraw the UV lamp assemblies.",
      "Check quartz sleeves for physical fractures, pitting, or stubborn lime deposits. Scrub clean with soft towels soaked in descaling liquid.",
      "Calibrate the reference UV intensity sensor using domestic potable water on the measuring nozzle.",
      "If total burning hours of the active lamps exceed the threshold limit (typically 12,000 hrs), replace high-pressure lamps in pairs."
    ],
    safetyPrecautions: [
      "WARING: High UV light exposure causes immediate skin burns and permanent blindness. Never energize UV reactor covers during visual checks.",
      "Allow lamp assemblies to cool for 20 minutes before extraction; lamp internal temperatures exceed 600°C."
    ],
    difficulty: "Medium"
  },
  {
    id: "aux-bwts-02",
    category: "Auxiliary Machinery",
    makeModel: "Erma First / OceanSaver Electrolysis BWTS",
    component: "Electrolysis Chamber & Hydrogen Ventilation",
    faultSymptom: "Hydrogen Gas Concentration High Alarm in Electrolysis Room (Exceeding 1.0% LEL)",
    possibleCauses: [
      "Failure of the negative pressure hydrogen de-gassing blower fan or blocked exhaust ventilation outlets.",
      "Cracks or seal failures in the electrolytic cell electrode boundaries leaking free hydrogen gas.",
      "Extremely low seawater salinity causing excessive electrical voltage forcing water dissociation over design parameters.",
      "Faulty calibrated gas detector transmitter reading noise values."
    ],
    troubleshootingSteps: [
      "Immediately trip the electrolysis current grid and initiate system cooling seawater purge.",
      "Verify that the exhaust ventilation blower fan motor has not tripped at the motor control center (MCC).",
      "Inspect blower belts and verify damper exhaust doors are physically open to exhaust gas safely to the open deck.",
      "Verify seawater salinity levels (minimum 15 PSU required for direct electrolysis). Below parameters, engage salt-water injection pumps.",
      "Conduct pressure test on cell housings to identify saline/acid leaks. Perform zero-calibration checks on critical gas sensors."
    ],
    safetyPrecautions: [
      "DANGER: Hydrogen is highly explosive at low concentrations (LEL 4.0%). No smoking, hot work, or open flames are permitted anywhere near the BWTS boundaries.",
      "All replacement electrical components inside the room must carry official explosion-proof Ex-d certifications."
    ],
    difficulty: "High"
  },
  {
    id: "aux-bwts-03",
    category: "Auxiliary Machinery",
    makeModel: "Optimarin / Hyde Marine BWTS Filters",
    component: "Ballast Filter Backwash Unit",
    faultSymptom: "High Differential Pressure (>0.8 bar) & Constant Backwash Cycle Failure",
    possibleCauses: [
      "Extremely heavy sediment load at the intake source (shallow waters, delta regions).",
      "Wear or physical jamming of the internal rotational backwash hydraulic nozzle assembly.",
      "Failure of the pneumatic control actuator piloting the backwash sludge discharge valve.",
      "Backwash booster pump failure or low suction pressure of washing line."
    ],
    troubleshootingSteps: [
      "Examine the backwash pressure manifold. Verify that the sludge exhaust valve opens fully on signal.",
      "Verify the backwash booster pump pressure reads >2.5 bar above the reactor line pressure.",
      "In heavy silt harbors, reduce overall ballast pump flow rate (throttle discharge) to allow the backwash cycle to match incoming solids load.",
      "If backwash cycle completes but differential pressure remains high, isolate electrical and hydraulic supplies, open filter inspection cover.",
      "Inspect the fine mesh screen (usually 20-40 microns) for physical clogging, clay adherence, or wire deformation. Power-wash the mesh manually."
    ],
    safetyPrecautions: [
      "Isolate ballast line completely. High hydraulic pressure can cause line blowout and room flooding.",
      "Ensure proper lockout (LOTO) of the automatic backwash driving motor."
    ],
    difficulty: "Medium"
  },
  {
    id: "2s-man-04",
    category: "2-Stroke Propulsion",
    makeModel: "MAN B&W S60ME-C / G70ME-C series",
    component: "Cylinder Liner & Rings",
    faultSymptom: "High Cylinder Liner Temperature Deviation / Sudden Scuffing Warning",
    possibleCauses: [
      "Breakdown of cylinder oil lubricating film on the liner due to acidic condensation (cold corrosion).",
      "Under-dosage of cylinder lubricant or dirty, blocked lubrication injection quills.",
      "Cylinder oil feed rate set too low or poor distribution due to mechanical lubricator pump wear.",
      "Poor fuel injection atomization leading to direct fuel jet wash spray hitting the liner walls."
    ],
    troubleshootingSteps: [
      "Immediately reduce engine speed slightly and increase cylinder lubrication feed rate to 150% override.",
      "Monitor individual cylinder liner temperatures on the control console carefully for sudden upward spikes.",
      "Check the high pressure cylinder lubricator operation panel for any feed pump warning codes or feedback errors.",
      "At the next opportunistic stoppage, perform a scavenger space port inspection of the affected piston and liner.",
      "Examine the cylinder lining for bright scuffing stripes, micro-cracks, and look for broken or sticking rings."
    ],
    safetyPrecautions: [
      "Wear respiratory masks during port inspections to avoid highly acidic cylinder engine fumes.",
      "Ensure engine is secured on turning gear warning lock."
    ],
    difficulty: "High"
  },
  {
    id: "2s-sulzer-03",
    category: "2-Stroke Propulsion",
    makeModel: "Wärtsilä Sulzer RT-flex 50/60/84 series",
    component: "Exhaust Valve Control Unit (VCU)",
    faultSymptom: "VCU Solenoid Valve Feedback Failure / Failure to Open-Close Exhaust Valve",
    possibleCauses: [
      "Solenoid valve electrical coil failure or mechanical slide sticking due to carbonized system oil.",
      "Hydraulic accumulator nitrogen gas bladder deflated or leaking.",
      "Solenoid power supply cable damage or WECS control cabinet interface board fault.",
      "Excessive wear of mechanical actuator seals in the Valve Control Unit."
    ],
    troubleshootingSteps: [
      "Check WECS diagnostics terminal for active diagnostic error codes indicating specific solenoid feedback lines.",
      "Trace WECS control Cabinet 24V DC auxiliary power outputs to confirm voltage is supplied during opening commands.",
      "Measure resistance of the internal solenoid coils (standard reads between 18-24 Ohms). Replace if shorted.",
      "Check the pre-charge pressure of the nitrogen accumulator servicing the VCU system block (typically 120-140 bar). Re-charge if low.",
      "Physically trigger the manual solenoid override pins using the plastic pin tool to verify mechanical shifting."
    ],
    safetyPrecautions: [
      "Exercise extreme care under live common rail manifolds; exhaust valves shift with speed exceeding 1.2 m/s.",
      "Do not adjust nitrogen gas pre-charges without specialized pressure kit gauges."
    ],
    difficulty: "Medium"
  },
  {
    id: "aux-boiler-02",
    category: "Auxiliary Machinery",
    makeModel: "Kangrim / Aalborg D-Type Marine Boiler",
    component: "Feed Water Level Controller (Mobrey / DP Transmitter)",
    faultSymptom: "Water Level Low-Low Drum Trip / Combustion Lockout",
    possibleCauses: [
      "DP (Differential Pressure) level transmitter sensing lines choked with boiler magnetite/sludge.",
      "Feedwater control valve positioner diaphragm ruptured or solenoid pilot frozen.",
      "Auxiliary feedwater pump cavitating or air lock in main header section.",
      "High salinity concentration in boiler drum causing severe priming/foaming and false level signals."
    ],
    troubleshootingSteps: [
      "Immediately check local water level sight glass to confirm actual physical water level in the drum; NEVER trust transmitter values alone.",
      "If actual water level is fully visible and safe, manually override feedwater pump starter at MCC to raise level.",
      "Perform blowdown of the Mobrey column and transmitter sensing pots to flush out grease, boiler compound flakes, and mud.",
      "Check auxiliary pneumatic air lines feeding feedwater control valve. Confirm active actuator signal matches feed demand (4-20mA loop).",
      "Calibrate level transmitter zero and span bounds using domestic cool water benchmark calibration curves."
    ],
    safetyPrecautions: [
      "CRITICAL: If sight glass is completely empty, NEVER pump cold water into a hot, fired boiler drum. Doing so will cause instant catastrophic thermal collapse and boiler drum explosion.",
      "Let boiler cool naturally before adding safe reserve water. Apply emergency lock-out tag-out protocols on active burner circuit."
    ],
    difficulty: "High"
  },
  {
    id: "aux-ows-02",
    category: "Auxiliary Machinery",
    makeModel: "Deckma OMD-2005 / OMD-24 Bilge Alarm",
    component: "15ppm Oil-in-Water Sensor Module",
    faultSymptom: "Fouled Glass Core Sensor lens / Calibration Error Drift Block",
    possibleCauses: [
      "Iron rust, heavy asphaltic sludge, or organic grease forming a dark slick film inside the optical glass cell.",
      "Over-tightened sealing glands causing microscopic micro-cracks in the optical measuring column.",
      "Internal electronic calibration value drift on reference LED diode emission index.",
      "Moisture condensed on external surfaces of optical glass tubes."
    ],
    troubleshootingSteps: [
      "De-energize OWS feed pumps and isolate OMD measuring line. Open sample water cell purge vents.",
      "Unscrew protective core cap on glass tube column. Extract cleaning plunger and inspect seals.",
      "Use soft circular brush saturated with custom descaling agent or mild citric acid to clean the inside glass cylinder thoroughly.",
      "Rinse with clean distilled domestic potable water. Close sample cap tightly.",
      "Energize unit and perform 'Zero Check'. If zero check reads >2ppm on distilled water, replace the entire sensor module array."
    ],
    safetyPrecautions: [
      "Do NOT scratch internal glass surfaces; micro-scratches scatter laser beams causing false high ppm bilge trips.",
      "Never feed OMD clean flushing water during bilge outboard discharge periods. This constitutes a severe MARPOL criminal violation."
    ],
    difficulty: "Medium"
  },
  {
    id: "aux-inc-02",
    category: "Auxiliary Machinery",
    makeModel: "TeamTec OG120 / OG400 Series Incinerator",
    component: "Sludge Dosing Nozzle & Sludge Circulation Line",
    faultSymptom: "Sludge Atomizing Air Low Pressure / Nozzle Carbon Blockage",
    possibleCauses: [
      "Carbonization of heavy fuel bilge oil inside burner nozzle tip due to high baking temperatures.",
      "Failure of pneumatic pressure regulating valve supplying high pressure nozzle atomization air.",
      "Sludge circulation line strainers completely fouled with dense plastic/fiber particles.",
      "Inadequate sludge oil heating inside sludge tank, leading to heavy thick wax blockages."
    ],
    troubleshootingSteps: [
      "Isolate incinerator sludge supply lines and purge the burner arm using high-pressure flushing air.",
      "Uncouple sludge burner arm assembly and extract atomic fluid nozzle from combustion core shroud.",
      "Place nozzle tip in safe diesel oil bath. Use micro-needles to clear individual atomizer spray holes.",
      "Verify atomizing air pressure regulator is set at 2.2 - 2.5 bar above combustion furnace draft limits.",
      "Clean individual sludge suction strainers and verify sludge loop temperature is held continuously at >85°C."
    ],
    safetyPrecautions: [
      "Always allow the refractory chamber to cool to under <50°C before extracting burner arms. Flare-backs can cause immediate ocular damage.",
      "Wear chemical hazard glasses and protective gloves when cleaning concentrated bilge sludge layers."
    ],
    difficulty: "Medium"
  },
  {
    id: "2s-man-05",
    category: "2-Stroke Propulsion",
    makeModel: "MAN B&W S60ME-C8 / G70ME-C9 electronic",
    component: "FIVA Proportional Solenoid Valve (Fuel Injection Valve Actuator)",
    faultSymptom: "FIVA Position Feedback Error / Single Cylinder Fuel Rack Limit Cut-out",
    possibleCauses: [
      "Microscopic metal particles sticking inside the hydraulic high-pressure spool valve slide.",
      "Failure of the electronic LVDT (Linear Variable Differential Transformer) position feedback sensor.",
      "Main hydraulically auxiliary control lube oil viscosity dropped due to system overheating.",
      "Damaged high-flex pilot cable connecting the Cylinder Control Unit (CCU) to the FIVA block head."
    ],
    troubleshootingSteps: [
      "Inspect the CCU diagnostic terminal block for active pilot proportional voltage alarm signals or sensor fault flags.",
      "Measure electrical coil resistance on proportional solenoids. Verify LVDT feedback loops match standard voltages.",
      "Isolate hydraulic power loop completely (200 bar). Bleed residual accumulator pressure thoroughly.",
      "Extract FIVA spool sliding cartridge. Clean micro-screens using high-pressure solvent spray and check slide movement.",
      "If sliding spool reveals heavy physical grooves or pitting, replace the complete FIVA valve body in pairs."
    ],
    safetyPrecautions: [
      "DANGER: ME-C engine FIVA valves operate under high hydraulic pressures (up to 250 bar). Verify system hydraulic pump power is OFF and accumulator lines are fully vented before unclamping any FIVA bolts.",
      "Always wear face protection shields during FIVA maintenance procedures."
    ],
    difficulty: "High"
  },
  {
    id: "4s-wartsila-02",
    category: "4-Stroke Generator",
    makeModel: "Wärtsilä 32 / 38 Marine Generators",
    component: "Exhaust Valve Seat & Cylinder Lid",
    faultSymptom: "Severe Single Cylinder Exhaust Gas Temperature High Deviation (>50°C above mean)",
    possibleCauses: [
      "High-temperature gas blow-by past valve seat due to soot crust build-up or micro pitting on seat faces.",
      "Incorrect hydraulic rotators (Turnomatics) operation leading to concentrated single point thermal loads.",
      "Valve guide clearance too tight causing spindle sluggishness.",
      "Poor fuel nozzle atomization resulting in secondary cylinder combustion across valve seats."
    ],
    troubleshootingSteps: [
      "Verify the automatic safety monitoring limits across generator cylinder exhaust valves.",
      "Instantly check hydraulic Turnomatic rotators through the cylinder visual sight port to verify continuous rotational action.",
      "If temperatures exceed safe thresholds, change load sharing grid grids, bring generator offline and follow safe LOTO cool-down protocols.",
      "Extract the affected Cylinder Cover Head. Unfasten exhaust valve assemblies with hydraulic clamping jacks.",
      "Inspect seat rings. Grind valve seats utilizing recommended fine paste guides or install new stellite-faced seat rings."
    ],
    safetyPrecautions: [
      "Always use correct hydraulic jacks during cover disassembly; hydraulic pressures run up to 1500 bar across cover nuts.",
      "Wear heavy-duty leather safety gloves to hold high temperature valve manifolds."
    ],
    difficulty: "High"
  },
  {
    id: "aux-bwts-04",
    category: "Auxiliary Machinery",
    makeModel: "Optimarin / OceanSaver Smart Cabinet",
    component: "Main Power Rectifier & Control PLC Sump",
    faultSymptom: "Rectifier High Heat Alarm / Automatic Power Reduction Grid limit",
    possibleCauses: [
      "Clogged cooling fan dust filters on the power panel cabinet door frame.",
      "Breakdown of high-duty electrical cooling blower fans causing heat build up inside semiconductor banks.",
      "High ambient engine room air temperature (lack of proper machinery space ventilation).",
      "Overcurrent induced due to ballast seawater turbidity requiring maximum electrolysis potential limits."
    ],
    troubleshootingSteps: [
      "Check cabinet visual indicators to read active temperatures across the central diode block segments.",
      "Manually check cooling fan intakes on cabinet sides. Clean out accumulated dust screens and lint barriers.",
      "If blower fan is seized, isolate power at MCC, lock standard breaker, and replace cooling fan with equivalent Ex-certified motor.",
      "Utilize auxiliary air blower to provide fresh cooling airstreams to the panel during intense summer passages.",
      "Reduce total ballast water pump volume slightly to drop electrolysis grid current draw and reduce cooling load."
    ],
    safetyPrecautions: [
      "DANGER: Cabinet internals operate under 440V AC and carry lethal capacitor charge reservoirs. Let the panel de-energize for 10 minutes before starting any interior cleaning.",
      "Wear certified double-insulated electric electrician safety gloves and shoes during internal electrical checks."
    ],
    difficulty: "Medium"
  }
];

