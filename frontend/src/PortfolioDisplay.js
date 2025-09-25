import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const CustomTooltip = ({ active, payload, label, portfolioKeys }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{`Date: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ margin: '5px 0 0 0', color: entry.color }}>
            {`${entry.name}: ${entry.value.toFixed(2)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PortfolioDisplay = ({ computedPortfolios }) => {
  if (!computedPortfolios || computedPortfolios.length === 0) {
    return (
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: '#333' }}>Portfolio Performance Visualization</h2>
        <p style={{ color: '#666', fontSize: '1.1em' }}>
          Submit a strategy configuration to see its performance.
        </p>
      </div>
    );
  }

  // --- Data Transformation for Multi-line Chart ---
  const allDates = new Set();
  computedPortfolios.forEach(p => {
    p.result.monthlySnapshots.forEach(s => allDates.add(s.date));
  });

  const sortedDates = Array.from(allDates).sort();

  const chartData = sortedDates.map(date => {
    const dataEntry = { date };
    computedPortfolios.forEach((p, index) => {
      const snapshot = p.result.monthlySnapshots.find(s => s.date === date);
      dataEntry[`portfolio_${p.id}`] = snapshot ? snapshot.totalPortfolioValue : null;
    });
    return dataEntry;
  });
  // --- End of Data Transformation ---

  return (
    <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ color: '#333', textAlign: 'center' }}>Portfolio Performance Comparison</h2>

      <div style={{ width: '100%', height: 500, marginTop: '20px' }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {computedPortfolios.map((p, index) => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={`portfolio_${p.id}`}
                stroke={COLORS[index % COLORS.length]}
                name={`Portfolio #${index + 1}`}
                activeDot={{ r: 8 }}
                connectNulls // This will connect lines across missing data points
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioDisplay;
