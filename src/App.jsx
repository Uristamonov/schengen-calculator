import React, { useState, useEffect } from 'react';

export default function App() {
  const baseSliderDate = new Date(2026, 2, 21);
  const initialDataSet = [
    { country: "Italy", entry: "2021-09-29", exit: "2021-10-07", ongoing: false },
    { country: "Spain", entry: "2022-09-01", exit: "2022-09-05", ongoing: false },
    { country: "France", entry: "2023-01-27", exit: "2023-01-29", ongoing: false },
    { country: "Spain", entry: "2023-10-06", exit: "2023-10-15", ongoing: false },
    { country: "Spain", entry: "2024-05-16", exit: "2024-05-20", ongoing: false },
    { country: "France", entry: "2024-06-30", exit: "2024-07-10", ongoing: false },
    { country: "Switzerland", entry: "2025-08-22", exit: "2025-09-01", ongoing: false },
    { country: "Spain", entry: "2026-04-03", exit: "2026-04-11", ongoing: false },
    { country: "Poland", entry: "2026-06-26", exit: "2026-07-06", ongoing: false },
    { country: "Poland", entry: "2026-07-10", exit: "", ongoing: true }
  ];

  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('schengen_react_graphics_v9');
    return saved ? JSON.parse(saved) : initialDataSet;
  });

  const [evalDate, setEvalDate] = useState("2026-09-17");
  const [sliderValue, setSliderValue] = useState(180);
  const [country, setCountry] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [isOngoing, setIsOngoing] = useState(false);

  useEffect(() => {
    localStorage.setItem('schengen_react_graphics_v9', JSON.stringify(trips));
  }, [trips]);

  const parseLocalDate = (str) => !str ? new Date() : new Date(str + "T00:00:00");

  const formatDisplayDate = (str) => {
    if (!str) return "Ongoing";
    const dateObj = new Date(str + "T00:00:00");
    if (isNaN(dateObj.getTime())) return str;
    return `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()}`;
  };

  const handleDatePickerChange = (isoVal) => {
    setEvalDate(isoVal);
    const diffDays = Math.round((parseLocalDate(isoVal) - baseSliderDate) / 86400000);
    setSliderValue(Math.max(0, Math.min(365, diffDays)));
  };

  const handleSliderChange = (val) => {
    const numericVal = parseInt(val, 10);
    setSliderValue(numericVal);
    let target = new Date(baseSliderDate);
    target.setDate(target.getDate() + numericVal);
    const y = target.getFullYear(), m = String(target.getMonth()+1).padStart(2,'0'), d = String(target.getDate()).padStart(2,'0');
    setEvalDate(`${y}-${m}-${d}`);
  };

  const handleAddTrip = (e) => {
    e.preventDefault();
    if (!entryDate || (!exitDate && !isOngoing)) return alert("Please fill in valid entry dates.");
    setTrips([...trips, { country: country.trim() || "Schengen Country", entry: entryDate, exit: isOngoing ? "" : exitDate, ongoing: isOngoing }]);
    setCountry(""); setEntryDate(""); setExitDate(""); setIsOngoing(false);
  };

  const targetEvalDate = parseLocalDate(evalDate);
  const windowStart = new Date(targetEvalDate);
  windowStart.setDate(windowStart.getDate() - 179);
  let totalDaysUsed = 0;

  const processedTrips = trips.map((trip, idx) => {
    const start = parseLocalDate(trip.entry);
    let end = trip.ongoing ? targetEvalDate : parseLocalDate(trip.exit || evalDate);
    let segmentDuration = end >= start ? Math.round((end - start) / 86400000) + 1 : 0;

    if (start <= targetEvalDate) {
      let effExit = trip.ongoing ? targetEvalDate : parseLocalDate(trip.exit);
      if (effExit > targetEvalDate) effExit = targetEvalDate;
      const interStart = new Date(Math.max(start, windowStart)), interEnd = new Date(Math.min(effExit, targetEvalDate));
      if (interStart <= interEnd) totalDaysUsed += Math.round((interEnd - interStart) / 86400000) + 1;
    }
    return { ...trip, duration: segmentDuration, idx };
  });
  return (
    <div className="w-full max-w-xl mx-auto p-4 flex flex-col gap-5 text-slate-100 selection:bg-blue-500/30">
      
      {/* MONITOR PANEL CONTAINER */}
      <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700/60 shadow-2xl p-6 transition-all">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              🇪🇺 Schengen Short-Stay Monitor
            </h1>
            <p className="text-slate-400 text-xs font-medium">90/180-day rolling lookback validation module</p>
          </div>
        </div>

        {/* INTERACTIVE TIMELINE SLIDER AREA */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 my-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">Evaluation: {formatDisplayDate(evalDate)}</span>
            <input type="date" value={evalDate} onChange={(e) => handleDatePickerChange(e.target.value)} className="border border-slate-600 rounded-xl px-2 py-1 text-xs bg-slate-800 text-slate-100 font-bold outline-none cursor-pointer focus:border-blue-500" />
          </div>
          <input type="range" min="0" max="365" value={sliderValue} onChange={(e) => handleSliderChange(e.target.value)} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 outline-none" />
        </div>

        {/* METRICS DASHBOARD CONTAINER FRAME */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch mt-2">
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-center items-center shadow-inner">
            <h3 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Days Used</h3>
            <p className="text-4xl font-black text-white mt-1.5 tracking-tight">{totalDaysUsed}</p>
            <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase">Limit: 90 Days</span>
          </div>

          <div className="sm:col-span-2 flex">
            {totalDaysUsed > 90 ? (
              <div className="w-full bg-red-950/40 border border-red-800/80 text-red-200 p-4 rounded-2xl flex flex-col justify-center shadow-md">
                <div className="font-bold text-xs flex items-center gap-1.5 text-red-400 uppercase tracking-wide">⚠️ Overstay Breach Flagged</div>
                <div className="text-xs mt-1.5 leading-relaxed text-slate-300 font-medium">Your planned segments exceed Schengen short-stay rules by <span className="font-extrabold text-red-400 underline">{totalDaysUsed - 90} days</span> inside this rolling window.</div>
              </div>
            ) : totalDaysUsed === 90 ? (
              <div className="w-full bg-amber-950/40 border border-amber-800/80 text-amber-200 p-4 rounded-2xl flex flex-col justify-center shadow-md">
                <div className="font-bold text-xs flex items-center gap-1.5 text-amber-400 uppercase tracking-wide">⚠️ Maximum Threshold Met</div>
                <div className="text-xs mt-1.5 leading-relaxed text-slate-300 font-medium">Exactly <span className="font-extrabold text-amber-400">90 days</span> consumed. You must depart the zone immediately to avoid border system regularities.</div>
              </div>
            ) : (
              <div className="w-full bg-emerald-950/30 border border-emerald-800/70 text-emerald-200 p-4 rounded-2xl flex flex-col justify-center shadow-md">
                <div className="font-bold text-xs flex items-center gap-1.5 text-emerald-400 uppercase tracking-wide">✅ Clear Compliance Track</div>
                <div className="text-xs mt-1.5 leading-relaxed text-slate-300 font-medium">Your schedule is aligned. You retain <span className="font-extrabold text-emerald-400">{90 - totalDaysUsed} legal short-stay days</span> available within this window frame.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INPUT MANAGEMENT BLOCK */}
      <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700/60 shadow-2xl p-6">
        <h2 className="text-xs font-bold text-slate-300 mb-4 tracking-wider uppercase">➕ Log New Travel Segment</h2>
        <form onSubmit={handleAddTrip} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Destination Country</label>
            <input type="text" placeholder="e.g. Poland, Spain, France" value={country} onChange={(e) => setCountry(e.target.value)} className="border border-slate-700 rounded-xl p-3 text-sm bg-slate-900 text-slate-100 outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Arrival Date (Entry)</label>
              <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="border border-slate-700 rounded-xl p-3 text-sm bg-slate-900 text-slate-100 outline-none focus:border-blue-500" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Departure Date (Exit)</label>
              <input type="date" value={exitDate} onChange={(e) => setExitDate(e.target.value)} disabled={isOngoing} className="border border-slate-700 rounded-xl p-3 text-sm bg-slate-900 text-slate-100 outline-none focus:border-blue-500 disabled:bg-slate-800/50 disabled:text-slate-500" />
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-400 cursor-pointer mt-1 select-none">
            <input type="checkbox" checked={isOngoing} onChange={(e) => { setIsOngoing(e.target.checked); if(e.target.checked) setExitDate(""); }} className="rounded border-slate-600 bg-slate-900 text-blue-500 w-4 h-4 focus:ring-0 focus:ring-offset-0" />
            Current active stay / Still inside Schengen zone boundary
          </label>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3.5 font-bold text-sm shadow-md transition-colors mt-2 tracking-wide uppercase">Append to Timeline Profile</button>
        </form>
      </div>

      {/* SEGMENTS WORKSPACE HISTORY LOG */}
      <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700/60 shadow-2xl p-6">
        <h2 className="text-xs font-bold text-slate-300 mb-4 tracking-wider uppercase">📋 Active Logged Segments Archive</h2>
        <div className="flex flex-col gap-2.5">
          {processedTrips.map((trip) => (
            <div key={trip.idx} className="flex justify-between items-center bg-slate-900/50 border border-slate-700/40 rounded-2xl p-4 hover:border-slate-600/60 transition-all">
              <div>
                <div className="font-extrabold text-white text-sm flex items-center gap-2">
                  {trip.country}
                  {trip.ongoing && <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest">Ongoing</span>}
                </div>
                <div className="text-xs text-slate-400 font-medium mt-1">{formatDisplayDate(trip.entry)} — {trip.ongoing ? 'Active Stay Track' : formatDisplayDate(trip.exit)}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-slate-800 border border-slate-700/60 text-slate-300 font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm">{trip.duration} Days</span>
                <button type="button" onClick={() => setTrips(trips.filter((_, i) => i !== trip.idx))} className="text-slate-500 hover:text-red-400 p-1.5 rounded-xl hover:bg-red-500/10 transition-all">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
