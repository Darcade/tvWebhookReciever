/* eslint-disable max-len */
const fs = require('fs');

const webpush = require('web-push');

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

if (!fs.existsSync('./store')) fs.mkdirSync('./store');

const subscribersPath = './store/subscriber.json';

// Replace with your email
// webpush.setVapidDetails('mailto:darcade@darcade.de', 'BEkBdXnC1yBrRCrpr9_cX2reubieCtm8TafW3SrKxyFSymb9YMFyQrKqC4bEjMe9VmqG15kUSGY9j6RjxrD8xK0', 'k8MJiPfbPmdWgEsZmsuFEOQCZE7MOvGn5EU0uzffkUs');
webpush.setVapidDetails('mailto:val@karpov.io', publicVapidKey, privateVapidKey);


module.exports = {
  storeSubscriber(subscriber) {
    // create file if it does not exist
    if (!fs.existsSync(subscribersPath)) {
      return fs.writeFile(subscribersPath, JSON.stringify([subscriber]), function (err) {
        if (err) return console.log(err);
        console.log('Saved to subscriber.json file');
      });
    }

    fs.readFile(subscribersPath, 'utf8', function (err, data) {
      if (err) {
        if (err.errno != -2) {
          return console.log(err);
        }
      }

      if (data == undefined) {
        data = [];
      } else {
        data = JSON.parse(data);
      }

      // check if file already contains subscriber
      for (const currSub of data) {
        if (currSub.endpoint == subscriber.endpoint) {
          console.log('Already stored requestes subscription.', subscriber);
          return;
        }
      }

      data.push(subscriber);
      console.log('Updated Subscriptions', data);
      fs.writeFile(subscribersPath, JSON.stringify(data), function (err) {
        if (err) return console.log(err);
        console.log('Stored subscribers');
      });
    });
  },
  pushMessage(title, message) {
    // create file if not already available
    if (!fs.existsSync(subscribersPath)) {
      return fs.writeFile(subscribersPath, JSON.stringify([]), function (err) {
        if (err) return console.log(err);
        console.log('Saved to subscriber.json file');
      });
    }
    fs.readFile(subscribersPath, 'utf8', function (err, data) {
      if (err) {
        if (err.errno != -2) {
          return console.log(err);
        }
      }

      if (data == undefined) {
        return;
      } else {
        data = JSON.parse(data);
      }

      const payload = JSON.stringify({ title, body: message });

      for (const subscriber of data) {
        webpush.sendNotification(subscriber, payload).catch((error) => {
          console.error(error.stack);
        });
      }
    });
  },
};
