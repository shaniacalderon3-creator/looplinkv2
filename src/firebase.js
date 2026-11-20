// ── Firebase initialisation ───────────────────────────────────────────────────
// Values come from VITE_ environment variables.
//
// LOCAL:      create .env.local in the project root with the values below.
// PRODUCTION: add the same variables in Vercel → Project → Settings → Env Vars.
//
// Required variable names:
//   VITE_FIREBASE_API_KEY
//   VITE_FIREBASE_AUTH_DOMAIN
//   VITE_FIREBASE_PROJECT_ID
//   VITE_FIREBASE_STORAGE_BUCKET
//   VITE_FIREBASE_MESSAGING_SENDER_ID
//   VITE_FIREBASE_APP_ID
//
// Where to get the values:
//   Firebase Console → Project Settings → Your apps → Web app → Config object.
//
// IMPORTANT: This file intentionally does NOT crash when env vars are missing.
// If the API key is absent the exported `auth` and `googleProvider` will be
// null and AuthContext will return a clear error message instead of throwing.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// Only initialise Firebase when the config is actually present.
// If the env vars are not set yet, export nulls so the rest of the app
// keeps working (email/password login is unaffected).
let auth = null;
let googleProvider = null;

if (apiKey) {
  const firebaseConfig = {
    apiKey,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Reuse the existing app instance during Vite HMR; otherwise initialise fresh.
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);

  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  // Always show the account-picker so users can switch accounts.
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

export { auth, googleProvider };
