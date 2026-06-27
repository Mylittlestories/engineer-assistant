import React, { useState } from "react";

export default function FuelChangeover() {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [fromFuel, setFromFuel] = useState("HSFO");
  const [toFuel, setToFuel] = useState("VLSFO");

  const duration = startTime && endTime 
    ? Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60)) 
    : 0;

  return (
    <div className="bg-[#0b1424] border border-slate-700 rounded-3xl p-5">
      <div className="text-sm font-semibold mb-4 text-[#22d3ee]">Fuel Changeover Log (MARPOL)</div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="text-xs text-slate-400">Start Time</label>
          <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-[#11223b] border border-slate-700 rounded-xl p-2 mt-1" />
        </div>
        <div>
          <label className="text-xs text-slate-400">End Time</label>
          <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-[#11223b] border border-slate-700 rounded-xl p-2 mt-1" />
        </div>
        <div>
          <label className="text-xs text-slate-400">From Fuel</label>
          <select value={fromFuel} onChange={e => setFromFuel(e.target.value)} className="w-full bg-[#11223b] border border-slate-700 rounded-xl p-2 mt-1">
            <option>HSFO</option><option>VLSFO</option><option>ULSFO</option><option>MGO</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">To Fuel</label>
          <select value={toFuel} onChange={e => setToFuel(e.target.value)} className="w-full bg-[#11223b] border border-slate-700 rounded-xl p-2 mt-1">
            <option>VLSFO</option><option>ULSFO</option><option>MGO</option><option>HSFO</option>
          </select>
        </div>
      </div>

      <div className="mt-4 p-3 bg-[#11223b] rounded-2xl text-sm">
        <div>Duration: <span className="font-mono text-[#22d3ee]">{duration} hours</span></div>
        <div className="text-xs text-slate-400 mt-1">Record this in Oil Record Book Part I</div>
      </div>
    </div>
  );
}
