import './types.js';
import './types/event.js';
import { Portfolio } from './Portfolio.js';
import { DefaultPortfolioEventStrategy } from './EventStrategy.js';

/**
 * Computes portfolio performance based on user configuration and historical events.
 * 
 * @param {PortfolioConfig} config - User's portfolio configuration.
 * @param {Event[]} events - All historical events (from stock_data.bin).
 * @returns {object} - Computed portfolio data including chart data and key statistics.
 */
const computePortfolioPerformance = (config, events) => {
  console.log("Starting portfolio performance computation...");
  console.log("Configuration:", config);

  const eventHandler = new DefaultPortfolioEventStrategy(config.monthlyInvestment);

  // 1. Filter relevant events based on selected stocks and date range
  const filteredEvents = events.filter(event => {
    const eventMonth = new Date(event.eventDate.seconds * 1000).toISOString().substring(0, 7);
    const isRelevantTicker = config.selectedStocks.some(s => s.ticker === event.ticker);
    const isInDateRange = eventMonth >= config.startDate && eventMonth <= config.endDate;
    return isRelevantTicker && isInDateRange;
  });

  // Sort events chronologically
  filteredEvents.sort((a, b) => {
    return (a.eventDate.seconds - b.eventDate.seconds) || (a.eventDate.nanos - b.eventDate.nanos);
  });

  console.log(filteredEvents);

  // Initialize portfolio
  let portfolio = new Portfolio();
  portfolio.initializeHoldings(config.selectedStocks);

  /** @type {MonthlySnapshot[]} */
  const monthlySnapshots = [];

  let currentMonth = config.startDate; // YYYY-MM

  const getNextMonth = (month) => {
    let [year, mon] = month.split('-').map(Number);
    mon++;
    if (mon > 12) {
      mon = 1;
      year++;
    }
    return `${year}-${String(mon).padStart(2, '0')}`;
  };

  while (currentMonth <= config.endDate) {
    let monthlyDividends = 0;

    let nextPortfolio = portfolio.clone();
    nextPortfolio.totalInvested += config.monthlyInvestment;

    const eventsInMonth = filteredEvents.filter(event =>
      new Date(event.eventDate.seconds * 1000).toISOString().substring(0, 7) === currentMonth
    );
    const priceEvents = eventsInMonth.filter(e => e.stock_price);
    nextPortfolio = eventHandler.handlePriceEvent({
      events: priceEvents,
      nextPortfolio
    }, nextPortfolio);


    // Process events for the current month
    const dividendEvents = eventsInMonth.filter(e => e.dividend);
    const portfolioBeforeDividend = nextPortfolio.clone();
    nextPortfolio = eventHandler.handleDividend(dividendEvents, nextPortfolio);
    monthlyDividends += nextPortfolio.totalDividendsReceived - portfolioBeforeDividend.totalDividendsReceived;

    const bonusShareEvents = eventsInMonth.filter(e => e.bonus_share);
    nextPortfolio = eventHandler.handleBonusShare(bonusShareEvents, nextPortfolio);

    portfolio = nextPortfolio;

    // Update prices for all holdings to the latest known at month end for snapshot
    const snapshotPortfolio = portfolio.clone();
    for (const ticker in snapshotPortfolio.holdings) {
      const latestPriceEvent = filteredEvents.slice().reverse().find(e =>
        e.ticker === ticker &&
        new Date(e.eventDate.seconds * 1000).toISOString().substring(0, 7) <= currentMonth &&
        e.stock_price
      );
      if (latestPriceEvent && latestPriceEvent.stock_price) {
        snapshotPortfolio.holdings[ticker].currentPrice = latestPriceEvent.stock_price.close;
      }
    }

    // Take monthly snapshot
    monthlySnapshots.push({
      date: currentMonth,
      totalPortfolioValue: snapshotPortfolio.calculateTotalValue(),
      monthlyPassiveIncome: monthlyDividends,
      totalDividendsReceived: snapshotPortfolio.totalDividendsReceived,
      totalInvested: snapshotPortfolio.totalInvested,
    });

    currentMonth = getNextMonth(currentMonth);
  }

  const finalTotalPortfolioValue = monthlySnapshots.length > 0 ? monthlySnapshots[monthlySnapshots.length - 1].totalPortfolioValue : 0;
  const finalTotalInvested = portfolio.totalInvested;
  const finalTotalDividends = portfolio.totalDividendsReceived;

  return {
    chartData: monthlySnapshots.map(s => ({ date: s.date, value: s.totalPortfolioValue })),
    dividendYield: finalTotalInvested > 0 ? (finalTotalDividends / finalTotalInvested) * 100 : 0,
    totalAssetValue: finalTotalPortfolioValue,
    monthlySnapshots: monthlySnapshots,
  };
};

export default computePortfolioPerformance;
