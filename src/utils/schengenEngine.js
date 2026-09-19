import { parseLocalDate } from './dateHelpers';

// 🔍 1. Core 180-Day Lookback Array Processors
export function processTimelineTrips(trips, targetEvalDate, windowStart, timelineStart, timelineEnd) {
  let totalDaysUsed = 0;

  const processedTrips = trips.map((trip, idx) => {
    const start = parseLocalDate(trip.entry);
    let end = trip.ongoing ? targetEvalDate : parseLocalDate(trip.exit || targetEvalDate);
    let segmentDuration = end >= start ? Math.round((end - start) / 86400000) + 1 : 0;

    if (start <= targetEvalDate) {
      let effExit = trip.ongoing ? targetEvalDate : parseLocalDate(trip.exit);
      if (effExit > targetEvalDate) effExit = targetEvalDate;
      const interStart = new Date(Math.max(start, windowStart));
      const interEnd = new Date(Math.min(effExit, targetEvalDate));
      if (interStart <= interEnd) {
        totalDaysUsed += Math.round((interEnd - interStart) / 86400000) + 1;
      }
    }

    const pctStart = Math.max(0, Math.min(100, (start - timelineStart) / (timelineEnd - timelineStart) * 100));
    const pctEnd = Math.max(0, Math.min(100, (end - timelineStart) / (timelineEnd - timelineStart) * 100));
    
    return { ...trip, duration: segmentDuration, left: pctStart, width: Math.max(0.5, pctEnd - pctStart), idx };
  });

  return { processedTrips, totalDaysUsed };
}

// 🔮 2. Next Available Entry Refresh Predictor
export function calculateNextRefresh(trips, totalDaysUsed, targetEvalDate) {
  if (totalDaysUsed < 90) return null;
  
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
      const interStart = new Date(Math.max(start, simulatedStart));
      const interEnd = new Date(Math.min(end, checkDate));
      if (interStart <= interEnd) simulatedDays += Math.round((interEnd - interStart) / 86400000) + 1;
    });

    if (simulatedDays < 90) return new Date(checkDate);
  }
  return null;
}

// 🛡️ 3. 30-Day Forward Safety Scanner
export function runSafetyPredictor(trips, targetEvalDate) {
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
      const interStart = new Date(Math.max(start, simStart));
      const interEnd = new Date(Math.min(end, futureCheckDate));
      if (interStart <= interEnd) simDays += Math.round((interEnd - interStart) / 86400000) + 1;
    });

    if (simDays > 90) {
      safeNextMonth = false;
      const y = futureCheckDate.getFullYear();
      const m = String(futureCheckDate.getMonth() + 1).padStart(2, '0');
      const day = String(futureCheckDate.getDate()).padStart(2, '0');
      highestFutureViolationDay = `${y}-${m}-${day}`;
      break;
    }
  }
  return { safeNextMonth, highestFutureViolationDay };
}

// 🎛️ 4. Full Horizon Continuity Stress Tester
export function runFullHorizonStressTest(trips, stressTestMode, timelineStart, timelineEnd, targetEvalDate) {
  if (!stressTestMode) return { stressTestViolationDate: null, stressTestMaxDays: 0 };

  let stressTestViolationDate = null;
  let stressTestMaxDays = 0;
  let testPointer = new Date(timelineStart);

  while (testPointer <= timelineEnd) {
    let simStart = new Date(testPointer);
    simStart.setDate(simStart.getDate() - 179);
    let simDays = 0;

    trips.forEach(t => {
      const start = parseLocalDate(t.entry);
      let end = t.ongoing ? (testPointer < targetEvalDate ? testPointer : targetEvalDate) : parseLocalDate(t.exit);
      if (end > testPointer) end = testPointer;
      const interStart = new Date(Math.max(start, simStart));
      const interEnd = new Date(Math.min(end, testPointer));
      if (interStart <= interEnd) simDays += Math.round((interEnd - interStart) / 86400000) + 1;
    });

    if (simDays > 90 && !stressTestViolationDate) {
      const y = testPointer.getFullYear(), m = String(testPointer.getMonth() + 1).padStart(2, '0'), d = String(testPointer.getDate()).padStart(2, '0');
      stressTestViolationDate = `${y}-${m}-${d}`;
    }
    if (simDays > stressTestMaxDays) stressTestMaxDays = simDays;
    testPointer.setDate(testPointer.getDate() + 1);
  }

  return { stressTestViolationDate, stressTestMaxDays };
}
