import React from 'react';

const PortfolioDisplay = ({ computedPortfolioData }) => {
    if (!computedPortfolioData) {
        return (
            <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ color: '#333' }}>Portfolio Performance Visualization</h2>
                <p style={{ color: '#666', fontSize: '1.1em' }}>
                    Submit your portfolio configuration to see the performance.
                </p>
                <div style={{ width: '80%', height: '250px', backgroundColor: '#e0e0e0', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888', fontSize: '1.2em' }}>
                    Chart Placeholder
                </div>
                <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ margin: 0, color: '#333' }}>Dividend Yield:</h3>
                        <p style={{ fontSize: '1.1em', fontWeight: 'bold' }}>--%</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ margin: 0, color: '#333' }}>Total Asset Value:</h3>
                        <p style={{ fontSize: '1.1em', fontWeight: 'bold' }}>$--</p>
                    </div>
                </div>
            </div>
        );
    }

    const { totalAssetValue, dividendYield, monthlySnapshots } = computedPortfolioData;

    return (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h2 style={{ color: '#333' }}>Portfolio Performance Visualization</h2>
            <p style={{ color: '#666', fontSize: '1.1em' }}>
                (Line graph, dividend yield, total asset value, etc. will appear here)
            </p>
            {/* Placeholder for actual chart and stats components */}
            <div style={{ width: '80%', height: '250px', backgroundColor: '#e0e0e0', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888', fontSize: '1.2em' }}>
                Chart Placeholder
            </div>
            <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>Dividend Yield:</h3>
                    <p style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{dividendYield.toFixed(2)}%</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>Total Asset Value:</h3>
                    <p style={{ fontSize: '1.1em', fontWeight: 'bold' }}>${totalAssetValue.toFixed(2)}</p>
                </div>
            </div>

            <h3 style={{ marginTop: '30px', color: '#333' }}>Monthly Snapshots:</h3>
            <div style={{ maxHeight: '200px', overflowY: 'scroll', border: '1px solid #eee', padding: '10px', borderRadius: '4px', width: '90%' }}>
                {monthlySnapshots.map((snapshot, index) => (
                    <div key={index} style={{ marginBottom: '5px', padding: '5px', borderBottom: '1px dotted #eee', display: 'flex', justifyContent: 'space-between', fontSize: '0.9em' }}>
                        <span>{snapshot.date}</span>
                        <span>Value: ${snapshot.totalPortfolioValue.toFixed(2)}</span>
                        <span>Monthly Div: ${snapshot.monthlyPassiveIncome.toFixed(2)}</span>
                        <span>Total Invested: ${snapshot.totalInvested.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PortfolioDisplay;