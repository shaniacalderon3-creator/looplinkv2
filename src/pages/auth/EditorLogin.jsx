import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoUrl from '../../assets/looplink-logo.jpg';

// Google icon — same SVG used on the student login page
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function EditorLogin() {
  const { adminLogin, adminGoogleLogin } = useAuth();
  const navigate = useNavigate();

  const [form,          setForm]          = useState({ email: '', password: '', remember: false });
  const [showPw,        setShowPw]        = useState(false);
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const anyLoading = loading || googleLoading;

  // ── Email/password submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim()) { setError('Please enter your email.'); return; }
    if (!form.password)     { setError('Please enter your password.'); return; }

    setLoading(true);
    const result = await adminLogin({ email: form.email, password: form.password, remember: form.remember });
    setLoading(false);

    if (result.ok) navigate('/admin', { replace: true });
    else           setError(result.error);
  };

  // ── Google sign-in ───────────────────────────────────────────────────────
  const handleGoogleClick = async () => {
    setError('');
    setGoogleLoading(true);
    const result = await adminGoogleLogin();
    setGoogleLoading(false);

    if (result.ok) {
      navigate('/admin', { replace: true });
    } else if (result.error) {
      setError(result.error);
    }
    // empty string = user cancelled the popup; do nothing
  };

  return (
    <div style={pageStyle}>
      {/* ── Left panel ── */}
      <div style={leftPanel}>
        <div style={leftInner}>
          <img
            src={logoUrl}
            alt="LoopLink"
            style={{ height: 80, width: 'auto', objectFit: 'contain', marginBottom: '1.5rem' }}
          />
          <AdminLogoFallback />
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '0.9375rem', marginTop: '1.5rem', maxWidth: 280, textAlign: 'center', lineHeight: 1.7 }}>
            Secure access for LoopLink administrators and editors.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              '📦  Manage campus items',
              '🔄  Review borrow requests',
              '🔍  Handle Lost & Found reports',
              '👥  Manage student accounts',
            ].map((line) => (
              <div key={line} style={{ color: 'rgba(255,255,255,.7)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {line}
              </div>
            ))}
          </div>
          <Link
            to="/login"
            style={{ marginTop: 'auto', paddingTop: '2.5rem', color: 'rgba(255,255,255,.5)', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 600 }}
          >
            ← Student Login
          </Link>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={rightPanel}>
        <div style={formCard}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 52, height: 52, borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              fontSize: '1.5rem', marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(245,158,11,.3)',
            }}>
              🛡
            </div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 900, color: 'var(--gray-800)', letterSpacing: '-0.02em' }}>
              Admin Login
            </h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              Editor &amp; Administrator Portal
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'var(--danger-light)', border: '1px solid var(--danger)',
              borderRadius: 'var(--radius)', padding: '0.625rem 0.875rem',
              fontSize: '0.875rem', color: 'var(--danger)', marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          {/* Email / password form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="admin@looplink.edu"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                autoComplete="email"
                disabled={anyLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem' }}
                  disabled={anyLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0 }}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1.25rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.remember} onChange={(e) => set('remember', e.target.checked)} style={{ marginRight: '0.5rem' }} />
              Remember me
            </label>

            <button
              type="submit"
              disabled={anyLoading}
              style={{
                width: '100%', padding: '0.75rem',
                background: anyLoading ? 'var(--gray-300)' : 'linear-gradient(135deg, #1e293b, #334155)',
                color: '#fff', border: 'none', borderRadius: 'var(--radius)',
                fontWeight: 700, fontSize: '1rem',
                cursor: anyLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'opacity .2s',
              }}
            >
              {loading ? 'Signing in…' : 'Log In to Admin Panel'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            margin: '1.25rem 0',
            color: 'var(--gray-300)', fontSize: '0.8125rem',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
            <span>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={anyLoading}
            style={{
              width: '100%', padding: '0.7rem',
              background: '#fff',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.625rem',
              fontWeight: 600, fontSize: '0.9375rem',
              color: 'var(--gray-700)',
              cursor: anyLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: googleLoading ? 0.7 : 1,
              transition: 'opacity .2s',
            }}
          >
            <GoogleIcon />
            {googleLoading ? 'Signing in with Google…' : 'Sign in with Google'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--gray-400)', marginTop: '2rem' }}>
            LoopLink Admin Portal · Authorised personnel only
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminLogoFallback() {
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontWeight: 900, fontSize: '1.5rem', color: '#fff', letterSpacing: '-0.02em' }}>
        Loop<span style={{ color: '#f59e0b' }}>Link</span>
      </span>
      <div style={{ marginTop: '0.2rem' }}>
        <span style={{ background: '#f59e0b', color: '#000', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.6rem', borderRadius: '4px', letterSpacing: '0.1em' }}>
          ADMIN PORTAL
        </span>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.6rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,.45)', fontWeight: 700, textTransform: 'uppercase' }}>
        BORROW • FIND • RETURN
      </div>
    </div>
  );
}

const pageStyle  = { minHeight: '100vh', display: 'flex', background: 'var(--gray-50)' };
const leftPanel  = { width: '42%', background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2.5rem', minHeight: '100vh' };
const leftInner  = { display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', maxWidth: 300 };
const rightPanel = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' };
const formCard   = { background: '#fff', borderRadius: '1.25rem', boxShadow: '0 8px 32px rgba(0,0,0,.10)', border: '1px solid var(--gray-200)', padding: '2.5rem 2.25rem', width: '100%', maxWidth: 420 };
