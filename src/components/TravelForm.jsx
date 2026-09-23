import React, { useState } from 'react';

export default function TravelForm({
  country, setCountry, showSuggestions, setShowSuggestions, filteredSuggestions,
  entryDate, setEntryDate, exitDate, setExitDate, isOngoing, setIsOngoing,
  handleDateKeyDown, handleAddTrip, inputStyle, cardStyle
}) {
  const [commentInput, setCommentInput] = useState("");
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleSubmitIntercept = (e) => {
    e.preventDefault();
    handleAddTrip(e, commentInput);
    setCommentInput("");
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '0 0 16px 0' }}>➕ Add New Trip</h2>
      <form onSubmit={handleSubmitIntercept}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px', position: 'relative' }}>
          <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Destination Country</label>
          <input 
            type="text" placeholder="Type to filter e.g. Poland, France..." value={country} 
            onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
            onChange={(e) => { setCountry(e.target.value); setShowSuggestions(true); }} 
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} 
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', marginTop: '4px', zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
              {filteredSuggestions.map((suggestion, sIdx) => (
                <div key={sIdx} onClick={() => { setCountry(suggestion); setShowSuggestions(false); }} style={{ padding: '10px 14px', fontSize: '13px', color: '#f8fafc', cursor: 'pointer', borderBottom: '1px solid #334155' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>📍 {suggestion}</div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
          <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Trip Label / Comments (Optional)</label>
          <input type="text" placeholder="e.g. Amalfi Coast, Summer Villa..." value={commentInput} onChange={(e) => setCommentInput(e.target.value)} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
        </div>

        <div style={{ gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px', display: 'grid' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Arrival Date (Entry)</label>
            <input type="date" min="2026-01-01" max="2027-06-30" onKeyDown={handleDateKeyDown} value={entryDate} onChange={(e) => { setEntryDate(e.target.value); if(exitDate && exitDate < e.target.value) setExitDate(""); }} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Departure Date (Exit)</label>
            {/* 🛡️ RE-VALIDATION LOCK: min FIELD IS TIED TO ACTIVE ARRIVAL VALUE */}
            <input type="date" min={entryDate || "2026-01-01"} max="2027-06-30" onKeyDown={handleDateKeyDown} value={exitDate} onChange={(e) => setExitDate(e.target.value)} disabled={isOngoing} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '14px' }}>
          <input type="checkbox" id="ongoingCheck" checked={isOngoing} onChange={(e) => { setIsOngoing(e.target.checked); if (e.target.checked) setExitDate(""); }} style={{ cursor: 'pointer' }} />
          <label htmlFor="ongoingCheck" style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Still inside Schengen zone / Active stay</label>
        </div>

        <button 
          type="submit" onMouseEnter={() => setIsButtonHovered(true)} onMouseLeave={() => setIsButtonHovered(false)}
          style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', width: '100%', transition: 'transform 0.15s ease', transform: isButtonHovered ? 'scale(1.02)' : 'scale(1)' }}
        >
          Add Trip
        </button>
      </form>
    </div>
  );
}
