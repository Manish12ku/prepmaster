const admin = require('firebase-admin');

let firebaseAdmin;

try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.CLIENT_EMAIL;

  if (privateKey && clientEmail) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || process.env.PROJECT_ID || "mock-test81",
      private_key: privateKey.replace(/\\n/g, '\n'),
      client_email: clientEmail,
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    firebaseAdmin = admin;
  } else {
    console.warn('Firebase Admin credentials not provided. Running in development mode without token verification.');
    firebaseAdmin = {
      auth: () => ({
        verifyIdToken: async (token) => {
          return { uid: 'dev-user', email: 'dev@example.com' };
        }
      })
    };
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  firebaseAdmin = {
    auth: () => ({
      verifyIdToken: async (token) => {
        return { uid: 'dev-user', email: 'dev@example.com' };
      }
    })
  };
}

module.exports = firebaseAdmin;
