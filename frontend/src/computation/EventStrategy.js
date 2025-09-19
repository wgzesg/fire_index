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
   * @param {SelectedStock[]} selectedStocks
   */
  constructor(monthlyInvestment, selectedStocks) {
    super();
    this.monthlyInvestment = monthlyInvestment;
    this.selectedStocks = new Map(selectedStocks.map(s => [s.ticker, s]));
  }

  /**
   * @override
   */
  handlePriceEvent({ events }, portfolio) {
    const newPortfolio = portfolio.clone();

    const latestPrices = {};
    events.forEach(event => {
      if (event.stockPrice) {
        latestPrices[event.ticker] = event.stockPrice.open;
      }
    });

    newPortfolio.updateHoldingPrices(latestPrices);
    const totalPortfolioValue = newPortfolio.calculateTotalValue();

    const currentValues = {};
    const expectedValues = {};
    for (const ticker in newPortfolio.holdings) {
      const holding = newPortfolio.holdings[ticker];
      const currentValue = holding.shares * (latestPrices[ticker] || holding.currentPrice);
      currentValues[ticker] = currentValue;

      const selectedStock = this.selectedStocks.get(ticker);
      if (selectedStock) {
        const expectedValue = (selectedStock.ratio / 100) * totalPortfolioValue;
        expectedValues[ticker] = expectedValue;
      }
    }

    const investmentAllocation = {};
    for (const ticker in currentValues) {
      const investmentNeeded = Math.max(0, expectedValues[ticker] - currentValues[ticker]);
      if (investmentNeeded > 0) {
        investmentAllocation[ticker] = investmentNeeded;
      }
    }

    const sortedInvestmentAllocation = Object.entries(investmentAllocation).sort(([, a], [, b]) => b - a);

    let remainingCash = newPortfolio.cash;

    for (const [ticker, investmentNeeded] of sortedInvestmentAllocation) {
      const price = latestPrices[ticker];
      if (!price || price <= 0) continue;

      const costPerLot = price * 100;
      if (remainingCash < costPerLot) {
        continue;
      }

      const numLotsToBuy = Math.floor(Math.min(remainingCash, investmentNeeded) / costPerLot);

      if (numLotsToBuy > 0) {
        const cost = numLotsToBuy * costPerLot;

        const stockHoldings = newPortfolio.holdings[ticker];
        const currentTotalValue = stockHoldings.shares * stockHoldings.averageCost;
        const newTotalValue = currentTotalValue + cost;
        const newTotalShares = stockHoldings.shares + (numLotsToBuy * 100);

        stockHoldings.averageCost = newTotalShares > 0 ? newTotalValue / newTotalShares : 0;
        stockHoldings.shares = newTotalShares;
        stockHoldings.currentPrice = price;

        remainingCash -= cost;
      }
    }

    newPortfolio.cash = remainingCash;
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
      const dividendAmount = stockHoldings.shares * event.dividend.amountPerShare;
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
      console.log("bonus stock event", event)

      stockHoldings.shares *= event.bonus_share.shares_per_share_owned;
    });
    return newPortfolio;
  }
}
