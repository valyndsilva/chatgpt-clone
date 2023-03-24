import admin from "firebase-admin";
// const serviceAccount = require("./serviceAccountKey.json");
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}
const adminDb = admin.firestore();

export { adminDb };
