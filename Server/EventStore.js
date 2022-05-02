const db = require('./database');

const EventSchema = new db.Schema({
  ID: { type: Number, unique: true},
  timestamp: { type: Date, default: Date.now },
  eventType: {
    type: String, enum: ['ExchangeError',
      'ExchangeSuccess',
      'ServerError',
      'AccountNotFound',
      'MissingParams'],
  },
  exchangeResponse: db.Schema.Types.Mixed,
  alertObj: db.Schema.Types.Mixed,
  name: String,
  message: String,
});
EventSchema.pre('save', function(next) {
  // eslint-disable-next-line no-invalid-this
  const doc = this;
  db.counter.findByIdAndUpdate({_id: 'event'}, {$inc: { seq: 1} }, function(error, counter) {
    if (error) {
      return next(error);
    }
    doc.ID = counter.seq;
    next();
  });
});

const EventModel = db.model('event', EventSchema);

module.exports = {
  EventSchema: EventSchema,
  EventModel: EventModel,
  async store(event) {
    try {
      if (event.ID == undefined) {
        return await EventModel.create(event);
      } else {
        return await EventModel.updateOne({ ID: event.ID }, event, { upsert: true, setDefaultsOnInsert: true });
      }
    } catch (err) {
      console.error('Error while storing event', err);
    }
  },
  async delete(ID) {
    return await EventModel.deleteOne({ ID });
  },
  async getAll() {
    return await EventModel.find({});
  },
  async getByID(ID) {
    return await EventModel.find({ ID });
  },
};


