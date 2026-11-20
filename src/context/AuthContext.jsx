import { createContext, useContext, useState } from 'react';
import { MOCK_USERS } from '../data/users';
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import {
  doc, setDoc, getDoc, serverTimestamp,
} from 'firebase/firestore';


// ─────────────────────────────────────────────────────────────────────────────
// Mock credential store.  Replace with real API calls when connecting a backend.
// ─────────────────────────────────────────────────────────────────────────────

// Pre-seeded mock passwords (email → password)
const MOCK_PASSWORDS = {
  'alex.rivera@student.edu':  'student123',
  'jamie.santos@student.edu': 'student123',
  'morgan.lee@student.edu':   'student123',
  'casey.kim@student.edu':    'student123',
  'admin@looplink.edu':       'admin123',
};

// LocalStorage keys
const LS_CUSTOMER = 'll_customer';
const LS_ADMIN    = 'll_admin';
const LS_ACCOUNTS = 'll_accounts'; // registered accounts

// Merge mock users with any locally-registered accounts
function loadAccounts() {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_ACCOUNTS) || '[]');
    return [...MOCK_USERS, ...stored];
  } catch {
    return [...MOCK_USERS];
  }
}

function saveAccount(user, password) {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_ACCOUNTS) || '[]');
    stored.push({ ...user });
    localStorage.setItem(LS_ACCOUNTS, JSON.stringify(stored));
    // Also persist password
    const pwMap = JSON.parse(localStorage.getItem('ll_passwords') || '{}');
    pwMap[user.email] = password;
    localStorage.setItem('ll_passwords', JSON.stringify(pwMap));
  } catch { /* ignore */ }
}

function getPassword(email) {
  // Normalise to lowercase so lookups are always consistent
  const key = email.toLowerCase().trim();
  // MOCK_PASSWORDS (hardcoded) always wins — localStorage can never shadow them
  if (MOCK_PASSWORDS[key] !== undefined) return MOCK_PASSWORDS[key];
  try {
    const pwMap = JSON.parse(localStorage.getItem('ll_passwords') || '{}');
    return pwMap[key] ?? null;
  } catch {
    return null;
  }
}

function persist(key, user, remember) {
  const store = remember ? localStorage : sessionStorage;
  store.setItem(key, JSON.stringify(user));
  // Always clear the other one
  if (remember) sessionStorage.removeItem(key);
  else          localStorage.removeItem(key);
}

function hydrate(key) {
  try {
    return (
      JSON.parse(localStorage.getItem(key)) ||
      JSON.parse(sessionStorage.getItem(key)) ||
      null
    );
  } catch {
    return null;
  }
}

function clear(key) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

