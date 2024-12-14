const admin = require('firebase-admin');
const serviceAccount = require('../ecommerce-test-69827-firebase-adminsdk-l6g68-f4c7b46d87.json'); // Replace with your actual path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://ecommerce-test-69827.appspot.com' // Replace with your Firebase project ID
});

const bucket = admin.storage().bucket();

module.exports = bucket;
