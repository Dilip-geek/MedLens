import React, { useState, useMemo } from 'react';
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  PlusCircle, 
  MinusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Filter 
} from 'lucide-react';
import { LongitudinalComparisonData, LongitudinalItem } from '../types';

interface LongitudinalComparisonProps {
  comparison: LongitudinalComparisonData;
}

export const LongitudinalComparison: React.FC<LongitudinalComparisonProps> = ({ comparison }) => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'INCREASED' | 'DECREASED' | 'STABLE' | 'NEW' | 'OMITTED'>('ALL');

  if (!comparison.hasComparison) {
    return (
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">
            <History size={20} style={{ color: 'var(--purple-500)' }} />
            <span>Longitudinal Parameter Comparison</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
          <History size={36} style={{ color: 'var(--text-dim)', marginBottom: 12 }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
            Single Report Mode (No Baseline Provided)
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', maxWidth: 460, margin: '0 auto' }}>
            Provide a previous medical or laboratory report in the "Previous Baseline" tab to unlock automated delta tracking, percentage changes, and trend visualization across clinical visits.
          </p>
        </div>
      </div>
    );
  }

  const { stats, items } = comparison;

  const filteredItems = useMemo(() => {
    return (items || []).filter(item => {
      if (filterCategory === 'INCREASED') return item.trendDirection === 'increased';
      if (filterCategory === 'DECREASED') return item.trendDirection === 'decreased';
      if (filterCategory === 'STABLE') return item.trendDirection === 'stable';
      if (filterCategory === 'NEW') return item.category === 'newly_appearing';
      if (filterCategory === 'OMITTED') return item.category === 'discontinued_or_omitted';
      return true;
    });
  }, [items, filterCategory]);

  const getTrendIcon = (item: LongitudinalItem) => {
    if (item.category === 'newly_appearing') {
      return (
        <span className="badge badge-normal" style={{ fontSize: 11 }}>
          <PlusCircle size={12} /> Newly Added
        </span>
      );
    }
    if (item.category === 'discontinued_or_omitted') {
      return (
        <span className="badge badge-neutral" style={{ fontSize: 11 }}>
          <MinusCircle size={12} /> Not Tested
        </span>
      );
    }
    if (item.trendDirection === 'increased') {
      return (
        <span className="badge badge-high" style={{ fontSize: 11 }}>
          <TrendingUp size={12} /> Increased
        </span>
      );
    }
    if (item.trendDirection === 'decreased') {
      return (
        <span className="badge badge-low" style={{ fontSize: 11 }}>
          <TrendingDown size={12} /> Decreased
        </span>
      );
    }
    return (
      <span className="badge badge-neutral" style={{ fontSize: 11 }}>
        <Minus size={12} /> Stable (±2%)
      </span>
    );
  };

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="card-title">
            <History size={20} style={{ color: 'var(--purple-500)' }} />
            <span>Longitudinal Parameter Comparison</span>
            <span className="badge badge-low" style={{ fontSize: 12 }}>
              {stats.matched} Matched Trends
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Structured data-level delta calculations, relative percentage shifts, and reference range stability.
          </p>
        </div>

        {/* Quick Filter Buttons */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`btn btn-sm ${filterCategory === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilterCategory('INCREASED')}
            className={`btn btn-sm ${filterCategory === 'INCREASED' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Increased ({stats.increased})
          </button>
          <button
            onClick={() => setFilterCategory('DECREASED')}
            className={`btn btn-sm ${filterCategory === 'DECREASED' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Decreased ({stats.decreased})
          </button>
          <button
            onClick={() => setFilterCategory('NEW')}
            className={`btn btn-sm ${filterCategory === 'NEW' ? 'btn-primary' : 'btn-secondary'}`}
          >
            New Tests ({stats.newParameters})
          </button>
          {stats.discontinued > 0 && (
            <button
              onClick={() => setFilterCategory('OMITTED')}
              className={`btn btn-sm ${filterCategory === 'OMITTED' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Omitted ({stats.discontinued})
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 12,
        marginBottom: 16
      }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Parameters Matched</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-highlight)' }}>{stats.matched}</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, color: 'var(--status-high)' }}>Increased Values</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--status-high)' }}>{stats.increased}</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, color: 'var(--status-low)' }}>Decreased Values</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--status-low)' }}>{stats.decreased}</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, color: 'var(--status-normal)' }}>Stable Levels</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--status-normal)' }}>{stats.stable}</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Range Shifts</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: stats.rangeShifts > 0 ? 'var(--status-high)' : 'var(--text-dim)' }}>
            {stats.rangeShifts}
          </div>
        </div>
      </div>

      {/* Comparison Data Table */}
      <div className="data-table-container">
        <table className="data-table" aria-label="Longitudinal Report Comparison Table">
          <thead>
            <tr>
              <th scope="col">Clinical Parameter</th>
              <th scope="col">Previous Report</th>
              <th scope="col">Current Report</th>
              <th scope="col">Delta (Change)</th>
              <th scope="col">% Variation</th>
              <th scope="col">Trend Direction</th>
              <th scope="col">Reference Range Shift</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                {/* Parameter */}
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-highlight)' }}>
                    {item.canonicalName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    {item.panel}
                  </div>
                </td>

                {/* Previous Value */}
                <td>
                  {item.previous ? (
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600 }}>
                        {item.previous.value} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.unit}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                        Range: {item.previous.rangeText}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>
                  )}
                </td>

                {/* Current Value */}
                <td>
                  {item.current ? (
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text-highlight)' }}>
                        {item.current.value} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.unit}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                        Range: {item.current.rangeText}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>
                  )}
                </td>

                {/* Delta */}
                <td>
                  {item.delta !== null ? (
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: item.delta > 0 ? 'var(--status-high)' : item.delta < 0 ? 'var(--status-low)' : 'var(--text-main)'
                    }}>
                      {item.delta > 0 ? `+${item.delta}` : item.delta} {item.unit}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>
                  )}
                </td>

                {/* % Change */}
                <td>
                  {item.percentChange !== null ? (
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: item.percentChange > 0 ? 'var(--status-high)' : item.percentChange < 0 ? 'var(--status-low)' : 'var(--text-main)'
                    }}>
                      {item.percentChange > 0 ? `+${item.percentChange}%` : `${item.percentChange}%`}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>
                  )}
                </td>

                {/* Trend Direction */}
                <td>
                  {getTrendIcon(item)}
                </td>

                {/* Range Shift */}
                <td>
                  {item.isRangeShifted ? (
                    <span className="badge badge-high" title={item.rangeShiftDetails || 'Reported ranges differ between dates'}>
                      <AlertTriangle size={11} /> Range Changed
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Consistent</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
