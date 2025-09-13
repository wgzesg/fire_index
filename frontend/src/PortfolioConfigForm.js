
import React, { useEffect, useState } from 'react';

const ALL_STOCKS = [
    { name: "DBS", ticker: "D05.SI" },
    { name: "SIA", ticker: "C6L.SI" },
    { name: "SATS", ticker: "S58.SI" },
    { name: "Mapletree Industrial Trust", ticker: "ME8U.SI" },
    { name: "Mapletree Logistics Trust", ticker: "M44U.SI" },
    { name: "Keppel", ticker: "BN4.SI" },
    { name: "Keppel Infra Trust", ticker: "A7RU.SI" },
];

const DEFAULT_INVESTMENT_AMOUNTS = [100, 500, 1000];

const distributeRatios = (currentSelectedStocks) => {
    const numStocks = currentSelectedStocks.length;
    if (numStocks === 0) return [];

    const newRatios = currentSelectedStocks.map(() => Math.floor(100 / numStocks));
    let remainder = 100 - newRatios.reduce((sum, ratio) => sum + ratio, 0);

    // Distribute remainder to ensure sum is exactly 100
    for (let i = 0; i < remainder; i++) {
        newRatios[i]++;
    }

    return currentSelectedStocks.map((stock, index) => ({ ...stock, ratio: newRatios[index] }));
};

const PortfolioConfigForm = ({ onSubmit, initialConfig, portfolioEvents }) => {
    const [selectedStocks, setSelectedStocks] = useState(initialConfig.selectedStocks);
    const [startDate, setStartDate] = useState(initialConfig.startDate);
    const [endDate, setEndDate] = useState(initialConfig.endDate);
    const [monthlyInvestment, setMonthlyInvestment] = useState(initialConfig.monthlyInvestment);
    const [totalRatio, setTotalRatio] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        const sum = selectedStocks.reduce((acc, stock) => acc + (parseFloat(stock.ratio) || 0), 0);
        setTotalRatio(sum);
        if (sum > 100) {
            setError('Total ratio cannot exceed 100%');
        } else {
            setError('');
        }
    }, [selectedStocks]);

    // Set default start and end dates based on available data if not already set
    useEffect(() => {
        if (portfolioEvents.length > 0 && !startDate && !endDate) {
            const firstDate = new Date(portfolioEvents[0].eventDate.seconds * 1000);
            const lastDate = new Date(portfolioEvents[portfolioEvents.length - 1].eventDate.seconds * 1000);
            setStartDate(firstDate.toISOString().substring(0, 7));
            setEndDate(lastDate.toISOString().substring(0, 7));
        }
    }, [portfolioEvents, startDate, endDate]);

    const handleAddStock = (stockToAdd) => {
        if (!selectedStocks.some(s => s.ticker === stockToAdd.ticker)) {
            const updatedSelectedStocks = [...selectedStocks, { ...stockToAdd, ratio: 0 }];
            setSelectedStocks(distributeRatios(updatedSelectedStocks));
        }
    };

    const handleRatioChange = (ticker, value) => {
        setSelectedStocks(selectedStocks.map(stock =>
            stock.ticker === ticker ? { ...stock, ratio: parseFloat(value) || 0 } : stock
        ));
    };

    const handleRemoveStock = (ticker) => {
        const updatedSelectedStocks = selectedStocks.filter(stock => stock.ticker !== ticker);
        setSelectedStocks(distributeRatios(updatedSelectedStocks));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (totalRatio !== 100) {
            setError('Total ratio must be exactly 100%');
            return;
        }
        if (!startDate || !endDate) {
            setError('Please select both start and end months.');
            return;
        }
        if (startDate >= endDate) {
            setError('End month must be after start month.');
            return;
        }
        if (monthlyInvestment <= 0) {
            setError('Monthly investment must be a positive number.');
            return;
        }
        setError('');
        onSubmit({
            selectedStocks,
            startDate,
            endDate,
            monthlyInvestment
        });
    };

    const availableStocksToDisplay = ALL_STOCKS.filter(stock => 
        !selectedStocks.some(s => s.ticker === stock.ticker)
    );

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Left Column: Stock Selection */}
                <div>
                    <h3 style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '1em' }}>Available Stocks:</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}>
                        {availableStocksToDisplay.length === 0 ? (
                            <p>All stocks selected!</p>
                        ) : (
                            availableStocksToDisplay.map(stock => (
                                <button
                                    key={stock.ticker}
                                    type="button"
                                    onClick={() => handleAddStock(stock)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '15px',
                                        border: '1px solid #007bff',
                                        backgroundColor: '#e7f3ff',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        fontSize: '0.8em',
                                        fontWeight: 'bold',
                                        transition: 'background-color 0.2s, color 0.2s'
                                    }}
                                >
                                    {stock.name} ({stock.ticker})
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Portfolio & Ratios */}
                <div>
                    <h3 style={{ fontSize: '1em', marginBottom: '10px', color: '#555' }}>Your Portfolio:</h3>
                    {selectedStocks.length === 0 ? (
                        <p style={{ fontSize: '0.9em' }}>No stocks selected yet. Please add some!</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}>
                            {selectedStocks.map(stock => (
                                <li key={stock.ticker} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', padding: '8px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#fff' }}>
                                    <span style={{ flexGrow: 1, fontWeight: 'bold', fontSize: '0.9em' }}>{stock.name} ({stock.ticker})</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={stock.ratio}
                                        onChange={(e) => handleRatioChange(stock.ticker, e.target.value)}
                                        style={{ width: '60px', padding: '4px', borderRadius: '3px', border: '1px solid #ddd', marginRight: '8px', textAlign: 'right', fontSize: '0.9em' }}
                                    />
                                    <span style={{ marginRight: '8px', fontSize: '0.9em' }}>%</span>
                                    <button type="button" onClick={() => handleRemoveStock(stock.ticker)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.8em' }}>Remove</button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                        <h4 style={{ margin: 0, color: '#333', fontSize: '1em' }}>Total Ratio: {totalRatio}%</h4>
                    </div>
                </div>
            </div>

            {/* Period and Investment Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <div>
                    <label htmlFor="start-month" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>Start Month:</label>
                    <input type="month" id="start-month" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.9em' }} />
                </div>
                <div>
                    <label htmlFor="end-month" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>End Month:</label>
                    <input type="month" id="end-month" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.9em' }} />
                </div>
                <div>
                    <label htmlFor="monthly-investment" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>Monthly Investment ($):</label>
                    <input type="number" id="monthly-investment" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.9em' }} min="0" />
                    <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
                        {DEFAULT_INVESTMENT_AMOUNTS.map(amount => (
                            <button
                                key={amount}
                                type="button"
                                onClick={() => setMonthlyInvestment(amount)}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: '3px',
                                    border: '1px solid #007bff',
                                    backgroundColor: monthlyInvestment === amount ? '#007bff' : '#e7f3ff',
                                    color: monthlyInvestment === amount ? 'white' : '#007bff',
                                    cursor: 'pointer',
                                    fontSize: '0.7em'
                                }}
                            >
                                ${amount}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold' }} disabled={totalRatio !== 100 || !!error}>View Portfolio Performance</button>
            </div>
            {error && <p style={{ color: '#dc3545', marginTop: '10px', textAlign: 'center', fontSize: '0.9em' }}>{error}</p>}
        </form>
    );
};

export default PortfolioConfigForm;
