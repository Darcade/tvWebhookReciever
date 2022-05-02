// Import the dependencies for testing
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const mongoose = require('../database');
const accounts = require('../accounts.testing');
const TradingExecutor = require('../TradingExecutor');
const app = require('../app');

const tradeExec = new TradingExecutor(accounts[0].ccxt);
// Configure chai
chai.use(chaiHttp);
chai.use(chaiSubset);
chai.use(require('chai-like'));
chai.use(require('chai-things'));
chai.should();

/**
 *
 * @return {Number} Current position price for BTC
 */
async function getPositionPrice() {
  const positionsResponse = await chai.request(app)
      .get('/pluginApi/positions')
      .set('Authorization', process.env.AUTH_KEY);

  positionsResponse.should.have.status(200);
  positionsResponse.body.should.be.an('array');

  return Number(positionsResponse.body[0].positions.BTC[0].avgEntryPrice);
}


/**
 * Will run alert test procedure wich contains following steps:
 * createAlert
 * triggerAlert
 * checkEventsFromAlert
 * @param {Object} newAlert Altert which gets generated and triggered
 * @return {Object} stored alert from mongooose
 */
async function alertTestProcedure(newAlert) {
  let storedAlert = null;
  it('creates new alert', async function() {
    storedAlert = await createAlert(newAlert);
  } );
  it('POST trigger alert', (done) => triggerAlert({ID: storedAlert.ID}, done));
  it('created event', (done) => {
    chai.request(app)
        .get('/pluginApi/events')
        .set('Authorization', process.env.AUTH_KEY)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array').that.is.not.empty;
          chai.expect(res.body).to.containSubset([{alertObj: {ID: storedAlert.ID}, eventType: 'ExchangeSuccess'}]);
          done();
        });
  });
}

/**
 * Will create alert and calls done callback as soon as it is finished
 * @param {Object} newAlert Alert which we want create.
 */
async function createAlert(newAlert) {
  let res = await chai.request(app)
      .post('/pluginApi/alert')
      .send(newAlert)
      .set('Authorization', process.env.AUTH_KEY);
  res.should.have.status(201);
  res.body.should.not.be.empty;
  const storedAlert = res.body;
  res = await chai.request(app)
      .get('/pluginApi/alerts')
      .set('Authorization', process.env.AUTH_KEY);
  res.should.have.status(200);
  res.body.should.be.an('array').that.is.not.empty;
  chai.expect(res.body).to.containSubset([newAlert]);

  return storedAlert;
}
/**
 * Will trigger alert and calls done callback as soon as it is finished
 * @param {Object} newAlert Alert which we want to trigger. Only Property 'ID' is required
 * @param {Function} done callback which gets called when finished
 */
function triggerAlert(newAlert, done) {
  chai.request(app)
      .post('/api/alert/' + newAlert.ID)
      .send({ 'authKey': process.env.AUTH_KEY, 'ID': newAlert.ID })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.empty;

        // check if event has been created
        chai.request(app)
            .get('/pluginApi/events')
            .set('Authorization', process.env.AUTH_KEY)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array').that.is.not.empty;
              chai.expect(res.body).to.containSubset([{alertObj: {ID: newAlert.ID}, eventType: 'ExchangeSuccess'}]);
              done();
            });
      });
}

/**
 * Contains all procedures that need to be called before test
 */
async function beforeAllTests() {
  await tradeExec.ccxtExchange.privateDeleteOrdersAll({ symbol: 'BTCUSD', untriggered: true });
}

/**
 * Contains all procedures to be called after Tests.
 */
async function afterAllTests() {
  // clear all open orders after tests
  await tradeExec.ccxtExchange.privateDeleteOrdersAll({ symbol: 'BTCUSD', untriggered: true });
  console.log('Finished all tests stopping mongodb Server and connction');
  mongoose.disconnect();
  mongoose.testServer.stop();
}

module.exports={
  triggerAlert, createAlert, alertTestProcedure, getPositionPrice, beforeAllTests, afterAllTests, chai,
};
