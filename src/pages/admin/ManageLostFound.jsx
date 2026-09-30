import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import SearchBar from '../../components/shared/SearchBar';
import Modal from '../../components/shared/Modal';
import { ConfirmModal } from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';
import { LF_CATEGORIES } from '../../data/lostFound';

const EMPTY_FORM = {
  type: 'lost', title: '', description: '', category: '',
  location: '', contactInfo: '', image: '', status: 'open', adminNote: '',
};

export default function ManageLostFound() {
  const { lostFound, addLostFound, updateLostFound, deleteLostFound, getUserById } = useApp();

  const [tab,        setTab]        = useState('all');
  const [search,     setSearch]     = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});

  const filtered = lostFound.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.location.toLowerCase().includes(q);
    const matchTab    = tab === 'all' || r.type === tab || r.status === tab;
    return matchSearch && matchTab;
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({ ...r });
    setErrors({});
    setEditTarget(r);
    setShowForm(true);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title    = 'Title is required.';
    if (!form.category)        e.category = 'Category is required.';
    if (!form.location.trim()) e.location = 'Location is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (editTarget) {
      updateLostFound({ ...editTarget, ...form });
    } else {
      addLostFound({ ...form, reporterId: 'admin1' });
    }
    setShowForm(false);
  };

  const quickStatus = (report, status) => {
    updateLostFound({ ...report, status });
  };

  const tabs = [
    { key: 'all',      label: 'All',      count: lostFound.length },
    { key: 'lost',     label: 'Lost',     count: lostFound.filter(r=>r.type==='lost').length },
    { key: 'found',    label: 'Found',    count: lostFound.filter(r=>r.type==='found').length },
    { key: 'open',     label: 'Open',     count: lostFound.filter(r=>r.status==='open').length },
    { key: 'resolved', label: 'Resolved', count: lostFound.filter(r=>r.status==='resolved').length },
    { key: 'returned', label: 'Returned', count: lostFound.filter(r=>r.status==='returned').length },
  ];

  return (
    <div>
      <PageHeader
        title="Lost & Found"
        subtitle={`${lostFound.filter(r=>r.status==='open').length} open reports`}
        action={<Button onClick={openAdd}>+ Add Report</Button>}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.4rem 0.875rem',
              borderRadius: '999px',
              border: `1.5px solid ${tab === t.key ? 'var(--primary)' : 'var(--gray-200)'}`,
              background: tab === t.key ? 'var(--primary-light)' : 'var(--white)',
              color: tab === t.key ? 'var(--primary)' : 'var(--gray-600)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by title or location…" />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No reports" description="No reports match the current filter." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Location</th>
                <th>Date</th>
                <th>Reporter</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const reporter = getUserById(r.reporterId);
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, fontSize: '0.875rem', maxWidth: 180 }}>
                      <span className="truncate" style={{ display: 'block' }}>{r.title}</span>
                    </td>
                    <td><StatusBadge status={r.type} /></td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{r.category}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', maxWidth: 140 }}>
                      <span className="truncate" style={{ display: 'block' }}>{r.location}</span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{r.date}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{reporter?.name ?? '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {r.status === 'open' && (
                          <>
                            <Button size="sm" variant="success" onClick={() => quickStatus(r, 'resolved')}>Resolved</Button>
                            <Button size="sm" variant="secondary" onClick={() => quickStatus(r, 'returned')}>Returned</Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openEdit(r)}>Edit</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => setDeleteId(r.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? 'Edit Report' : 'Add Report'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editTarget ? 'Save Changes' : 'Add Report'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            {['lost', 'found'].map((t) => (
              <label
                key={t}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  padding: '0.5rem', borderRadius: 'var(--radius)',
                  border: `1.5px solid ${form.type === t ? 'var(--primary)' : 'var(--gray-200)'}`,
                  background: form.type === t ? 'var(--primary-light)' : 'var(--gray-50)',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
                  color: form.type === t ? 'var(--primary)' : 'var(--gray-600)',
                }}
              >
                <input type="radio" name="type" value={t} checked={form.type === t} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ display: 'none' }} />
                {t === 'lost' ? '😢 Lost' : '🎉 Found'}
              </label>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            {errors.title && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.title}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select</option>
                {LF_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.category}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location *</label>
            <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            {errors.location && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.location}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {errors.description && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.description}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Contact Info</label>
            <input className="form-control" value={form.contactInfo} onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Admin Note</label>
            <textarea className="form-control" rows={2} value={form.adminNote} onChange={(e) => setForm({ ...form, adminNote: e.target.value })} placeholder="Internal note visible to the reporter…" />
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteLostFound(deleteId)}
        title="Delete Report"
        message="Are you sure you want to delete this report? This cannot be undone."
        confirmLabel="Delete Report"
        variant="danger"
      />
    </div>
  );
}
