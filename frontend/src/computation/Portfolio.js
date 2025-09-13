import './types.js';

/**
 * Represents the state of a portfolio at a specific point in time.
 */
export class Portfolio {
    constructor() {
        /** @type {Object.<string, PortfolioHolding>} */
        this.holdings = {};
        this.cash = 0;
        this.totalInvested = 0;
        this.totalDividendsReceived = 0;
    }

    /**
     * Creates a deep copy of the portfolio.
     * @returns {Portfolio}
     */
    clone() {
        const newPortfolio = new Portfolio();
        newPortfolio.cash = this.cash;
        newPortfolio.totalInvested = this.totalInvested;
        newPortfolio.totalDividendsReceived = this.totalDividendsReceived;
        newPortfolio.holdings = JSON.parse(JSON.stringify(this.holdings));
        return newPortfolio;
    }

    /**
     * @param {SelectedStock[]} selectedStocks 
     */
    initializeHoldings(selectedStocks) {
        selectedStocks.forEach(stock => {
            if (!this.holdings[stock.ticker]) {
                this.holdings[stock.ticker] = { shares: 0, averageCost: 0, currentPrice: 0 };
            }
        });
    }

    /**
     * Calculates the total value of the portfolio.
     * @returns {number}
     */
    calculateTotalValue() {
        let totalValue = this.cash;
        for (const ticker in this.holdings) {
            const holding = this.holdings[ticker];
            totalValue += holding.shares * holding.currentPrice;
        }
        return totalValue;
    }
}
