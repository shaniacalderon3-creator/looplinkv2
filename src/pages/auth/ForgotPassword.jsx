import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FallbackLogo, styles, logoUrl } from './Login';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address.'); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = forgotPassword(email);
    setLoading(false);

    if (result.ok) setSuccess(result.message);
    else            setError(result.error);
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: 420 }}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <img src={logoUrl} alt="LoopLink" style={styles.logo} />
        </div>

        <h1 style={styles.heading}>Forgot Password?</h1>
        <p style={styles.sub}>Enter your school email and we'll send you a reset link</p>

        {error   && <div style={styles.errorBox}>{error}</div>}

        {success ? (
          <div
            style={{
              background: 'var(--success-light)',
              border: '1px solid var(--success)',
              borderRadius: 'var(--radius)',
              padding: '1rem',
              fontSize: '0.9rem',
              color: '#065f46',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📬</div>
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">School Email</label>
              <input
                id="reset-email"
                type="email"
                className="form-control"
                placeholder="you@student.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Reset Password'}
            </button>
          </form>
        )}

        <p style={{ ...styles.bottomText, marginTop: '1.5rem' }}>
          <Link to="/login" style={styles.link}>← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
