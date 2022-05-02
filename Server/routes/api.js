const express = require('express');
const router = new express.Router();
const chalk = require('chalk');

const AccountStore = require('../AccountStore');
const TradingExecutor = require('../TradingExecutor');
const EventStore = require('../EventStore.js');
const AlertStore = require('../AlertStore');

const push = require('../push');
const authKey = process.env.AUTH_KEY;


// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  // console.log('pluginApi req.headers:',  req.headers);
  if (req && req.body && req.body.authKey == authKey) {
    next();
  } else {
    console.error('No auth key found req.body', req.body);
    console.error('No auth key found req.rawBody', req.rawBody);
    res.sendStatus(401);
  }
});


router.post('/alert/:alertid', async (req, res, next) => {
  // console.log(chalk.yellow(new Date()) + ' - Recieved request at api ' + chalk.magenta(JSON.stringify(req.params)));
  // console.log('req.body = ' + chalk.magenta(JSON.stringify(req.body)));
  // check if key is inside body
  if (req.body && req.body.authKey) {
    // get alert
    const cAlert = await AlertStore.getByID(req.params.alertid);
    if (!cAlert) {
      console.warn('Alert #'+req.params.alertid + ' is not available!');
      return;
      console.log('🚀 ~ file: api.js ~ line 34 ~ router.post ~ req.params', req.params);

      console.log('🚀 ~ file: api.js ~ line 34 ~ router.post ~ cAlert', cAlert);
    }

    const all = await AccountStore.getAll();
    console.log('🚀 ~ file: api.js ~ line 43 ~ router.post ~ all', all);
    console.log('🚀 ~ file: api.js ~ line 45 ~ router.post ~ cAlert', cAlert);
    console.log('🚀 ~ file: api.js ~ line 46 ~ router.post ~ cAlert.account', cAlert.account);
    const currAccCcxt = await AccountStore.getCcxtByID(cAlert.account);


    if (currAccCcxt) {
      const tradeExec = new TradingExecutor(currAccCcxt);
      let orderAllowed = false;
      let response = undefined;
      let shortMessage = '';


      try {
        if (cAlert.minimalPercentBalance) {
          const balance = await tradeExec.getAvailablePercentBalance(await tradeExec.getQuoteCurrencyBySymbol(cAlert.symbol));
          console.log('🚀 ~ file: api.js ~ line 61 ~ router.post ~ balance', balance);
          if ((balance*100) > cAlert.minimalPercentBalance) {
            console.log('🚀 ~ file: api.js ~ line 61 ~ router.post ~ balance', balance);
            orderAllowed = true;
          } else {
            shortMessage = 'Not enough percent balance. Curr avail balance=' + balance * 100 + '%';
            orderAllowed = false;
          }
        } else {
          orderAllowed = true;
        }
        if (orderAllowed) {
          switch (cAlert.hookType) {
            case 'createOrder':
              shortMessage = `Created ${cAlert.side} order for ${cAlert.symbol} with quantity=${cAlert.quantity}`;


              let longExitPrice = cAlert.takeProfit;
              if (cAlert.takeProfitPercent) {
                const longProfitPerc = cAlert.takeProfit * 0.01;

                const posResp = await tradeExec.getPosition(cAlert.symbol);
                if (posResp.size == 0) {
                  // get takeprofit from actual price not from position since none is avail
                  longExitPrice = posResp.markPrice * (1 + longProfitPerc);
                  response = await tradeExec.createOrderWithTakeProfit(cAlert.symbol, cAlert.side, cAlert.orderPrice, cAlert.orderQuantity, cAlert.reduceOnly, longExitPrice);
                } else {
                  // longExitPrice = posResp.avgEntryPrice * (1 + longProfitPerc)
                  // set TakeProfit after 2 seconds since we hate to wait for order to close
                  // TODO make this cleaner and more configuratble via formular
                  setTimeout(async function () {
                    try {
                      console.log('Cancelling all orders');
                      await tradeExec.ccxtExchange.privateDeleteOrdersAll({ symbol: cAlert.symbol, untriggered: true });
                      console.log('Setting Takeprofit to ' + cAlert.takeProfit + '% for ' + cAlert.ID);
                      tradeExec.setTakeProfitPercent(cAlert.symbol, cAlert.takeProfit, 100, 0);
                    } catch (err) {
                      console.error('Failed setting takeprofit at alert#' + cAlert.ID, err);
                    }
                  }, 2000);
                  response = await tradeExec.createOrder(cAlert.symbol, cAlert.side, cAlert.orderPrice, cAlert.orderQuantity, cAlert.reduceOnly);
                }
              } else {
                response = await tradeExec.createOrder(cAlert.symbol, cAlert.side, cAlert.orderPrice, cAlert.orderQuantity, cAlert.reduceOnly);
              }


              /* if (cAlert.useTakeProfit) {
                if (cAlert.takeProfitPercent) {
                  setTimeout(async function () {
                    try {
                        console.log("Cancelling all orders")
                        await tradeExec.ccxtExchange.privateDeleteOrdersAll({ symbol: "BTCUSD", untriggered: true })
                        console.log("Setting Takeprofit to 0.295%")
                        tradeExec.setTakeProfitPercent("BTCUSD", 0.295, 100, 0)
                      } else {
                        console.log("15SekStrategy account not found!")
                      }
                    } catch (err) {
                      console.error("Failed setting trailingstop at alertid="+cAlert.ID, err)
                    }
                  }.bind(this), 1000);
                } else {

                }
              } */

              break;
            case 'closePosition':
              shortMessage = `Closing Position for ${cAlert.symbol} at price ${cAlert.price}  with percentQuantity=${cAlert.percent}`;
              response = await tradeExec.closePosition(cAlert.symbol, cAlert.orderPrice, cAlert.percent, cAlert.onlyCloseOnProfit);

              break;
            case 'setStopLoss':
              shortMessage = `Set stopLoss for ${cAlert.symbol} at price ${cAlert.price} with trigger Price ${cAlert.triggerPrice} with percentQuantity=${cAlert.percent}`;
              response = await tradeExec.setStopLoss(cAlert.symbol, cAlert.orderPrice, cAlert.percent, cAlert.triggerPrice);

              break;
            case 'setTakeProfit':
              shortMessage = `Set TakeProfit for ${cAlert.symbol} at price ${cAlert.price} with trigger Price ${cAlert.triggerPrice} with percentQuantity=${cAlert.percent}`;
              response = await tradeExec.setTakeProfit(cAlert.symbol, cAlert.orderPrice, cAlert.percent, cAlert.triggerPrice);
              break;
            case 'setTrailingStopLoss':
              shortMessage = `Set TrailingStop for ${cAlert.symbol} at price ${cAlert.price} with trigger Price ${cAlert.triggerPrice} with percentQuantity=${cAlert.percent}`;
              response = await tradeExec.setTrailingStopLoss(cAlert.symbol, cAlert.percent, cAlert.offset, cAlert.triggerPrice);
              break;
          }
        }


        // console.log(chalk.green('Posted order: response: ' + JSON.stringify(response)));
        if (response && response.code == '0') {
          EventStore.store({ eventType: 'ExchangeSuccess', name: 'Success for request to Exchange', message: null, exchangeResponse: response, alertObj: cAlert });
          res.send('success');
        } else {
          EventStore.store({ eventType: 'ExchangeError', name: 'Error for request to Exchange', message: 'Response from Server was empty', exchangeResponse: response, alertObj: cAlert });

          res.send('failed 55512');
        }
      } catch (err) {
        EventStore.store({ eventType: 'ExchangeError', name: err.name, message: err.message, exchangeResponse: null, alertObj: cAlert });
        console.log(chalk.red('Error requesting exchange server'), err);
        shortMessage = 'Error while requesting exchange server | ' + err.name;
        res.send('Error while sending to Server');
      }

      push.pushMessage(`#${cAlert.ID}-${cAlert.hookType}`, shortMessage);
    } else {
      const message = 'Account id not found...';
      console.log(chalk.red(message));
      EventStore.store({ eventType: 'AccountNotFound', name: 'Could not find account with id ' + cAlert.account, message: null, exchangeResponse: res.body, alertObj: cAlert });

      res.send(message);
    }
  } else {
    EventStore.store({ eventType: 'MissingParams', name: 'Missing params in request ', message: null, exchangeResponse: req.body, alertObj: cAlert });

    EventStore.store(new EventStore.Event(+new Date(), EventStore.EventTypes.MissingParams, 'Missing params in request ' + cAlert.account, JSON.stringify(req.body), null, cAlert));
    console.log(chalk.red('Request has missing parameters or authKey is wrong'));
    res.send('missing param ');
  }
});

module.exports = router;


