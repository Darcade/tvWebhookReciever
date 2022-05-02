
/* const {
  createAlert, alertTestProcedure, getPositionPrice, beforeAllTests, afterAllTests, chai,
} = require('../../../../Server/test/testHelpers');
*/

// const {exchanges} = require('ccxt');

/**
 * Will assert that alert from params is shown currently via alerts tab
 * @param {*} alertName
 * @param {*} alertDesc
 * @param {*} symbol
 * @param {*} orderType
 * @param {*} orderPrice
 */
function assertAlertShown(alertName, alertDesc, symbol, orderType, orderPrice ) {
  cy.contains('#alertName', alertName);
  cy.contains('#alertDescription', alertDesc);
  cy.contains('#alertSymbol', symbol);
  cy.contains('#alertOrderType', orderType);
  let expectedPriceValue = 'Market Order';
  if (orderPrice < 0) {
    expectedPriceValue = orderPrice;
  }
  cy.contains('#alertPrice', expectedPriceValue);
}
/**
 * Will enter params into alert Form without creating the alert
 * @param {*} alertName
 * @param {*} alertDesc
 * @param {*} symbol
 * @param {*} hookType
 * @param {*} accountName
 * @param {*} orderType
 * @param {*} orderPrice
 */
function enterBasicAlert(alertName, alertDesc, symbol, hookType, accountName, orderType, orderPrice) {
  cy.get('#name').type(alertName);
  cy.get('#description').type(alertDesc);

  cy.get('#hookTypes').parent().click();
  cy.get('.v-menu__content').contains(hookType).click();

  cy.get('#account').parent().click();
  cy.get('.v-menu__content').contains(accountName).click();

  cy.get('#symbol').parent().click();
  cy.get('.v-menu__content').contains(symbol).click();

  cy.get('#orderType').parent().click();
  cy.get('.v-menu__content').contains(orderType).click();

  if (orderType !== 'Market') cy.get('#orderPrice').type(orderPrice);
}

/**
 * Will create order in UI and verify if it gets shown in alerts list
 * @param {String} alertName
 * @param {String} alertDesc
 * @param {String} symbol
 * @param {String} orderType
 * @param {Number} orderPrice
 * @param {Number} positionPercent Percent of Position (0-100)
 */
function createClosePositionAlert(alertName, alertDesc, symbol, orderType, orderPrice, positionPercent) {
  const hookType = 'closePosition';
  const accountName='Phemex Testnet';

  enterBasicAlert(alertName, alertDesc, symbol, hookType, accountName, orderType, orderPrice);


  cy.get('#positionPercentTextField').type(positionPercent);
  cy.get('#saveAlertButton').click();

  assertAlertShown(alertName, alertDesc, symbol, orderType, orderPrice );
  cy.contains('#positionPercent', positionPercent);
  // cy.contains('#alertQuantity', orderQuantity);
}
/**
 * Will create order in UI and verify if it gets shown in alerts list
 * @param {String} alertName
 * @param {String} alertDesc
 * @param {String} symbol
 * @param {Number} orderPrice
 * @param {Number} triggerPrice
 * @param {Number} positionPercent Percent of Position (0-100)
 */
function createSetStopLossAlert(alertName, alertDesc, symbol, orderPrice, triggerPrice, positionPercent) {
  const hookType = 'closePosition';
  const accountName='Phemex Testnet';

  enterBasicAlert(alertName, alertDesc, symbol, hookType, accountName, orderPrice);


  cy.get('#orderPrice').type(orderPrice);
  cy.get('#triggerPrice').type(triggerPrice);


  cy.get('#positionPercentTextField').type(positionPercent);
  cy.get('#saveAlertButton').click();

  assertAlertShown(alertName, alertDesc, symbol, null, orderPrice );
  // cy.contains('#alertQuantity', orderQuantity);
}
/**
 * Will create order in UI and verify if it gets shown in alerts list
 * @param {String} alertName
 * @param {String} alertDesc
 * @param {String} symbol
 * @param {String} accountName
 * @param {Number} orderSide "Buy" or "Sell"
 * @param {String} orderType "Market" or "Limit"
 * @param {Number} orderQuantity Quantity of order
 * @param {Number} orderPrice Price of order
 */
