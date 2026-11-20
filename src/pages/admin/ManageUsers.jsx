import { useState, useEffect, useCallback } from 'react';
import {
  collection, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import SearchBar from '../../components/shared/SearchBar';
import Modal from '../../components/shared/Modal';
import { ConfirmModal } from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';

// ── Firestore helpers ─────────────────────────────────────────────────────────

/** Convert a Firestore doc snapshot into the shape the table expects. */
function docToUser(snap) {
  const d = snap.data();
  return {
    id:          snap.id,
    name:        d.name        ?? '',
    email:       d.email       ?? '',
    studentId:   d.studentId   ?? '',
    department:  d.department  ?? '',
    role:        d.role        ?? 'student',
    status:      d.status      ?? 'active',
    borrowCount: d.borrowCount ?? 0,
    avatar:      d.avatar      ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(d.name ?? '')}`,
    joinedAt:    d.joinedAt?.toDate
      ? d.joinedAt.toDate().toISOString().slice(0, 10)
      : (d.joinedAt ?? ''),
    provider:    d.provider    ?? 'email',
    _fromFirestore: true,
  };
}

const EMPTY_FORM = {
  name: '', email: '', role: 'student', studentId: '',
  department: '', status: 'active',
};

export default function ManageUsers() {
  // Fall-back mock data from AppContext (used only when Firestore is unavailable)
  const { users: mockUsers, addUser } = useApp();

  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [fsError,     setFsError]     = useState('');   // Firestore error message
  const [usingMock,   setUsingMock]   = useState(false);
  const [search,      setSearch]      = useState('');
  const [filterRole,  setFilterRole]  = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [errors,      setErrors]      = useState({});
  const [saving,      setSaving]      = useState(false);

  // ── Load users from Firestore ───────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setFsError('');

    if (!db) {
      // Firebase not configured yet — use mock data
      setUsers(mockUsers);
      setUsingMock(true);
      setLoading(false);
      return;
    }

    try {
      const q   = query(collection(db, 'users'), orderBy('joinedAt', 'desc'));
      const snap = await getDocs(q);

      if (snap.empty) {
        // Firestore is live but empty — fall back to mock data
        setUsers(mockUsers);
        setUsingMock(true);
      } else {
        setUsers(snap.docs.map(docToUser));
        setUsingMock(false);
      }
    } catch (err) {
      console.error('ManageUsers: Firestore read failed', err);
      setFsError(`Could not load users from Firestore: ${err.message}`);
      setUsers(mockUsers);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [mockUsers]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.studentId ?? '').toLowerCase().includes(q);
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  // ── Form helpers ────────────────────────────────────────────────────────────
  const openEdit = (u) => {
    setForm({
      name:       u.name,
      email:      u.email,
      role:       u.role,
      studentId:  u.studentId  ?? '',
      department: u.department ?? '',
      status:     u.status     ?? 'active',
    });
    setErrors({});
    setEditTarget(u);
    setShowForm(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save edit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    if (db && editTarget?._fromFirestore) {
      // Real Firestore document
      try {
        await updateDoc(doc(db, 'users', editTarget.id), {
          name:       form.name.trim(),
          email:      form.email.trim().toLowerCase(),
          studentId:  form.studentId.trim(),
          department: form.department.trim(),
          role:       form.role,
          status:     form.status,
        });
        await loadUsers();
      } catch (err) {
        setFsError(`Save failed: ${err.message}`);
      }
    } else {
      // Mock-only fallback: update local state directly
      setUsers((prev) =>
        prev.map((u) => u.id === editTarget?.id ? { ...u, ...form } : u)
      );
    }

    setSaving(false);
    setShowForm(false);
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const target = users.find((u) => u.id === id);
    if (db && target?._fromFirestore) {
      try {
        await deleteDoc(doc(db, 'users', id));
        await loadUsers();
      } catch (err) {
        setFsError(`Delete failed: ${err.message}`);
      }
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Manage Users"
        subtitle={
          loading
            ? 'Loading…'
            : `${users.filter(u => u.role === 'student').length} students · ${users.filter(u => u.role === 'admin').length} admins`
        }
        action={
          <Button size="sm" variant="secondary" onClick={loadUsers} disabled={loading}>
            {loading ? 'Refreshing…' : '↻ Refresh'}
          </Button>
        }
      />

      {/* Firestore error banner */}
      {fsError && (
        <div style={{
          background: 'var(--danger-light)', border: '1px solid var(--danger)',
          borderRadius: 'var(--radius)', padding: '0.75rem 1rem',
          fontSize: '0.875rem', color: 'var(--danger)', marginBottom: '1.25rem',
        }}>
          ⚠️ {fsError}
        </div>
      )}

      {/* Mock-data notice */}
      {usingMock && !loading && (
        <div style={{
          background: 'var(--warning-light)', border: '1px solid var(--warning)',
          borderRadius: 'var(--radius)', padding: '0.75rem 1rem',
          fontSize: '0.875rem', color: '#92400e', marginBottom: '1.25rem',
        }}>
          📋 Showing sample data. Newly registered users will appear here after they sign up.
        </div>
      )}

      {/* Search + filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, or student ID…">
          <select
            className="form-control"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ width: 'auto', minWidth: 130, border: 'none', boxShadow: 'none', background: 'transparent' }}
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </SearchBar>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
          Loading users…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="👥" title="No users found" description="Try different search terms." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Student ID</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Borrows</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <img
                        src={u.avatar}
                        alt={u.name}
                        style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gray-100)', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(u.name)}`; }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>{u.studentId}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{u.department}</td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '999px',
                      fontSize: '0.75rem', fontWeight: 700,
                      background: u.role === 'admin' ? 'var(--warning-light)' : 'var(--primary-light)',
                      color:      u.role === 'admin' ? '#92400e'              : 'var(--primary)',
                      textTransform: 'capitalize',
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td><StatusBadge status={u.status ?? 'active'} /></td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--gray-600)', textAlign: 'center' }}>{u.borrowCount ?? 0}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{u.joinedAt}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" onClick={() => openEdit(u)}>Edit</Button>
                      {u.role !== 'admin' && (
                        <Button size="sm" variant="outline-danger" onClick={() => setDeleteId(u.id)}>Remove</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Edit User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.email}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input className="form-control" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="STU-2026-XXX" />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-control" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Role</label>
              <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Remove confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Remove User"
        message="Are you sure you want to remove this user? This deletes the Firestore document and cannot be undone."
        confirmLabel="Remove User"
        variant="danger"
      />
    </div>
  );
}
