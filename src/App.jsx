import React, { useState, useEffect } from 'react';

export default function App() {
  // Anchored timeline bounds matching the exact September 17, 2026 framework
  const baseSliderDate = new Date(2026, 2, 21); // March 21, 2026 (Slider value 0)

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
    const saved = localStorage.getItem('schengen_react_graphics_v3');
    return saved ? JSON.parse(saved) : initialDataSet;
  });

  const [evalDate, setEvalDate] = useState("2026-09-17");
  const [sliderValue, setSliderValue] = useState(180); // Corresponds directly to 17/09/2026
  
  const [country, setCountry] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [isOngoing, setIsOngoing] = useState(false);

  useEffect(() => {
    localStorage.setItem('schengen_react_graphics_v3', JSON.stringify(trips));
  }, [trips]);

  const parseLocalDate = (str) => {
    if (!str) return new Date();
    return new Date(str + "T00:00:00");
  };

  const formatDisplayDate = (str) => {
    if (!str) return "Ongoing";
    const dateObj = new Date(str + "T00:00:00");
    if (isNaN(dateObj.getTime())) return str;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const dateToISOString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Sync date picker input updates with slider step positioning
  const handleDatePickerChange = (isoVal) => {
    setEvalDate(isoVal);
    const target = parseLocalDate(isoVal);
    let diffDays = Math.round((target - baseSliderDate) / 86400000);
    diffDays = Math.max(0, Math.min(365, diffDays));
    setSliderValue(diffDays);
  };

  // Sync horizontal range timeline changes with active calendar states
  const handleSliderChange = (val) => {
    const numericVal = parseInt(val, 10);
    setSliderValue(numericVal);
    let target = new Date(baseSliderDate);
    target.setDate(target.getDate() + numericVal);
    setEvalDate(dateToISOString(target));
  };

  const handleAddTrip = (e) => {
    e.preventDefault();
    if (!entryDate || (!exitDate && !isOngoing)) {
      alert("Please fill in valid entry dates.");
      return;
    }
    setTrips([...trips, {
      country: country.trim() || "Schengen Country",
      entry: entryDate,
      exit: isOngoing ? "" : exitDate,
      ongoing: isOngoing
    }]);
    setCountry("");
    setEntryDate("");
    setExitDate("");
    setIsOngoing(false);
  };

  const handleDeleteTrip = (idx) => {
    setTrips(trips.filter((_, i) => i !== idx));
  };

  // 180-day window lookback calculation core engine
  const targetEvalDate = parseLocalDate(evalDate);
  const windowStart = new Date(targetEvalDate);
  windowStart.setDate(windowStart.getDate() - 179);

  let totalDaysUsed = 0;

  const processedTrips = trips.map((trip, idx) => {
    const start = parseLocalDate(trip.entry);
    let end = trip.ongoing ? targetEvalDate : parseLocalDate(trip.exit || evalDate);
    
    let segmentDuration = 0;
    if (end >= start) {
      segmentDuration = Math.round((end - start) / 86400000) + 1;
    }

    if (start <= targetEvalDate) {
      let effExit = trip.ongoing ? targetEvalDate : parseLocalDate(trip.exit);
      if (effExit > targetEvalDate) effExit = targetEvalDate;

      const intersectionStart = new Date(Math.max(start, windowStart));
      const intersectionEnd = new Date(Math.min(effExit, targetEvalDate));

      if (intersectionStart <= intersectionEnd) {
        totalDaysUsed += Math.round((intersectionEnd - intersectionStart) / 86400000) + 1;
      }
    }

    return { ...trip, duration: segmentDuration, idx };
  });

  return (
    <div className="w-full max-w-xl mx-auto p-4 flex flex-col gap-6">
      
      {/* GRAPHICAL CONTROLS & MONITOR COCKPIT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              🇪🇺 Schengen Stay Calculator
            </h1>
            <p className="text-slate-400 text-xs">Interactive 90/180-day rolling tracking system</p>
          </div>
        </div>

        {/* TIME CONTROLS PANEL */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Evaluation Date: {formatDisplayDate(evalDate)}
            </span>
            <input 
              type="date" 
              value={evalDate} 
              onChange={(e) => handleDatePickerChange(e.target.value)} 
              className="border border-slate-200 rounded-lg p-1.5 text-xs bg-white font-medium outline-none" 
            />
          </div>
          <input 
            type="range" 
            min="0" 
            max="365" 
            value={sliderValue} 
            onChange={(e) => handleSliderChange(e.target.value)} 
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 outline-none" 
          />
        </div>

        {/* GRAPHICAL METRIC GROUPS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch mt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center items-center">
            <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Days Used</h3>
            <p className="text-4xl font-black text-slate-800 mt-1 leading-none">{totalDaysUsed}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1">max 90 allowed</span>
          </div>

          <div className="sm:col-span-2 flex">
            {totalDaysUsed > 90 ? (
              <div className="w-full bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex flex-col justify-center">
                <div className="font-bold text-sm flex items-center gap-1.5">⚠️ Overstay Violation</div>
                <div className="text-xs mt-1 leading-relaxed">Your simulated timeline uses <span className="font-bold">{totalDaysUsed} days</span>, triggering an overstay breach by <span className="font-bold">{totalDaysUsed - 90} days</span>!</div>
              </div>
            ) : totalDaysUsed === 90 ? (
              <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex flex-col justify-center">
                <div className="font-bold text-sm flex items-center gap-1.5">⚠️ Maximum Stay Limit</div>
                <div className="text-xs mt-1 leading-relaxed">You have hit exactly <span className="font-bold">90 days</span>. Any additional stay tomorrow will trigger a customs border compliance alert.</div>
              </div>
            ) : (
              <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex flex-col justify-center">
                <div className="font-bold text-sm flex items-center gap-1.5">✅ Safe Window Alignment</div>
                <div className="text-xs mt-1 leading-relaxed">Your track is fully legal. You hold <span className="font-bold">{90 - totalDaysUsed} days available</span> within this specific 180-day lookback window.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INPUT INTERFACE SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
        <h2 class="text-sm font-bold text-slate-800 mb-4 tracking-tight">➕ Add New Segment Entry</h2>
        <form onSubmit={handleAddTrip} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Destination Country</label>
            <input type="text" placeholder="e.g. Poland, Spain, Germany" value={country} onChange={(e) => setCountry(e.target.value)} className="border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Arrival Date (Entry)</label>
              <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Departure Date (Exit)</label>
