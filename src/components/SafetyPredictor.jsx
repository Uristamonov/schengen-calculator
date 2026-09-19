import React from 'react';
import { formatDisplayDate } from '../utils/dateHelpers';

export default function SafetyPredictor({
  totalDaysUsed,
  safeNextMonth,
  highestFutureViolationDay,
  stressTestMode,
  stressTestViolationDate,
  stressTestMaxDays,
  nextRefreshDate,
  cardStyle
}) {
  // 🎨 DYNAMIC METRIC STYLE COORDINATORS
  let metricBorderColor = '#334155';
  let metricTextColor = '#f8fafc';

  if (totalDaysUsed === 90) {
    metricBorderColor = '#eab308'; // Warning Alert Yellow Border
    metricTextColor = '#eab308';   // Warning Alert Yellow Text
  } else if (totalDaysUsed >= 91) {
    metricBorderColor = '#ef4444'; // Violation Breach Red Border
    metricTextColor = '#ef4444';   // Violation Breach Red Text
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '16px', marginTop: '16px' }}>
        {/* DYNAMICALLY INJECTED ACCENT CONTAINER */}
        <div style={{ background: '#0f172a', border: `1px solid ${metricBorderColor}`, borderRadius: '12px', padding: '16px', textAlign: 'center', transition: 'all 0.2s ease' }}>
          <h3 style={{ margin: 0, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Days Used</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '36px', fontWeight: '900', color: metricTextColor, transition: 'color 0.2s ease' }}>{totalDaysUsed}</p>
        </div>
        
        {totalDaysUsed > 90 ? (
          <div style={{ padding: '16px', borderRadius: '12px', fontSize: '13px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#f87171', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>⚠️ Overstay Violation Triggered</div>
            <div>Your timeline uses {totalDaysUsed} days, exceeding limits by {totalDaysUsed - 90} days!</div>
          </div>
        ) : !safeNextMonth ? (
          <div style={{ padding: '16px', borderRadius: '12px', fontSize: '13px', background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b', color: '#fbbf24', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>⚠️ Future Overstay Warning</div>
            <div>Current window is clear, but upcoming scheduled trips will cause a violation on <strong>{highestFutureViolationDay ? formatDisplayDate(highestFutureViolationDay) : ''}</strong>!</div>
          </div>
        ) : (
          <div style={{ padding: '16px', borderRadius: '12px', fontSize: '13px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#34d399', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>✅ Safe Next 30 Days</div>
            <div>There are {90 - totalDaysUsed} remaining days available in this window.</div>
          </div>
        )}
      </div>

      {stressTestMode && (
        <div style={{ ...cardStyle, background: stressTestViolationDate ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)', borderColor: stressTestViolationDate ? '#ef4444' : '#10b981', marginBottom: '0px', marginTop: '16px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '800', color: stressTestViolationDate ? '#f87171' : '#34d399', textTransform: 'uppercase', marginBottom: '4px' }}>🛡️ Future Travel Evaluation</h2>
          <div style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '600' }}>
            {stressTestViolationDate ? (
              <span>⚠️ <strong>Future Overstay Detected!!</strong> Planned trips will trigger an overstay on <span style={{ color: '#f87171', textDecoration: 'underline' }}>{formatDisplayDate(stressTestViolationDate)}</span>. Maximum overstay will be <span style={{ color: '#ef4444' }}>{stressTestMaxDays - 90} days</span> inside that 180-day window.</span>
            ) : (
              <span>✅ <strong>Future Travel Verified</strong> for forthcoming 18-month itinerary. Peak allocation hits {stressTestMaxDays}/90 days.</span>
            )}
          </div>
        </div>
      )}

      {totalDaysUsed >= 90 && (
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #3b82f6', marginTop: '16px', marginBottom: '0px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '4px' }}>🔮 Predicted Earliest Re-entry</h2>
          <div style={{ fontSize: '14px', color: '#f8fafc', fontWeight: '600', lineHeight: '1.5' }}>
            {nextRefreshDate ? (
              (() => {
                const y = nextRefreshDate.getFullYear();
                const m = String(nextRefreshDate.getMonth() + 1).padStart(2, '0');
                const d = String(nextRefreshDate.getDate()).padStart(2, '0');
                return (
                  <span>Assuming you leave the zone tomorrow, your earliest next entry allowance window opens on <span style={{ color: '#60a5fa', textDecoration: 'underline', fontWeight: '800' }}>{formatDisplayDate(`${y}-${m}-${d}`)}</span>.</span>
                );
              })()
            ) : (
              <span style={{ color: '#94a3b8' }}>An active ongoing stay means your counter increases at the same rate as the window moves. You must log a departure date to allow days to roll off.</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
