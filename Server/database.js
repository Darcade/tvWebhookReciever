const mongoose = require('mongoose');

// TODO load real server uri
let uri = process.env.MONGODB_CONN;

// If testing start in memory Server

/**
 * Will initialize mongoose connection
 * If testing is active a in memory mongo db server is ran
 */
async function initConnection() {
  try {
    if (process.env.NODE_ENV == 'test') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      // This will create an new instance of
      // "MongoMemoryServer" and automatically start it
      const mongod = await MongoMemoryServer.create();
      mongoose.testServer = mongod;
      uri = mongod.getUri();

      console.log('Using in memory mongodb Server: ' + uri);
      await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME });
    } else {
      await mongoose.connect(uri, {
        dbName: process.env.MONGO_DB_NAME,
        user: process.env.MONGO_INITDB_ROOT_USERNAME,
        pass: process.env.MONGO_INITDB_ROOT_PASSWORD });
    }
  } catch (err) {
    console.error('Error while connecting to mongodb: ', err);
  }

  console.log('Connected to mongodb at ', uri);
};


mongoose.initConnection = initConnection;
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1 },
});
mongoose.counter = mongoose.model('counter', CounterSchema);

mongoose.counter.updateOne({ _id: 'event' }, {}, { upsert: true, setDefaultsOnInsert: true }).then(()=>console.log('Created index counter for event'));

mongoose.counter.updateOne({ _id: 'alert' }, {}, { upsert: true, setDefaultsOnInsert: true }).then(()=>console.log('Created index counter for alert'));
mongoose.counter.updateOne({ _id: 'account' }, {}, { upsert: true, setDefaultsOnInsert: true }).then(()=>console.log('Created index counter for account'));

module.exports = mongoose;
