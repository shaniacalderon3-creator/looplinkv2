import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';
import SearchBar from '../../components/shared/SearchBar';
import Modal from '../../components/shared/Modal';
import { ConfirmModal } from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';
import { SD_CATEGORIES } from '../../data/sharedDonated';

// ── Shared status / type helpers ─────────────────────────────────────────────
const SD_STATUSES = ['pending', 'approved', 'available', 'claimed', 'completed', 'rejected'];

const STATUS_STYLES = {
  pending:   { bg: '#fef3c7', color: '#92400e'         },
  approved:  { bg: 'var(--info-light)',    color: 'var(--info)'     },
  available: { bg: 'var(--success-light)', color: 'var(--success)'  },
  claimed:   { bg: 'var(--primary-light)', color: 'var(--primary)'  },
  completed: { bg: 'var(--gray-100)',      color: 'var(--gray-500)' },
  rejected:  { bg: 'var(--danger-light)',  color: 'var(--danger)'   },
};

function SDBadge({ type }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.6rem', borderRadius: '999px',
      fontSize: '0.7rem', fontWeight: 700,
      background: type === 'donated' ? '#fdf2f2' : 'var(--primary-light)',
      color:      type === 'donated' ? '#7c1c1c' : 'var(--primary)',
    }}>
      {type === 'donated' ? '🎁 Donated' : '📦 Shared'}
    </span>
  );
}

function SDStatusBadge({ status }) {
  const cfg = STATUS_STYLES[status] ?? STATUS_STYLES.available;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.2rem 0.6rem', borderRadius: '999px',
      fontSize: '0.7rem', fontWeight: 700,
      background: cfg.bg, color: cfg.color,
      textTransform: 'capitalize',
    }}>
      {status}
    </span>
  );
}

// ── Empty form for add / edit ─────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', category: '', description: '',
  condition: 'Good', type: 'donated', status: 'pending',
  image: '', contactMethod: '', postedBy: '', adminNote: '',
};

