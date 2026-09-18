import React, { useState, useEffect } from 'react';
import { schengenCountries } from './constants/countries';
import { parseLocalDate, formatDisplayDate } from './utils/dateHelpers';
import GraphicalTimeline from './components/GraphicalTimeline';
import SafetyPredictor from './components/SafetyPredictor';
import TravelForm from './components/TravelForm';
import LogHistory from './components/LogHistory';

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
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "schengen_trips_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
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
      e.target.value = "";
    };
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
    if (e.target.value && e.target.value.length >= 10 && e.key >= '0' && e.key <= '9') {
      e.preventDefault();
    }
  };

  const handleAddTrip = (e) => {
    e.preventDefault();
    if (!entryDate || (!exitDate && !isOngoing)) return alert("Please fill in dates.");
    const formattedCountry = country.trim();
    const verified = schengenCountries.find(c => c.toLowerCase() === formattedCountry.toLowerCase());
    if (!verified) return alert("❌ Invalid Country Entry!");

    const newStart = parseLocalDate(entryDate);
    const newEnd = isOngoing ? new Date(2099, 11, 31) : parseLocalDate(exitDate);
    if (newEnd < newStart) return alert("Error: Departure date cannot be earlier than arrival.");

    for (let i = 0; i < trips.length; i++) {
      const existing = trips[i];
      const existStart = parseLocalDate(existing.entry);
      const existEnd = existing.ongoing ? new Date(2099, 11, 31) : parseLocalDate(existing.exit);
      if (newStart < existEnd && newEnd > existStart) return alert("❌ Scheduling Clash Detected!");
    }

    const colors = ['#3b82f6', '#eab308', '#ec4899', '#14b8a6', '#10b981', '#a855f7'];
    setTriTrips([...trips, { country: verified, entry: entryDate, exit: isOngoing ? "" : exitDate, ongoing: isOngoing, color: colors[trips.length % colors.length] }]);
    setCountry(""); setEntryDate(""); setExitDate(""); setIsOngoing(false);
  };

  const startEditing = (idx, trip) => {
    setEditingIdx(idx);
    setEditCountry(trip.country);
    setEditEntryDate(trip.entry);
    setEditExitDate(trip.ongoing ? "" : trip.exit);
    setEditIsOngoing(trip.ongoing);
  };

  const handleSaveEdit = (idx) => {
    if (!editEntryDate || (!editExitDate && !editIsOngoing)) return alert("Please fill in dates.");
    const formattedCountry = editCountry.trim();
    const verified = schengenCountries.find(c => c.toLowerCase() === formattedCountry.toLowerCase());
    if (!verified) return alert("❌ Invalid Country Entry!");

    const newStart = parseLocalDate(editEntryDate);
    const newEnd = editIsOngoing ? new Date(2099, 11, 31) : parseLocalDate(editExitDate);
    if (newEnd < newStart) return alert("Error: Departure date cannot be earlier than arrival.");

    for (let i = 0; i < trips.length; i++) {
      if (i === idx) continue;
      const existing = trips[i];
      const existStart = parseLocalDate(existing.entry);
      const existEnd = existing.ongoing ? new Date(2099, 11, 31) : parseLocalDate(existing.exit);
      if (newStart < existEnd && newEnd > existStart) return alert("❌ Scheduling Clash Detected!");
    }

    const updatedTrips = [...trips];
    updatedTrips[idx] = { ...updatedTrips[idx], country: verified, entry: editEntryDate, exit: editIsOngoing ? "" : editExitDate, ongoing: editIsOngoing };
    setTriTrips(updatedTrips);
    setEditingIdx(null);
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

        {showHelpModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '24px', padding: '28px', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', boxSizing: 'border-box', color: '#cbd5e1', fontFamily: 'system-ui, sans-serif' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', fontWeight: '800' }}>💡 App Documentation Guide</h2>
                <button type="button" onClick={() => setShowHelpModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', lineHeight: '1.6', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                <div>
                  <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '2px' }}>🔍 Navigating with Evaluation Date & Slider</strong>
                  The calendar box and range slider target a specific reference day. Adjusting them highlights the active 180-day block area using an enclosed background overlay, instantly calculating how many stay segments fall within that zone range.
                </div>
                <div>
                  <strong style={{ color: '#34d399', display: 'block', marginBottom: '2px' }}>🛡️ The 30-Day Safety Predictor</strong>
                  The panel continuously scans 30 days into the future from your slider focal date. If logged upcoming trips create an allowance breach inside the rolling window within the next month, it flips to an immediate cautionary warning.
                </div>
                <div>
                  <strong style={{ color: '#a855f7', display: 'block', marginBottom: '2px' }}>🎛️ Plan My Year: Full Stress Test</strong>
                  Activating this toggle loops across your entire 18-month itinerary canvas to search for hidden "calendar traps." It catches instances where maximizing stays now accidentally borrows from your allowance later, making it perfect for verifying seasonal property timelines.
                </div>
                <div>
                  <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '2px' }}>✏️ Inline Stay Modification</strong>
                  Click the pencil icon (✏️) on any item in your trip archive logs to toggle edit mode. Modify the country or dates directly in place and click Save (💾) to run strict collision checkers and instantly refresh your timeline graphics.
                </div>
              </div>
              <button type="button" onClick={() => setShowHelpModal(false)} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', marginTop: '20px', cursor: 'pointer' }}>Understood, Close Guide</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
