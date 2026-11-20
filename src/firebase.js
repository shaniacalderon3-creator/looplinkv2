// ── Firebase initialisation ───────────────────────────────────────────────────
// Values come from VITE_ environment variables.
//
// LOCAL:      .env.local in the project root (already created — do not commit)
// PRODUCTION: Vercel → Project → Settings → Environment Variables
//
// This file intentionally does NOT crash when env vars are missing.
// auth, db, and googleProvider are null until the config is present.
// All callers must guard against null before using them.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider }     from 'firebase/auth';
import { getFirestore }                    from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();

let auth         = null;
let db           = null;
let googleProvider = null;

if (apiKey) {
  const firebaseConfig = {
    apiKey,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId:             import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
  };

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  auth = getAuth(app);
  db   = getFirestore(app);           // default Firestore database

  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

export { auth, db, googleProvider };
