import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoUrl from '../../assets/looplink-logo.jpg';

export default function EditorLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ email: '', password: '', remember: false });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim()) { setError('Please enter your email.'); return; }
    if (!form.password)     { setError('Please enter your password.'); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = adminLogin({ email: form.email, password: form.password, remember: form.remember });
    setLoading(false);

    if (result.ok) navigate('/admin', { replace: true });
    else           setError(result.error);
  };

  return (
    <div style={pageStyle}>
      {/* Split left panel */}
      <div style={leftPanel}>
        <div style={leftInner}>
          {/* Logo */}
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
            style={{
              marginTop: 'auto',
              paddingTop: '2.5rem',
              color: 'rgba(255,255,255,.5)',
              fontSize: '0.8125rem',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            ← Student Login
          </Link>
        </div>
      </div>

      {/* Right form panel */}
      <div style={rightPanel}>
        <div style={formCard}>
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


          {error && (
            <div style={{
              background: 'var(--danger-light)', border: '1px solid var(--danger)',
              borderRadius: 'var(--radius)', padding: '0.625rem 0.875rem',
              fontSize: '0.875rem', color: 'var(--danger)', marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

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
              disabled={loading}
              style={{
                width: '100%', padding: '0.75rem',
                background: loading ? 'var(--gray-300)' : 'linear-gradient(135deg, #1e293b, #334155)',
                color: '#fff', border: 'none', borderRadius: 'var(--radius)',
                fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'opacity .2s',
              }}
            >
              {loading ? 'Signing in…' : 'Log In to Admin Panel'}
            </button>
          </form>

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

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  background: 'var(--gray-50)',
};

const leftPanel = {
  width: '42%',
  background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%, #1e293b 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem 2.5rem',
  minHeight: '100vh',
};

const leftInner = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  maxWidth: 300,
};

const rightPanel = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1.5rem',
};

const formCard = {
  background: '#fff',
  borderRadius: '1.25rem',
  boxShadow: '0 8px 32px rgba(0,0,0,.10)',
  border: '1px solid var(--gray-200)',
  padding: '2.5rem 2.25rem',
  width: '100%',
  maxWidth: 420,
};
