// MedLens Longitudinal Comparison Engine
// Computes structured data-level deltas, percentage variations, trend directions,
// newly appearing tests, discontinued tests, and reference range modifications.

export function compareReports(currentParameters = [], previousParameters = []) {
  if (!previousParameters || previousParameters.length === 0) {
    return {
      hasComparison: false,
      summary: 'No previous report provided for longitudinal comparison.',
      items: [],
      stats: {
        totalCompared: 0,
        increased: 0,
        decreased: 0,
        stable: 0,
        newParameters: currentParameters.length,
        discontinued: 0,
        rangeShifts: 0
      }
    };
  }

  const prevMap = new Map();
  previousParameters.forEach(p => {
    prevMap.set(p.canonicalName.toLowerCase(), p);
  });

  const currMap = new Map();
  currentParameters.forEach(p => {
    currMap.set(p.canonicalName.toLowerCase(), p);
  });

  const items = [];
  let increasedCount = 0;
  let decreasedCount = 0;
  let stableCount = 0;
  let rangeShiftCount = 0;

  // 1. Evaluate all parameters present in current report
  for (const curr of currentParameters) {
    const key = curr.canonicalName.toLowerCase();
    const prev = prevMap.get(key);

    if (prev) {
      // Both reports have this parameter
      const currVal = typeof curr.observedValue === 'number' ? curr.observedValue : parseFloat(curr.observedValue);
      const prevVal = typeof prev.observedValue === 'number' ? prev.observedValue : parseFloat(prev.observedValue);

      let delta = null;
      let percentChange = null;
      let trendDirection = 'stable'; // 'increased' | 'decreased' | 'stable' | 'qualitative'

      if (!isNaN(currVal) && !isNaN(prevVal)) {
        delta = parseFloat((currVal - prevVal).toFixed(2));
        percentChange = prevVal !== 0 ? parseFloat(((delta / prevVal) * 100).toFixed(1)) : 0;

        // Consider stable if within +/- 2% or 0
        if (Math.abs(percentChange) <= 2) {
          trendDirection = 'stable';
          stableCount++;
        } else if (delta > 0) {
          trendDirection = 'increased';
          increasedCount++;
        } else {
          trendDirection = 'decreased';
          decreasedCount++;
        }
      } else {
        trendDirection = 'qualitative';
      }

      // Check for reference range shift
      const rangeShifted = prev.rawRangeText && curr.rawRangeText &&
        prev.rawRangeText.trim() !== curr.rawRangeText.trim();
      if (rangeShifted) {
        rangeShiftCount++;
      }

      items.push({
        id: `comp_${curr.id}`,
        canonicalName: curr.canonicalName,
        panel: curr.panel,
        unit: curr.unit || prev.unit,
        current: {
          value: curr.observedValue,
          status: curr.status,
          statusLabel: curr.statusLabel,
          rangeText: curr.rawRangeText || 'None reported',
          isOutOfRange: curr.isOutOfRange
        },
        previous: {
          value: prev.observedValue,
          status: prev.status,
          statusLabel: prev.statusLabel,
          rangeText: prev.rawRangeText || 'None reported',
          isOutOfRange: prev.isOutOfRange
        },
        delta,
        percentChange,
        trendDirection,
        statusTransition: `${prev.statusLabel} → ${curr.statusLabel}`,
        isRangeShifted: !!rangeShifted,
        rangeShiftDetails: rangeShifted ? `Previous: [${prev.rawRangeText}] vs Current: [${curr.rawRangeText}]` : null,
        category: 'matched'
      });
    } else {
      // Newly appearing in current report
      items.push({
        id: `comp_${curr.id}`,
        canonicalName: curr.canonicalName,
        panel: curr.panel,
        unit: curr.unit,
        current: {
          value: curr.observedValue,
          status: curr.status,
          statusLabel: curr.statusLabel,
          rangeText: curr.rawRangeText || 'None reported',
          isOutOfRange: curr.isOutOfRange
        },
        previous: null,
        delta: null,
        percentChange: null,
        trendDirection: 'new',
        statusTransition: `Newly Added (Current: ${curr.statusLabel})`,
        isRangeShifted: false,
        rangeShiftDetails: null,
        category: 'newly_appearing'
      });
    }
  }

  // 2. Identify parameters in previous report that are absent in current report
  let discontinuedCount = 0;
  for (const prev of previousParameters) {
    const key = prev.canonicalName.toLowerCase();
    if (!currMap.has(key)) {
      discontinuedCount++;
      items.push({
        id: `comp_disc_${prev.id}`,
        canonicalName: prev.canonicalName,
        panel: prev.panel,
        unit: prev.unit,
        current: null,
        previous: {
          value: prev.observedValue,
          status: prev.status,
          statusLabel: prev.statusLabel,
          rangeText: prev.rawRangeText || 'None reported',
          isOutOfRange: prev.isOutOfRange
        },
        delta: null,
        percentChange: null,
        trendDirection: 'omitted',
        statusTransition: `Not Tested in Current Report (Previous: ${prev.statusLabel})`,
        isRangeShifted: false,
        rangeShiftDetails: null,
        category: 'discontinued_or_omitted'
      });
    }
  }

  const newParamsCount = items.filter(i => i.category === 'newly_appearing').length;

  return {
    hasComparison: true,
    items,
    stats: {
      totalCompared: items.length,
      matched: items.filter(i => i.category === 'matched').length,
      increased: increasedCount,
      decreased: decreasedCount,
      stable: stableCount,
      newParameters: newParamsCount,
      discontinued: discontinuedCount,
      rangeShifts: rangeShiftCount
    }
  };
}
