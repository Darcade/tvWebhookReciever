// Import the dependencies for testing
process.env.NODE_ENV = 'test';

const app = require('../app');

const {
  createAlert, alertTestProcedure, getPositionPrice, beforeAllTests, afterAllTests, chai,
} = require('./testHelpers');


describe('Backend Tests', () => {
  before(beforeAllTests);
  after(afterAllTests);

  describe('Basic REST tests', () => {
    describe('Authorisation header required at all endpoints', () => {
      it('GET /pluginApi/accounts', (done) => {
        chai.request(app)
            .get('/pluginApi/accounts')
            .set('Authorization', 'asdasdasdasd')
            .end((err, res) => {
              res.should.have.status(401);
              done();
            });
      });
      it('GET /pluginApi/events', (done) => {
        chai.request(app)
            .get('/pluginApi/events')
            .set('Authorization', 'asdasdasdasd')
            .end((err, res) => {
              res.should.have.status(401);
              done();
            });
      });
      it('GET /pluginApi/alerts', (done) => {
        chai.request(app)
            .get('/pluginApi/alerts')
            .set('Authorization', 'asdasdasdasd')
            .end((err, res) => {
              res.should.have.status(401);
              done();
            });
      });
      it('GET /pluginApi/asdasdasd', (done) => {
        chai.request(app)
            .get('/pluginApi/asdasdasd')
            .set('Authorization', 'asdasdasdasd')
            .end((err, res) => {
              res.should.have.status(401);
              done();
            });
      });
    });
    describe('GET /', () => {
      it('should load root page record', (done) => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              done();
            });
      }).timeout(5000);
    });
    describe('GET /pluginApi/accounts', () => {
      // Test to get all students record
      it('should list created account', async () => {
        const res = await chai.request(app)
            .post('/pluginApi/account')
            .set('Authorization', process.env.AUTH_KEY)
            .send({'ID': null, 'name': 'Test', 'comment': 'testcomment', 'apiKey': 'fb9a7e8a-227d-4c52-a08f-74d5bc595c3d', 'secret': 'xCNbjYnvbSsFlpC0CpH1pSwl3hlFb3Bx6LVQuX7w_61mYTkwMmQ5ZC1jMWFhLTQzYjUtYmRlOS0xNWEwMDJkNWM2MTc', 'exchange': 'phemexTestnet'});

        res.should.have.status(201);

        const res2 = await chai.request(app)
            .get('/pluginApi/accounts')
            .set('Authorization', process.env.AUTH_KEY);
        res2.should.have.status(200);
        res2.body.should.be.a('array');
        chai.expect(res2.body).to.be.an('array').that.contains.something.like({'name': 'Test', 'comment': 'testcomment', 'apiKey': '*', 'secret': '*', 'exchange': 'phemexTestnet'});
      });
    });
    describe('GET /pluginApi/alerts', () => {
      // Test to get all students record
      it('return empty array', (done) => {
        chai.request(app)
            .get('/pluginApi/alerts')
            .set('Authorization', process.env.AUTH_KEY)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array').that.is.empty;

              done();
            });
      });
    });
    describe('GET /pluginApi/events', () => {
      // Test to get all students record
      it('return empty array', (done) => {
        chai.request(app)
            .get('/pluginApi/events')
            .set('Authorization', process.env.AUTH_KEY)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array').that.is.empty;

              done();
            });
      });
    });
    describe('GET /pluginApi/positions', () => {
      // Test to get all students record
      it('return array', (done) => {
        chai.request(app)
            .get('/pluginApi/positions')
            .set('Authorization', process.env.AUTH_KEY)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');// .that.is.empty;

              done();
            });
      });
    });
    describe('GET /pluginApi/:accountid/markets', () => {
      // Test to get all students record
      it('return array', (done) => {
        chai.request(app)
            .get('/pluginApi/1/markets')
            .set('Authorization', process.env.AUTH_KEY)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array').that.is.not.empty;

              done();
            });
      });
    });
    describe.skip('GET /pluginApi/ticker/:symbol1/:symbol2', () => {
      // Test to get all students record
      it('return array', (done) => {
        chai.request(app)
            .get('/pluginApi/ticker/BTC/USD')
            .set('Authorization', process.env.AUTH_KEY)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('object').that.is.not.empty;

              done();
            });
      }).timeout(5000); ;
    });
    describe('DELETE /pluginApi/alerts', () => {
      const newAlert = {
        'hookType': 'createOrder',
        // 'ID': 1,
        'symbol': 'BTCUSD',
        'account': 1, 'name': 'Testalert',
        'description': 'Testdesc',
        'side': 'Buy', 'orderPrice': 0,
        'orderQuantity': 10, 'orderType': 'Market',
        'reduceOnly': false, 'closeAllOrders': false,
        'percent': 0, 'useTakeProfit': false,
        'takeProfit': 0 };
      let storedAlert = null;
      it('creates new alert', async () => storedAlert = await createAlert(newAlert));
      it('DELETE deletes alert', (done) => {
        chai.request(app)
            .delete('/pluginApi/alert/'+storedAlert.ID)
            .set('Authorization', process.env.AUTH_KEY)
            .end((err, res) => {
              res.should.have.status(201);
              res.body.should.be.empty;

              // check if alert has been stored
              chai.request(app)
                  .get('/pluginApi/alerts')
                  .set('Authorization', process.env.AUTH_KEY)
                  .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array').that.is.empty;
                    done();
                  });
            });
      });
    });
  });

  describe('POST /api/alert/:alertid', () => {
    it('blocks requests without auth', ()=>{
      chai.request(app)
          .post('/api/alert/1')
          .end((err, res) => {
            res.should.have.status(401);
            res.body.should.be.empty;
          });
    });
    describe('createOrder', async ( ) => {
      const newAlert = {
        'hookType': 'createOrder',
        // 'ID': 1,//
        'symbol': 'BTCUSD',
        'account': 1,
        'name': 'Testalert',
        'description': 'Testdesc',
        'side': 'Buy',
        'orderPrice': 0,
        'orderQuantity': 1,
        'orderType': 'Market',
        'reduceOnly': false,
        'closeAllOrders': false,
        'percent': 0,
        'useTakeProfit': false,
        'takeProfit': 0 };
      await alertTestProcedure(newAlert);
    });
    describe('setTakeProfit', async () => {
      const newAlert = {
        'hookType': 'setTakeProfit',
        // 'ID': 1,//
        'symbol': 'BTCUSD',
        'account': 1,
        'name': 'Testalert',
        'description': 'Testdesc',
        'orderPrice': 0,
        'orderType': 'Market',
        'reduceOnly': true,
        'closeAllOrders': true,
        'percent': 100,
        'triggerPrice': await getPositionPrice()* 1.5 };

      await alertTestProcedure(newAlert);
    });
    describe('setStopLoss', async () => {
      const positionsResponse = await chai.request(app)
          .get('/pluginApi/positions')
          .set('Authorization', process.env.AUTH_KEY);

      positionsResponse.should.have.status(200);
      positionsResponse.body.should.be.an('array');

      currPositionPrice = positionsResponse.body[0].positions.BTC[0].avgEntryPrice;
      const newAlert = {
        'hookType': 'setStopLoss',
        // 'ID': 1,//
        'symbol': 'BTCUSD',
        'account': 1,
        'name': 'Testalert',
        'description': 'Testdesc',
        'side': 'Buy',
        'orderPrice': 0,
        'percent': 100,
        'triggerPrice': await getPositionPrice()*0.95 };

      await alertTestProcedure(newAlert);
    });
    describe('setTrailingStopLoss', async () => {
      const newAlert = {
        'hookType': 'setTrailingStopLoss',
        // 'ID': 1,//
        'symbol': 'BTCUSD',
        'account': 1,
        'name': 'Testalert',
        'description': 'Testdesc',
        'side': 'Buy',
        'offset': 400,
        'percent': 100,
        'triggerPrice': await getPositionPrice()*1.2 };

      await alertTestProcedure(newAlert);
    });
    describe('closePosition', async () => {
      const newAlert = {
        'hookType': 'closePosition',
        'symbol': 'BTCUSD',
        'account': 1,
        'name': 'Testalert',
        'description': 'Testdesc',
        'orderPrice': 0,
        'orderType': 'Market',
        'reduceOnly': false,
        'closeAllOrders': false,
        'percent': 100,
        'useTakeProfit': false,
        'takeProfit': 0 };
      await alertTestProcedure(newAlert);
    });
  });
});
