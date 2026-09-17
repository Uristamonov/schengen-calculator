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
    const saved = localStorage.getItem('schengen_react_dark_v1');
    return saved ? JSON.parse(saved) : initialDataSet;
  });

  const [evalDate, setEvalDate] = useState("2026-09-17");
  const [sliderValue, setSliderValue] = useState(180);
  const [country, setCountry] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [isOngoing, setIsOngoing] = useState(false);

  useEffect(() => {
    localStorage.setItem('schengen_react_dark_v1', JSON.stringify(trips));
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
    if (!entryDate || (!exitDate && !isOngoing)) return alert("Please check inputs.");
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
    <div className="w-full max-w-xl mx-auto p-4 flex flex-col gap-6 text-slate-200">
      
      {/* HEADER MONITOR COCKPIT */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-6">
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">🇪🇺 Schengen Stay Calculator</h1>
        <p className="text-slate-400 text-xs mb-4">Permanent Dark Mode Look</p>
        
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 my-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation Date: {formatDisplayDate(evalDate)}</span>
            <input type="date" value={evalDate} onChange={(e) => handleDatePickerChange(e.target.value)} className="border border-slate-600 rounded-lg p-1.5 text-xs bg-slate-800 text-slate-100 outline-none" />
          </div>
          <input type="range" min="0" max="365" value={sliderValue} onChange={(e) => handleSliderChange(e.target.value)} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 outline-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch mt-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-center items-center">
            <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Days Used</h3>
            <p className="text-4xl font-black text-slate-100 mt-1 leading-none">{totalDaysUsed}</p>
          </div>
          <div className="sm:col-span-2 flex">
            {totalDaysUsed > 90 ? (
              <div className="w-full bg-red-950/40 border border-red-800 text-red-200 p-4 rounded-xl text-xs flex items-center">Your timeline uses <b>{totalDaysUsed} days</b>, triggering an overstay breach by <b>{totalDaysUsed - 90} days</b>!</div>
            ) : totalDaysUsed === 90 ? (
              <div className="w-full bg-amber-950/40 border border-amber-800 text-amber-200 p-4 rounded-xl text-xs flex items-center">Maximum <b>90 days</b> used frame. Any additional stay tomorrow will trigger a compliance alert.</div>
            ) : (
              <div className="w-full bg-emerald-950/40 border border-emerald-200 text-emerald-200 p-4 rounded-xl text-xs flex items-center">Visa compliant track. You hold <b>{90 - totalDaysUsed} safe remaining days</b> inside this 180-day frame.</div>
            )}
          </div>
        </div>
      </div>

      {/* SEGMENT INPUT FORM */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-6">
        <h2 className="text-sm font-bold text-slate-100 mb-4 tracking-tight">➕ Add New Segment Entry</h2>
        <form onSubmit={handleAddTrip} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400">Destination Country</label>
            <input type="text" placeholder="e.g. Poland" value={country} onChange={(e) => setCountry(e.target.value)} className="border border-slate-700 rounded-lg p-2.5 text-sm bg-slate-900 text-slate-100 outline-none focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">Arrival Date (Entry)</label>
              <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="border border-slate-700 rounded-lg p-2.5 text-sm bg-slate-900 text-slate-100 outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">Departure Date (Exit)</label>
              <input type="date" value={exitDate} onChange={(e) => setExitDate(e.target.value)} disabled={isOngoing} className="border border-slate-700 rounded-lg p-2.5 text-sm bg-slate-900 text-slate-100 disabled:bg-slate-800 disabled:text-slate-500" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 cursor-pointer mt-1">
            <input type="checkbox" checked={isOngoing} onChange={(e) => { setIsOngoing(e.target.checked); if(e.target.checked) setExitDate(""); }} className="rounded border-slate-600 bg-slate-900 text-blue-500 w-4 h-4" />
            Still inside Schengen zone
          </label>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-bold text-sm shadow-sm transition-colors mt-2">Append to Log Timeline</button>
        </form>
      </div>

      {/* SEGMENT VISUAL ARCHIVE CONTAINER */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-6">
        <h2 className="text-sm font-bold text-slate-100 mb-4 tracking-tight">📋 Logged Stay Segments</h2>
        <div className="flex flex-col gap-2">
          {processedTrips.map((trip) => (
            <div key={trip.idx} className="flex justify-between items-center bg-slate-900 border border-slate-700 rounded-xl p-4">
              <div>
                <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  {trip.country}
                  {trip.ongoing && <span className="bg-blue-900/60 text-blue-300 border border-blue-700 font-bold text-[9px] px-2 py-0.5 rounded-full">Active</span>}
                </div>
                <div className="text-xs text-slate-400 font-medium mt-1">{formatDisplayDate(trip.entry)} — {trip.ongoing ? 'Ongoing Stay' : formatDisplayDate(trip.exit)}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-slate-800 text-slate-300 font-bold text-xs px-2.5 py-1 rounded-md">{trip.duration} Days</span>
                <button type="button" onClick={() => setTrips(trips.filter((_, i) => i !== trip.idx))} className="text-slate-500 hover:text-red-400 p-1.5 text-md transition-colors">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
