import React, { useState, useEffect } from 'react';
import { schengenCountries } from './constants/countries';
import { parseLocalDate, formatDisplayDate } from './utils/dateHelpers';
import { 
  processTimelineTrips, 
  calculateNextRefresh, 
  runSafetyPredictor, 
  runFullHorizonStressTest 
} from './utils/schengenEngine';
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
  // 🎛️ INVOAKING THE EXTERNAL MODULAR SCHENGEN MATH ENGINES
  const targetEvalDate = parseLocalDate(evalDate);
  const windowStart = new Date(targetEvalDate);
  windowStart.setDate(windowStart.getDate() - 179);

  const { processedTrips, totalDaysUsed } = processTimelineTrips(
    trips, targetEvalDate, windowStart, timelineStart, timelineEnd
  );

  const nextRefreshDate = calculateNextRefresh(trips, totalDaysUsed, targetEvalDate);
  const { safeNextMonth, highestFutureViolationDay } = runSafetyPredictor(trips, targetEvalDate);
  const { stressTestViolationDate, stressTestMaxDays } = runFullHorizonStressTest(
    trips, stressTestMode, timelineStart, timelineEnd, targetEvalDate
  );

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

        <TravelForm
          country={country}
          setCountry={setCountry}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          filteredSuggestions={filteredSuggestions}
          entryDate={entryDate}
          setEntryDate={setEntryDate}
          exitDate={exitDate}
          setExitDate={setExitDate}
          isOngoing={isOngoing}
          setIsOngoing={setIsOngoing}
          handleDateKeyDown={handleDateKeyDown}
          handleAddTrip={handleAddTrip}
          inputStyle={inputStyle}
          cardStyle={cardStyle}
        />

        <LogHistory
          trips={trips}
          processedTrips={processedTrips}
          editingIdx={editingIdx}
          setEditingIdx={setEditingIdx}
          editCountry={editCountry}
          setEditCountry={setEditCountry}
          editShowSuggestions={editShowSuggestions}
          setEditShowSuggestions={setEditShowSuggestions}
          editFilteredSuggestions={editFilteredSuggestions}
          editEntryDate={editEntryDate}
          setEditEntryDate={setEditEntryDate}
          editExitDate={editExitDate}
          setEditExitDate={setEditExitDate}
          editIsOngoing={editIsOngoing}
          setEditIsOngoing={setEditIsOngoing}
          startEditing={startEditing}
          handleSaveEdit={handleSaveEdit}
          handleDateKeyDown={handleDateKeyDown}
          setTriTrips={setTriTrips}
          cardStyle={cardStyle}
          inputStyle={inputStyle}
        />

        <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

      </div>
    </div>
  );
}
