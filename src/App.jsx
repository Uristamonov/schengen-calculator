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
    const saved = localStorage.getItem('schengen_native_css_v1');
    return saved ? JSON.parse(saved) : initialDataSet;
  });

  const [evalDate, setEvalDate] = useState("2026-09-17");
  const [sliderValue, setSliderValue] = useState(180);
  const [country, setCountry] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [isOngoing, setIsOngoing] = useState(false);

  useEffect(() => {
    localStorage.setItem('schengen_native_css_v1', JSON.stringify(trips));
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
    if (!entryDate || (!exitDate && !isOngoing)) return alert("Please fill in valid dates.");
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
  // Injecting styles directly so the browser cannot ignore them
  const styles = `
    .app-bg { background-color: #0f172a; min-height: 100vh; padding: 20px; color: #cbd5e1; display: flex; justify-content: center; }
    .container { width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: 20px; font-family: system-ui, sans-serif; }
    .card { background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
    h1 { font-size: 24px; font-weight: 800; color: #f8fafc; margin: 0 0 4px 0; }
    h2 { font-size: 16px; font-weight: 700; color: #f8fafc; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .subtitle { color: #94a3b8; font-size: 13px; margin: 0 0 20px 0; }
    .control-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: #0f172a; padding: 12px; border-radius: 12px; border: 1px solid #334155; }
    .control-row label { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
    input[type="date"], input[type="text"] { background: #1e293b; border: 1px solid #475569; color: #f8fafc; padding: 8px 12px; border-radius: 8px; font-size: 14px; outline: none; }
    .slider { width: 100%; height: 6px; background: #334155; border-radius: 4px; appearance: none; outline: none; margin-top: 8px; }
    .dashboard { display: grid; grid-template-columns: 130px 1fr; gap: 16px; margin-top: 16px; }
    .metric-box { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; }
    .metric-box h3 { margin: 0; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
    .metric-box p { margin: 4px 0 0 0; font-size: 36px; font-weight: 900; color: #f8fafc; }
    .alert-box { padding: 16px; border-radius: 12px; font-size: 13px; line-height: 1.5; display: flex; flex-direction: column; justify-content: center; }
    .alert-safe { background: rgba(16,185,129,0.1); border: 1px solid #10b981; color: #34d399; }
    .alert-warn { background: rgba(245,158,11,0.1); border: 1px solid #f59e0b; color: #fbbf24; }
    .alert-danger { background: rgba(239,68,68,0.1); border: 1px solid #ef4444; color: #f87171; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .btn-submit { background: #2563eb; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; }
    .btn-submit:hover { background: #1d4ed8; }
    .trip-list { display: flex; flex-direction: column; gap: 10px; }
    .trip-item { display: flex; justify-content: space-between; align-items: center; background: #0f172a; border: 1px solid #334155; padding: 14px; border-radius: 12px; }
    .badge-active { background: #1e3a8a; color: #60a5fa; border: 1px solid #3b82f6; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 20px; margin-left: 6px; text-transform: uppercase; }
    .days-badge { background: #334155; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: 700; color: #f1f5f9; }
    .btn-delete { background: none; border: none; color: #f87171; cursor: pointer; font-size: 16px; padding: 4px; }
    .btn-delete:hover { color: #ef4444; }
  `;

  return (
    <div className="app-bg">
      <style>{styles}</style>
      <div className="container">
        
        {/* COCKPIT CARD */}
        <div className="card">
          <h1>🇪🇺 Schengen Stay Calculator</h1>
          <p class="subtitle">Interactive 90/180-day rolling tracking system</p>
          
          <div className="control-row">
            <label>Evaluation Date: {formatDisplayDate(evalDate)}</label>
            <input type="date" value={evalDate} onChange={(e) => handleDatePickerChange(e.target.value)} />
          </div>
          <input type="range" min="0" max="365" value={sliderValue} onChange={(e) => handleSliderChange(e.target.value)} className="slider" />

          <div className="dashboard">
            <div className="metric-box">
              <h3>Days Used</h3>
              <p>{totalDaysUsed}</p>
            </div>
            {totalDaysUsed > 90 ? (
              <div className="alert-box alert-danger">
                <div style={{fontWeight:'bold', marginBottom:'2px'}}>⚠️ Overstay Violation</div>
                <div>Timeline uses {totalDaysUsed} days, exceeding limits by {totalDaysUsed - 90} days!</div>
              </div>
            ) : totalDaysUsed === 90 ? (
              <div className="alert-box alert-warn">
                <div style={{fontWeight:'bold', marginBottom:'2px'}}>⚠️ Maximum Allowed Limit</div>
                <div>Exactly 90 days used. Staying any longer will result in an immediate compliance alert.</div>
              </div>
            ) : (
              <div className="alert-box alert-safe">
                <div style={{fontWeight:'bold', marginBottom:'2px'}}>✅ Visa Compliant</div>
                <div>You have {90 - totalDaysUsed} safe remaining days inside this rolling lookback window.</div>
              </div>
            )}
          </div>
        </div>

        {/* INPUT CARD */}
        <div className="card">
          <h2>➕ Add New Segment Entry</h2>
          <form onSubmit={handleAddTrip}>
            <div className="form-group">
              <label style={{fontSize:'11px', color:'#94a3b8'}}>Destination Country</label>
              <input type="text" placeholder="e.g. Poland" value={country} onChange={(e) => setCountry(e.target.value)} style={{width:'100%', boxSizing:'border-box'}} />
            </div>
            <div className="form-row" style={{marginBottom:'14px'}}>
              <div className="form-group" style={{marginBottom:0}}>
                <label style={{fontSize:'11px', color:'#94a3b8'}}>Arrival Date (Entry)</label>
                <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label style={{fontSize:'11px', color:'#94a3b8'}}>Departure Date (Exit)</label>
                <input type="date" value={exitDate} onChange={(e) => setExitDate(e.target.value)} disabled={isOngoing} />
              </div>
            </div>
            <div className="form-group" style={{flexDirection:'row', alignItems:'center', gap:'8px', cursor:'pointer'}}>
              <input type="checkbox" id="ongoingCheck" checked={isOngoing} onChange={(e) => { setIsOngoing(e.target.checked); if(e.target.checked) setExitDate(""); }} style={{cursor:'pointer'}} />
              <label htmlFor="ongoingCheck" style={{cursor:'pointer', fontSize:'13px'}}>Still inside Schengen zone / Active stay</label>
            </div>
            <button type="submit" className="btn-submit" style={{width:'100%', marginTop:'6px'}}>Append to Timeline</button>
          </form>
        </div>

        {/* LIST CARD */}
        <div className="card">
          <h2>📋 Logged Stay Segments</h2>
          <div className="trip-list">
            {processedTrips.map((trip) => (
              <div key={trip.idx} className="trip-item">
                <div>
                  <div style={{fontWeight:'bold', color:'#f8fafc', fontSize:'14px'}}>
                    {trip.country}
                    {trip.ongoing && <span className="badge-active">Active</span>}
                  </div>
                  <div style={{fontSize:'12px', color:'#94a3b8', marginTop:'4px'}}>
                    {formatDisplayDate(trip.entry)} — {trip.ongoing ? 'Ongoing Stay' : formatDisplayDate(trip.exit)}
                  </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                  <span className="days-badge">{trip.duration} Days</span>
                  <button type="button" onClick={() => setTrips(trips.filter((_, i) => i !== trip.idx))} className="btn-delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
