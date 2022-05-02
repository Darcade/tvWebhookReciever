const db = require('./database');


const alertSchema = new db.Schema({
  name: String,
  description: String,
  ID: { type: Number, unique: true}, // Unique number ID of alert
  account: Number, // ID of account
  hookType: String, // "createOrder", "closePosition", "setTakeProfit", "setStopLoss", "setTrailingStopLoss"
  symbol: String,
  orderPrice: Number,
  percent: Number,
  offset: Number, // used for trailing stoploss
  triggerPrice: Number, // Price at which trailingStoploss gets triggered
  onlyCloseOnProfit: Boolean,
  closeAllOrders: Boolean,
  orderType: String,
  side: String,
  orderQuantity: Number,
  reduceOnly: Boolean,

  minimalPercentBalance: Number,
  takeProfit: Number,
  takeProfitPercent: Boolean,
  useTakeProfit: Boolean,
});


alertSchema.pre('save', function(next) {
  // eslint-disable-next-line no-invalid-this
  const doc = this;
  db.counter.findByIdAndUpdate({_id: 'alert'}, {$inc: { seq: 1} }, function(error, counter) {
    if (error) {
      return next(error);
    }
    doc.ID = counter.seq;
    next();
  });
});
const alertModel = db.model('alert', alertSchema);


module.exports = {
  async store(alert) {
    try {
      if (alert.ID == undefined) {
        return await alertModel.create(alert);
      } else {
        return await alertModel.updateOne({ ID: alert.ID }, alert, { upsert: true, setDefaultsOnInsert: true });
      }
    } catch (err) {
      console.error('Error while storing alert', err);
    }
  },
  async delete(alertID) {
    return await alertModel.deleteOne({ID: alertID});
  },
  async getAll() {
    return await alertModel.find({});
  },
  async getByID(alertID) {
    const dbResult = await alertModel.find({ID: Number(alertID)});
    if (dbResult.length == 1) {
      return dbResult[0];
    } else if (dbResult.length > 1) {
      console.error('Too many alerts found for alertID #'+alertID, dbResult);
    }
    return null;
  },
};
