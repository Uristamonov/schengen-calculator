import React from 'react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '24px', padding: '28px', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', boxSizing: 'border-box', color: '#cbd5e1', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', fontWeight: '800' }}>💡 App Documentation Guide</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', lineHeight: '1.6', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
          {/* UPDATED MODAL PRE-POPULATION DOCUMENTATION EXPLANATORY CONTENT */}
          <div>
            <strong style={{ color: '#2563eb', display: 'block', marginBottom: '2px' }}>🐣 Onboarding Sample Trips</strong>
            To help you get started right away, this tool initializes pre-populated with three distinct test entries (Winter Sun in Spain, Summer Holiday in Italy, and Christmas in Poland). These samples demonstrate how lookback calculations catch potential overstays automatically [Vercel].
          </div>
          <div>
            <strong style={{ color: '#f87171', display: 'block', marginBottom: '2px' }}>🗑️ Resetting to a Blank Slate</strong>
            Ready to log your own genuine itineraries? Simply click the <strong>"Clear Data"</strong> button located at the very top right corner of the application screen. This purges all sample records instantly and sets up a clean workspace [Vercel].
          </div>
          <div>
            <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '2px' }}>鼠标 Grab-and-Slide Timeline Canvas</strong>
            You can directly grab, click, and slide the highlighted blue 180-day window block overlay horizontally with your mouse cursor [Vercel]. Shifting it left or right moves your reference frame dynamically, updating both the input range slider and background calculation engines simultaneously.
          </div>
          <div>
            <strong style={{ color: '#eab308', display: 'block', marginBottom: '2px' }}>🏷️ Optional Trip Labels & Comments</strong>
            When appending or editing a segment, you can add an optional custom comment (e.g., *"Amalfi Coast"* or *"Summer Villa"*). These show up inline next to the country name to help you keep track of specific itineraries.
          </div>
          <div>
            <strong style={{ color: '#34d399', display: 'block', marginBottom: '2px' }}>🛡️ Future Travel Warnings</strong>
            The panel continuously evaluates your next month's incoming trips. If future legs cause a rolling violation, it flips the display status box to an immediate warning stating the exact future breach date.
          </div>
          <div>
            <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '2px' }}>✏️ Inline Stay Modification</strong>
            Click the pencil icon (✏️) on any item in your trip archive logs to toggle edit mode. Modify the country, travel dates, or custom comments directly in place and click Save (💾) to re-verify restrictions and update your metrics.
          </div>
        </div>
        
        <button type="button" onClick={onClose} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', marginTop: '20px', cursor: 'pointer' }}>Understood, Close Guide</button>
      </div>
    </div>
  );
}
