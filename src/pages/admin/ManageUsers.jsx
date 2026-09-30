import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import SearchBar from '../../components/shared/SearchBar';
import Modal from '../../components/shared/Modal';
import { ConfirmModal } from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';

const EMPTY_FORM = {
  name: '', email: '', role: 'student', studentId: '',
  department: '', status: 'active',
};

export default function ManageUsers() {
  const { users, addUser, updateUser, deleteUser } = useApp();

  const [search,     setSearch]     = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.studentId?.toLowerCase().includes(q);
    const matchRole   = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, role: u.role, studentId: u.studentId ?? '', department: u.department ?? '', status: u.status ?? 'active' });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (editTarget) {
      updateUser({ ...editTarget, ...form });
    } else {
      addUser({ ...form, avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${form.name.replace(/\s/g, '')}`, borrowCount: 0 });
    }
    setShowForm(false);
  };

  return (
    <div>
      <PageHeader
        title="Manage Users"
        subtitle={`${users.filter(u => u.role === 'student').length} students · ${users.filter(u => u.role === 'admin').length} admins`}
        action={<Button onClick={openAdd}>+ Add User</Button>}
      />

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

      {filtered.length === 0 ? (
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
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: u.role === 'admin' ? 'var(--warning-light)' : 'var(--primary-light)',
                        color: u.role === 'admin' ? '#92400e' : 'var(--primary)',
                        textTransform: 'capitalize',
                      }}
                    >
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

      {/* Add / Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? 'Edit User' : 'Add User'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editTarget ? 'Save Changes' : 'Add User'}</Button>
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

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteUser(deleteId)}
        title="Remove User"
        message="Are you sure you want to remove this user? This action cannot be undone."
        confirmLabel="Remove User"
        variant="danger"
      />
    </div>
  );
}
