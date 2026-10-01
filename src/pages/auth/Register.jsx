import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FallbackLogo, GoogleIcon, styles, logoUrl } from './Login';

export default function Register() {
  const { customerRegister } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', studentId: '', email: '', password: '', confirmPassword: '', terms: false,
  });
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name         = 'Full name is required.';
    if (!form.studentId.trim())    e.studentId    = 'Student ID is required.';
    if (!form.email.trim())        e.email        = 'School email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.password)            e.password     = 'Password is required.';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (!form.confirmPassword)     e.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    if (!form.terms)               e.terms        = 'You must accept the Terms and Conditions.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = customerRegister(form);
    setLoading(false);

    if (result.ok) {
      navigate('/home', { replace: true });
    } else {
      setApiError(result.error);
    }
  };

  const handleGoogleClick = () => {
    alert('Google Sign-In is not connected in this prototype.\n\nPlease register with the form above.');
  };

  const Field = ({ label, id, children, error }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      {children}
      {error && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{error}</span>}
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: 480, padding: '2.25rem 2rem' }}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <img src={logoUrl} alt="LoopLink" style={styles.logo} />
        </div>

        <h1 style={styles.heading}>Create Account</h1>
        <p style={styles.sub}>Join LoopLink and start borrowing today</p>

        {apiError && <div style={styles.errorBox}>{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <Field label="Full Name" id="name" error={errors.name}>
            <input
              id="name" type="text" className="form-control"
              placeholder="Your full name"
              value={form.name} onChange={(e) => set('name', e.target.value)}
              autoComplete="name"
            />
          </Field>

          <Field label="Student ID" id="studentId" error={errors.studentId}>
            <input
              id="studentId" type="text" className="form-control"
              placeholder="e.g. STU-2026-001"
              value={form.studentId} onChange={(e) => set('studentId', e.target.value)}
            />
          </Field>

          <Field label="School Email" id="email" error={errors.email}>
            <input
              id="email" type="email" className="form-control"
              placeholder="you@student.edu"
              value={form.email} onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
            />
          </Field>

          <Field label="Password" id="password" error={errors.password}>
            <div style={styles.pwWrap}>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className="form-control"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                autoComplete="new-password"
                style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={styles.eyeBtn} tabIndex={-1}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </Field>

          <Field label="Confirm Password" id="confirmPassword" error={errors.confirmPassword}>
            <div style={styles.pwWrap}>
              <input
                id="confirmPassword"
                type={showCpw ? 'text' : 'password'}
                className="form-control"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => set('confirmPassword', e.target.value)}
                autoComplete="new-password"
                style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" onClick={() => setShowCpw(!showCpw)} style={styles.eyeBtn} tabIndex={-1}>
                {showCpw ? '🙈' : '👁'}
              </button>
            </div>
          </Field>

          {/* Terms */}
          <div className="form-group">
            <label style={{ ...styles.checkLabel, alignItems: 'flex-start', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => set('terms', e.target.checked)}
                style={{ marginTop: '0.2rem', flexShrink: 0 }}
              />
              <span>
                I agree to the{' '}
                <a href="#terms" style={styles.link} onClick={(e) => e.preventDefault()}>Terms and Conditions</a>
                {' '}and{' '}
                <a href="#privacy" style={styles.link} onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              </span>
            </label>
            {errors.terms && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '-0.5rem', display: 'block' }}>{errors.terms}</span>}
          </div>

          <button
            type="submit"
            style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <div style={styles.divider}><span>or</span></div>

        <button type="button" onClick={handleGoogleClick} style={styles.googleBtn}>
          <GoogleIcon />
          Continue with Google
          <span style={styles.prototypeBadge}>Prototype</span>
        </button>

        <p style={styles.bottomText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
