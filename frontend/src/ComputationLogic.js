/**
 * @typedef {object} SelectedStock
 * @property {string} name
 * @property {string} ticker
 * @property {number} ratio
 */

/**
 * @typedef {object} PortfolioConfig
 * @property {SelectedStock[]} selectedStocks
 * @property {string} startDate - YYYY-MM format
 * @property {string} endDate - YYYY-MM format
 * @property {number} monthlyInvestment
 */

/**
 * @typedef {object} PortfolioHolding
 * @property {number} shares - Number of shares held
 * @property {number} averageCost - Average cost per share
 * @property {number} currentPrice - Latest known price per share
 */

/**
 * @typedef {object} MonthlySnapshot
 * @property {string} date - YYYY-MM format
 * @property {number} totalPortfolioValue
 * @property {number} monthlyPassiveIncome
 * @property {number} totalDividendsReceived
 * @property {number} totalInvested
 */

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

    // 1. Filter relevant events based on selected stocks and date range
    const filteredEvents = events.filter(event => {
        const eventMonth = new Date(event.eventDate.seconds * 1000).toISOString().substring(0, 7);
        const isRelevantTicker = config.selectedStocks.some(s => s.ticker === event.ticker);
        const isInDateRange = eventMonth >= config.startDate && eventMonth <= config.endDate;
        return isRelevantTicker && isInDateRange;
    });

    // Sort events chronologically (already sorted from App.js, but good to ensure)
    filteredEvents.sort((a, b) => {
        return (a.eventDate.seconds - b.eventDate.seconds) || (a.eventDate.nanos - b.eventDate.nanos);
    });

    // Initialize portfolio ledger
    /** @type {Object.<string, PortfolioHolding>} */
    const holdings = {};
    config.selectedStocks.forEach(stock => {
        holdings[stock.ticker] = { shares: 0, averageCost: 0, currentPrice: 0 };
    });

    let cash = 0;
    let totalDividendsReceived = 0;
    let totalInvested = 0;
    /** @type {MonthlySnapshot[]} */
    const monthlySnapshots = [];

    let currentMonth = config.startDate; // YYYY-MM

    // Helper to get the next month in YYYY-MM format
    const getNextMonth = (month) => {
        let [year, mon] = month.split('-').map(Number);
        mon++;
        if (mon > 12) {
            mon = 1;
            year++;
        }
        return `${year}-${String(mon).padStart(2, '0')}`;
    };

    // Main loop to iterate through months and events
    while (currentMonth <= config.endDate) {
        let monthlyInvestmentAmount = config.monthlyInvestment;
        let monthlyDividends = 0;

        // Process monthly investment at the beginning of the month
        cash += monthlyInvestmentAmount;
        totalInvested += monthlyInvestmentAmount;

        // Distribute monthly investment among selected stocks based on ratios
        if (config.selectedStocks.length > 0) {
            config.selectedStocks.forEach(sStock => {
                const allocation = (monthlyInvestmentAmount * sStock.ratio) / 100;
                const stockHoldings = holdings[sStock.ticker];
                
                // Find the latest price for this stock up to currentMonth
                const latestPriceEvent = filteredEvents.slice().reverse().find(e => 
                    e.ticker === sStock.ticker && 
                    new Date(e.eventDate.seconds * 1000).toISOString().substring(0, 7) <= currentMonth &&
                    e.stock_price
                );

                if (latestPriceEvent && latestPriceEvent.stock_price && latestPriceEvent.stock_price.close > 0) {
                    const price = latestPriceEvent.stock_price.close;
                    const sharesToBuy = allocation / price;

                    if (sharesToBuy > 0) {
                        const currentTotalValue = stockHoldings.shares * stockHoldings.averageCost;
                        const newTotalValue = currentTotalValue + allocation;
                        const newTotalShares = stockHoldings.shares + sharesToBuy;

                        stockHoldings.averageCost = newTotalValue / newTotalShares;
                        stockHoldings.shares = newTotalShares;
                        stockHoldings.currentPrice = price; // Update current price for this month
                        cash -= allocation; // Deduct from cash
                    }
                }
            });
        }

        // Process events for the current month
        const eventsInMonth = filteredEvents.filter(event => 
            new Date(event.eventDate.seconds * 1000).toISOString().substring(0, 7) === currentMonth
        );

        eventsInMonth.forEach(event => {
            const stockHoldings = holdings[event.ticker];
            if (!stockHoldings) return; // Should not happen with filtered events

            if (event.stock_price) {
                stockHoldings.currentPrice = event.stock_price.close; // Update latest price
            } else if (event.dividend) {
                const dividendAmount = stockHoldings.shares * event.dividend.amount_per_share;
                cash += dividendAmount;
                totalDividendsReceived += dividendAmount;
                monthlyDividends += dividendAmount;
            } else if (event.bonus_share) {
                // For bonus shares, adjust the number of shares
                // Assuming bonus_share.shares_per_share_owned is a multiplier (e.g., 1.1 for 10% bonus)
                stockHoldings.shares *= event.bonus_share.shares_per_share_owned;
            }
        });

        // Calculate total portfolio value for the snapshot
        let currentPortfolioValue = cash;
        Object.values(holdings).forEach(h => {
            currentPortfolioValue += h.shares * h.currentPrice;
        });

        // Take monthly snapshot
        monthlySnapshots.push({
            date: currentMonth,
            totalPortfolioValue: currentPortfolioValue,
            monthlyPassiveIncome: monthlyDividends,
            totalDividendsReceived: totalDividendsReceived,
            totalInvested: totalInvested,
        });

        currentMonth = getNextMonth(currentMonth);
    }

    // Final computed data
    const finalTotalPortfolioValue = monthlySnapshots.length > 0 ? monthlySnapshots[monthlySnapshots.length - 1].totalPortfolioValue : 0;
    const finalTotalInvested = totalInvested;
    const finalTotalDividends = totalDividendsReceived;

    return {
        chartData: monthlySnapshots.map(s => ({ date: s.date, value: s.totalPortfolioValue })),
        dividendYield: finalTotalInvested > 0 ? (finalTotalDividends / finalTotalInvested) * 100 : 0,
        totalAssetValue: finalTotalPortfolioValue,
        monthlySnapshots: monthlySnapshots,
        // ... other computed stats
    };
};

export default computePortfolioPerformance;