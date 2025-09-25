import React, { useState } from 'react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const PortfolioComparisonPanel = ({ computedPortfolios, onDelete }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!computedPortfolios || computedPortfolios.length === 0) {
    return (
      <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', backgroundColor: '#f9f9f9', minHeight: '200px' }}>
        <h3 style={{ marginTop: 0, color: '#333', textAlign: 'center' }}>Strategies</h3>
        <p style={{ textAlign: 'center', color: '#666' }}>Submit a strategy configuration to see its stats here.</p>
      </div>
    );
  }

  const handleToggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const tableHeaderStyle = {
    padding: '8px',
    borderBottom: '2px solid #ddd',
    textAlign: 'left',
    fontSize: '0.85em'
  };

  const tableCellStyle = {
    padding: '8px',
    borderBottom: '1px solid #eee',
    fontSize: '0.9em',
    textAlign: 'right'
  };

  return (
    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginTop: 0, color: '#333', textAlign: 'center', flexShrink: 0 }}>Strategy Comparison</h3>
      <div style={{ flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>Portfolio</th>
              <th style={tableHeaderStyle}>Total Assets</th>
              <th style={tableHeaderStyle}>Total Dividends</th>
              <th style={tableHeaderStyle}>Yearly Dividend</th>
              <th style={tableHeaderStyle}>Yearly Rate (%)</th>
              <th style={tableHeaderStyle}>Total Yield (%)</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {computedPortfolios.map((p, index) => {
              const { result, config } = p;
              return (
                <React.Fragment key={p.id}>
                  <tr>
                    <td style={{ ...tableCellStyle, textAlign: 'left' }}>
                      <button onClick={() => handleToggleRow(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '15px', height: '15px', backgroundColor: COLORS[index % COLORS.length], marginRight: '8px' }}></div>
                        <strong>#{index + 1} {expandedRow === p.id ? '▼' : '▶'}</strong>
                      </button>
                    </td>
                    <td style={tableCellStyle}>${result.totalAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={tableCellStyle}>${result.totalDividendsReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={tableCellStyle}>${result.yearlyDividend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={tableCellStyle}>{result.yearlyDividendRate.toFixed(2)}</td>
                    <td style={tableCellStyle}>{result.totalInvestmentYield.toFixed(2)}</td>
                    <td style={tableCellStyle}>
                      <button onClick={() => onDelete(p.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                  {expandedRow === p.id && (
                    <tr>
                      <td colSpan="7" style={{ padding: '10px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                        <div style={{ fontSize: '0.9em', color: '#555' }}>
                          <div><strong>Monthly Investment:</strong> ${config.monthlyInvestment}</div>
                          <div><strong>Date Range:</strong> {config.startDate} to {config.endDate}</div>
                          <div><strong>Stocks:</strong> {config.selectedStocks.map(s => `${s.ticker} (${s.ratio}%)`).join(', ')}</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioComparisonPanel;
