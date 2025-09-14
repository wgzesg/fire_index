/**
 * From protos/stock_data.proto
 * @typedef {object} StockPrice
 * @property {number} open
 * @property {number} high
 * @property {number} low
 * @property {number} close
 */

/**
 * From protos/stock_data.proto
 * @typedef {object} Dividend
 * @property {number} amount_per_share
 */

/**
 * From protos/stock_data.proto
 * @typedef {object} BonusShare
 * @property {number} shares_per_share_owned
 */

/**
 * From protos/stock_data.proto
 * @typedef {object} Event
 * @property {string} ticker
 * @property {object} event_date
 * @property {number} event_date.seconds
 * @property {number} event_date.nanos
 * @property {StockPrice} [stock_price]
 * @property {Dividend} [dividend]
 * @property {BonusShare} [bonus_share]
 */
