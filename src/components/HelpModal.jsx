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
          <div>
            <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '2px' }}>🖱️ Grab-and-Slide Timeline Canvas</strong>
            You can now directly grab, click, and slide the highlighted blue 180-day window block overlay horizontally with your mouse cursor [Vercel]. Shifting it left or right moves your reference frame dynamically, shifting both the input range slider and background calculation engines simultaneously.
          </div>
          <div>
            <strong style={{ color: '#eab308', display: 'block', marginBottom: '2px' }}>🔍 Navigating with Evaluation Date & Sliders</strong>
            The alternative calendar date picker box and range slider target a specific reference day. Adjusting either coordinates matches up parameters to track historical stay segment counters inside the bounded rolling period.
          </div>
          <div>
            <strong style={{ color: '#34d399', display: 'block', marginBottom: '2px' }}>🛡️ The 30-Day Safety Predictor</strong>
            The panel continuously evaluates your next month's incoming trips. If future legs cause a rolling violation, it flips the display status box to an immediate warning stating the exact future breach date.
          </div>
          <div>
            <strong style={{ color: '#a855f7', display: 'block', marginBottom: '2px' }}>🎛️ Plan My Year: Full Stress Test</strong>
            Turning on this button scans all 18 months of data to catch sliding calendar traps. It proves if early month stays accidentally lock your seasonal home allowance down later, preventing long-term overstay surprises.
          </div>
          <div>
            <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '2px' }}>✏️ Inline Stay Modification</strong>
            Click the pencil icon (✏️) on any item in your trip archive logs to toggle edit mode. Modify the country or dates directly in place and click Save (💾) to run strict collision checkers and instantly refresh your timeline graphics.
          </div>
          <div>
            <strong style={{ color: '#cbd5e1', display: 'block', marginBottom: '2px' }}>🔒 Privacy & File Backups</strong>
            Your travel histories are stored locally on your own device's internal sandbox. Use the <strong>Export</strong> action to download your timeline profile to your computer, and use <strong>Import</strong> to reload it anytime.
          </div>
        </div>
        
        <button type="button" onClick={onClose} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', marginTop: '20px', cursor: 'pointer' }}>Understood, Close Guide</button>
      </div>
    </div>
  );
}
