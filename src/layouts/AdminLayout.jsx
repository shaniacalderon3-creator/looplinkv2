import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ToastContainer from '../components/shared/Toast';
import logoUrl from '../assets/looplink-logo.jpg';

const navItems = [
  { to: '/admin',                 label: 'Dashboard',       icon: '◉', exact: true },
  { to: '/admin/items',           label: 'Manage Items',    icon: '📦' },
  { to: '/admin/borrow-requests', label: 'Borrow Requests', icon: '🔄' },
  { to: '/admin/lost-found',      label: 'Lost & Found',    icon: '🔍' },
  { to: '/admin/users',           label: 'Manage Users',    icon: '👥' },
];

export default function AdminLayout() {
  const { toasts, removeToast } = useApp();
  const { admin, adminLogout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/editor/login', { replace: true });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: collapsed ? 64 : 240,
        minHeight: '100vh',
        background: 'var(--admin-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {/* Sidebar header — Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0 0.5rem' : '0 0.875rem 0 1rem',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          flexShrink: 0,
        }}>
          {!collapsed && (
            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', overflow: 'hidden' }}>
              <img
                src={logoUrl}
                alt="LoopLink"
                style={{ height: 34, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9, flexShrink: 0 }}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              {/* Fallback wordmark */}
              <span style={{ display: 'none', flexDirection: 'column' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                  Loop<span style={{ color: '#f59e0b' }}>Link</span>
                </span>
                <span style={{ fontSize: '0.55rem', background: '#f59e0b', color: '#000', borderRadius: '3px', padding: '0.05rem 0.3rem', fontWeight: 800, letterSpacing: '0.05em', width: 'fit-content' }}>
                  ADMIN
                </span>
              </span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'rgba(255,255,255,.08)', border: 'none',
              color: 'var(--gray-400)', borderRadius: '6px',
              width: 28, height: 28, cursor: 'pointer', fontSize: '0.8rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              title={collapsed ? item.label : undefined}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                gap: '0.75rem',
                padding: collapsed ? '0.65rem' : '0.65rem 0.875rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '8px',
                color: isActive ? '#fff' : 'rgba(255,255,255,.55)',
                background: isActive ? 'rgba(255,255,255,.12)' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all var(--transition)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: student view + logout */}
        <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button
            onClick={() => navigate('/home')}
            title={collapsed ? 'Student View' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              width: '100%', padding: collapsed ? '0.65rem' : '0.65rem 0.875rem',
              background: 'rgba(255,255,255,.06)', border: 'none',
              borderRadius: '8px', color: 'rgba(255,255,255,.55)',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              whiteSpace: 'nowrap', overflow: 'hidden', fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>←</span>
            {!collapsed && 'Student View'}
          </button>

          <button
            onClick={handleLogout}
            title={collapsed ? 'Log Out' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              width: '100%', padding: collapsed ? '0.65rem' : '0.65rem 0.875rem',
              background: 'rgba(239,68,68,.15)', border: 'none',
              borderRadius: '8px', color: '#fca5a5',
              fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap', overflow: 'hidden', fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>⏻</span>
            {!collapsed && 'Log Out'}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: 64, background: '#fff',
          borderBottom: '1.5px solid var(--gray-200)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 1.5rem', gap: '1rem',
          position: 'sticky', top: 0, zIndex: 50,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            Logged in as{' '}
            <strong style={{ color: 'var(--gray-700)' }}>
              {admin?.name ?? 'Admin'}
            </strong>
          </span>
          <img
            src={admin?.avatar}
            alt={admin?.name}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gray-100)', border: '2px solid var(--warning-light)', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback avatar */}
          <div style={{
            display: 'none', width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, var(--primary))',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '0.875rem',
          }}>
            {(admin?.name?.[0] ?? 'A').toUpperCase()}
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
          <Outlet />
        </main>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