// ─────────────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => hydrate(LS_CUSTOMER));
  const [admin,    setAdmin]    = useState(() => hydrate(LS_ADMIN));

  // ── Customer auth ──────────────────────────────────────────────────────────

  /** @returns {{ ok: boolean, error?: string }} */
  function customerLogin({ email, password, remember = false }) {
    const normEmail = email.trim().toLowerCase();
    const accounts  = loadAccounts();
    const user = accounts.find(
      (u) => u.email.toLowerCase() === normEmail && u.role !== 'admin'
    );
    if (!user) return { ok: false, error: 'No account found with that email.' };

    const stored = getPassword(normEmail);
    if (!stored || stored !== password) return { ok: false, error: 'Incorrect password.' };
    if (user.status === 'inactive') return { ok: false, error: 'This account is inactive. Contact support.' };

    persist(LS_CUSTOMER, user, remember);
    setCustomer(user);
    return { ok: true };
  }

  /** @returns {{ ok: boolean, error?: string }} */
  async function customerRegister({ name, studentId, email, password, confirmPassword }) {
    if (password !== confirmPassword) return { ok: false, error: 'Passwords do not match.' };
    if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };

    const accounts = loadAccounts();
    const exists   = accounts.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) return { ok: false, error: 'An account with that email already exists.' };

    // ── Try to create a real Firebase Auth account ────────────────────────
    let firebaseUid = null;
    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        firebaseUid = cred.user.uid;
      } catch (err) {
        // email-already-in-use means they registered before
        if (err.code === 'auth/email-already-in-use') {
          return { ok: false, error: 'An account with that email already exists.' };
        }
        // Any other Firebase Auth error — fall through to local-only registration
        console.warn('Firebase Auth registration failed, using local fallback:', err.message);
      }
    }

    const userId = firebaseUid ? `firebase_${firebaseUid}` : `u${Date.now()}`;

    const newUser = {
      id:          userId,
      name:        name.trim(),
      email:       email.trim().toLowerCase(),
      role:        'student',
      avatar:      `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(name.trim())}`,
      studentId:   studentId.trim(),
      department:  '',
      joinedAt:    new Date().toISOString().slice(0, 10),
      borrowCount: 0,
      status:      'active',
    };

    // ── Write Firestore document at users/{uid} ───────────────────────────
    if (db && firebaseUid) {
      try {
        await setDoc(doc(db, 'users', firebaseUid), {
          name:        newUser.name,
          email:       newUser.email,
          studentId:   newUser.studentId,
          department:  '',
          role:        'student',
          status:      'active',
          borrowCount: 0,
          avatar:      newUser.avatar,
          joinedAt:    serverTimestamp(),
          provider:    'email',
        });
      } catch (err) {
        console.warn('Firestore write failed (non-fatal):', err.message);
      }
    }

    saveAccount(newUser, password);
    persist(LS_CUSTOMER, newUser, false);
    setCustomer(newUser);
    return { ok: true };
  }

  function customerLogout() {
    clear(LS_CUSTOMER);
    setCustomer(null);
  }

  /** Mock "send reset email" — always succeeds in prototype */
  function forgotPassword(email) {
    const accounts = loadAccounts();
    const exists   = accounts.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    return exists
      ? { ok: true,  message: `A reset link has been sent to ${email}. (Prototype: no real email is sent.)` }
      : { ok: false, error:   'No account found with that email.' };
  }

  // ── Admin auth ─────────────────────────────────────────────────────────────

  /**
   * Email/password admin login via real Firebase Auth + Firestore role check.
   * Falls back to mock lookup only when Firebase is not configured.
   * @returns {{ ok: boolean, error?: string }}
   */
  async function adminLogin({ email, password, remember = false }) {
    // ── Firebase path (when configured) ────────────────────────────────────
    if (auth && db) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const uid  = cred.user.uid;

        // Read Firestore document to verify role
        let firestoreUser = null;
        try {
          const snap = await getDoc(doc(db, 'users', uid));
          if (snap.exists()) firestoreUser = snap.data();
        } catch (fsErr) {
          // Firestore read failed — sign out and report
          await auth.signOut();
          return { ok: false, error: `Could not verify admin role: ${fsErr.message}` };
        }

        if (!firestoreUser || firestoreUser.role !== 'admin') {
          // Signed-in user is not an admin — revoke the Firebase session
          await auth.signOut();
          return { ok: false, error: 'This account is not an administrator.' };
        }

        const adminUser = {
          id:         uid,
          name:       firestoreUser.name       ?? cred.user.displayName ?? email,
          email:      firestoreUser.email      ?? email.trim().toLowerCase(),
          role:       'admin',
          avatar:     firestoreUser.avatar     ?? cred.user.photoURL ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=admin`,
          studentId:  firestoreUser.studentId  ?? '',
          department: firestoreUser.department ?? '',
          joinedAt:   firestoreUser.joinedAt?.toDate
            ? firestoreUser.joinedAt.toDate().toISOString().slice(0, 10)
            : (firestoreUser.joinedAt ?? new Date().toISOString().slice(0, 10)),
          status:     firestoreUser.status     ?? 'active',
        };

        persist(LS_ADMIN, adminUser, remember);
        setAdmin(adminUser);
        return { ok: true };

      } catch (err) {
        // Firebase Auth errors (wrong password, user not found, etc.)
        if (
          err.code === 'auth/invalid-credential' ||
          err.code === 'auth/wrong-password'     ||
          err.code === 'auth/user-not-found'
        ) {
          return { ok: false, error: 'Incorrect email or password.' };
        }
        if (err.code === 'auth/invalid-email') {
          return { ok: false, error: 'Please enter a valid email address.' };
        }
        if (err.code === 'auth/too-many-requests') {
          return { ok: false, error: 'Too many failed attempts. Please try again later.' };
        }
        return { ok: false, error: err.message || 'Sign-in failed. Please try again.' };
      }
    }

    // ── Mock fallback (Firebase not configured) ─────────────────────────────
    const normEmail = email.trim().toLowerCase();
    const accounts  = loadAccounts();
    const user = accounts.find(
      (u) => u.email.toLowerCase() === normEmail && u.role === 'admin'
    );
    if (!user) return { ok: false, error: 'No admin account found with that email.' };

    const stored = getPassword(normEmail);
    if (!stored || stored !== password) return { ok: false, error: 'Incorrect password.' };

    persist(LS_ADMIN, user, remember);
    setAdmin(user);
    return { ok: true };
  }

  /**
   * Google sign-in for admin. Verifies role === 'admin' in Firestore.
   * Never creates or overwrites the Firestore document.
   * Never lets a non-admin Google user gain admin access.
   * @returns {{ ok: boolean, error?: string }}
   */
  async function adminGoogleLogin() {
    if (!auth || !googleProvider || !db) {
      return {
        ok: false,
        error: 'Google sign-in is not configured. Please check Firebase environment variables.',
      };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { uid, email } = result.user;

      // Read Firestore document — no writes, no role promotion
      let firestoreUser = null;
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) firestoreUser = snap.data();
      } catch (fsErr) {
        await auth.signOut();
        return { ok: false, error: `Could not verify admin role: ${fsErr.message}` };
      }

      if (!firestoreUser || firestoreUser.role !== 'admin') {
        // Not an admin — revoke the Firebase session immediately
        await auth.signOut();
        return { ok: false, error: 'This account is not an administrator.' };
      }

      const adminUser = {
        id:         uid,
        name:       firestoreUser.name       ?? result.user.displayName ?? email,
        email:      firestoreUser.email      ?? email.toLowerCase(),
        role:       'admin',
        avatar:     firestoreUser.avatar     ?? result.user.photoURL ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=admin`,
        studentId:  firestoreUser.studentId  ?? '',
        department: firestoreUser.department ?? '',
        joinedAt:   firestoreUser.joinedAt?.toDate
          ? firestoreUser.joinedAt.toDate().toISOString().slice(0, 10)
          : (firestoreUser.joinedAt ?? new Date().toISOString().slice(0, 10)),
        status:     firestoreUser.status ?? 'active',
        provider:   'google',
      };

      persist(LS_ADMIN, adminUser, true);
      setAdmin(adminUser);
      return { ok: true };

    } catch (err) {
      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        return { ok: false, error: '' }; // silent — user cancelled
      }
      if (err.code === 'auth/popup-blocked') {
        return {
          ok: false,
          error: 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.',
        };
      }
      return {
        ok: false,
        error: err.message || 'Google sign-in failed. Please try again.',
      };
    }
  }

  function adminLogout() {
    // Sign out of Firebase Auth as well so the session is fully cleared
    if (auth) auth.signOut().catch(() => {});
    clear(LS_ADMIN);
    setAdmin(null);
  }

  // ── Google OAuth (student only) ───────────────────────────────────────────
  // Uses Firebase signInWithPopup. Never grants admin role.
  // Returns { ok: true } on success or { ok: false, error: string } on failure.
  // Returns { ok: false, error: '' } when the user simply closes the popup.
  async function googleLogin() {
    if (!auth || !googleProvider) {
      return {
        ok: false,
        error:
          'Google sign-in is not configured yet. ' +
          'Please add your Firebase credentials to .env.local ' +
          '(see src/firebase.js for the required variable names).',
      };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { displayName, email, photoURL, uid } = result.user;

      if (!email) {
        return { ok: false, error: 'Google did not return an email address. Please try again.' };
      }

      // ── Write Firestore doc only if it doesn't exist yet ─────────────────
      // This preserves any existing role/status that an admin may have set.
      if (db) {
        try {
          const userRef  = doc(db, 'users', uid);
          const snapshot = await getDoc(userRef);
          if (!snapshot.exists()) {
            await setDoc(userRef, {
              name:        displayName || email.split('@')[0],
              email:       email.toLowerCase(),
              studentId:   '',
              department:  '',
              role:        'student',   // Google login never creates an admin
              status:      'active',
              borrowCount: 0,
              avatar:      photoURL || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(email)}`,
              joinedAt:    serverTimestamp(),
              provider:    'google',
            });
          }
        } catch (err) {
          console.warn('Firestore write failed (non-fatal):', err.message);
        }
      }

      const googleUser = {
        id:          `google_${uid}`,
        name:        displayName || email.split('@')[0],
        email:       email.toLowerCase(),
        role:        'student',
        avatar:      photoURL || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(email)}`,
        studentId:   '',
        department:  '',
        joinedAt:    new Date().toISOString().slice(0, 10),
        borrowCount: 0,
        status:      'active',
        provider:    'google',
      };

      persist(LS_CUSTOMER, googleUser, true);
      setCustomer(googleUser);
      return { ok: true };
    } catch (err) {
      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        return { ok: false, error: '' };
      }
      if (err.code === 'auth/popup-blocked') {
        return {
          ok: false,
          error: 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.',
        };
      }
      return {
        ok: false,
        error: err.message || 'Google sign-in failed. Please try again.',
      };
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isCustomerLoggedIn = !!customer;
  const isAdminLoggedIn    = !!admin;

  const value = {
    customer,
    admin,
    isCustomerLoggedIn,
    isAdminLoggedIn,
    customerLogin,
    customerRegister,
    customerLogout,
    forgotPassword,
    adminLogin,
    adminLogout,
    adminGoogleLogin,
    googleLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
