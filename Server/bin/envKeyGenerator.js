const crypto = require('crypto');
const urlBase64 = require('urlsafe-base64');

function generateVAPIDKeys() {
  const curve = crypto.createECDH('prime256v1');
  curve.generateKeys();

  return {
    publicKey: urlBase64.encode(curve.getPublicKey()),
    privateKey: urlBase64.encode(curve.getPrivateKey()),
  };
}

const vapidKeys = generateVAPIDKeys();


console.log(`PUBLIC_VAPID_KEY=${vapidKeys.publicKey}`);
console.log(`PRIVATE_VAPID_KEY=${vapidKeys.privateKey}`);
console.log(`MAILTO_VAPID=mailto:usehere@your.mail`);
console.log(`AUTH_KEY=${crypto.randomBytes(32).toString('hex')}`);

