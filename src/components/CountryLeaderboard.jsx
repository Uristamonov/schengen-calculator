import React from 'react';

export default function CountryLeaderboard({ processedTrips, cardStyle }) {
  const statsMap = processedTrips.reduce((acc, trip) => {
    const name = trip.country;
    acc[name] = (acc[name] || 0) + trip.duration;
    return acc;
  }, {});

  const rankedCountries = Object.entries(statsMap)
    .map(([country, days]) => ({ country, days }))
    .sort((a, b) => b.days - a.days);

  if (rankedCountries.length === 0) return null;

  return (
    <div style={cardStyle}>
      {/* UPDATED SYSTEM METRIC TITLE */}
      <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        📊 Most-Visited Countries
      </h2>
      {/* TECHNICAL SATURATION JARGON PARAGRAPH COMPLETELY PURGED */}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rankedCountries.map((item, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍';
          
          return (
            <div 
              key={item.country} 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '12px 16px', borderRadius: '10px', border: '1px solid #334155' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>
                <span style={{ fontSize: '16px' }}>{medal}</span>
                {item.country}
              </div>
              <span style={{ background: '#1e293b', border: '1px solid #475569', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                {item.days} {item.days === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
