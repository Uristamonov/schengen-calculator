import React, { useState, useEffect } from 'react';

export default function App() {
  const timelineStart = new Date(2021, 0, 1);
  const timelineEnd = new Date(2026, 11, 31);
  const totalTimelineDays = Math.round((timelineEnd - timelineStart) / 86400000);

  const initialDataSet = [
    { country: "Italy", entry: "2021-09-29", exit: "2021-10-07", ongoing: false, color: '#3b82f6' },
    { country: "Spain", entry: "2022-09-01", exit: "2022-09-05", ongoing: false, color: '#eab308' },
    { country: "France", entry: "2023-01-27", exit: "2023-01-29", ongoing: false, color: '#ec4899' },
    { country: "Spain", entry: "2023-10-06", exit: "2023-10-15", ongoing: false, color: '#eab308' },
    { country: "Spain", entry: "2024-05-16", exit: "2024-05-20", ongoing: false, color: '#eab308' },
    { country: "France", entry: "2024-06-30", exit: "2024-07-10", ongoing: false, color: '#ec4899' },
    { country: "Switzerland", entry: "2025-08-22", exit: "2025-09-01", ongoing: false, color: '#14b8a6' },
    { country: "Spain", entry: "2026-04-03", exit: "2026-04-11", ongoing: false, color: '#eab308' },
    { country: "Poland", entry: "2026-06-26", exit: "2026-07-06", ongoing: false, color: '#10b981' },
    { country: "Poland", entry: "2026-07-10", exit: "", ongoing: true, color: '#10b981' }
  ];

  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('schengen_graphical_timeline_v2');
    return saved ? JSON.parse(saved) : initialDataSet;
  });

  const [evalDate, setEvalDate] = useState("2026-09-17");
  const [sliderValue, setSliderValue] = useState(() => {
    const initialTarget = new Date(2026, 8, 17);
    return Math.round((initialTarget - timelineStart) / 86400000);
  });

  const [country, setCountry] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [isOngoing, setIsOngoing] = useState(false);

  useEffect(() => {
    localStorage.setItem('schengen_graphical_timeline_v2', JSON.stringify(trips));
  }, [trips]);

  const parseLocalDate = (str) => !str ? new Date() : new Date(str + "T00:00:00");

  const formatDisplayDate = (str) => {
    if (!str) return "Ongoing";
    const dateObj = new Date(str + "T00:00:00");
    if (isNaN(dateObj.getTime())) return str;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDatePickerChange = (isoVal) => {
    setEvalDate(isoVal);
    const diffDays = Math.round((parseLocalDate(isoVal) - timelineStart) / 86400000);
    setSliderValue(Math.max(0, Math.min(totalTimelineDays, diffDays)));
  };

  const handleSliderChange = (val) => {
    const numericVal = parseInt(val, 10);
    setSliderValue(numericVal);
    let target = new Date(timelineStart);
    target.setDate(target.getDate() + numericVal);
    const y = target.getFullYear(), m = String(target.getMonth()+1).padStart(2,'0'), d = String(target.getDate()).padStart(2,'0');
    setEvalDate(`${y}-${m}-${d}`);
  };

  const handleAddTrip = (e) => {
    e.preventDefault();
    if (!entryDate || (!exitDate && !isOngoing)) return alert("Please fill in dates.");
    const colors = ['#3b82f6', '#eab308', '#ec4899', '#14b8a6', '#10b981', '#a855f7'];
    const dynamicColor = colors[trips.length % colors.length];
    setTrips([...trips, { country: country.trim() || "Schengen Country", entry: entryDate, exit: isOngoing ? "" : exitDate, ongoing: isOngoing, color: dynamicColor }]);
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

    const pctStart = Math.max(0, Math.min(100, (start - timelineStart) / (timelineEnd - timelineStart) * 100));
    const pctEnd = Math.max(0, Math.min(100, (end - timelineStart) / (timelineEnd - timelineStart) * 100));
    const pctWidth = Math.max(0.5, pctEnd - pctStart);

    return { ...trip, duration: segmentDuration, left: pctStart, width: pctWidth, idx };
  });

  const windowLeft = Math.max(0, Math.min(100, (windowStart - timelineStart) / (timelineEnd - timelineStart) * 100));
  const windowWidth = Math.max(0, Math.min(100, (targetEvalDate - windowStart) / (timelineEnd - timelineStart) * 100));
  const evalMarkerLeft = Math.max(0, Math.min(100, (targetEvalDate - timelineStart) / (timelineEnd - timelineStart) * 100));

  const cardStyle = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', marginBottom: '20px', boxSizing: 'border-box' };
  const inputStyle = { background: '#0f172a', border: '1px solid #475569', color: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', outline: 'none' };
  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', padding: '20px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'system-ui, sans-serif', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
        
        {/* GRAPHICAL MONITOR PANEL */}
        <div style={cardStyle}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '0 0 4px 0' }}>🇪🇺 Schengen Short-Stay Monitor</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0' }}>Interactive 90/180-day rolling evaluation engine</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Evaluation Date: {formatDisplayDate(evalDate)}</span>
            <input type="date" value={evalDate} onChange={(e) => handleDatePickerChange(e.target.value)} style={inputStyle} />
          </div>

          {/* UPGRADED 4X TALLER VISUAL GRAPHICAL TIMELINE */}
          <div style={{ position: 'relative', height: '160px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', margin: '24px 0 16px 0', overflow: 'hidden', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)' }}>
            
            {/* Year Guidelines Grid for Visual Context */}
            <div style={{ position: 'absolute', left: '0%', width: '16.6%', borderRight: '1px solid #1e293b', top: 0, bottom: 0, padding: '4px', fontSize: '9px', color: '#475569', fontWeight: 'bold' }}>2021</div>
            <div style={{ position: 'absolute', left: '16.6%', width: '16.6%', borderRight: '1px solid #1e293b', top: 0, bottom: 0, padding: '4px', fontSize: '9px', color: '#475569', fontWeight: 'bold' }}>2022</div>
            <div style={{ position: 'absolute', left: '33.2%', width: '16.6%', borderRight: '1px solid #1e293b', top: 0, bottom: 0, padding: '4px', fontSize: '9px', color: '#475569', fontWeight: 'bold' }}>2023</div>
            <div style={{ position: 'absolute', left: '49.8%', width: '16.6%', borderRight: '1px solid #1e293b', top: 0, bottom: 0, padding: '4px', fontSize: '9px', color: '#475569', fontWeight: 'bold' }}>2024</div>
            <div style={{ position: 'absolute', left: '66.4%', width: '16.6%', borderRight: '1px solid #1e293b', top: 0, bottom: 0, padding: '4px', fontSize: '9px', color: '#475569', fontWeight: 'bold' }}>2025</div>
            <div style={{ position: 'absolute', left: '83%', width: '17%', top: 0, bottom: 0, padding: '4px', fontSize: '9px', color: '#475569', fontWeight: 'bold' }}>2026</div>

            {/* Rolling Lookback Window (Blue Shadow Area) */}
            <div style={{ position: 'absolute', left: `${windowLeft}%`, width: `${windowWidth}%`, top: 0, bottom: 0, background: 'rgba(59,130,246,0.12)', borderLeft: '1px dashed #3b82f6', borderRight: '1px dashed #3b82f6', zIndex: 1 }} />
            
            {/* Travel Segments Color Blocks */}
            {processedTrips.map((trip) => (
              <div key={trip.idx} style={{ position: 'absolute', left: `${trip.left}%`, width: `${trip.width}%`, top: '24px', bottom: '24px', backgroundColor: trip.color || '#3b82f6', borderRadius: '4px', minWidth: '4px', zIndex: 2, boxShadow: '0 2px 5px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }} title={`${trip.country}: ${trip.duration} days`} />
            ))}

            {/* Target Red Indicator Pin Line */}
            <div style={{ position: 'absolute', left: `${evalMarkerLeft}%`, width: '2px', top: 0, bottom: 0, backgroundColor: '#ef4444', zIndex: 3 }}>
              <div style={{ position: 'absolute', top: 0, left: '-4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
              <div style={{ position: 'absolute', bottom: 0, left: '-4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
            </div>
          </div>

          <input type="range" min="0" max={totalTimelineDays} value={sliderValue} onChange={(e) => handleSliderChange(e.target.value)} style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '4px', outline: 'none', cursor: 'pointer', marginBottom: '16px' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '16px', marginTop: '16px' }}>
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Days Used</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '36px', fontWeight: '900', color: '#f8fafc' }}>{totalDaysUsed}</p>
            </div>
            {totalDaysUsed > 90 ? (
              <div style={{ padding: '16px', borderRadius: '12px', fontSize: '13px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#f87171', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>⚠️ Overstay Violation Triggered</div>
                <div>Your timeline uses {totalDaysUsed} days, exceeding limits by {totalDaysUsed - 90} days!</div>
              </div>
            ) : totalDaysUsed === 90 ? (
              <div style={{ padding: '16px', borderRadius: '12px', fontSize: '13px', background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b', color: '#fbbf24', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>⚠️ Maximum Stay Threshold Met</div>
                <div>Exactly 90 days used. Staying any longer will result in an immediate customs compliance alert.</div>
              </div>
            ) : (
              <div style={{ padding: '16px', borderRadius: '12px', fontSize: '13px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#34d399', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>✅ Safe Window Alignment</div>
                <div>You hold {90 - totalDaysUsed} safe remaining short-stay days available in this window.</div>
              </div>
            )}
          </div>
        </div>

        {/* LOG NEW ENTRY FORM */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '0 0 16px 0' }}>➕ Add New Segment Entry</h2>
          <form onSubmit={handleAddTrip}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Destination Country</label>
              <input type="text" placeholder="e.g. Poland" value={country} onChange={(e) => setCountry(e.target.value)} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Arrival Date (Entry)</label>
                <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} style={{...inputStyle, width:'100%', boxSizing:'border-box'}} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Departure Date (Exit)</label>
                <input type="date" value={exitDate} onChange={(e) => setExitDate(e.target.value)} disabled={isOngoing} style={{...inputStyle, width:'100%', boxSizing:'border-box'}} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '14px' }}>
              <input type="checkbox" id="ongoingCheck" checked={isOngoing} onChange={(e) => { setIsOngoing(e.target.checked); if(e.target.checked) setExitDate(""); }} style={{ cursor: 'pointer' }} />
              <label htmlFor="ongoingCheck" style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Still inside Schengen zone / Active stay</label>
            </div>
            <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', width: '100%' }}>Append to Log Timeline</button>
          </form>
        </div>

        {/* TIMELINE HISTORY LOG LOG */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '0 0 16px 0' }}>📋 Logged Stay Segments</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {processedTrips.map((trip) => (
              <div key={trip.idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', border: '1px solid #334155', padding: '14px', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
<span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: trip.color, display: 'inline-block' }} />{trip.country}{trip.ongoing && <span style={{ background: '#1e3a8a', color: '#60a5fa', border: '1px solid #3b82f6', fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '20px', textTransform: 'uppercase' }}>Active}<div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{formatDisplayDate(trip.entry)} — {trip.ongoing ? 'Ongoing Stay' : formatDisplayDate(trip.exit)}<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ background: '#334155', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>{trip.duration} Days<button type="button" onClick={() => setTrips(trips.filter((_, i) => i !== trip.idx))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px' }}>🗑️))});}
