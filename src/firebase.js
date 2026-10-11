import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbuGxQJ7DAK6W-KNg_6eXe_Ucbx-o4",
  authDomain: "mf-technology-portal.firebaseapp.com",
  projectId: "mf-technology-portal",
  storageBucket: "mf-technology-portal.firebasestorage.app",
  messagingSenderId: "424419957011",
  appId: "1:424419957011:web:6e5e9580f8c40e3e24e2e6",
  measurementId: "G-SQQXE02ZCK",
};

const app = initializeApp(firebaseConfig);

// Firestore
const db = getFirestore(app);

// Firebase Analytics
let analytics = null;

try {
  const analyticsSupported = await isSupported();

  if (analyticsSupported) {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn(
    "Firebase Analytics is not available:",
    error
  );
}

export {
  app,
  db,
  analytics,
};

export default app;