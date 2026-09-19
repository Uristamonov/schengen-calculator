import React, { useRef, useState, useEffect } from 'react';
import { formatDisplayDate } from '../utils/dateHelpers';

export default function GraphicalTimeline({
  timelineStart,
  timelineEnd,
  totalTimelineDays,
  sliderValue,
  handleSliderChange,
  windowLeft,
  windowWidth,
  processedTrips,
  evalMarkerLeft,
  targetEvalDate,
  windowStart,
  evalDate
}) {
  const trackRef = useRef(null);
  const [isDragging, setIsOngoingDrag] = useState(false);
  const [dragStartDays, setDragStartDays] = useState(0);
  const [dragStartPercent, setDragStartPercent] = useState(0);

  const handleWindowMouseDown = (e) => {
    e.preventDefault();
    if (!trackRef.current) return;
    
    setIsOngoingDrag(true);
    setDragStartDays(sliderValue);
    
    const trackRect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - trackRect.left;
    const clickPercent = (clickX / trackRect.width) * 100;
    setDragStartPercent(clickPercent);
  };

  useEffect(() => {
    const handleMouseGlobalMove = (e) => {
      if (!isDragging || !trackRef.current) return;
      
      const trackRect = trackRef.current.getBoundingClientRect();
      const currentX = e.clientX - trackRect.left;
      const currentPercent = (currentX / trackRect.width) * 100;
      
      const pctDelta = currentPercent - dragStartPercent;
      const daysDelta = Math.round((pctDelta / 100) * totalTimelineDays);
      
      let targetDays = dragStartDays + daysDelta;
      if (targetDays < 0) targetDays = 0;
      if (targetDays > totalTimelineDays) targetDays = totalTimelineDays;
      
      handleSliderChange(targetDays);
    };

    const handleMouseGlobalUp = () => {
      if (isDragging) setIsOngoingDrag(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseGlobalMove);
      window.addEventListener('mouseup', handleMouseGlobalUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseGlobalMove);
      window.removeEventListener('mouseup', handleMouseGlobalUp);
    };
  }, [isDragging, dragStartPercent, dragStartDays, totalTimelineDays, handleSliderChange]);

  return (
    <>
      <div style={{ padding: '8px 12px', background: '#1e293b', borderRadius: '8px', border: '1px dashed #475569', fontSize: '11px', color: '#94a3b8', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
        {/* FIXED DATE FORMATTING CHECKPOINT PASS */}
        <span>📅 Window Start: <strong>{formatDisplayDate(windowStart.toISOString().split('T')[0])}</strong></span>
        <span>➡️ Evaluation Target: <strong>{formatDisplayDate(evalDate)}</strong></span>
      </div>

      <div 
        ref={trackRef}
        style={{ position: 'relative', height: '160px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', margin: '24px 0 16px 0', overflow: 'hidden', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)' }}
      >
        <div style={{ position: 'absolute', left: '0%', width: '16.66%', borderRight: '1px dashed #1e293b', top: 0, bottom: 0, padding: '4px', fontSize: '8px', color: '#475569', fontWeight: 'bold' }}>'26 Q1</div>
        <div style={{ position: 'absolute', left: '16.66%', width: '16.66%', borderRight: '1px dashed #1e293b', top: 0, bottom: 0, padding: '4px', fontSize: '8px', color: '#475569', fontWeight: 'bold' }}>'26 Q2</div>
        <div style={{ position: 'absolute', left: '33.33%', width: '16.66%', borderRight: '1px dashed #1e293b', top: 0, bottom: 0, padding: '4px', fontSize: '8px', color: '#475569', fontWeight: 'bold' }}>'26 Q3</div>
        <div style={{ position: 'absolute', left: '50%', width: '16.66%', borderRight: '2px solid #334155', top: 0, bottom: 0, padding: '4px', fontSize: '8px', color: '#64748b', fontWeight: 'black' }}>'26 Q4</div>
        <div style={{ position: 'absolute', left: '66.66%', width: '16.66%', borderRight: '1px dashed #1e293b', top: 0, bottom: 0, padding: '4px', fontSize: '8px', color: '#475569', fontWeight: 'bold' }}>'27 Q1</div>
        <div style={{ position: 'absolute', left: '83.33%', width: '16.66%', top: 0, bottom: 0, padding: '4px', fontSize: '8px', color: '#475569', fontWeight: 'bold' }}>'27 Q2</div>

        <div 
          onMouseDown={handleWindowMouseDown}
          style={{ 
            position: 'absolute', left: `${windowLeft}%`, width: `${windowWidth}%`, top: 0, bottom: 0, 
            background: isDragging ? 'rgba(59,130,246,0.22)' : 'rgba(59,130,246,0.12)', 
            borderLeft: '2px solid #3b82f6', borderRight: '2px solid #3b82f6', zIndex: 4, 
            cursor: isDragging ? 'grabbing' : 'grab', transition: 'background-color 0.15s ease'
          }} 
          title="Drag left or right to slide the lookback window timeline"
        />
        
        {processedTrips.map((trip) => {
          // DYNAMIC HOVER LABEL ASSEMBLER NODE
          const tooltipString = trip.comments 
            ? `${trip.country} (${trip.comments}): ${trip.duration} days`
            : `${trip.country}: ${trip.duration} days`;

          return (
            <div 
              key={trip.idx} 
              style={{ position: 'absolute', left: `${trip.left}%`, width: `${trip.width}%`, top: '24px', bottom: '24px', backgroundColor: trip.color || '#3b82f6', borderRadius: '4px', minWidth: '4px', zIndex: 2, boxShadow: '0 2px 5px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }} 
              title={tooltipString} 
            />
          );
        })}

        <div style={{ position: 'absolute', left: `${evalMarkerLeft}%`, width: '2px', top: 0, bottom: 0, backgroundColor: '#ef4444', zIndex: 3 }}>
          <div style={{ position: 'absolute', top: 0, left: '-4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '-4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
        </div>
      </div>

      <input type="range" min="0" max={totalTimelineDays} value={sliderValue} onChange={(e) => handleSliderChange(e.target.value)} style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '4px', outline: 'none', cursor: 'pointer', marginBottom: '16px' }} />
    </>
  );
}
