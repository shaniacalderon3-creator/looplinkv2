import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { customerLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim()) { setError('Please enter your email.'); return; }
    if (!form.password)     { setError('Please enter your password.'); return; }

    setLoading(true);
    // Tiny artificial delay so it feels like a real request
    await new Promise((r) => setTimeout(r, 500));
    const result = customerLogin({ email: form.email, password: form.password, remember: form.remember });
    setLoading(false);

    if (result.ok) {
      navigate('/home', { replace: true });
    } else {
      setError(result.error);
    }
  };

  const handleGoogleClick = () => {
    alert('Google Sign-In is not connected in this prototype.\n\nUse the mock credentials below to log in:\nEmail: alex.rivera@student.edu\nPassword: student123');
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <img src="/looplink-logo.jpg" alt="LoopLink" style={styles.logo} onError={(e) => { e.target.style.display = 'none'; }} />
          <FallbackLogo />
        </div>

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.sub}>Sign in to your student account</p>

        {/* Demo hint */}
        <div style={styles.hint}>
          <strong>Demo credentials —</strong> email: <code>alex.rivera@student.edu</code> · password: <code>student123</code>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">School Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@student.edu"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Password
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
            </label>
            <div style={styles.pwWrap}>
              <input
                type={showPw ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={styles.eyeBtn} tabIndex={-1}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <label style={styles.checkLabel}>
            <input type="checkbox" checked={form.remember} onChange={(e) => set('remember', e.target.checked)} style={{ marginRight: '0.5rem' }} />
            Remember me
          </label>

          <button type="submit" style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Signing in…' : 'Log In'}
          </button>
        </form>

        <div style={styles.divider}><span>or</span></div>

        <button type="button" onClick={handleGoogleClick} style={styles.googleBtn}>
          <GoogleIcon />
          Continue with Google
          <span style={styles.prototypeBadge}>Prototype</span>
        </button>

        <p style={styles.bottomText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create Account</Link>
        </p>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '1.5rem' }}>
          Admin?{' '}
          <Link to="/editor/login" style={{ color: 'var(--gray-500)', fontWeight: 600, textDecoration: 'underline' }}>
            Editor / Admin Login →
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Shared sub-components used across all auth pages ──────────────────────────

export function FallbackLogo() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '14px',
        background: 'linear-gradient(135deg, #7c1c1c 0%, #b8860b 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em',
        boxShadow: '0 4px 12px rgba(124,28,28,.3)',
      }}>
        LL
      </div>
      <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#7c1c1c', letterSpacing: '-0.02em', lineHeight: 1 }}>
        Loop<span style={{ color: '#b8860b' }}>Link</span>
      </span>
      <span style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>
        BORROW • FIND • RETURN
      </span>
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
export const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8f0f0 0%, #fdf8ee 50%, #f0f4ff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
  },
  card: {
    background: '#fff',
    borderRadius: '1.25rem',
    boxShadow: '0 8px 32px rgba(0,0,0,.10)',
    border: '1px solid var(--gray-200)',
    padding: '2.5rem 2.25rem',
    width: '100%',
    maxWidth: 440,
  },
  logoWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  logo: {
    height: 72,
    width: 'auto',
    objectFit: 'contain',
    display: 'block',
  },
  heading: {
    fontSize: '1.625rem',
    fontWeight: 900,
    color: 'var(--gray-800)',
    textAlign: 'center',
    marginBottom: '0.25rem',
    letterSpacing: '-0.02em',
  },
  sub: {
    textAlign: 'center',
    color: 'var(--gray-500)',
    fontSize: '0.9375rem',
    marginBottom: '1.5rem',
  },
  hint: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 'var(--radius)',
    padding: '0.625rem 0.875rem',
    fontSize: '0.8125rem',
    color: '#92400e',
    marginBottom: '1.25rem',
    lineHeight: 1.6,
  },
  errorBox: {
    background: 'var(--danger-light)',
    border: '1px solid var(--danger)',
    borderRadius: 'var(--radius)',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    color: 'var(--danger)',
    marginBottom: '1rem',
  },
  pwWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
    padding: 0,
  },
  forgotLink: {
    color: 'var(--primary)',
    fontWeight: 600,
    fontSize: '0.8125rem',
    textDecoration: 'none',
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: 'var(--gray-600)',
    marginBottom: '1.25rem',
    cursor: 'pointer',
  },
  primaryBtn: {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #7c1c1c, #b8860b)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    letterSpacing: '0.01em',
    transition: 'opacity 0.2s',
    fontFamily: 'inherit',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    margin: '1.25rem 0',
    color: 'var(--gray-300)',
    fontSize: '0.8125rem',
    '& span': { background: '#fff', padding: '0 0.5rem' },
  },
  googleBtn: {
    width: '100%',
    padding: '0.7rem',
    background: '#fff',
    border: '1.5px solid var(--gray-200)',
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.625rem',
    fontWeight: 600,
    fontSize: '0.9375rem',
    color: 'var(--gray-700)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    position: 'relative',
  },
  prototypeBadge: {
    position: 'absolute',
    right: '0.75rem',
    background: 'var(--gray-100)',
    color: 'var(--gray-400)',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  bottomText: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: 'var(--gray-500)',
    marginTop: '1.25rem',
  },
  link: {
    color: 'var(--primary)',
    fontWeight: 700,
    textDecoration: 'none',
  },
};
