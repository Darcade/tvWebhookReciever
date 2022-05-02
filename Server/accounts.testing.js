const ccxt = require('ccxt');

/**
 * These accounts are used for mocha tests
 */

const accounts = [
  // Server ip
  // http://173.249.15.31/
  /**
     * Account1: Adams Phemex Account
     */
  {
    'ID': 1,
    'name': 'Phemex Testnet',
    'apiKey': 'fb9a7e8a-227d-4c52-a08f-74d5bc595c3d',
    'secret': 'xCNbjYnvbSsFlpC0CpH1pSwl3hlFb3Bx6LVQuX7w_61mYTkwMmQ5ZC1jMWFhLTQzYjUtYmRlOS0xNWEwMDJkNWM2MTc',
    'ccxt': new ccxt.phemex({
      'apiKey': 'fb9a7e8a-227d-4c52-a08f-74d5bc595c3d',
      'secret': 'xCNbjYnvbSsFlpC0CpH1pSwl3hlFb3Bx6LVQuX7w_61mYTkwMmQ5ZC1jMWFhLTQzYjUtYmRlOS0xNWEwMDJkNWM2MTc',
      'timeout': 30000,
      'enableRateLimit': true,
    }),
  },
];


// Set testnet if needed

for (let i=0; i<accounts.length; i++) {
  if (accounts[i].ID==1 || accounts[i].ID==1) {
    accounts[i].ccxt.urls['api']=accounts[i].ccxt.urls['test']; // switch
  }
}

module.exports=accounts;
