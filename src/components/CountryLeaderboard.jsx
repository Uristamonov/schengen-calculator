import React from 'react';

export default function CountryLeaderboard({ processedTrips, cardStyle }) {
  // Aggregate duration totals per country
  const statsMap = processedTrips.reduce((acc, trip) => {
    const name = trip.country;
    acc[name] = (acc[name] || 0) + trip.duration;
    return acc;
  }, {});

  // Convert map to ranked array sorted highest to lowest duration
  const rankedCountries = Object.entries(statsMap)
    .map(([country, days]) => ({ country, days }))
    .sort((a, b) => b.days - a.days);

  if (rankedCountries.length === 0) return null;

  return (
    <div style={cardStyle}>
      <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        📊 Country Statistics Leaderboard
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 16px 0' }}>
        Cumulative short-stay time tracking sorted by allocation saturation.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rankedCountries.map((item, index) => {
          // Visual ranking trophy styling indicators
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
