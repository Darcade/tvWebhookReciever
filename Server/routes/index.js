const express = require('express');

const router = new express.Router();
const push = require('../push');

const path = require('path');

const fs = require('fs');
/*
=======================================

Public Key:
BEkBdXnC1yBrRCrpr9_cX2reubieCtm8TafW3SrKxyFSymb9YMFyQrKqC4bEjMe9VmqG15kUSGY9j6RjxrD8xK0

Private Key:
k8MJiPfbPmdWgEsZmsuFEOQCZE7MOvGn5EU0uzffkUs

=======================================*/
const webpush = require('web-push');

const mailtoVapid = process.env.MAILTO_VAPID;
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
const authKey = process.env.AUTH_KEY;

console.log(`Push loaded with mailTo:${mailtoVapid}, publicVapid:${publicVapidKey}, privateVapid:${privateVapidKey}, authKey:${authKey}`);

// Replace with your email
// webpush.setVapidDetails('mailto:darcade@darcade.de', "BEkBdXnC1yBrRCrpr9_cX2reubieCtm8TafW3SrKxyFSymb9YMFyQrKqC4bEjMe9VmqG15kUSGY9j6RjxrD8xK0", "k8MJiPfbPmdWgEsZmsuFEOQCZE7MOvGn5EU0uzffkUs");
webpush.setVapidDetails(mailtoVapid, publicVapidKey, privateVapidKey);

/**
 * Will return path of the Browserplugin
 * @return {String} Path of browserplugin install file
 */
function getPluginPath() {
  const pluginPath = path.resolve(__dirname, '../public/artifacts');
  const artifacts = fs.readdirSync(pluginPath);
  return path.resolve(__dirname, '../public/artifacts', artifacts[0]);
}

router.get('/browserplugin', (req, res) => {
  console.log('Sending browser plugin for download');
  const cPath = getPluginPath();
  console.log('Sending file '+cPath);
  res.sendFile(cPath);
});


router.post('/subscribe', (req, res) => {
  const subscription = req.body;
  // store subscription to File
  push.storeSubscriber(subscription);

  res.status(201).json({});
  const payload = JSON.stringify({ title: 'test', body: 'Test push message', type: 'push' });


  console.log('Subscription:', subscription);

  /* setInterval(function () {
    push.pushMessage("TestV2 10 sec inverv")
  }, 10000);*/
  webpush.sendNotification(subscription, payload).catch((error) => {
    console.error(error.stack);
  });
});


router.get('/notify', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


module.exports = router;
