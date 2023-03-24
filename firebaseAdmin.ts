import admin from "firebase-admin";
import { getApps } from "firebase/app";
import { FIREBASE_PROJECT_ID } from "./firebaseCredentials";

// const serviceAccount = require("./serviceAccountKey.json");
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

// if (!getApps().length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     projectId: FIREBASE_PROJECT_ID,
//   });
// }
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: FIREBASE_PROJECT_ID,
  });
}
const adminDb = admin.firestore();

export { adminDb };
