import React, { useState, useEffect } from 'react';

export default function App() {
  const timelineStart = new Date(2026, 0, 1);
  const timelineEnd = new Date(2027, 5, 30);
  const totalTimelineDays = Math.round((timelineEnd - timelineStart) / 86400000);

  const initialDataSet = [];

  const schengenCountries = [
    "Austria", "Belgium", "Bulgaria", "Croatia", "Czech Republic", "Denmark", 
    "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", 
    "Italy", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", 
    "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Slovakia", 
    "Slovenia", "Spain", "Sweden", "Switzerland"
  ];

  const [trips, setTriTrips] = useState(() => {
    const saved = localStorage.getItem('schengen_graphical_timeline_v4');
    return saved ? JSON.parse(saved) : initialDataSet;
  });

  const [evalDate, setEvalDate] = useState("2026-09-17");
  const [sliderValue, setSliderValue] = useState(() => {
    const initialTarget = new Date(2026, 8, 17);
    return Math.round((initialTarget - timelineStart) / 86400000);
  });

  const [country, setCountry] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [isOngoing, setIsOngoing] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('schengen_graphical_timeline_v4', JSON.stringify(trips));
  }, [trips]);

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trips, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "schengen_trips_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e) => {
    const fileReader = new FileReader();
    if (!e.target.files || e.target.files.length === 0) return;
    fileReader.readAsText(e.target.files, "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        if (Array.isArray(parsedData)) {
          setTriTrips(parsedData);
          alert("Backup data successfully imported and synced!");
        } else {
          alert("Invalid backup file structure.");
        }
      } catch (err) {
        alert("Error parsing file structure.");
      }
    };
  };

  const parseLocalDate = (str) => !str ? new Date() : new Date(str + "T00:00:00");

  const formatDisplayDate = (str) => {
    if (!str) return "Ongoing";
    const dateObj = new Date(str + "T00:00:00");
    if (isNaN(dateObj.getTime())) return str;
    return `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()}`;
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

  const handleDateKeyDown = (e) => {
    const value = e.target.value;
    if (value && value.length >= 10) {
      if (e.key >= '0' && e.key <= '9') e.preventDefault();
    }
  };

  const handleAddTrip = (e) => {
    e.preventDefault();
    if (!entryDate || (!exitDate && !isOngoing)) return alert("Please fill in dates.");
    const formattedInputCountry = country.trim();
    const isKnownState = schengenCountries.some(c => c.toLowerCase() === formattedInputCountry.toLowerCase());
    if (!isKnownState) return alert("❌ Invalid Country Entry!");

    const verifiedCountryName = schengenCountries.find(c => c.toLowerCase() === formattedInputCountry.toLowerCase());
    const newStart = parseLocalDate(entryDate);
    const newEnd = isOngoing ? new Date(2099, 11, 31) : parseLocalDate(exitDate);
    if (newEnd < newStart) return alert("Error: Departure date cannot be earlier than arrival.");

    for (let i = 0; i < trips.length; i++) {
      const existingTrip = trips[i];
      const existStart = parseLocalDate(existingTrip.entry);
      const existEnd = existingTrip.ongoing ? new Date(2099, 11, 31) : parseLocalDate(existingTrip.exit);
      if (newStart < existEnd && newEnd > existStart) return alert("❌ Scheduling Clash Detected!");
    }

    const colors = ['#3b82f6', '#eab308', '#ec4899', '#14b8a6', '#10b981', '#a855f7'];
    const dynamicColor = colors[trips.length % colors.length];
    setTriTrips([...trips, { country: verifiedCountryName, entry: entryDate, exit: isOngoing ? "" : exitDate, ongoing: isOngoing, color: dynamicColor }]);
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
    return { ...trip, duration: segmentDuration, left: pctStart, width: Math.max(0.5, pctEnd - pctStart), idx };
  });
  let nextRefreshDate = null;
  if (totalDaysUsed >= 90) {
    let checkDate = new Date(targetEvalDate);
    for (let dayOffset = 1; dayOffset <= 180; dayOffset++) {
      checkDate.setDate(checkDate.getDate() + 1);
      let simulatedStart = new Date(checkDate);
      simulatedStart.setDate(simulatedStart.getDate() - 179);
      let simulatedDays = 0;
      trips.forEach(t => {
        const start = parseLocalDate(t.entry);
        let end = t.ongoing ? targetEvalDate : parseLocalDate(t.exit);
        if (end > checkDate) end = checkDate;
        const interStart = new Date(Math.max(start, simulatedStart)), interEnd = new Date(Math.min(end, checkDate));
        if (interStart <= interEnd) simulatedDays += Math.round((interEnd - interStart) / 86400000) + 1;
      });
      if (simulatedDays < 90) { nextRefreshDate = new Date(checkDate); break; }
    }
  }

  const filteredSuggestions = schengenCountries.filter(c => c.toLowerCase().includes(country.toLowerCase()) && country.trim() !== "" && c.toLowerCase() !== country.toLowerCase());
  const windowLeft = Math.max(0, Math.min(100, (windowStart - timelineStart) / (timelineEnd - timelineStart) * 100));
  const windowWidth = Math.max(0, Math.min(100, (targetEvalDate - windowStart) / (timelineEnd - timelineStart) * 100));
  const evalMarkerLeft = Math.max(0, Math.min(100, (targetEvalDate - timelineStart) / (timelineEnd - timelineStart) * 100));

  const cardStyle = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', marginBottom: '20px', boxSizing: 'border-box' };
  const inputStyle = { background: '#0f172a', border: '1px solid #475569', color: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', outline: 'none' };

  const inlineCalendarStyles = `input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; opacity: 0.8; } input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 1; }`;

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', padding: '20px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'system-ui, sans-serif', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
      <style>{inlineCalendarStyles}</style>
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
        
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '4px' }}>
            <div>
              <h1 style={{ fontSize: '24px', color: '#f8fafc', margin: 0, fontWeight: '800' }}>🇪🇺 Schengen Short-Stay Monitor</h1>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Interactive 18-Month Lookahead Timeline</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button type="button" onClick={() => setShowHelpModal(true)} style={{ background: '#1e3a8a', border: '1px solid #3b82f6', color: '#60a5fa', fontSize: '11px', fontWeight: '700', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', textTransform: 'uppercase' }}>💡 How to Use</button>
              <button type="button" onClick={handleExportData} style={{ background: '#334155', border: '1px solid #475569', color: '#f8fafc', fontSize: '11px', fontWeight: '700', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', textTransform: 'uppercase' }}>📥 Export</button>
              <label style={{ background: '#334155', border: '1px solid #475569', color: '#f8fafc', fontSize: '11px', fontWeight: '700', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', textTransform: 'uppercase' }}>📤 Import<input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} /></label>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0', background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Evaluation Date: {formatDisplayDate(evalDate)}</span>
            <input type="date" min="2026-01-01" max="2027-06-30" onKeyDown={handleDateKeyDown} value={evalDate} onChange={(e) => handleDatePickerChange(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ position: 'relative', height: '160px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', margin: '24px 0 16px 0', overflow: 'hidden', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)' }}>
            <div style={{ position: 'absolute', left: '0%', width: '16.66%', borderRight: '1px dashed #1e293b', top: 0, bottom: 0, padding: '4px', fontSize: '8px', color: '#475569', fontWeight: 'bold' }}>'26 Q1</div>
            <div style={{ position: 'absolute', left: '16.66%', width: '16.66%', borderRight: '1px dashed #1e293b', top: 0, bottom: 0, padding: '4px', fontSize: '8px', color: '#475569', fontWeight: 'bold' }}>'26 Q2</div>
            <div style={{ position: 'absolute', left: '33.33%', width: '16.66%', borderRight: '1px dashed #1e293b', top: 0, bottom: 0, padding: '4px', fontSize: '8px', color: '#475569', fontWeight: 'bold' }}>'26 Q3</div>
            <div style={{ position: 'absolute', left: '50%', width: '16.66%', borderRight: '2px solid #334155', top: 0, bottom: 0, padding: '4px', fontSize: '8px', color: '#64748b', fontWeight: 'black' }}>'26 Q4</div>
            <div style={{ position: 'absolute', left: '66.66%', width: '16.66%', borderRight: '1px dashed #1e293b', top: 0, bottom: 0, padding: '4px', fontSize: '8px', color: '#475569', fontWeight: 'bold' }}>'27 Q1</div>
            <div style={{ position: 'absolute', left: '83.33%', width: '16.66%', top: 0, bottom: 0, padding: '4px', fontSize: '8px', color: '#475569', fontWeight: 'bold' }}>'27 Q2</div>

            <div style={{ position: 'absolute', left: `${windowLeft}%`, width: `${windowWidth}%`, top: 0, bottom: 0, background: 'rgba(59,130,246,0.12)', borderLeft: '1px dashed #3b82f6', borderRight: '1px dashed #3b82f6', zIndex: 1 }} />
            {processedTrips.map((trip) => (
              <div key={trip.idx} style={{ position: 'absolute', left: `${trip.left}%`, width: `${trip.width}%`, top: '24px', bottom: '24px', backgroundColor: trip.color || '#3b82f6', borderRadius: '4px', minWidth: '4px', zIndex: 2, boxShadow: '0 2px 5px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }} title={`${trip.country}: ${trip.duration} days`} />
            ))}
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

        {totalDaysUsed >= 90 && (
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #3b82f6' }}>
            <h2 style={{ fontSize: '11px', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '6px' }}>🔮 Predictive Entry Lookahead</h2>
            <div style={{ fontSize: '14px', color: '#f8fafc', fontWeight: '600', lineHeight: '1.5' }}>
              {nextRefreshDate ? (
                <span>Assuming you leave the zone tomorrow, your earliest next entry allowance window opens on <span style={{ color: '#60a5fa', textDecoration: 'underline', fontWeight: '800' }}>{formatDisplayDate(nextRefreshDate.toISOString().split('T')[0])}</span>.</span>
              ) : (
                <span style={{ color: '#94a3b8' }}>An active ongoing stay means your counter increases at the same rate as the window moves. You must log a departure date to allow days to roll off.</span>
              )}
            </div>
          </div>
        )}

        <div style={cardStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '0 0 16px 0' }}>➕ Add New Travel Segment</h2>
          <form onSubmit={handleAddTrip}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px', position: 'relative' }}>
              <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Destination Country</label>
              <input type="text" placeholder="Type to filter e.g. Poland, France..." value={country} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} onChange={(e) => { setCountry(e.target.value); setShowSuggestions(true); }} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', marginTop: '4px', zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
                  {filteredSuggestions.map((suggestion, sIdx) => (
                    <div key={sIdx} onClick={() => { setCountry(suggestion); setShowSuggestions(false); }} style={{ padding: '10px 14px', fontSize: '13px', color: '#f8fafc', cursor: 'pointer', borderBottom: '1px solid #334155' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>📍 {suggestion}</div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px', display: 'grid' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Arrival Date (Entry)</label>
                <input type="date" min="2026-01-01" max="2027-06-30" onKeyDown={handleDateKeyDown} value={entryDate} onChange={(e) => setEntryDate(e.target.value)} style={{...inputStyle, width:'100%', boxSizing:'border-box'}} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Departure Date (Exit)</label>
                <input type="date" min="2026-01-01" max="2027-06-30" onKeyDown={handleDateKeyDown} value={exitDate} onChange={(e) => setExitDate(e.target.value)} disabled={isOngoing} style={{...inputStyle, width:'100%', boxSizing:'border-box'}} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '14px' }}>
              <input type="checkbox" id="ongoingCheck" checked={isOngoing} onChange={(e) => { setIsOngoing(e.target.checked); if(e.target.checked) setExitDate(""); }} style={{ cursor: 'pointer' }} />
              <label htmlFor="ongoingCheck" style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Still inside Schengen zone / Active stay</label>
            </div>
            <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', width: '100%' }}>Append to Log Timeline</button>
          </form>
        </div>
        <div style={cardStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '0 0 16px 0' }}>📋 Logged Stay Segments</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {processedTrips.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#475569', fontSize: '13px', padding: '20px 0' }}>No travel segments currently logged in this browser session.</div>
            ) : (
              processedTrips.map((trip) => (
                <div key={trip.idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', border: '1px solid #334155', padding: '14px', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: trip.color, display: 'inline-block' }} />
                      {trip.country}
                      {trip.ongoing && <span style={{ background: '#1e3a8a', color: '#60a5fa', border: '1px solid #3b82f6', fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '20px', textTransform: 'uppercase' }}>Active</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{formatDisplayDate(trip.entry)} — {trip.ongoing ? 'Ongoing Stay' : formatDisplayDate(trip.exit)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ background: '#334155', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>{trip.duration} Days</span>
                    <button type="button" onClick={() => setTriTrips(trips.filter((_, i) => i !== trip.idx))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {showHelpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '24px', padding: '28px', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', boxSizing: 'border-box', color: '#cbd5e1', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', fontWeight: '800' }}>💡 App Documentation Guide</h2>
              <button type="button" onClick={() => setShowHelpModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', lineHeight: '1.6', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
              <div>
                <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '2px' }}>🔍 Navigating with Evaluation Date & Slider</strong>
                The <strong>Evaluation Date</strong> calendar selector and horizontal range slider work hand-in-hand to shift your reference timeline point. Changing either tool updates the <strong>red focal pinpoint indicator</strong> on your 18-month map grid and establishes the target point for the rolling lookback count [Vercel].
              </div>
              <div>
                <strong style={{ color: '#34d399', display: 'block', marginBottom: '2px' }}>📊 The 90/180-Day Rolling Rule</strong>
                The panel dynamically assesses how many total days you have logged inside your active 180-day window relative to your current slider view point. This allows you to slide back into the past to track history or slide out into 2027 to forecast future trip balances [Vercel].
              </div>
              <div>
                <strong style={{ color: '#cbd5e1', display: 'block', marginBottom: '2px' }}>📍 Logging Trips & Transit Days</strong>
                Type a destination country name and select an official state from the suggestion dropdown. The overlap calculator handles transit days perfectly, meaning you can exit Country A and enter Country B on the same afternoon.
              </div>
              <div>
                <strong style={{ color: '#cbd5e1', display: 'block', marginBottom: '2px' }}>🏃 Active Stays Checkbox</strong>
                Check the <em>"Still inside Schengen zone"</em> box if you are currently inside a country. This locks the departure variable to the rolling slider target dynamically.
              </div>
              <div>
                <strong style={{ color: '#cbd5e1', display: 'block', marginBottom: '2px' }}>🔒 Privacy & File Backups</strong>
                Your travel histories are stored locally on your own device's internal sandbox. Use the <strong>Export</strong> action to download your timeline profile to your computer, and use <strong>Import</strong> to reload it anytime.
              </div>
            </div>
            <button type="button" onClick={() => setShowHelpModal(false)} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', marginTop: '20px', cursor: 'pointer' }}>Understood, Close Guide</button>
          </div>
        </div>
      )}
    </div>
  );
}
