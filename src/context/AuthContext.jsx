import { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/users';

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
  try {
    const pwMap = JSON.parse(localStorage.getItem('ll_passwords') || '{}');
    return MOCK_PASSWORDS[email] ?? pwMap[email] ?? null;
  } catch {
    return MOCK_PASSWORDS[email] ?? null;
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
    const accounts = loadAccounts();
    const user = accounts.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.role !== 'admin'
    );
    if (!user) return { ok: false, error: 'No account found with that email.' };

    const stored = getPassword(email.trim().toLowerCase());
    if (!stored || stored !== password) return { ok: false, error: 'Incorrect password.' };
    if (user.status === 'inactive') return { ok: false, error: 'This account is inactive. Contact support.' };

    persist(LS_CUSTOMER, user, remember);
    setCustomer(user);
    return { ok: true };
  }

  /** @returns {{ ok: boolean, error?: string }} */
  function customerRegister({ name, studentId, email, password, confirmPassword }) {
    if (password !== confirmPassword) return { ok: false, error: 'Passwords do not match.' };
    if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };

    const accounts = loadAccounts();
    const exists   = accounts.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) return { ok: false, error: 'An account with that email already exists.' };

    const newUser = {
      id:         `u${Date.now()}`,
      name:       name.trim(),
      email:      email.trim().toLowerCase(),
      role:       'student',
      avatar:     `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(name.trim())}`,
      studentId:  studentId.trim(),
      department: '',
      joinedAt:   new Date().toISOString().slice(0, 10),
      borrowCount: 0,
      status:     'active',
    };

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

  /** @returns {{ ok: boolean, error?: string }} */
  function adminLogin({ email, password, remember = false }) {
    const accounts = loadAccounts();
    const user = accounts.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.role === 'admin'
    );
    if (!user) return { ok: false, error: 'No admin account found with that email.' };

    const stored = getPassword(email.trim().toLowerCase());
    if (!stored || stored !== password) return { ok: false, error: 'Incorrect password.' };

    persist(LS_ADMIN, user, remember);
    setAdmin(user);
    return { ok: true };
  }

  function adminLogout() {
    clear(LS_ADMIN);
    setAdmin(null);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
