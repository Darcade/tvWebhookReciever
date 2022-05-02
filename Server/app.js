const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const pluginApiRouter = require('./routes/pluginApi');

const app = express();

const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

if (process.env.SENTRY_ERROR_LOG && process.env.SENTRY_DSN_URL) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN_URL,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}


const mongoose = require('./database');

(async () => {
  console.log('Calling init connection!');
  mongoose.initConnection();
})();

const bodyParser = require('body-parser');

if (process.env.SENTRY_ERROR_LOG && process.env.SENTRY_DSN_URL) {
  // RequestHandler creates a separate execution context
  // using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/public/webapp/css'));
app.use('/js', express.static(__dirname + '/public/webapp/js'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

const cors = require('cors');

if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
}

app.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/pluginApi', pluginApiRouter);

if (process.env.SENTRY_ERROR_LOG && process.env.SENTRY_DSN_URL) {
  app.get('/debug-sentry', function mainHandler(req, res) {
    throw new Error('My first Sentry error!');
  });
}

// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));


if (process.env.SENTRY_ERROR_LOG && process.env.SENTRY_DSN_URL) {
  // The error handler must be before any other error middlewares
  // and after all controllers
  app.use(Sentry.Handlers.errorHandler());
}


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

if (process.env.SENTRY_ERROR_LOG && process.env.SENTRY_DSN_URL) {
  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
}


module.exports = app;
