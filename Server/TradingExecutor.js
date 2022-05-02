const chalk = require('chalk');
const crypto = require('crypto');
const ccxt = require('ccxt');

module.exports = class TradingExecutor {
  /**
   *
   * @param {*} ccxtExchange ccxt object with api key and exchange set
   */
  constructor(ccxtExchange) {
    this.currMessageID = 1;
    this.ccxtExchange = ccxtExchange;
  }

  /**
   * Will return quteCurrency for given symbol at current exchange of object instace
   * @param {String} symbol Symbol to check quote currency for
   * @return {String} Quote currency
   */
  async getQuoteCurrencyBySymbol(symbol) {
    try {
      const allAvailMarkets = await this.getAvailableMarkets();
      const availMarkets=allAvailMarkets.find((item)=>item.exchange==this.ccxtExchange.id).markets;
      const currSymbolMarket = availMarkets.find((item)=>item.symbol==symbol);

      return currSymbolMarket.quoteCurrency;
    } catch (err) {
      console.error('🚀 ~ file: TradingExecutor.js ~ line 28 ~ TradingExecutor ~ getQuoteCurrencyBySymbol ~ err', err);
    }
    return null;
  }

  /**
   * @return {Object} List of available Markets
   */
  async getAvailableMarkets() {
    const exchanges = ['phemex', 'phemexTestnet'];
    const marketsList = [];
    for (const cExch of exchanges) {
      let markets =[];
      let exchString = cExch;
      if (cExch == 'phemexTestnet') {
        exchString = 'phemex';
      }

      const currCcxt =new ccxt[exchString]({
        'timeout': 30000,
        'enableRateLimit': true,
      });
      if (cExch == 'phemexTestnet') currCcxt.urls['api']=currCcxt.urls['test'];
      if (currCcxt) {
        try {
          const productsResult = await currCcxt.publicGetProducts();
          if (productsResult && productsResult.data && productsResult.code === '0' && productsResult.msg === 'OK') {
            markets = productsResult.data;
          } else {
            console.error('Request to exchange failed', productsResult);
            break;
          }
        } catch (err) {
          console.error('Request to exchange failed', err);
          break;
        }
      } else {
        console.error('Ccxt was empty', currCcxt);
        break;
      }
      marketsList.push({exchange: cExch, markets});
    }
    return marketsList;
  }

  /**
   *
   * @return {String} Returns random message ID
   */
  getNextMessagID() {
    return crypto.randomBytes(20).toString('hex');
  }

  /**
   * Will close position for current accont
   * @param {String} symbol Symbol of the coin
  * @return {Object} Position response or undefined if not found
   */
  async getPosition(symbol) {
    let currency = symbol.replace('USD', '');// .slice(0, 3)
    if (currency == 'cETH') currency = 'ETH';
    if (currency == 'uBTC') currency = 'BTC';
    const trades = await this.ccxtExchange.privateGetAccountsAccountPositions({ currency });
    if (trades && trades.data && trades.data.positions) {
      for (const position of trades.data.positions) {
        if (position.symbol == symbol) return position;
      }
      console.log(`Positions ${currency}`, trades.data.positions);
    }
    return undefined;
  }

  /**
   * Will close position for current accont
   * @param {String} symbol Symbol of the coin
   * @param {String} price If price is undefined or null a market order is created. If price is set than it will create a limit order.
   * @param {Number} percentQuantityOfPosition Percent quantity of the position minimum=1 max. 100
   * @param  {Number} triggerPrice Price at which stoploss gets activated
   * @return {Object} Response of the order creation
   */
  async setStopLoss(symbol, price, percentQuantityOfPosition, triggerPrice) {
    /**
     * Phemex example requests from https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#place-order-with-argument-in-url-query-string
StopLoss Sell order, triggered order is placed as limit order (Assume current last-price is 30k)

{
    "clOrdID": "stop-loss-order-then-limit",
    "symbol": "BTCUSD",
    "side": "Sell",
    "ordType": "StopLimit",
    "triggerType": "ByMarkPrice",
    "stopPxEp": "299550000", // "trigger price, when ordType= Stop/StopLimit and side = Sell, stopPxEp must less than last-price"
    "priceEp": "299650000", // "when ordType = StopLimit, priceEp is required, when ordType = Stop, priceEp is not required "
    "orderQty": 10000
}
StopLoss Buy order, triggered order is placed as market order (Assume current last-price is 30k)
{
    "clOrdID": "stop-loss-order-then-market",
    "symbol": "BTCUSD",
    "side": "Buy",
    "ordType": "Stop",
    "triggerType": "ByMarkPrice",
    "stopPxEp": "333550000", // "trigger price, when ordType = Stop/StopLimit and side = Buy, stopPxEp must be larger than last-price"
    "priceEp": "0",// not required
    "orderQty": 10000
}
     */
    const quantity = await this.getPercentPositionQuantity(symbol, percentQuantityOfPosition);
    const position = await this.getPosition(symbol);
    const newSide = position.side == 'Buy' ? 'Sell' : 'Buy';
    const request = {
      'symbol': symbol,
      'clOrdID': this.getNextMessagID(),
      'side': newSide,
      'priceEp': price == '0' || price == undefined ? undefined : price * 10000, // scale up price for phemex api
      'orderQty': quantity,
      'ordType': price == 0 || price == '0' || price == undefined ? 'Stop' : 'StopLimit',
      'triggerType': 'ByMarkPrice',
      'stopPxEp': triggerPrice * 10000,
    };

    console.log('Preparing request for order = ' + chalk.magenta(JSON.stringify(request)));

    return await this.ccxtExchange.privatePostOrders(request);
  }
  /**
   * Will close position for current accont
   * @param {String} symbol Symbol of the coin
   * @param {String} price If price is undefined or null a market order is created. If price is set than it will create a limit order.
   * @param {Number} percentQuantityOfPosition Percent quantity of the position minimum=1 max. 100
   * @param {Number} triggerPrice Price used to trigger Takeprofit
   * @return {Object} Response of the order creation
   */
  async setTakeProfit(symbol, price, percentQuantityOfPosition, triggerPrice) {
    /**
     * Phemex example requests
     {
    "clOrdID": "take-profit-order-then-limit",
    "symbol": "BTCUSD",
    "side": "Sell",
    "ordType": "LimitIfTouched",
    "triggerType": "ByMarkPrice",
    "stopPxEp": "333550000", // "trigger price, when ordType = LimitIfTouched/MarketIfTouched and side = Sell, stopPxEp is larger than last-price"
    "priceEp": "334550000", // "when ordType = LimitIfTouched, priceEp is required, when ordType = MarketIfTouched, priceEp is not required "
    "orderQty": 10000
}
{
    "clOrdID": "take-profit-order-then-market",
    symbol": "BTCUSD",
    "side": "Buy",
    "ordType": "MarketIfTouched",
    "triggerType": "ByLastPrice",
    "stopPxEp": "299550000", // "when ordType = LimitIfTouched/MarketIfTouched and side = Buy, stopPxEp is less than last-price"
    "priceEp": "0", // "not required"
    "orderQty": 10000
}
     */
    const quantity = await this.getPercentPositionQuantity(symbol, percentQuantityOfPosition);
    const position = await this.getPosition(symbol);
    const newSide = position.side == 'Buy' ? 'Sell' : 'Buy';
    let request = {
      'symbol': symbol,
      'clOrdID': this.getNextMessagID(),
      'side': newSide,
      'priceEp': price == '0' || price == undefined ? undefined : price * 10000, // scale up price for phemex api
      'orderQty': quantity,
      'ordType': price == 0 || price == '0' || price == undefined ? 'MarketIfTouched' : 'LimitIfTouched',
      'triggerType': 'ByLastPrice', // or ByMarkPrice
      'stopPxEp': triggerPrice * 10000,
    };

    if (triggerPrice === undefined || triggerPrice === null || triggerPrice == 0) {
      request = {
        'symbol': symbol,
        'clOrdID': this.getNextMessagID(),
        'side': newSide,
        'priceEp': price == '0' || price == undefined ? undefined : price * 10000, // scale up price for phemex api
        'orderQty': quantity,
        'ordType': 'LimitIfTouched',
        'triggerType': 'ByLastPrice', // or ByMarkPrice
        'stopPxEp': Number(price) * 10000,
      };
    }

    console.log('Preparing request for order = ' + chalk.magenta(JSON.stringify(request)));

    try {
      return await this.ccxtExchange.privatePostOrders(request);
    } catch (err) {
      // if takeprofit would trigger close then close current position at market price
      if (err.message.includes('TE_RISING_TRIGGER_DIRECTLY') ) {
        console.log('Closing position since takeprofit would trigger directly');

        try {
          this.closePosition(symbol, undefined, 100, true);
        } catch (err) {
          console.error('Error while closing position after takeprofit failed:'+err.message, err);
        }
      } else {
        console.error('Error while setting takeprofit :'+err.message, err);
      }
    }
  }

  /**
       * Will set Takeprofit to given percent in profit
       * @param {String} symbol Symbol of the coin
       * @param {Number} priceGainPercent Percentage gain from current price min 0
       * @param {Number} percentQuantityOfPosition Percent quantity of the position minimum=1 max. 100
       * @param {Number} triggerPrice Price used to trigger Takeprofit
       * @return {Object} Response of the order creation
       */
  async setTakeProfitPercent(symbol, priceGainPercent, percentQuantityOfPosition, triggerPrice) {
    // calculate exit price
    const posResp = await this.getPosition(symbol);
    const longProfitPerc = priceGainPercent * 0.01;
    const longExitPrice = posResp.avgEntryPrice * (1 + longProfitPerc);
    console.log('Calculated Percentage for TakeProfit posResp:', posResp);
    return this.setTakeProfit(symbol, longExitPrice, percentQuantityOfPosition, triggerPrice);
  }

  /**
    * Will close position for current accont
    * @param {String} symbol Symbol of the coin
    * @param {Number} percentQuantityOfPosition Percent quantity of the position minimum=1 max. 100
    * @param {Number} offsetValue Offset used for trailing stop
    * @param {Number} triggerPrice Price used to trigger Takeprofit
    * @return {Object} Response of the order creation
    */
  async setTrailingStopLoss(symbol, percentQuantityOfPosition, offsetValue, triggerPrice) {
    // TODO fix empty trigger Price not working
    /**
     * Phemex example requests
Trailing stop order with activiation price
{
"symbol": "BTCUSD",
"side": "Sell",
"ordType": "Stop",
"orderQty": 0,
"priceEp": 0,
"triggerType": "ByLastPrice",
"stopPxEp": 340000000, // activation price of this trailing order, this value should be larger than last-price
"timeInForce": "ImmediateOrCancel",
"closeOnTrigger": true,
"pegPriceType": "TrailingTakeProfitPeg",
"pegOffsetValueEp": -10000000,//retraces by $1000.0 from the optimal price, sign is opposite to position side, i.e. Long Position => negative sign; Shot Position => positive sign
"clOrdID": "cl-order-id"
}

Trailing stop order(Assume current position is long, current last-price is 32k)
{
"symbol": "BTCUSD",
"side": "Sell", // assume current position is long
"ordType": "Stop",
"orderQty": 0,
"priceEp": 0,
"triggerType": "ByLastPrice",
"stopPxEp": 315000, // "if position is long, this value should be less than last-price; if position is short, this value is larger than last-price",
"timeInForce": "ImmediateOrCancel",
"closeOnTrigger": true,
"pegPriceType": "TrailingStopPeg",
"pegOffsetValueEp": -10000000, // retraces by $1000.0 from the optimal price, sign is opposite to position side, i.e. Long Position => negative sign; Shot Position => positive sign
"clOrdID": "cl-order-id"
}

     */
    const quantity = await this.getPercentPositionQuantity(symbol, percentQuantityOfPosition);
    const position = await this.getPosition(symbol);
    const newSide = position.side == 'Buy' ? 'Sell' : 'Buy';
    const request = {
      'symbol': symbol,
      'side': newSide,
      'ordType': 'Stop',
      'orderQty': quantity,
      'priceEp': 0,
      'triggerType': 'ByLastPrice', // or ByMarkPrice
      'stopPxEp': triggerPrice * 10000,
      'timeInForce': 'ImmediateOrCancel',
      'closeOnTrigger': true,
      'pegPriceType': 'TrailingTakeProfitPeg', // TrailingStopPeg
      'pegOffsetValueEp': (offsetValue * 10000) * (position.side == 'Buy' ? -1 : 1), // retraces by $1000.0 from the optimal price, sign is opposite to position side, i.e. Long Position => negative sign; Shot Position => positive sign

      'clOrdID': this.getNextMessagID(),


    };

    console.log('Preparing request for order = ' + chalk.magenta(JSON.stringify(request)));

    return await this.ccxtExchange.privatePostOrders(request);
  }


  /**
   * Will close position for current accont
   * @param {String} symbol Symbol of the coin
   * @param {String} side 'Buy' or 'Sell'
   * @param {Number} price If price is undefined or null a market order is created. If price is set than it will create a limit order.
   * @param {Number} quantity Quantity used for trade
   * @param {Boolean} reduceOnly Defines if position should only be reduced
   * @param {Number} takeProfitPrice Defines if position should only be reduced
   * @return {Object} Response of the order creation
   */
  async createOrderWithTakeProfit(symbol, side, price, quantity, reduceOnly, takeProfitPrice) {
    const request = {
      'actionBy': 'FromOrderPlacement',
      'symbol': symbol,
      'clOrdID': this.getNextMessagID(),
      'side': side,
      'priceEp': price == '0' || price == undefined ? undefined : price * 10000, // scale up price for phemex api
      'orderQty': quantity,
      'ordType': price == 0 || price == '0' || price == undefined ? 'Market' : 'Limit',
      'reduceOnly': reduceOnly,
      'triggerType': 'UNSPECIFIED',
      'pegPriceType': 'UNSPECIFIED',
      'timeInForce': 'GoodTillCancel',
      'takeProfitEp': takeProfitPrice == '0' || takeProfitPrice == undefined ? undefined : takeProfitPrice * 10000,
      // "stopLossEp": 0,
      'pegOffsetValueEp': 0,
      'pegPriceType': 'UNSPECIFIED',
    };

    console.log('Preparing request for order = ' + chalk.magenta(JSON.stringify(request)));

    return await this.ccxtExchange.privatePostOrders(request);
  }
  /**
   * Will close position for current accont
   * @param {String} symbol Symbol of the coin
   * @param {String} side 'Buy' or 'Sell'
   * @param {Number} price If price is undefined or null a market order is created. If price is set than it will create a limit order.
   * @param {Number} quantity Quantity used for trade
   * @param {Boolean} reduceOnly Defines if position should only be reduced
   * @return {Object} Response of the order creation
   */
  async createOrder(symbol, side, price, quantity, reduceOnly) {
    const request = {
      'actionBy': 'FromOrderPlacement',
      'symbol': symbol,
      'clOrdID': this.getNextMessagID(),
      'side': side,
      'priceEp': price == '0' || price == undefined ? undefined : price * 10000, // scale up price for phemex api
      'orderQty': quantity,
      'ordType': price == 0 || price == '0' || price == undefined ? 'Market' : 'Limit',
      'reduceOnly': reduceOnly,
      'triggerType': 'UNSPECIFIED',
      'pegPriceType': 'UNSPECIFIED',
      'timeInForce': 'GoodTillCancel',
      // "takeProfitEp": 0,
      // "stopLossEp": 0,
      'pegOffsetValueEp': 0,
      'pegPriceType': 'UNSPECIFIED',
    };

    console.log('Preparing request for order = ' + chalk.magenta(JSON.stringify(request)));

    return await this.ccxtExchange.privatePostOrders(request);
  }
  /**
 * Will close position for current accont
 * @param {String} symbol Symbol of the coin
 * @param {Number} percentQuantity Percent quantity of the position minimum=1 max. 100
 * @return {Object} Position response or undefined if not found
 */
  async getPercentPositionQuantity(symbol, percentQuantity) {
    const currency = symbol.slice(0, 3);
    const trades = await this.ccxtExchange.privateGetAccountsAccountPositions({ currency });
    if (trades && trades.data && trades.data.positions) {
      for (const position of trades.data.positions) {
        if (position.symbol == symbol) return Number(position.size) * (percentQuantity / 100);
      }
      // console.log(`Positions ${currency}`, trades.data.positions)
    }
    return undefined;
  }

  async getAvailablePercentBalance(currency) {
    const acc = await this.ccxtExchange.privateGetAccountsAccountPositions({ currency });
    return 1 - (Number(acc.data.account.totalUsedBalanceEv) / Number(acc.data.account.accountBalanceEv));
  }

  /**
   * Will close position for current accont
   * @param {String} symbol Symbol of the coin
   * @param {String} price If price is undefined or null a market order is created. If price is set than it will create a limit order.
   * @param {Number} percentQuantityOfPosition Percent quantity of the position minimum=1 max. 100
   * @param {Boolean} onlyCloseOnProfit Will only close is trade is in profit
   * @return {Object} Response of the order creation
   */
  async closePosition(symbol, price, percentQuantityOfPosition, onlyCloseOnProfit) {
    let currency = symbol.replace('USD', '');// .slice(0, 3)
    if (currency == 'cETH') currency = 'ETH';
    if (currency == 'uBTC') currency = 'BTC';
    const trades = await this.ccxtExchange.privateGetAccountsAccountPositions({ currency });
    if (trades && trades.data && trades.data.positions) {
      for (const position of trades.data.positions) {
        if (position.symbol == symbol) {
          const size = position.size; const side = position.side; const avgEntryPrice = position.avgEntryPrice; const markPrice = position.markPrice;
          const changePercent = ((markPrice / avgEntryPrice) - 1) * 100;
          if (onlyCloseOnProfit && changePercent < 0) {
            console.log('Trade is not in profit and onlyCloseOnProfit=true', position);
            return 'NotInProfit';
          }
          console.log(`Closing Position ${side} at avg price ${avgEntryPrice} (curr Market ${markPrice}) with size ${size}  gain/loss ${changePercent.toPrecision(4)}%`);
          const newSide = side == 'Buy' ? 'Sell' : 'Buy';
          const newQuantity = Number(size) * (percentQuantityOfPosition / 100);
          return await this.createOrder(symbol, newSide, price, newQuantity, true);
        }
      }
      // console.log(`Positions ${currency}`, trades.data.positions)
    } else {
      console.log('closePosition() trages.data.positions does not exist', trades);
    }
  }
};
