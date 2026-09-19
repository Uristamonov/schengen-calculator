import React, { useState, useEffect } from 'react';
import { schengenCountries } from './constants/countries';
import { parseLocalDate, formatDisplayDate } from './utils/dateHelpers';
import GraphicalTimeline from './components/GraphicalTimeline';
import SafetyPredictor from './components/SafetyPredictor';
import TravelForm from './components/TravelForm';
import LogHistory from './components/LogHistory';
import HelpModal from './components/HelpModal';

export default function App() {
  const timelineStart = new Date(2026, 0, 1);
  const timelineEnd = new Date(2027, 5, 30);
  const totalTimelineDays = Math.round((timelineEnd - timelineStart) / 86400000);

  const [trips, setTriTrips] = useState(() => {
    const saved = localStorage.getItem('schengen_graphical_timeline_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [evalDate, setEvalDate] = useState("2026-09-17");
  const [sliderValue, setSliderValue] = useState(() => {
    return Math.round((new Date(2026, 8, 17) - timelineStart) / 86400000);
  });

  const [country, setCountry] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [isOngoing, setIsOngoing] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [stressTestMode, setStressTestMode] = useState(false);

  const [editingIdx, setEditingIdx] = useState(null);
  const [editCountry, setEditCountry] = useState("");
  const [editShowSuggestions, setEditShowSuggestions] = useState(false);
  const [editEntryDate, setEditEntryDate] = useState("");
  const [editExitDate, setEditExitDate] = useState("");
  const [editIsOngoing, setEditIsOngoing] = useState(false);

  useEffect(() => {
    localStorage.setItem('schengen_graphical_timeline_v4', JSON.stringify(trips));
  }, [trips]);

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trips, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr); anchor.setAttribute("download", "schengen_trips_backup.json");
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
  };

  const handleImportData = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files, "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) { setTriTrips(parsed); alert("Backup data successfully imported!"); }
        else { alert("Invalid backup structure."); }
      } catch (err) { alert("Error parsing file structure."); }
      e.target.value = "";
    };
  };

  const handleDatePickerChange = (isoVal) => {
    setEvalDate(isoVal);
    const diffDays = Math.round((parseLocalDate(isoVal) - timelineStart) / 86400000);
    setSliderValue(Math.max(0, Math.min(totalTimelineDays, diffDays)));
  };

  const handleSliderChange = (val) => {
    const numericVal = parseInt(val, 10); setSliderValue(numericVal);
    let target = new Date(timelineStart); target.setDate(target.getDate() + numericVal);
    setEvalDate(`${target.getFullYear()}-${String(target.getMonth()+1).padStart(2,'0')}-${String(target.getDate()).padStart(2,'0')}`);
  };

  const handleDateKeyDown = (e) => {
    if (e.target.value && e.target.value.length >= 10 && e.key >= '0' && e.key <= '9') e.preventDefault();
  };

  const handleAddTrip = (e) => {
    e.preventDefault(); if (!entryDate || (!exitDate && !isOngoing)) return alert("Please fill in dates.");
    const match = schengenCountries.find(c => c.toLowerCase() === country.trim().toLowerCase());
    if (!match) return alert("❌ Invalid Country!");
    const newStart = parseLocalDate(entryDate), newEnd = isOngoing ? new Date(2099, 11, 31) : parseLocalDate(exitDate);
    if (newEnd < newStart) return alert("Error: Exit cannot be earlier than entry.");
    for (let i = 0; i < trips.length; i++) {
      const exist = trips[i], s = parseLocalDate(exist.entry), e = exist.ongoing ? new Date(2099, 11, 31) : parseLocalDate(exist.exit);
      if (newStart < e && newEnd > s) return alert("❌ Scheduling Clash Detected!");
    }
    const colors = ['#3b82f6', '#eab308', '#ec4899', '#14b8a6', '#10b981', '#a855f7'];
    setTriTrips([...trips, { country: match, entry: entryDate, exit: isOngoing ? "" : exitDate, ongoing: isOngoing, color: colors[trips.length % colors.length] }]);
    setCountry(""); setEntryDate(""); setExitDate(""); setIsOngoing(false);
  };

  const startEditing = (idx, trip) => {
    setEditingIdx(idx); setEditCountry(trip.country); setEditEntryDate(trip.entry);
    setEditExitDate(trip.ongoing ? "" : trip.exit); setEditIsOngoing(trip.ongoing);
  };

  const handleSaveEdit = (idx) => {
    if (!editEntryDate || (!editExitDate && !editIsOngoing)) return alert("Please fill in dates.");
    const match = schengenCountries.find(c => c.toLowerCase() === editCountry.trim().toLowerCase());
    if (!match) return alert("❌ Invalid Country!");
    const newStart = parseLocalDate(editEntryDate), newEnd = editIsOngoing ? new Date(2099, 11, 31) : parseLocalDate(editExitDate);
    if (newEnd < newStart) return alert("Error: Exit cannot be earlier than entry.");
    for (let i = 0; i < trips.length; i++) {
      if (i === idx) continue;
      const exist = trips[i], s = parseLocalDate(exist.entry), e = exist.ongoing ? new Date(2099, 11, 31) : parseLocalDate(exist.exit);
      if (newStart < e && newEnd > s) return alert("❌ Scheduling Clash Detected!");
    }
    const updated = [...trips]; updated[idx] = { ...updated[idx], country: match, entry: editEntryDate, exit: editIsOngoing ? "" : editExitDate, ongoing: editIsOngoing };
    setTriTrips(updated); setEditingIdx(null);
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

  let safeNextMonth = true;
  let highestFutureViolationDay = null; 
  let futureCheckDate = new Date(targetEvalDate);
  for (let d = 1; d <= 30; d++) {
    futureCheckDate.setDate(futureCheckDate.getDate() + 1);
    let simStart = new Date(futureCheckDate);
    simStart.setDate(simStart.getDate() - 179);
    let simDays = 0;
    trips.forEach(t => {
      const start = parseLocalDate(t.entry);
      let end = t.ongoing ? futureCheckDate : parseLocalDate(t.exit);
      if (end > futureCheckDate) end = futureCheckDate;
      const interStart = new Date(Math.max(start, simStart)), interEnd = new Date(Math.min(end, futureCheckDate));
      if (interStart <= interEnd) simDays += Math.round((interEnd - interStart) / 86400000) + 1;
    });
    if (simDays > 90) { 
      safeNextMonth = false; 
      const y = futureCheckDate.getFullYear(), m = String(futureCheckDate.getMonth() + 1).padStart(2, '0'), day = String(futureCheckDate.getDate()).padStart(2, '0');
      highestFutureViolationDay = `${y}-${m}-${day}`;
      break; 
    }
  }

  let stressTestViolationDate = null;
  let stressTestMaxDays = 0;
  if (stressTestMode) {
    let testPointer = new Date(timelineStart);
    while (testPointer <= timelineEnd) {
      let simStart = new Date(testPointer);
      simStart.setDate(simStart.getDate() - 179);
      let simDays = 0;
      trips.forEach(t => {
        const start = parseLocalDate(t.entry);
        let end = t.ongoing ? (testPointer < targetEvalDate ? testPointer : targetEvalDate) : parseLocalDate(t.exit);
        if (end > testPointer) end = testPointer;
        const interStart = new Date(Math.max(start, simStart)), interEnd = new Date(Math.min(end, testPointer));
        if (interStart <= interEnd) simDays += Math.round((interEnd - interStart) / 86400000) + 1;
      });
      if (simDays > 90 && !stressTestViolationDate) { 
        const y = testPointer.getFullYear(), m = String(testPointer.getMonth() + 1).padStart(2, '0'), d = String(testPointer.getDate()).padStart(2, '0');
        stressTestViolationDate = `${y}-${m}-${d}`;
      }
      if (simDays > stressTestMaxDays) { stressTestMaxDays = simDays; }
      testPointer.setDate(testPointer.getDate() + 1);
    }
  }

  const filteredSuggestions = schengenCountries.filter(c => c.toLowerCase().includes(country.toLowerCase()) && country.trim() !== "" && c.toLowerCase() !== country.toLowerCase());
  const editFilteredSuggestions = schengenCountries.filter(c => c.toLowerCase().includes(editCountry.toLowerCase()) && editCountry.trim() !== "" && c.toLowerCase() !== editCountry.toLowerCase());

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

          <GraphicalTimeline
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            totalTimelineDays={totalTimelineDays}
            sliderValue={sliderValue}
            handleSliderChange={handleSliderChange}
            windowLeft={windowLeft}
            windowWidth={windowWidth}
            processedTrips={processedTrips}
            evalMarkerLeft={evalMarkerLeft}
            targetEvalDate={targetEvalDate}
            windowStart={windowStart}
            evalDate={evalDate}
          />

          <div style={{ display: 'flex', alignItems: 'center', padding: '12px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', marginBottom: '0px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>🔍 Plan My Year: Full Continuity Stress Test</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>Scans ahead through all 18 months to check for future calendar traps</span>
            </div>
            <input type="checkbox" checked={stressTestMode} onChange={(e) => setStressTestMode(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
          </div>

          <SafetyPredictor
            totalDaysUsed={totalDaysUsed}
            safeNextMonth={safeNextMonth}
            highestFutureViolationDay={highestFutureViolationDay}
            stressTestMode={stressTestMode}
            stressTestViolationDate={stressTestViolationDate}
            stressTestMaxDays={stressTestMaxDays}
            nextRefreshDate={nextRefreshDate}
            cardStyle={cardStyle}
          />
        </div>
