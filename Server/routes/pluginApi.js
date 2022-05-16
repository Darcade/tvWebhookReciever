const express = require('express');
const ccxt = require('ccxt');

const router = new express.Router();
const TradingExecutor = require('../TradingExecutor');
const EventStore = require('../EventStore');
const AccountStore = require('../AccountStore');
const AlertStore = require('../AlertStore');


const authKey = process.env.AUTH_KEY;


// a middleware function with no mount path.
// This code is executed for every request to the router
router.use(function (req, res, next) {
  // console.log('pluginApi req.headers:',  req.headers);
  if (req.headers && req.headers['authorization'] && req.headers['authorization'] == authKey) {
    next();
  } else {
    console.error('No auth key found ', req);
    res.sendStatus(401);
  }
});


/**
 * Returns Alerts
 */
router.get('/accounts', async (req, res) => {
  const allAccounts = await AccountStore.getAllVerifiedAndMasked();
  res.json(allAccounts);
});

router.delete('/account/:accountid', async (req, res) => {
  await AccountStore.delete(req.params.accountid);
  res.status(201).send('Success');
});

/**
 * Will store alert. Items with same ID will be overwritten
 */
router.post('/account', async (req, res) => {
  const storeResult = await AccountStore.store(req.body);

  res.status(201).json(storeResult);
});


router.delete('/alert/:alertid', async (req, res) => {
  await AlertStore.delete(req.params.alertid);
  res.status(201).send('Success');
});
/**
 * Returns Alerts
 */
router.get('/alerts', async (req, res) => {
  res.json(await AlertStore.getAll());
});

/**
 * Will store alert. Items with same ID will be overwritten
 */
router.post('/alert', async (req, res) => {
  const storeResult = await AlertStore.store(req.body);

  res.status(201).json(storeResult);
});


/**
 * Returns Events shown in plugin
 */
router.get('/events', async (req, res) => {
  res.json(await EventStore.getAll());
});

/*
router.get('/ticker/:symbol1/:symbol2', async function (req, res) {
  try {
    const trade = new TradingExecutor(accounts[0].ccxt);
    const ticker = await trade.ccxtExchange.fetchTicker(req.params.symbol1 +'/' + req.params.symbol2);
    res.json(ticker);
  } catch (err) {
    console.error('Error while fetching positions: ', err);
  }
});*/


router.get('/positions', async function (req, res) {
  const positions = [];
  const allAccounts = await AccountStore.getAll();
  for (const acc of allAccounts) {
    const trade = new TradingExecutor(await AccountStore.getCcxtByID(acc.ID));
    try {
      const btcPos = await trade.ccxtExchange.privateGetAccountsAccountPositions({ currency: 'BTC' });
      const usdPos = await trade.ccxtExchange.privateGetAccountsAccountPositions({ currency: 'USD' });


      const pos = { localAccountID: acc.ID, accName: acc.name };
      pos.accounts = { BTC: btcPos.data.account, USD: usdPos.data.account };
      pos.positions = { BTC: btcPos.data.positions, USD: usdPos.data.positions };
      positions.push(pos);
    } catch (err) {
      console.error('Error while fetching positions for '+acc.name, err);
    }
  }
  res.json(positions);
});


/*router.get('/:accountid/markets', async function (req, res) {
  if (req.params.accountid) {
    const cAcc = accounts.find((acc) => acc.ID == Number(req.params.accountid));
    if (cAcc && cAcc.ccxt) {
      try {
        const productsResult = await cAcc.ccxt.publicGetProducts();
        if (productsResult && productsResult.data && productsResult.code === '0' && productsResult.msg === 'OK') {
          res.json(productsResult.data);
        } else {
          res.status(400).json({ message: 'Request to Server failed', err: productsResult });
        }
      } catch (err) {
        res.status(400).json({ message: 'Request to Server failed', err });
      }
    } else {
      res.status(400).json({ message: 'AccountID not found' });
      console.error('AccountID not found');
    }
  }
});*/

/**
 * Returns list of accounts for fomular in browser plugin
 */
router.get('/markets', async (req, res) => {
  // TODO use getAvailMarkets from tradingExec
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
          res.status(400).json({ message: 'Request to Server failed', err: productsResult });
          break;
        }
      } catch (err) {
        res.status(400).json({ message: 'Request to Server failed catch', err: err });
        break;
      }
    } else {
      res.status(400).json({ message: 'Ccxt was empty' });
      console.error('Ccxt was empty', currCcxt);
      break;
    }
    marketsList.push({exchange: cExch, markets});
  }
  res.json(marketsList);
});


module.exports = router;
