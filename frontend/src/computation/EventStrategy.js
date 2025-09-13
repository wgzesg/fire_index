import { Portfolio } from "./Portfolio";

/**
 * Interface for handling portfolio events.
 * Different strategies can be implemented by extending this class.
 */
export class PortfolioEventStrategy {
    /**
     * @param {object} purchaseDetails
     * @param {string} purchaseDetails.ticker
     * @param {number} purchaseDetails.sharesToBuy
     * @param {number} purchaseDetails.price
     * @param {number} purchaseDetails.allocation
     * @param {Portfolio} portfolio
     * @returns {Portfolio}
     */
    handlePurchase(purchaseDetails, portfolio) {
        console.warn("handlePurchase not implemented. Details:", purchaseDetails);
        return portfolio;
    }

    /**
     * @param {object} event
     * @param {Portfolio} portfolio
     * @returns {Portfolio}
     */
    handleDividend(event, portfolio) {
        console.warn("handleDividend not implemented. Event:", event);
        return portfolio;
    }

    /**
     * @param {object} event
     * @param {Portfolio} portfolio
     * @returns {Portfolio}
     */
    handleBonusShare(event, portfolio) {
        console.warn("handleBonusShare not implemented. Event:", event);
        return portfolio;
    }
}

/**
 * Default strategy for handling portfolio events.
 */
export class DefaultPortfolioEventStrategy extends PortfolioEventStrategy {
    /**
     * @override
     */
    handlePurchase({ ticker, sharesToBuy, price, allocation }, portfolio) {
        const newPortfolio = portfolio.clone();
        const stockHoldings = newPortfolio.holdings[ticker];

        if (sharesToBuy > 0) {
            const currentTotalValue = stockHoldings.shares * stockHoldings.averageCost;
            const newTotalValue = currentTotalValue + allocation;
            const newTotalShares = stockHoldings.shares + sharesToBuy;

            stockHoldings.averageCost = newTotalShares > 0 ? newTotalValue / newTotalShares : 0;
            stockHoldings.shares = newTotalShares;
            stockHoldings.currentPrice = price;
            newPortfolio.cash -= allocation;
        }
        return newPortfolio;
    }

    /**
     * @override
     */
    handleDividend(event, portfolio) {
        const newPortfolio = portfolio.clone();
        const stockHoldings = newPortfolio.holdings[event.ticker];
        if (!stockHoldings || stockHoldings.shares === 0) {
            return newPortfolio;
        }

        const dividendAmount = stockHoldings.shares * event.dividend.amount_per_share;
        newPortfolio.cash += dividendAmount;
        newPortfolio.totalDividendsReceived += dividendAmount;
        
        return newPortfolio;
    }

    /**
     * @override
     */
    handleBonusShare(event, portfolio) {
        const newPortfolio = portfolio.clone();
        const stockHoldings = newPortfolio.holdings[event.ticker];
        if (!stockHoldings) return newPortfolio;

        stockHoldings.shares *= event.bonus_share.shares_per_share_owned;
        return newPortfolio;
    }
}
