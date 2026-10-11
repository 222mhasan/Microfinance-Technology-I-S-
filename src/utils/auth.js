
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";

import app from "../firebase";

// ==================================================
// Firebase Authentication
// ==================================================

const auth = getAuth(app);

// ==================================================
// Prevent Duplicate Anonymous Login Requests
// ==================================================

let anonymousLoginPromise = null;

// ==================================================
// Sign In Viewer Anonymously
// ==================================================

export async function initializeAnonymousUser() {
  try {
    // ----------------------------------------------
    // If a user already exists, use that user
    // ----------------------------------------------

    if (auth.currentUser) {
      console.log(
        "Firebase user already exists:",
        auth.currentUser.uid
      );

      return auth.currentUser;
    }

    // ----------------------------------------------
    // If another login request is already running,
    // wait for the same request
    // ----------------------------------------------

    if (anonymousLoginPromise) {
      return await anonymousLoginPromise;
    }

    // ----------------------------------------------
    // Create one anonymous login request
    // ----------------------------------------------

    anonymousLoginPromise = signInAnonymously(auth)
      .then((result) => {
        console.log(
          "Anonymous Firebase user created:",
          result.user.uid
        );

        return result.user;
      })
      .catch((error) => {
        console.error(
          "Anonymous Firebase authentication failed:",
          error
        );

        return null;
      })
      .finally(() => {
        anonymousLoginPromise = null;
      });

    return await anonymousLoginPromise;
  } catch (error) {
    console.error(
      "Anonymous Firebase authentication failed:",
      error
    );

    return null;
  }
}

// ==================================================
// Listen for Authentication State
// ==================================================

export function listenToAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

// ==================================================
// Get Current Firebase User
// ==================================================

export function getCurrentUser() {
  return auth.currentUser;
}

// ==================================================
// Get Current Firebase UID
// ==================================================

export function getCurrentUserId() {
  return auth.currentUser?.uid || null;
}

// ==================================================
// Export Firebase Auth
// ==================================================

export { auth };
