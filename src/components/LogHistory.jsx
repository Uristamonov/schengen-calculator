import React from 'react';
import { formatDisplayDate } from '../utils/dateHelpers';

export default function LogHistory({
  trips,
  processedTrips,
  editingIdx,
  setEditingIdx,
  editCountry,
  setEditCountry,
  editShowSuggestions,
  setEditShowSuggestions,
  editFilteredSuggestions,
  editEntryDate,
  setEditEntryDate,
  editExitDate,
  setEditExitDate,
  editIsOngoing,
  setEditIsOngoing,
  startEditing,
  handleSaveEdit,
  handleDateKeyDown,
  setTriTrips,
  cardStyle,
  inputStyle
}) {
  const [editComment, setEditComment] = React.useState("");

  const triggerStartEditing = (idx, trip) => {
    startEditing(idx, trip);
    setEditComment(trip.comments || "");
  };

  const sortedProcessedTrips = [...processedTrips].sort((a, b) => {
    return new Date(a.entry + "T00:00:00") - new Date(b.entry + "T00:00:00");
  });

  return (
    <div style={cardStyle}>
      <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '0 0 16px 0' }}>📋 Logged Trips</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sortedProcessedTrips.length === 0 ? (
          /* UPDATED EMPTY TIMELINE RE-WORDS */
          <div style={{ textAlign: 'center', color: '#475569', fontSize: '13px', padding: '20px 0' }}>No trips currently logged in this browser session.</div>
        ) : (
          sortedProcessedTrips.map((trip) => {
            return (
              <div key={trip.idx} style={{ background: '#0f172a', border: '1px solid #334155', padding: '14px', borderRadius: '12px' }}>
                {editingIdx === trip.idx ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Edit Country</label>
                      <input type="text" value={editCountry} onFocus={() => setEditShowSuggestions(true)} onBlur={() => setTimeout(() => setEditShowSuggestions(false), 200)} onChange={(e) => { setEditCountry(e.target.value); setEditShowSuggestions(true); }} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                      {editShowSuggestions && editFilteredSuggestions.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', marginTop: '4px', zIndex: 20, maxHeight: '120px', overflowY: 'auto' }}>
                          {editFilteredSuggestions.map((sug, sIdx) => (
                            <div key={sIdx} onClick={() => { setEditCountry(sug); setEditShowSuggestions(false); }} style={{ padding: '8px 12px', fontSize: '12px', color: '#f8fafc', cursor: 'pointer', borderBottom: '1px solid #334155' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>📍 {sug}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Edit Trip Label / Comments</label>
                      <input type="text" value={editComment} onChange={(e) => setEditComment(e.target.value)} placeholder="e.g. Amalfi Coast, Summer Villa..." style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Entry</label>
                        <input type="date" min="2026-01-01" max="2027-06-30" onKeyDown={handleDateKeyDown} value={editEntryDate} onChange={(e) => setEditEntryDate(e.target.value)} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Exit</label>
                        <input type="date" min="2026-01-01" max="2027-06-30" onKeyDown={handleDateKeyDown} value={editExitDate} onChange={(e) => setEditExitDate(e.target.value)} disabled={editIsOngoing} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="checkbox" id={`editOngoing-${trip.idx}`} checked={editIsOngoing} onChange={(e) => { setEditIsOngoing(e.target.checked); if (e.target.checked) setEditExitDate(""); }} />
                      <label htmlFor={`editOngoing-${trip.idx}`} style={{ fontSize: '12px', fontWeight: '600' }}>Active Stay</label>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button type="button" onClick={() => handleSaveEdit(trip.idx, editComment)} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>💾 Save</button>
                      <button type="button" onClick={() => setEditingIdx(null)} style={{ flex: 1, background: '#475569', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>✕ Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: trip.color, display: 'inline-block' }} />
                        {trip.country}
                        {trip.comments && <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '500', fontStyle: 'italic' }}>— "{trip.comments}"</span>}
                        {trip.ongoing && <span style={{ background: '#1e3a8a', color: '#60a5fa', border: '1px solid #3b82f6', fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '20px', textTransform: 'uppercase' }}>Active</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{formatDisplayDate(trip.entry)} — {trip.ongoing ? 'Ongoing Stay' : formatDisplayDate(trip.exit)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#334155', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', color: '#f1f5f9' }}>{trip.duration} Days</span>
                      <button type="button" onClick={() => triggerStartEditing(trip.idx, trip)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '14px' }} title="Edit Stay">✏️</button>
                      <button type="button" onClick={() => setTriTrips(trips.filter((_, i) => i !== trip.idx))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px' }} title="Delete Stay">🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
