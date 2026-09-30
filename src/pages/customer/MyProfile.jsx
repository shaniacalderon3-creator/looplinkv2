import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';

export default function MyProfile() {
  const { updateUser, getItemById, addToast, borrowRequests, lostFound } = useApp();
  const { customer: user, customerLogout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', department: user?.department ?? '' });

  const myRequests = borrowRequests.filter((r) => r.userId === user?.id);
  const myReports  = lostFound.filter((r) => r.reporterId === user?.id);

  const stats = [
    { label: 'Total Requests', value: myRequests.length, color: 'var(--primary)' },
    { label: 'Active Borrows', value: myRequests.filter((r) => r.status === 'approved').length,  color: 'var(--success)'  },
    { label: 'Pending',        value: myRequests.filter((r) => r.status === 'pending').length,   color: 'var(--warning)'  },
    { label: 'L&F Reports',   value: myReports.length,                                           color: 'var(--accent)'   },
  ];

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      addToast('Name and email are required.', 'error');
      return;
    }
    updateUser({ ...user, ...form });
    setEditing(false);
  };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 860 }}>
        <PageHeader title="My Profile" subtitle="Manage your account information" />

        {/* Profile card */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  style={{
                    width: 88, height: 88, borderRadius: '50%',
                    border: '3px solid var(--primary-light)',
                    background: 'var(--gray-100)',
                    objectFit: 'cover',
                  }}
                />
                <span
                  style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--success)',
                    border: '2px solid var(--white)',
                  }}
                />
              </div>

              {/* Info / Edit form */}
              <div style={{ flex: 1 }}>
                {editing ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Department</label>
                      <input className="form-control" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <Button onClick={handleSave}>Save</Button>
                      <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--gray-800)' }}>{user?.name}</h2>
                      <StatusBadge status={user?.status} />
                    </div>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{user?.email}</p>
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      <span>🏫 {user?.department}</span>
                      <span>🪪 {user?.studentId}</span>
                      <span>📅 Joined {user?.joinedAt}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ marginTop: '1rem' }}
                      onClick={() => { setForm({ name: user.name, email: user.email, department: user.department }); setEditing(true); }}
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
          {stats.map((s) => (
            <div
              key={s.label}
              className="card"
              style={{ textAlign: 'center' }}
            >
              <div className="card-body" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', fontWeight: 600, marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent borrow requests */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body" style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.75rem', marginBottom: '0' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-800)' }}>Recent Borrow Requests</h3>
          </div>
          {myRequests.length === 0 ? (
            <div className="card-body" style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>No requests yet.</div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Dates</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...myRequests].sort((a,b) => b.requestDate > a.requestDate ? 1 : -1).slice(0, 5).map((req) => {
                    const item = getItemById(req.itemId);
                    return (
                      <tr key={req.id}>
                        <td style={{ fontWeight: 600 }}>{item?.name ?? 'Unknown'}</td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{req.startDate} → {req.endDate}</td>
                        <td><StatusBadge status={req.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* My L&F reports */}
        <div className="card">
          <div className="card-body" style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-800)' }}>My Lost &amp; Found Reports</h3>
          </div>
          {myReports.length === 0 ? (
            <div className="card-body" style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>No reports yet.</div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myReports.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.title}</td>
                      <td><StatusBadge status={r.type} /></td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{r.date}</td>
                      <td><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
