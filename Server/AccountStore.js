/* eslint-disable no-invalid-this */
const db = require('./database');
const ccxt = require('ccxt');

const AccountSchema = new db.Schema({
  ID: { type: Number, unique: true},
  createdTimestamp: { type: Date, default: Date.now },
  updateTimestamp: { type: Date, default: Date.now },
  exchange: {
    type: String, enum: ['phemex', 'phemexTestnet', 'bybit', 'ftx'],
  },
  name: String,
  comment: String,
  apiKey: String,
  secret: String,
});
/**
 * @param {Object} accDoc
 * @return {Boolean} Will return if account credentials allow connection
 */
async function verifyAccount(accDoc) {
  let result = false;
  // verify connection
  try {
    let exchString = accDoc.exchange;
    if (accDoc.exchange == 'phemexTestnet') {
      exchString = 'phemex';
    }

    const cExch =new ccxt[exchString]({
      'apiKey': accDoc.apiKey,
      'secret': accDoc.secret,
      'timeout': 30000,
      'enableRateLimit': true,
    });
    if (accDoc.exchange == 'phemexTestnet') cExch.urls['api']=cExch.urls['test'];

    const checkAuthResult = cExch.checkRequiredCredentials();
    console.log('🚀 ~ file: AccountStore.js ~ line 36 ~ db.counter.findByIdAndUpdate ~ checkAuthResult', checkAuthResult);
    result = checkAuthResult;

    if (cExch.has['signIn']) {
      await cExch.signIn();
    }

    const balance = await cExch.fetchTotalBalance();
    console.log('🚀 ~ file: AccountStore.js ~ line 43 ~ db.counter.findByIdAndUpdate ~ balance', balance);


    result = true;
  } catch (err) {
    console.log('🚀 ~ file: AccountStore.js ~ line 38 ~ db.counter.findByIdAndUpdate ~ err', err);
    result = false;
  }
  return result;
}
/*
AccountSchema.pre('updateOne', async function(next) {
  const doc = this.getUpdate();

  try {
    doc.ccxtConnected = await verifyAccount(doc);

    this.update({}, doc).exec();
    next();
  } catch (error) {
    return next(error);
  }
});
 AccountSchema.pre('updateOne', { document: true, query: false }, async function(next) {
  // eslint-disable-next-line no-invalid-this
  const doc = this;
  doc.updateTimestamp = new Date();
  doc.ccxtConnected = await verifyAccount(doc);

  next();
});*/
AccountSchema.pre('save', function(next) {
  // eslint-disable-next-line no-invalid-this
  const doc = this;

  db.counter.findByIdAndUpdate({_id: 'account'}, {$inc: { seq: 1} }, async function(error, counter) {
    if (error) {
      return next(error);
    }
    doc.ID = counter.seq;
    doc.updateTimestamp = new Date();
    // doc.ccxtConnected = await verifyAccount(doc);

    next();
  });
});
const AccountModel = db.model('account', AccountSchema);

/**
 * Will delete account with set ID
 * @param {*} ID
 * @return {Object}
 */
async function deleteByID(ID) {
  return await AccountModel.deleteOne({ ID });
}

/**
 * Returns all accounts stored in database
 * @return {Object}
 */
async function getAll() {
  return await AccountModel.find({});
}


/**
 * Returns all accounts stored in database
 * @return {Object}
 */
async function getAllVerifiedAndMasked() {
  const allAccounts = await AccountModel.find({});
  const result = [];
  for (const cAcc of allAccounts) {
    const cAccCopy = JSON.parse(JSON.stringify(cAcc));
    cAccCopy.ccxtConnected = await verifyAccount(cAccCopy);
    cAccCopy.apiKey='*';
    cAccCopy.secret='*';
    result.push(cAccCopy);
  }
  return result;
}
/**
 * Will return account with given ID
 * @param {*} AccID
 * @return {Object}
 */
async function getByID(AccID) {
  const dbResult = await AccountModel.find({ID: Number(AccID)});
  if (dbResult.length == 1) {
    return dbResult[0];
  } else if (dbResult.length > 1) {
    console.error('Too many accounts found for alertID #'+alertID, dbResult);
  }
  return null;
}
/**
 * Will return ccxt object with set apiKey for given AccountID
 * @param {*} AccID
 * @return {*} ccxt instance
 */
async function getCcxtByID(AccID) {
  console.log('🚀 ~ file: AccountStore.js ~ line 145 ~ getCcxtByID ~ AccID', AccID);
  try {
    const acc = await getByID(AccID);
    if (!acc) {
      console.warn('Account with ID '+AccID+' does not exist');
      return;
    }
    let exchString = acc.exchange;
    console.log('🚀 ~ file: AccountStore.js ~ line 154 ~ getCcxtByID ~ acc', acc);
    if (acc.exchange == 'phemexTestnet') {
      exchString = 'phemex';
    }

    console.log('🚀 ~ file: AccountStore.js ~ line 156 ~ getCcxtByID ~ exchString', exchString);
    const cExch = new ccxt[exchString]({
      'apiKey': acc.apiKey,
      'secret': acc.secret,
      'timeout': 30000,
      'enableRateLimit': true,
    });
    if (acc.exchange == 'phemexTestnet') cExch.urls['api']=cExch.urls['test'];
    return cExch;
  } catch (err) {
    console.error('Error while getting ccxt for account #'+AccID, err);
    return;
  }
}


/**
 * Will store account in database.
 * If account.ID is set then account will get updated
 * @param {*} account
 * @return {Object}
 */
async function store(account) {
  try {
    if (account.ID == undefined) {
      return await AccountModel.create(account);
    } else {
      return await AccountModel.updateOne({ ID: account.ID }, account, { upsert: true, setDefaultsOnInsert: true });
    }
  } catch (err) {
    console.error('Error while storing account', err);
  }
}

module.exports = {
  store, delete: deleteByID, getAll, getByID, getAllVerifiedAndMasked, getCcxtByID,
};
