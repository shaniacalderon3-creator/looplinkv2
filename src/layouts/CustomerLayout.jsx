import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ToastContainer from '../components/shared/Toast';

export default function CustomerLayout() {
  const { toasts, removeToast } = useApp();
  const { customer, customerLogout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/home',       label: 'Home'         },
    { to: '/browse',     label: 'Browse Items' },
    { to: '/my-borrow',  label: 'My Borrowing' },
    { to: '/lost-found', label: 'Lost & Found' },
  ];

  const handleLogout = () => {
    customerLogout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Nav ── */}
      <header style={{
        background: '#fff',
        borderBottom: '1.5px solid var(--gray-200)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div className="container" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', flexShrink: 0 }}>
            <img
              src="/looplink-logo.jpg"
              alt="LoopLink"
              style={{ height: 38, width: 'auto', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            {/* Fallback wordmark — hidden when logo loads */}
            <span style={{
              display: 'none', alignItems: 'center', gap: '0.4rem',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '9px',
                background: 'linear-gradient(135deg, #7c1c1c, #b8860b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 900, fontSize: '0.875rem',
              }}>LL</div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#7c1c1c', letterSpacing: '-0.02em' }}>
                Loop<span style={{ color: '#b8860b' }}>Link</span>
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }} className="ll-desktop-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => ({
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: isActive ? 'var(--primary)' : 'var(--gray-600)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  transition: 'all var(--transition)',
                  textDecoration: 'none',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            {/* Admin shortcut */}
            <button
              onClick={() => navigate('/editor/login')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius)',
                border: '1.5px solid var(--gray-200)',
                background: 'var(--gray-100)',
                color: 'var(--gray-600)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              className="ll-desktop-nav"
            >
              Admin ↗
            </button>

            {/* Profile avatar + name */}
            <NavLink
              to="/profile"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
            >
              <img
                src={customer?.avatar}
                alt={customer?.name}
                style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid var(--primary-light)', objectFit: 'cover', background: 'var(--gray-100)', flexShrink: 0 }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="ll-desktop-nav">
                {customer?.name?.split(' ')[0]}
              </span>
            </NavLink>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="ll-desktop-nav"
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius)',
                border: '1.5px solid var(--danger-light)',
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Log Out
            </button>

            {/* Hamburger */}
            <button
              className="ll-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: 'none', background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--gray-700)', cursor: 'pointer' }}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid var(--gray-200)', padding: '0.75rem 1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  padding: '0.6rem 0.75rem', borderRadius: 'var(--radius)', fontWeight: 600,
                  color: isActive ? 'var(--primary)' : 'var(--gray-700)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/profile" onClick={() => setMenuOpen(false)} style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--gray-700)', textDecoration: 'none' }}>
              My Profile
            </NavLink>
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              style={{ padding: '0.6rem 0.75rem', borderRadius: 'var(--radius)', border: 'none', background: 'var(--danger-light)', color: 'var(--danger)', fontWeight: 700, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: '0.9rem' }}
            >
              Log Out
            </button>
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer style={{
        background: '#0f172a',
        borderTop: '1px solid rgba(255,255,255,.06)',
        padding: '2rem 0',
        color: 'rgba(255,255,255,.55)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Logo in footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src="/looplink-logo.jpg"
                alt="LoopLink"
                style={{ height: 36, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.8 }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff' }}>
                  Loop<span style={{ color: '#b8860b' }}>Link</span>
                </div>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', fontWeight: 700 }}>
                  BORROW • FIND • RETURN
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem' }}>
              © 2026 LoopLink — Student Borrowing &amp; Lost and Found Platform
            </p>
          </div>
        </div>
      </footer>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <style>{`
        @media (max-width: 768px) {
          .ll-desktop-nav { display: none !important; }
          .ll-hamburger   { display: block !important; }
        }
      `}</style>
    </div>
  );
}