function createCreateOrderAlert(alertName, alertDesc, symbol, accountName, orderSide, orderType, orderQuantity, orderPrice) {
  const hookType = 'createOrder';

  enterBasicAlert(alertName, alertDesc, symbol, hookType, accountName, orderType, orderPrice);


  cy.get('#orderSide').parent().click();
  cy.get('.v-menu__content').contains(orderSide).click();

  cy.get('#orderQuantity').type(orderQuantity);

  cy.get('#saveAlertButton').click();


  cy.contains('#alertQuantity', orderQuantity);
  assertAlertShown(alertName, alertDesc, symbol, orderType, orderPrice );
}

/**
 * Will create a account with given data. It will also assert the creation
 * @param {String} accountName
 * @param {String} accountComment
 * @param {String} exchange
 * @param {String} apiKey
 * @param {String} secret
 */
function createAccount(accountName, accountComment, exchange, apiKey, secret) {
  cy.get('#accountsTab').click();
  cy.get('#accountName').type(accountName);
  cy.get('#comment').type(accountComment);
  cy.get('#accountExchange').parent().click();
  cy.get('.v-menu__content').contains(exchange).click();
  cy.get('#apiKey').type(apiKey);
  cy.get('#secret').type(secret);
  cy.get('#saveAccountButton').click();
  cy.get('#accountsList').contains(accountName);
  cy.get('#accountsList').contains(accountComment);
}

describe('Create Alerts:', () => {
  const accountName = 'TestACC';
  const accountComment = 'This is a random comment';
  const exchange = 'Phemex testnet';
  it('setup is working', () => {
    cy.visit('/');
    cy.get('.appBox');
    cy.get('#settingsTab').click();
    cy.get('#serverUrl').type('http://localhost:41555');
    cy.get('#apiKey').type('Q9kpO0RIAup2Qkp4ejBajxKyeHnkrP4ehFrjrTHBzRmaKgnNoOxlD84zZpmEemDQ');
    cy.get('#saveSettingsBtn').click();
  });
  describe('Accounts', function() {
    const phemexTestnetApiKey = 'fb9a7e8a-227d-4c52-a08f-74d5bc595c3d';
    const phemexTestnetSecret = 'xCNbjYnvbSsFlpC0CpH1pSwl3hlFb3Bx6LVQuX7w_61mYTkwMmQ5ZC1jMWFhLTQzYjUtYmRlOS0xNWEwMDJkNWM2MTc';

    it('creates account', () => {
      createAccount(accountName, accountComment, exchange, phemexTestnetApiKey, phemexTestnetSecret);
    });
    it('deletes account', () => {
      cy.get('#deleteAccountBtn').click();
      // TODO add check if has been deleted
    });
    it('changes account name and comment', () => {
      createAccount(accountName, accountComment, exchange, phemexTestnetApiKey, phemexTestnetSecret);
      cy.get('#accountsList').contains(accountName).click();
      cy.get('#accountName').type(accountName+' NEW');
      cy.get('#comment').type(accountComment+' NEW');
      cy.get('#saveAccountButton').click();
      cy.get('#accountsList').contains(accountName+' NEW');
      cy.get('#accountsList').contains(accountComment+' NEW');
      cy.get('#deleteAccountBtn').click();
    });

    it('changes account apiKey and secret', () => {
      createAccount(accountName, accountComment, exchange, 'XXXXXX', 'XXXXXX');
      cy.get('#accountsList').contains(accountName).click();
      cy.get('#changeApiKeyBtn').click();
      cy.get('#apiKey').type(phemexTestnetApiKey);
      cy.get('#secret').type(phemexTestnetSecret);
      cy.get('#saveAccountButton').click();
      // TODO check if connection is working after change and was not working before
    });
  });

  describe('createOrder ', () => {
    it('creates Alert', ()=>{
      cy.get('#mainTab').click();
      createCreateOrderAlert('Alert2', 'Alert2Desc', 'BTCUSD', accountName, 'Buy', 'Market', 1);
    });
    it('triggers Alert', ()=>{
      cy.get('#alertsTab').click();
      cy.get('#triggerAlert > .v-btn__content').click();
    });
  });
  describe.skip('closePosition ', () => {
    it('creates Alert', ()=>{
      cy.get('#mainTab').click();
      createClosePositionAlert('Testalert', 'Testdescription for alert!', 'BTCUSD', 'Market', 0, 100);
    });
  });
  describe.skip('createSetStopLossAlert ', () => {
    it('creates Alert', ()=>{
      cy.get('#mainTab').click();
      createSetStopLossAlert('Testalert', 'Testdescription for alert!', 'BTCUSD', 0, 55000);
    });
  });
});

