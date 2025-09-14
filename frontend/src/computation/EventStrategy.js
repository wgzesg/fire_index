import { Portfolio } from "./Portfolio";
import './types.js';
import './types/event.js';

/**
 * Interface for handling portfolio events.
 * Different strategies can be implemented by extending this class.
 */
export class PortfolioEventStrategy {
  /**
   * @param {Event[]} events
   * @param {Portfolio} portfolio
   * @returns {Portfolio}
   */
  handlePriceEvent(events, portfolio) {
    console.warn("handlePurchase not implemented. Details:", purchaseDetails);
    return portfolio;
  }

  /**
   * @param {Event[]} events
   * @param {Portfolio} portfolio
   * @returns {Portfolio}
   */
  handleDividend(events, portfolio) {
    console.warn("handleDividend not implemented. Events:", events);
    return portfolio;
  }

  /**
   * @param {Event[]} events
   * @param {Portfolio} portfolio
   * @returns {Portfolio}
   */
  handleBonusShare(events, portfolio) {
    console.warn("handleBonusShare not implemented. Events:", events);
    return portfolio;
  }
}

/**
 * Default strategy for handling portfolio events.
 */
export class DefaultPortfolioEventStrategy extends PortfolioEventStrategy {
  /**
   * @param {number} monthlyInvestment
   */
  constructor(monthlyInvestment) {
    super();
    this.monthlyInvestment = monthlyInvestment;
  }

  /**
   * @override
   */
  handlePriceEvent(events, portfolio) {
    const newPortfolio = portfolio.clone();
    let moneySpent = 0;

    const stockPrices = {};
    selectedStocks.forEach(stock => {
      const latestPriceEvent = events.slice().reverse().find(e =>
        e.ticker === stock.ticker && e.stock_price
      );
      if (latestPriceEvent && latestPriceEvent.stock_price) {
        stockPrices[stock.ticker] = latestPriceEvent.stock_price.close;
      }
    });

    selectedStocks.forEach(stock => {
      const price = stockPrices[stock.ticker];
      if (!price || price <= 0) return;

      const allocation = this.monthlyInvestment * (stock.ratio / 100);
      const costPerUnit = price;

      if (costPerUnit > 0) {
        const numUnitsToBuy = Math.floor(allocation / costPerUnit);

        if (numUnitsToBuy > 0) {
          const cost = numUnitsToBuy * costPerUnit;

          const stockHoldings = newPortfolio.holdings[stock.ticker];
          const currentTotalValue = stockHoldings.shares * stockHoldings.averageCost;
          const newTotalValue = currentTotalValue + cost;
          const newTotalShares = stockHoldings.shares + (numUnitsToBuy * 100);

          stockHoldings.averageCost = newTotalShares > 0 ? newTotalValue / newTotalShares : 0;
          stockHoldings.shares = newTotalShares;
          stockHoldings.currentPrice = price;

          moneySpent += cost;
        }
      }
    });

    const cashFromInvestment = this.monthlyInvestment - moneySpent;
    newPortfolio.cash += cashFromInvestment;

    return newPortfolio;
  }

  /**
   * @override
   * @param {Event[]} events
   */
  handleDividend(events, portfolio) {
    let newPortfolio = portfolio.clone();
    events.forEach(event => {
      const stockHoldings = newPortfolio.holdings[event.ticker];
      if (!stockHoldings || stockHoldings.shares === 0) {
        return;
      }

      const dividendAmount = stockHoldings.shares * event.dividend.amount_per_share;
      newPortfolio.cash += dividendAmount;
      newPortfolio.totalDividendsReceived += dividendAmount;
    });
    return newPortfolio;
  }

  /**
   * @override
   * @param {Event[]} events
   */
  handleBonusShare(events, portfolio) {
    let newPortfolio = portfolio.clone();
    events.forEach(event => {
      const stockHoldings = newPortfolio.holdings[event.ticker];
      if (!stockHoldings) return;

      stockHoldings.shares *= event.bonus_share.shares_per_share_owned;
    });
    return newPortfolio;
  }
}
