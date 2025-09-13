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
