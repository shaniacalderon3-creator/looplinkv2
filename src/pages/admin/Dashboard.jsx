import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/shared/StatusBadge';
import logoUrl from '../../assets/looplink-logo.jpg';

export default function Dashboard() {
  const { users, sharedDonated } = useApp(); // users & shared/donated still use AppContext
  const { admin } = useAuth();
  const navigate  = useNavigate();

  const [counts,   setCounts]   = useState({ items: 0, available: 0, requests: 0, pendingReqs: 0, reports: 0, openReports: 0 });
  const [recentReqs,   setRecentReqs]   = useState([]);
  const [recentReports,setRecentReports]= useState([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }

    const [itemsRes, reqsRes, reportsRes] = await Promise.all([
      supabase.from('items').select('id, status'),
      supabase.from('borrow_requests').select('id, status, item_id, student_name, start_date, end_date, items(name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('lost_found_reports').select('id, title, location, type, status, date_reported').order('created_at', { ascending: false }).limit(5),
    ]);

    const allItems   = itemsRes.data   ?? [];
    const allReqs    = reqsRes.data    ?? [];
    const allReports = reportsRes.data ?? [];

    setCounts({
      items:       allItems.length,
      available:   allItems.filter(i => i.status?.toLowerCase() === 'available').length,
      requests:    allReqs.length,
      pendingReqs: allReqs.filter(r => r.status?.toLowerCase() === 'pending').length,
      reports:     allReports.length,
      openReports: allReports.filter(r => r.status?.toLowerCase() === 'open').length,
    });

    setRecentReqs(allReqs.filter(r => r.status?.toLowerCase() === 'pending').slice(0, 5));
    setRecentReports(allReports.filter(r => r.status?.toLowerCase() === 'open').slice(0, 5));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = [
    { label: 'Total Items',      value: loading ? '…' : counts.items,       sub: `${counts.available} available`,                                               color: 'var(--primary)',  icon: '📦', path: '/admin/items'           },
    { label: 'Borrow Requests',  value: loading ? '…' : counts.requests,     sub: `${counts.pendingReqs} pending`,                                              color: 'var(--warning)',  icon: '🔄', path: '/admin/borrow-requests'  },
    { label: 'Shared & Donated', value: sharedDonated.length,                sub: `${sharedDonated.filter(r=>r.status==='pending').length} pending`,             color: '#7c1c1c',         icon: '🎁', path: '/admin/shared-donated'   },
    { label: 'Lost & Found',     value: loading ? '…' : counts.reports,      sub: `${counts.openReports} open`,                                                 color: 'var(--accent)',   icon: '🔍', path: '/admin/lost-found'        },
    { label: 'Students',         value: users.filter(u=>u.role==='student').length, sub: `${users.filter(u=>u.status==='active'&&u.role==='student').length} active`, color: 'var(--success)', icon: '👥', path: '/admin/users' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <img src={logoUrl} alt="LoopLink" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--gray-800)', letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>
          Welcome back, <strong>{admin?.name ?? 'Admin'}</strong>! Here's what's happening on campus today.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ cursor: 'pointer', transition: 'transform var(--transition)' }} onClick={() => navigate(s.path)}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: s.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
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
        {/* Pending Requests */}
        <div className="card">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gray-800)' }}>Pending Requests</h3>
            <button onClick={() => navigate('/admin/borrow-requests')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>View all →</button>
          </div>
          {loading ? (
            <div style={{ padding: '1.5rem', color: 'var(--gray-400)', fontSize: '0.9rem', textAlign: 'center' }}>Loading…</div>
          ) : recentReqs.length === 0 ? (
            <div style={{ padding: '1.5rem', color: 'var(--gray-400)', fontSize: '0.9rem', textAlign: 'center' }}>No pending requests 🎉</div>
          ) : recentReqs.map((req) => (
            <div key={req.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{req.items?.name ?? req.item_id ?? '—'}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{req.student_name} · {req.start_date} → {req.end_date}</p>
              </div>
              <StatusBadge status="pending" />
            </div>
          ))}
        </div>

        {/* Open L&F Reports */}
        <div className="card">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gray-800)' }}>Open L&amp;F Reports</h3>
            <button onClick={() => navigate('/admin/lost-found')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>View all →</button>
          </div>
          {loading ? (
            <div style={{ padding: '1.5rem', color: 'var(--gray-400)', fontSize: '0.9rem', textAlign: 'center' }}>Loading…</div>
          ) : recentReports.length === 0 ? (
            <div style={{ padding: '1.5rem', color: 'var(--gray-400)', fontSize: '0.9rem', textAlign: 'center' }}>No open reports 🎉</div>
          ) : recentReports.map((r) => (
            <div key={r.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{r.title}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{r.location} · {r.date_reported}</p>
              </div>
              <StatusBadge status={r.type} />
            </div>
          ))}
        </div>
      </div>

      {/* Item availability breakdown — from real Supabase data */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-200)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gray-800)' }}>Item Availability</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {['available', 'borrowed', 'unavailable'].map((status) => {
              const total = counts.items || 1;
              const count = status === 'available' ? counts.available : 0; // extend if needed
              const pct   = Math.round((count / total) * 100);
              const colors = { available: 'var(--success)', borrowed: 'var(--warning)', unavailable: 'var(--danger)' };
              return (
                <div key={status} style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'capitalize' }}>{status}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: colors[status] }}>{loading ? '…' : count}</span>
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
