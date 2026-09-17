import React, { useState, useEffect } from 'react';

export default function App() {
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
    const saved = localStorage.getItem('schengen_react_data_v1');
    return saved ? JSON.parse(saved) : initialDataSet;
  });

  const [evalDate, setEvalDate] = useState("2026-09-17");
  const [country, setCountry] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [isOngoing, setIsOngoing] = useState(false);

  useEffect(() => {
    localStorage.setItem('schengen_react_data_v1', JSON.stringify(trips));
  }, [trips]);

  const parseLocalDate = (str) => {
    if (!str) return new Date();
    return new Date(str + "T00:00:00");
  };

  const formatDisplayDate = (str) => {
    if (!str) return "Ongoing Stay";
    const dateObj = new Date(str + "T00:00:00");
    if (isNaN(dateObj.getTime())) return str;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleAddTrip = (e) => {
    e.preventDefault();
    if (!entryDate || (!exitDate && !isOngoing)) {
      alert("Please fill in valid entry and exit dates.");
      return;
    }
    const newTrip = {
      country: country.trim() || "Schengen Country",
      entry: entryDate,
      exit: isOngoing ? "" : exitDate,
      ongoing: isOngoing
    };
    setTrips([...trips, newTrip]);
    setCountry("");
    setEntryDate("");
    setExitDate("");
    setIsOngoing(false);
  };

  const handleDeleteTrip = (idx) => {
    setTrips(trips.filter((_, i) => i !== idx));
  };

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
      
      {/* DASHBOARD CARD PANEL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">🇪🇺 Schengen Calculator</h1>
        <p class="text-slate-400 text-xs mb-4">90/180-day rolling execution engine</p>
        
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl mb-4 flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluation / Control Date</label>
          <input type="date" value={evalDate} onChange={(e) => setEvalDate(e.target.value)} className="border border-slate-200 rounded-lg p-2 text-sm bg-white" />
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Days Used</h3>
            <p className="text-3xl font-black text-slate-800 mt-1">{totalDaysUsed}</p>
          </div>
          <div className="col-span-2">
            {totalDaysUsed > 90 ? (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm">
                <div className="font-bold">⚠️ Overstay Alert</div>
                <div>You have exceeded visa limits by {totalDaysUsed - 90} days within this 180-day window!</div>
              </div>
            ) : totalDaysUsed === 90 ? (
              <div class="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
                <div class="font-bold">⚠️ Maximum Stay Limit</div>
                <div>Exactly 90 days used. Staying even one extra day will result in a compliance violation.</div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm">
                <div className="font-bold">✅ Visa Compliant</div>
                <div>You have {90 - totalDaysUsed} safe remaining days inside this rolling lookback window.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ENTRY MANAGEMENT FORM CARD */}
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-md font-bold text-slate-800 mb-4">➕ Add Travel Segment</h2>
        <form onSubmit={handleAddTrip} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Country</label>
            <input type="text" placeholder="e.g. Poland" value={country} onChange={(e) => setCountry(e.target.value)} className="border border-slate-300 rounded-lg p-2.5 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Arrival Date (Entry)</label>
              <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="border border-slate-300 rounded-lg p-2.5 text-sm" />
            </div>
            <div class="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Departure Date (Exit)</label>
              <input type="date" value={exitDate} onChange={(e) => setExitDate(e.target.value)} disabled={isOngoing} className="border border-slate-300 rounded-lg p-2.5 text-sm disabled:bg-slate-50 disabled:text-slate-400" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer mt-1">
            <input type="checkbox" checked={isOngoing} onChange={(e) => { setIsOngoing(e.target.checked); if(e.target.checked) setExitDate(""); }} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
            Still inside Schengen zone / Current ongoing stay
          </label>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-bold text-sm shadow-sm mt-2 transition-colors">Append to Timeline</button>
        </form>
      </div>

      {/* TIMELINE LOGGER SEGMENTS FRAME */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-md font-bold text-slate-800 mb-4">📋 Logged Stay Segments</h2>
        <div className="flex flex-col gap-2">
          {processedTrips.map((trip) => (
            <div key={trip.idx} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div>
                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  {trip.country}
                  {trip.ongoing && <span className="bg-blue-100 text-blue-700 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">Active</span>}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {formatDisplayDate(trip.entry)} — {trip.ongoing ? 'Ongoing Simulation' : formatDisplayDate(trip.exit)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-slate-200 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-md">{trip.duration} Days</span>
                <button onClick={() => handleDeleteTrip(trip.idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg text-sm font-bold transition-colors">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
