
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
const { EventCollection } = require('./stock_data_pb');

import PortfolioConfigForm from './PortfolioConfigForm';
import PortfolioDisplay from './PortfolioDisplay';
import PortfolioComparisonPanel from './PortfolioComparisonPanel';
import computePortfolioPerformance from './computation';

const DEFAULT_INVESTMENT_AMOUNTS = [100, 500, 1000];

const App = () => {
  const [portfolioEvents, setPortfolioEvents] = useState([]);
  const [showInputForm, setShowInputForm] = useState(true);
  const [portfolioConfig, setPortfolioConfig] = useState({
    selectedStocks: [],
    startDate: '',
    endDate: '',
    monthlyInvestment: DEFAULT_INVESTMENT_AMOUNTS[0],
  });
  const [computedPortfolios, setComputedPortfolios] = useState([]);
  const [panelVisible, setPanelVisible] = useState(false);
  const diagramRef = useRef(null);
  const [diagramHeight, setDiagramHeight] = useState(0);

  useEffect(() => {
    fetch('./stock_data.bin')
      .then(response => response.arrayBuffer())
      .then(data => {
        const collection = EventCollection.deserializeBinary(new Uint8Array(data));
        const sortedEvents = collection.toObject().eventsList.sort((a, b) => {
          return (a.eventDate.seconds - b.eventDate.seconds) || (a.eventDate.nanos - b.eventDate.nanos);
        });
        setPortfolioEvents(sortedEvents);

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

  useLayoutEffect(() => {
    const measureHeight = () => {
      if (diagramRef.current) {
        setDiagramHeight(diagramRef.current.offsetHeight);
      }
    };

    measureHeight();

    window.addEventListener('resize', measureHeight);
    return () => window.removeEventListener('resize', measureHeight);
  }, [computedPortfolios]); // Re-measure when content changes

  useEffect(() => {
    if (computedPortfolios.length > 0) {
      const timer = setTimeout(() => setPanelVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setPanelVisible(false);
    }
  }, [computedPortfolios.length]);

  const handleFormSubmit = (config) => {
    const result = computePortfolioPerformance(config, portfolioEvents);
    const newPortfolio = {
      id: Date.now(),
      config: config,
      result: result,
    };
    setComputedPortfolios(prev => [...prev, newPortfolio]);
    setShowInputForm(false);
  };

  const handleDeletePortfolio = (id) => {
    setComputedPortfolios(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Portfolio Performance Analyzer</h1>

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

      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
        <div style={{ flex: '5' }} ref={diagramRef}>
          <PortfolioDisplay computedPortfolios={computedPortfolios} />
        </div>
        {computedPortfolios.length > 0 && (
          <div style={{ flex: '1' }}>
            <PortfolioComparisonPanel computedPortfolios={computedPortfolios} onDelete={handleDeletePortfolio} />
          </div>
        )}
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
