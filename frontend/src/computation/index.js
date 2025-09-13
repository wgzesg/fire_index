import './types.js';
import { Portfolio } from './Portfolio.js';
import { DefaultPortfolioEventStrategy } from './EventStrategy.js';

/**
 * Computes portfolio performance based on user configuration and historical events.
 * 
 * @param {PortfolioConfig} config - User's portfolio configuration.
 * @param {object[]} events - All historical events (from stock_data.bin).
 * @returns {object} - Computed portfolio data including chart data and key statistics.
 */
const computePortfolioPerformance = (config, events) => {
    console.log("Starting portfolio performance computation...");
    console.log("Configuration:", config);

    const eventHandler = new DefaultPortfolioEventStrategy();

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
        nextPortfolio.cash += config.monthlyInvestment;
        nextPortfolio.totalInvested += config.monthlyInvestment;

        // Distribute monthly investment among selected stocks
        if (config.selectedStocks.length > 0) {
            config.selectedStocks.forEach(sStock => {
                const allocation = (config.monthlyInvestment * sStock.ratio) / 100;
                
                const latestPriceEvent = filteredEvents.slice().reverse().find(e => 
                    e.ticker === sStock.ticker && 
                    new Date(e.eventDate.seconds * 1000).toISOString().substring(0, 7) <= currentMonth &&
                    e.stock_price
                );

                if (latestPriceEvent && latestPriceEvent.stock_price && latestPriceEvent.stock_price.close > 0) {
                    const price = latestPriceEvent.stock_price.close;
                    const sharesToBuy = allocation / price;

                    if (sharesToBuy > 0) {
                        nextPortfolio = eventHandler.handlePurchase({
                            ticker: sStock.ticker,
                            sharesToBuy,
                            price,
                            allocation
                        }, nextPortfolio);
                    }
                }
            });
        }

        // Process events for the current month
        const eventsInMonth = filteredEvents.filter(event => 
            new Date(event.eventDate.seconds * 1000).toISOString().substring(0, 7) === currentMonth
        );

        eventsInMonth.forEach(event => {
            if (event.stock_price) {
                if (nextPortfolio.holdings[event.ticker]) {
                    nextPortfolio.holdings[event.ticker].currentPrice = event.stock_price.close;
                }
            } else if (event.dividend) {
                const portfolioBeforeDividend = nextPortfolio.clone();
                nextPortfolio = eventHandler.handleDividend(event, nextPortfolio);
                monthlyDividends += nextPortfolio.totalDividendsReceived - portfolioBeforeDividend.totalDividendsReceived;
            } else if (event.bonus_share) {
                nextPortfolio = eventHandler.handleBonusShare(event, nextPortfolio);
            }
        });
        
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
