import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{`Date: ${label}`}</p>
        <p style={{ margin: '5px 0 0 0' }}>{`Portfolio Value: ${data.totalPortfolioValue.toFixed(2)}`}</p>
        <p style={{ margin: '5px 0 0 0' }}>{`Monthly Income: ${data.monthlyPassiveIncome.toFixed(2)}`}</p>
        <p style={{ margin: '5px 0 0 0' }}>{`Total Invested: ${data.totalInvested.toFixed(2)}`}</p>
        <p style={{ margin: '5px 0 0 0' }}>{`Total Dividends: ${data.totalDividendsReceived.toFixed(2)}`}</p>
        <p style={{ margin: '5px 0 0 0' }}>{`Yearly Dividend: ${data.yearlyDividend.toFixed(2)}`}</p>
        <p style={{ margin: '5px 0 0 0' }}>{`Yearly Dividend Rate: ${data.yearlyDividendRate.toFixed(2)}%`}</p>
      </div>
    );
  }

  return null;
};

const PortfolioDisplay = ({ computedPortfolioData }) => {
  if (!computedPortfolioData) {
    return (
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: '#333' }}>Portfolio Performance</h2>
        <p style={{ color: '#666', fontSize: '1.1em' }}>
          Submit your portfolio configuration to see the performance.
        </p>
      </div>
    );
  }

  const { totalAssetValue, totalDividendsReceived, monthlySnapshots, yearlyDividend, yearlyDividendRate, totalInvestmentYield } = computedPortfolioData;

  return (
    <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ color: '#333', textAlign: 'center' }}>Portfolio Performance Visualization</h2>

      <div style={{ width: '100%', height: 400, marginTop: '20px' }}>
        <ResponsiveContainer>
          <LineChart
            data={monthlySnapshots}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="totalPortfolioValue" stroke="#8884d8" activeDot={{ r: 8 }} name="Total Portfolio Value" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: '#333' }}>Total Dividends Received:</h3>
          <p style={{ fontSize: '1.1em', fontWeight: 'bold' }}>${totalDividendsReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: '#333' }}>Total Asset Value:</h3>
          <p style={{ fontSize: '1.1em', fontWeight: 'bold' }}>${totalAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: '#333' }}>Yearly Dividend:</h3>
          <p style={{ fontSize: '1.1em', fontWeight: 'bold' }}>${yearlyDividend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: '#333' }}>Yearly Dividend Rate:</h3>
          <p style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{yearlyDividendRate.toFixed(2)}%</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: '#333' }}>Total Investment Yield:</h3>
          <p style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{totalInvestmentYield.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDisplay;