export default function ManageSharedDonated() {
  const { sharedDonated, addSharedDonated, updateSharedDonated, deleteSharedDonated } = useApp();

  const [search,     setSearch]     = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStat, setFilterStat] = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});

  // Filtered list
  const filtered = sharedDonated.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.postedBy?.toLowerCase().includes(q);
    const matchType   = !filterType || l.type === filterType;
    const matchStat   = !filterStat || l.status === filterStat;
    return matchSearch && matchType && matchStat;
  });

  // Tab counts
  const tabCounts = SD_STATUSES.reduce((acc, s) => {
    acc[s] = sharedDonated.filter((l) => l.status === s).length;
    return acc;
  }, { all: sharedDonated.length });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (listing) => {
    setForm({ ...listing });
    setErrors({});
    setEditTarget(listing);
    setShowForm(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name     = 'Name is required.';
    if (!form.category)           e.category = 'Category is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (editTarget) {
      updateSharedDonated({ ...editTarget, ...form });
    } else {
      addSharedDonated({ ...form, postedById: 'admin1' });
    }
    setShowForm(false);
  };

  // Quick status change without opening full edit form
  const quickStatus = (listing, status) => {
    updateSharedDonated({ ...listing, status });
  };

  return (
    <div>
      <PageHeader
        title="Shared & Donated"
        subtitle={`${sharedDonated.filter(l => l.status === 'pending').length} pending review`}
        action={<Button onClick={openAdd}>+ Add Listing</Button>}
      />

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {[
          { key: '',         label: `All (${tabCounts.all})` },
          { key: 'pending',  label: `Pending (${tabCounts.pending})` },
          { key: 'approved', label: `Approved (${tabCounts.approved})` },
          { key: 'available',label: `Available (${tabCounts.available})` },
          { key: 'claimed',  label: `Claimed (${tabCounts.claimed})` },
          { key: 'completed',label: `Completed (${tabCounts.completed})` },
          { key: 'rejected', label: `Rejected (${tabCounts.rejected})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilterStat(t.key)}
            style={{
              padding: '0.35rem 0.875rem', borderRadius: '999px', cursor: 'pointer',
              border: `1.5px solid ${filterStat === t.key ? 'var(--primary)' : 'var(--gray-200)'}`,
              background: filterStat === t.key ? 'var(--primary-light)' : '#fff',
              color: filterStat === t.key ? 'var(--primary)' : 'var(--gray-600)',
              fontWeight: 700, fontSize: '0.8rem',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + type filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or posted by…">
          <select
            className="form-control"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: 'auto', minWidth: 130, border: 'none', boxShadow: 'none', background: 'transparent' }}
          >
            <option value="">All Types</option>
            <option value="donated">🎁 Donated</option>
            <option value="shared">📦 Shared</option>
          </select>
        </SearchBar>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon="🎁" title="No listings found" description="Adjust the filters or add a listing." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Posted By</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((listing) => (
                <tr key={listing.id}>
                  {/* Item */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--radius)',
                        overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                      }}>
                        {listing.image
                          ? <img src={listing.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : (listing.type === 'donated' ? '🎁' : '📦')
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>
                          {listing.name}
                        </div>
                        {listing.adminNote && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            💬 {listing.adminNote}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td><SDBadge type={listing.type} /></td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>{listing.category}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{listing.condition}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{listing.postedBy ?? '—'}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{listing.datePosted}</td>
                  <td><SDStatusBadge status={listing.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {/* Quick-action buttons based on current status */}
                      {listing.status === 'pending' && (
                        <>
                          <Button size="sm" variant="success"       onClick={() => quickStatus(listing, 'approved')}>Approve</Button>
                          <Button size="sm" variant="outline-danger" onClick={() => quickStatus(listing, 'rejected')}>Reject</Button>
                        </>
                      )}
                      {listing.status === 'approved' && (
                        <Button size="sm" variant="success" onClick={() => quickStatus(listing, 'available')}>Mark Available</Button>
                      )}
                      {listing.status === 'available' && (
                        <Button size="sm" variant="secondary" onClick={() => quickStatus(listing, 'claimed')}>Mark Claimed</Button>
                      )}
                      {listing.status === 'claimed' && (
                        <Button size="sm" variant="secondary" onClick={() => quickStatus(listing, 'completed')}>Complete</Button>
                      )}
                      {listing.status === 'rejected' && (
                        <Button size="sm" variant="ghost" style={{ color: 'var(--warning)' }} onClick={() => quickStatus(listing, 'pending')}>Re-open</Button>
                      )}
                      <Button size="sm" variant="outline"       onClick={() => openEdit(listing)}>Edit</Button>
                      <Button size="sm" variant="outline-danger" onClick={() => setDeleteId(listing.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? 'Edit Listing' : 'Add Listing'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editTarget ? 'Save Changes' : 'Add Listing'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div className="form-group">
            <label className="form-label">Type</label>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {['donated', 'shared'].map((t) => (
                <label key={t} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  padding: '0.5rem', borderRadius: 'var(--radius)', cursor: 'pointer',
                  border: `1.5px solid ${form.type === t ? 'var(--primary)' : 'var(--gray-200)'}`,
                  background: form.type === t ? 'var(--primary-light)' : 'var(--gray-50)',
                  fontWeight: 700, fontSize: '0.875rem',
                  color: form.type === t ? 'var(--primary)' : 'var(--gray-600)',
                }}>
                  <input type="radio" name="type" value={t} checked={form.type === t}
                    onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ display: 'none' }} />
                  {t === 'donated' ? '🎁 Donated' : '📦 Shared'}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input className="form-control" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mathematics Textbook" />
            {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {SD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.category}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-control" value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                {['Very Good', 'Good', 'Fair'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-control" rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the item…" />
            {errors.description && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.description}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {SD_STATUSES.map((s) => (
                  <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Posted By</label>
              <input className="form-control" value={form.postedBy}
                onChange={(e) => setForm({ ...form, postedBy: e.target.value })}
                placeholder="Student name" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contact / Request Method</label>
            <input className="form-control" value={form.contactMethod}
              onChange={(e) => setForm({ ...form, contactMethod: e.target.value })}
              placeholder="e.g. email or room number" />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (optional)</label>
            <input className="form-control" value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://…" />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Admin Note (visible to student)</label>
            <textarea className="form-control" rows={2} value={form.adminNote}
              onChange={(e) => setForm({ ...form, adminNote: e.target.value })}
              placeholder="Optional note for the submitter…" />
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm ── */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteSharedDonated(deleteId)}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This cannot be undone."
        confirmLabel="Delete Listing"
        variant="danger"
      />
    </div>
  );
}
