import React, { useState } from 'react';

export default function HelpModal({ isOpen, onClose }) {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '24px', padding: '28px', maxWidth: '520px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', boxSizing: 'border-box', color: '#cbd5e1', fontFamily: 'system-ui, sans-serif' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', fontWeight: '800', lineHeight: '1.4' }}>
            💡 How to use the Schengen Travel Allowance Planner
          </h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold', padding: '0 4px' }}>✕</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', lineHeight: '1.6', maxHeight: '380px', overflowY: 'auto', paddingRight: '6px' }}>
          <div>
            <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '4px', fontSize: '14px' }}>🗺️ Exploring Your Timeline</strong>
            You can change your reference date by using the calendar box or dragging the horizontal slider. For a quicker option, simply click and drag the blue 180-day window overlay left or right with your mouse. The metrics will update instantly.
          </div>
          <div>
            <strong style={{ color: '#34d399', display: 'block', marginBottom: '4px', fontSize: '14px' }}>🛡️ Tracking and Warnings</strong>
            The app counts how many days you spent in the Schengen zone during the 180-day lookback window from your chosen date. The 30-Day Safety Predictor automatically checks your upcoming scheduled trips to alert you of any future overstay risks a month in advance.
          </div>
          <div>
            <strong style={{ color: '#a855f7', display: 'block', marginBottom: '4px', fontSize: '14px' }}>🎛️ Include Future Travel</strong>
            Turn on this checkbox to scan your entire 18-month itinerary. It looks ahead to catch hidden rolling window violations, making sure that stays planned early in the year do not accidentally use up your allowance for later trips.
          </div>
          <div>
            <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '4px', fontSize: '14px' }}>✏️ Adding and Editing Trips</strong>
            Use the entry form to log new trips. You can type a custom name in the optional Trip Label field (like "Amalfi Coast") to identify specific holidays. To update a trip's details or label, click the pencil icon (✏️) in your history log to edit it inline.
          </div>
          <div>
            <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '4px', fontSize: '14px' }}>🐣 Sample Data and Resetting</strong>
            The app initializes with sample trips (Spain, Italy, and Poland) to show how the timeline tracks stays and flags warnings. To delete these sample trips and start fresh with a completely blank workspace, click the "Clear Data" button at the top right.
          </div>
          <div>
            <strong style={{ color: '#94a3b8', display: 'block', marginBottom: '4px', fontSize: '14px' }}>🔒 Privacy and Data Backups</strong>
            Your travel history is saved locally in your own browser's storage. Use the Export button to download a backup file of your data to your computer, and use the Import button to load it back at any time.
          </div>
        </div>
        
        {/* 🎛️ UNIFIED LIFT TRANSFORM INSTALLED HERE */}
        <button 
          type="button" 
          onClick={onClose} 
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', marginTop: '20px', cursor: 'pointer', fontSize: '14px', transition: 'transform 0.15s ease', transform: isButtonHovered ? 'scale(1.02)' : 'scale(1)' }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
