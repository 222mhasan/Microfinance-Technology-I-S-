import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import db from "../firestore";
import { initializeAnonymousUser } from "./auth";

// Prevent duplicate page-visit records during development
const recentActivities = new Map();
const DUPLICATE_WINDOW_MS = 1500;

// Save a visitor activity to Firestore
export async function logFirestoreActivity({
  activityType,
  pageName = "",
  pagePath = "",
  details = {},
}) {
  try {
    // Ensure the visitor has a Firebase UID
    const user = await initializeAnonymousUser();

    if (!user) {
      console.warn("Activity not saved: Firebase user unavailable.");
      return null;
    }

    // Prevent immediate duplicate events
    const duplicateKey = JSON.stringify({
      userId: user.uid,
      activityType,
      pageName,
      pagePath,
      details,
    });

    const now = Date.now();
    const previousTime = recentActivities.get(duplicateKey);

    if (
      previousTime &&
      now - previousTime < DUPLICATE_WINDOW_MS
    ) {
      console.log("Duplicate Firestore activity skipped:", activityType);
      return null;
    }

    recentActivities.set(duplicateKey, now);

    // Save the activity
    const documentData = {
      userId: user.uid,
      activityType: String(activityType || "unknown"),
      pageName: String(pageName || ""),
      pagePath: String(pagePath || ""),
      details,
      timestamp: serverTimestamp(),
    };

    const documentRef = await addDoc(
      collection(db, "activityLogs"),
      documentData
    );

    console.log("Firestore activity saved:", {
      id: documentRef.id,
      activityType,
      pageName,
      pagePath,
    });

    return documentRef.id;
  } catch (error) {
    console.error("Failed to save Firestore activity:", error);
    return null;
  }
}