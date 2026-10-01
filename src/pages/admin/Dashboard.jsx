import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/shared/StatusBadge';
import logoUrl from '../../assets/looplink-logo.jpg';

export default function Dashboard() {
  const { items, borrowRequests, lostFound, users } = useApp();
  const { admin } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Items',       value: items.length,                                               sub: `${items.filter(i => i.availability==='available').length} available`,    color: 'var(--primary)',  icon: '📦', path: '/admin/items'           },
    { label: 'Borrow Requests',   value: borrowRequests.length,                                      sub: `${borrowRequests.filter(r=>r.status==='pending').length} pending`,       color: 'var(--warning)',  icon: '🔄', path: '/admin/borrow-requests'  },
    { label: 'Lost & Found',      value: lostFound.length,                                           sub: `${lostFound.filter(r=>r.status==='open').length} open`,                 color: 'var(--accent)',   icon: '🔍', path: '/admin/lost-found'        },
    { label: 'Students',          value: users.filter(u=>u.role==='student').length,                 sub: `${users.filter(u=>u.status==='active'&&u.role==='student').length} active`, color: 'var(--success)', icon: '👥', path: '/admin/users'           },
  ];

  const pendingRequests = borrowRequests.filter((r) => r.status === 'pending').slice(0, 5);
  const openReports     = lostFound.filter((r) => r.status === 'open').slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        {/* Logo strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <img
            src={logoUrl}
            alt="LoopLink"
            style={{ height: 44, width: 'auto', objectFit: 'contain' }}
          />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--gray-800)', letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>
          Welcome back, <strong>{admin?.name ?? 'Admin'}</strong>! Here's what's happening on campus today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {stats.map((s) => (
          <div
            key={s.label}
            className="card"
            style={{ cursor: 'pointer', transition: 'transform var(--transition)' }}
            onClick={() => navigate(s.path)}
          >
            <div className="card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: 48, height: 48, borderRadius: '12px',
                  background: s.color + '1a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.875rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--gray-700)', marginTop: '0.2rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.1rem' }}>{s.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lower panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Pending Borrow Requests */}
        <div className="card">
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--gray-200)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gray-800)' }}>Pending Requests</h3>
            <button
              onClick={() => navigate('/admin/borrow-requests')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
            >
              View all →
            </button>
          </div>
          {pendingRequests.length === 0 ? (
            <div style={{ padding: '1.5rem', color: 'var(--gray-400)', fontSize: '0.9rem', textAlign: 'center' }}>
              No pending requests 🎉
            </div>
          ) : (
            <div>
              {pendingRequests.map((req) => (
                <PendingRow key={req.id} req={req} items={items} users={users} />
              ))}
            </div>
          )}
        </div>

        {/* Open L&F Reports */}
        <div className="card">
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--gray-200)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gray-800)' }}>Open L&amp;F Reports</h3>
            <button
              onClick={() => navigate('/admin/lost-found')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
            >
              View all →
            </button>
          </div>
          {openReports.length === 0 ? (
            <div style={{ padding: '1.5rem', color: 'var(--gray-400)', fontSize: '0.9rem', textAlign: 'center' }}>
              No open reports 🎉
            </div>
          ) : (
            <div>
              {openReports.map((r) => (
                <LFRow key={r.id} report={r} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item availability breakdown */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-200)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gray-800)' }}>Item Availability</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {['available', 'borrowed', 'unavailable'].map((status) => {
              const count = items.filter((i) => i.availability === status).length;
              const pct   = items.length ? Math.round((count / items.length) * 100) : 0;
              const colors = { available: 'var(--success)', borrowed: 'var(--warning)', unavailable: 'var(--danger)' };
              return (
                <div key={status} style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'capitalize' }}>{status}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: colors[status] }}>{count}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: colors[status], borderRadius: '999px', transition: 'width .5s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PendingRow({ req, items, users }) {
  const item = items.find((i) => i.id === req.itemId);
  const user = users.find((u) => u.id === req.userId);
  return (
    <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{item?.name ?? 'Unknown'}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{user?.name} · {req.startDate} → {req.endDate}</p>
      </div>
      <StatusBadge status="pending" />
    </div>
  );
}

function LFRow({ report }) {
  return (
    <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{report.title}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{report.location} · {report.date}</p>
      </div>
      <StatusBadge status={report.type} />
    </div>
  );
}
