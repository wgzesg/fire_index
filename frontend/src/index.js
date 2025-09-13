
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
const { EventCollection } = require('./stock_data_pb');

import PortfolioConfigForm from './PortfolioConfigForm';
import PortfolioDisplay from './PortfolioDisplay';
import computePortfolioPerformance from './computation';

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

const App = () => {
    const [portfolioEvents, setPortfolioEvents] = useState([]);
    const [showInputForm, setShowInputForm] = useState(true); // State to toggle form visibility
    const [portfolioConfig, setPortfolioConfig] = useState({
        selectedStocks: [],
        startDate: '',
        endDate: '',
        monthlyInvestment: DEFAULT_INVESTMENT_AMOUNTS[0],
    });
    const [computedData, setComputedData] = useState(null);

    useEffect(() => {
        fetch('./stock_data.bin')
            .then(response => response.arrayBuffer())
            .then(data => {
                const collection = EventCollection.deserializeBinary(new Uint8Array(data));
                const sortedEvents = collection.toObject().eventsList.sort((a, b) => {
                    return (a.eventDate.seconds - b.eventDate.seconds) || (a.eventDate.nanos - b.eventDate.nanos);
                });
                setPortfolioEvents(sortedEvents);

                // Set default start and end dates based on available data
                if (sortedEvents.length > 0) {
                    const firstDate = new Date(sortedEvents[0].eventDate.seconds * 1000);
                    const lastDate = new Date(sortedEvents[sortedEvents.length - 1].eventDate.seconds * 1000);
                    setPortfolioConfig(prevConfig => ({
                        ...prevConfig,
                        startDate: firstDate.toISOString().substring(0, 7),
                        endDate: lastDate.toISOString().substring(0, 7),
                    }));
                }
            })
            .catch(error => console.error('Error fetching or parsing stock data:', error));
    }, []);

    const handleFormSubmit = (config) => {
        setPortfolioConfig(config);
        setShowInputForm(false); // Hide form after submission
        const result = computePortfolioPerformance(config, portfolioEvents);
        setComputedData(result);
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Portfolio Performance Analyzer</h1>

            {/* Top Bar / Collapsible Input Form */}
            <div style={{ marginBottom: '20px', border: '1px solid #eee', borderRadius: '8px', padding: '15px', backgroundColor: '#f9f9f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowInputForm(!showInputForm)}>
                    <h2 style={{ margin: 0, color: '#555', fontSize: '1.2em' }}>
                        {showInputForm ? 'Hide Configuration' : 'Show Configuration'}
                    </h2>
                    <span>{showInputForm ? '▲' : '▼'}</span>
                </div>

                {showInputForm && (
                    <PortfolioConfigForm 
                        onSubmit={handleFormSubmit} 
                        initialConfig={portfolioConfig}
                        portfolioEvents={portfolioEvents}
                    />
                )}
            </div>

            {/* Main Content Area: Visualization and Key Stats */}
            <PortfolioDisplay computedPortfolioData={computedData} />

            {/* Raw Events (for debugging/reference) - can be hidden or moved later */}
            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ccc' }}>
                <h2 style={{ textAlign: 'center', color: '#333' }}>Raw Events (for debugging/reference):</h2>
                {portfolioEvents.length === 0 ? (
                    <p style={{ textAlign: 'center' }}>Loading events...</p>
                ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'scroll', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                        {portfolioEvents.map((event, index) => (
                            <div key={index} style={{ marginBottom: '10px', padding: '8px', borderBottom: '1px dotted #eee' }}>
                                <strong>{event.ticker}</strong> - {new Date(event.eventDate.seconds * 1000).toLocaleDateString()} - 
                                {event.stockPrice && `Stock Price (O:${event.stockPrice.open.toFixed(2)}, H:${event.stockPrice.high.toFixed(2)}, L:${event.stockPrice.low.toFixed(2)}, C:${event.stockPrice.close.toFixed(2)})`}
                                {event.dividend && `Dividend: ${event.dividend.amountPerShare.toFixed(2)}`}
                                {event.bonusShare && `Bonus Share: ${event.bonusShare.sharesPerShareOwned.toFixed(2)}`}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
