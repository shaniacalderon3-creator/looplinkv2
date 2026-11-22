/**
 * TermsGate — wraps the student layout.
 *
 * After login, reads users/{uid} from Firestore.
 * If termsVersion !== '2026-11-22', renders a full-screen, non-dismissible
 * modal the user must scroll through, tick, and accept before they can proceed.
 *
 * Rules:
 * - Always uses auth.currentUser.uid — never user?.uid from AuthContext.
 * - Accept writes only termsAcceptedAt + termsVersion; no other fields touched.
 * - Decline signs the user out and sends them to /login.
 * - Modal cannot be dismissed by clicking outside or pressing Escape.
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import TermsContent from './TermsContent';

const TERMS_VERSION = '2026-11-22';

export default function TermsGate({ children }) {
  const { customerLogout } = useAuth();
  const navigate = useNavigate();

  const [status,         setStatus]        = useState('loading'); // 'loading' | 'accepted' | 'required'
  const [checked,        setChecked]       = useState(false);
  const [scrolledToEnd,  setScrolledToEnd] = useState(false);
  const [saving,         setSaving]        = useState(false);
  const [saveError,      setSaveError]     = useState('');
  const scrollRef = useRef(null);

  // ── Check whether the current user has accepted the latest Terms ──────────
  useEffect(() => {
    let cancelled = false;

    async function check() {
      // Wait until Firebase Auth has resolved a user
      const fbUser = auth.currentUser;
      if (!fbUser) {
        // Auth not ready yet — retry shortly
        const t = setTimeout(check, 300);
        return () => clearTimeout(t);
      }

      if (!db) {
        // Firestore not configured — skip the gate so the app still works
        if (!cancelled) setStatus('accepted');
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (cancelled) return;

        const data = snap.exists() ? snap.data() : {};
        if (data.termsVersion === TERMS_VERSION) {
          setStatus('accepted');
        } else {
          setStatus('required');
        }
      } catch {
        // Firestore read failed — fail open so the user isn't locked out
        if (!cancelled) setStatus('accepted');
      }
    }

    check();
    return () => { cancelled = true; };
  }, []);

  // ── Scroll-to-end detector ────────────────────────────────────────────────
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12) {
      setScrolledToEnd(true);
    }
  };

  // ── Accept ────────────────────────────────────────────────────────────────
  const handleAccept = async () => {
    const fbUser = auth.currentUser;
    if (!fbUser) {
      setSaveError('Session expired. Please log in again.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await updateDoc(doc(db, 'users', fbUser.uid), {
        termsAcceptedAt: serverTimestamp(),
        termsVersion:    TERMS_VERSION,
      });
      setStatus('accepted');
    } catch (err) {
      setSaveError(`Could not save your acceptance: ${err.message}. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  // ── Decline ───────────────────────────────────────────────────────────────
  const handleDecline = () => {
    customerLogout();
    navigate('/login', { replace: true });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
        <p style={{ color: 'var(--gray-400)', fontSize: '0.9375rem' }}>Loading…</p>
      </div>
    );
  }

  if (status === 'accepted') {
    return <>{children}</>;
  }

  // status === 'required' → show the modal
  const canAccept = scrolledToEnd && checked && !saving;

  return (
    <>
      {/* Page behind the modal — blurred so the user knows they're blocked */}
      <div style={{ filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>

      {/* Full-screen overlay — not clickable through */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
        // Intentionally no onClick — modal is non-dismissible
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '1rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: 640,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div style={{ padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid var(--gray-200)', flexShrink: 0 }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--gray-800)', marginBottom: '0.2rem' }}>
              Terms and Conditions
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>
              Effective date: November 22, 2026
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 600 }}>
              Please scroll through and read the full Terms before accepting.
            </p>
          </div>

          {/* Scrollable content */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem 1.5rem',
              minHeight: 0,
            }}
          >
            <TermsContent compact />

            {/* Checkbox — appears at the very end of the scrollable area */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: scrolledToEnd ? 'var(--primary-light)' : 'var(--gray-100)',
                borderRadius: 'var(--radius)',
                border: `1.5px solid ${scrolledToEnd ? 'var(--primary)' : 'var(--gray-200)'}`,
                transition: 'background 0.3s, border-color 0.3s',
              }}
            >
              {!scrolledToEnd && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginBottom: '0.6rem', textAlign: 'center' }}>
                  ↓ Scroll to the end to enable the checkbox
                </p>
              )}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: scrolledToEnd ? 'pointer' : 'not-allowed' }}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!scrolledToEnd}
                  onChange={(e) => setChecked(e.target.checked)}
                  style={{ marginTop: '0.2rem', width: 16, height: 16, flexShrink: 0, cursor: scrolledToEnd ? 'pointer' : 'not-allowed' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: scrolledToEnd ? 'var(--primary)' : 'var(--gray-400)', lineHeight: 1.5 }}>
                  I have read, understood and agree to the Terms and Conditions
                </span>
              </label>
            </div>
          </div>

          {/* Error */}
          {saveError && (
            <div style={{ padding: '0.625rem 1.5rem', background: 'var(--danger-light)', borderTop: '1px solid var(--danger)', fontSize: '0.875rem', color: 'var(--danger)', flexShrink: 0 }}>
              ⚠️ {saveError}
            </div>
          )}

          {/* Footer buttons */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexShrink: 0 }}>
            <button
              onClick={handleDecline}
              disabled={saving}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius)',
                border: '1.5px solid var(--gray-200)',
                background: 'var(--white)',
                color: 'var(--gray-600)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Decline and Log Out
            </button>
            <button
              onClick={handleAccept}
              disabled={!canAccept}
              title={!scrolledToEnd ? 'Scroll to the end first' : !checked ? 'Tick the checkbox first' : ''}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: 'var(--radius)',
                border: 'none',
                background: canAccept ? 'linear-gradient(135deg, #7c1c1c, #b8860b)' : 'var(--gray-200)',
                color: canAccept ? '#fff' : 'var(--gray-400)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: canAccept ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {saving ? 'Saving…' : 'Accept and Continue'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
