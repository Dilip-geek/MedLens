import React, { useState } from 'react';
import { 
  Table, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Edit3, 
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ExtractedParameter, ProcessedRecord } from '../types';

interface StructuredRecordViewProps {
  record: ProcessedRecord;
  onSelectParameterForTrace: (param: ExtractedParameter) => void;
  onEditParameter: (param: ExtractedParameter) => void;
  onVerifyParameter: (paramId: string) => void;
}

export const StructuredRecordView: React.FC<StructuredRecordViewProps> = ({
  record,
  onSelectParameterForTrace,
  onEditParameter,
  onVerifyParameter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [panelFilter, setPanelFilter] = useState('ALL');
  const [rangeFilter, setRangeFilter] = useState<'ALL' | 'OUT_OF_RANGE' | 'NORMAL' | 'NO_RANGE'>('ALL');

  const panels = Object.keys(record.panelGroups || {});

  // Filtering
  const filteredParameters = (record.parameters || []).filter(p => {
    const matchesSearch = 
      p.canonicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rawName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.loinc && p.loinc.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPanel = panelFilter === 'ALL' || p.panel === panelFilter;

    let matchesRange = true;
    if (rangeFilter === 'OUT_OF_RANGE') matchesRange = p.isOutOfRange;
    if (rangeFilter === 'NORMAL') matchesRange = p.status === 'NORMAL';
    if (rangeFilter === 'NO_RANGE') matchesRange = p.status === 'NO_RANGE_REPORTED';

    return matchesSearch && matchesPanel && matchesRange;
  });

  const getStatusBadge = (param: ExtractedParameter) => {
    switch (param.status) {
      case 'CRITICAL_HIGH':
      case 'CRITICAL_LOW':
        return (
          <span className="badge badge-critical" title="Significant divergence requiring clinical attention">
            <AlertOctagon size={12} /> {param.statusLabel}
          </span>
        );
      case 'HIGH':
        return (
          <span className="badge badge-high" title={param.interpretation}>
            <AlertTriangle size={12} /> {param.statusLabel}
          </span>
        );
      case 'LOW':
        return (
          <span className="badge badge-low" title={param.interpretation}>
            <AlertTriangle size={12} /> {param.statusLabel}
          </span>
        );
      case 'NO_RANGE_REPORTED':
        return (
          <span className="badge badge-neutral" title="No reference range provided in the source report; range was not fabricated">
            <HelpCircle size={12} /> No Range in Source
          </span>
        );
      case 'NORMAL':
      default:
        return (
          <span className="badge badge-normal" title={param.interpretation}>
            <CheckCircle2 size={12} /> {param.statusLabel}
          </span>
        );
    }
  };

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header" style={{ flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div className="card-title">
            <Table size={20} style={{ color: 'var(--teal-500)' }} />
            <span>Structured Clinical Laboratory Parameters</span>
            <span className="badge badge-normal" style={{ fontSize: 12 }}>
              {record.parameters.length} Extracted
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            All parameters normalized to standard LOINC nomenclature with reported reference range awareness and source provenance.
          </p>
        </div>

        {/* Search and Quick Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 30, fontSize: 13, height: 36 }}
              placeholder="Search tests, LOINC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search laboratory parameters"
            />
          </div>

          {/* Panel Selector */}
          <select
            className="form-select"
            style={{ fontSize: 13, height: 36, width: 'auto', minWidth: 160 }}
            value={panelFilter}
            onChange={(e) => setPanelFilter(e.target.value)}
            aria-label="Filter by Clinical Panel"
          >
            <option value="ALL">All Clinical Panels</option>
            {panels.map(panel => (
              <option key={panel} value={panel}>
                {panel} ({record.panelGroups[panel]?.length})
              </option>
            ))}
          </select>

          {/* Range Status Filter */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setRangeFilter('ALL')}
              className={`btn btn-sm ${rangeFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All ({record.parameters.length})
            </button>
            <button
              onClick={() => setRangeFilter('OUT_OF_RANGE')}
              className={`btn btn-sm ${rangeFilter === 'OUT_OF_RANGE' ? 'btn-primary' : 'btn-secondary'}`}
              style={rangeFilter !== 'OUT_OF_RANGE' && record.summary.outOfRangeCount > 0 ? { borderColor: 'var(--status-high)' } : {}}
            >
              Out of Range ({record.summary.outOfRangeCount})
            </button>
            {record.summary.missingRangeCount > 0 && (
              <button
                onClick={() => setRangeFilter('NO_RANGE')}
                className={`btn btn-sm ${rangeFilter === 'NO_RANGE' ? 'btn-primary' : 'btn-secondary'}`}
              >
                No Range in Report ({record.summary.missingRangeCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Parameters Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Clinical Parameter</th>
              <th>Observed Value</th>
              <th>Reported Reference Range</th>
              <th>Status & Interpretation</th>
              <th>Source / Provenance</th>
              <th style={{ textAlign: 'center' }}>Traceability</th>
              <th style={{ textAlign: 'center' }}>Review</th>
            </tr>
          </thead>
          <tbody>
            {filteredParameters.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-dim)' }}>
                  No clinical parameters match the current filters.
                </td>
              </tr>
            ) : (
              filteredParameters.map((param) => (
                <tr 
                  key={param.id}
                  className={param.isCritical ? 'row-critical' : param.isOutOfRange ? 'row-out-of-range' : ''}
                >
                  {/* Test Name & Panel */}
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-highlight)' }}>
                        {param.canonicalName}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                        {param.rawName.toLowerCase() !== param.canonicalName.toLowerCase() && (
                          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                            Reported as: <em>"{param.rawName}"</em>
                          </span>
                        )}
                        <span style={{ fontSize: 10, color: 'var(--teal-500)', fontFamily: 'var(--font-mono)' }}>
                          LOINC: {param.loinc}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {param.panel}
                      </div>
                    </div>
                  </td>

                  {/* Observed Value & Unit */}
                  <td>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {param.observedValue} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>{param.unit}</span>
                    </div>
                  </td>

                  {/* Reference Range (Strictly from report) */}
                  <td>
                    {param.referenceRange ? (
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-main)' }}>
                          {param.referenceRange.display}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                          From source: "{param.rawRangeText}"
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-dim)', fontSize: 12 }}>
                        <em>Not reported in source</em>
                      </div>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {getStatusBadge(param)}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {param.interpretation}
                      </span>
                    </div>
                  </td>

                  {/* Provenance Tag */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span className={`prov-tag ${param.isVerified ? 'prov-verified' : 'prov-current'}`}>
                        {param.isVerified ? '✓ Human Verified' : `📄 ${param.sourceLabel}`}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                        Confidence: {(param.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>

                  {/* Source Traceability Button */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => onSelectParameterForTrace(param)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 8px' }}
                      title={`View exact source snippet: "${param.sourceQuote}"`}
                    >
                      <Eye size={13} style={{ color: 'var(--teal-500)' }} />
                      <span style={{ fontSize: 11 }}>Trace</span>
                    </button>
                  </td>

                  {/* Human Review & Edit */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => onEditParameter(param)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 8px' }}
                      title="Edit parameter or mark verified"
                    >
                      <Edit3 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Non-Invention Guarantee Footnote */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingTop: 10,
        borderTop: '1px solid var(--border-subtle)',
        fontSize: 12,
        color: 'var(--text-dim)'
      }}>
        <span>
          🛡️ <strong>Reference Range Integrity:</strong> Reference intervals are derived strictly from the uploaded laboratory document. No reference ranges are synthesized or assumed when absent.
        </span>
        <span>{filteredParameters.length} of {record.parameters.length} parameters displayed</span>
      </div>
    </div>
  );
};
