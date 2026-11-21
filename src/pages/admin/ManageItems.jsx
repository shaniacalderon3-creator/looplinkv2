import { useState, useEffect } from 'react';
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import SearchBar from '../../components/shared/SearchBar';
import Modal from '../../components/shared/Modal';
import { ConfirmModal } from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';
import { CATEGORIES } from '../../data/items';
import { formatPrice } from '../../utils/formatPrice';

// ── Firestore ↔ app shape ─────────────────────────────────────────────────────
function docToItem(d) {
  const r = d.data();
  return {
    id:          d.id,
    name:        r.title        ?? '',
    category:    r.category     ?? '',
    description: r.description  ?? '',
    location:    r.location     ?? '',
    condition:   r.condition    ?? 'Good',
    borrowingFee:Number(r.borrowingFee) || 0,
    availability:r.status       ?? 'available',
    image:       r.imageUrl     ?? '',
    borrowPeriod:r.borrowPeriod ?? 7,
    tags:        r.tags         ?? [],
    createdAt:   r.createdAt?.toDate?.().toISOString().slice(0, 10) ?? '',
  };
}

const EMPTY_FORM = {
  name: '', category: '', description: '', image: '',
  availability: 'available', condition: 'Good', location: '',
  borrowPeriod: 7, borrowingFee: 0, tags: '',
};

export default function ManageItems() {
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [dbError,     setDbError]     = useState('');
  const [search,      setSearch]      = useState('');
  const [filterCat,   setFilterCat]   = useState('');
  const [filterAvail, setFilterAvail] = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [errors,      setErrors]      = useState({});
  const [saving,      setSaving]      = useState(false);
  const [formError,   setFormError]   = useState(''); // error shown inside the modal

  // ── Live listener ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!db) {
      setDbError('Firestore is not initialised. Check your Firebase environment variables.');
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => { setItems(snap.docs.map(docToItem)); setLoading(false); setDbError(''); },
      (err)  => { setDbError(`Failed to load items: ${err.message}`); setLoading(false); },
    );
    return () => unsub();
  }, []);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    const matchCat    = !filterCat   || item.category    === filterCat;
    const matchAvail  = !filterAvail || item.availability === filterAvail;
    return matchSearch && matchCat && matchAvail;
  });

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM); setErrors({}); setFormError(''); setEditTarget(null); setShowForm(true);
  };
  const openEdit = (item) => {
    setForm({ ...item, borrowingFee: item.borrowingFee ?? 0, tags: item.tags?.join(', ') ?? '' });
    setErrors({}); setFormError(''); setEditTarget(item); setShowForm(true);
  };
  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = 'Name is required.';
    if (!form.category)           e.category    = 'Category is required.';
    if (!form.location.trim())    e.location    = 'Location is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true); setFormError('');

    // Build the payload with explicit fallbacks — never send undefined to Firestore
    const payload = {
      title:        (form.name        || '').trim(),
      description:  (form.description || '').trim(),
      category:     form.category     || '',
      location:     (form.location    || '').trim(),
      condition:    form.condition    || 'Good',
      status:       form.availability || 'available',
      imageUrl:     (form.image       || '').trim(),
      borrowingFee: Number(form.borrowingFee) || 0,
      borrowPeriod: Number(form.borrowPeriod) || 7,
      tags: typeof form.tags === 'string'
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : (Array.isArray(form.tags) ? form.tags : []),
    };

    try {
      if (editTarget) {
        await updateDoc(doc(db, 'items', editTarget.id), payload);
      } else {
        await addDoc(collection(db, 'items'), { ...payload, createdAt: serverTimestamp() });
      }
      setShowForm(false);
    } catch (err) {
      // Show the real Firestore error inside the modal — the form stays open
      setFormError(err.message || 'Save failed. Check your Firestore security rules.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDbError('');
    try {
      await deleteDoc(doc(db, 'items', id));
    } catch (err) {
      setDbError(err.message);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Manage Items"
        subtitle={loading ? 'Loading…' : `${items.length} items total`}
        action={<Button onClick={openAdd}>+ Add Item</Button>}
      />

      {dbError && (
        <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--danger)', marginBottom: '1.25rem' }}>
          ⚠️ {dbError}
        </div>
      )}

      {/* Search + filters */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search items…">
          <select className="form-control" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            style={{ width: 'auto', minWidth: 150, border: 'none', boxShadow: 'none', background: 'transparent' }}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-control" value={filterAvail} onChange={(e) => setFilterAvail(e.target.value)}
            style={{ width: 'auto', minWidth: 140, border: 'none', boxShadow: 'none', background: 'transparent' }}>
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </SearchBar>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📦" title="No items found" description="Add an item or adjust your filters." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Item</th><th>Category</th><th>Location</th>
                <th>Condition</th><th>Fee</th><th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0 }}>
                        {item.image
                          ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📦</div>}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{item.category}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{item.location}</td>
                  <td style={{ fontSize: '0.875rem' }}>{item.condition}</td>
                  <td>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: (!item.borrowingFee || item.borrowingFee <= 0) ? 'var(--success)' : '#7c1c1c' }}>
                      {formatPrice(item.borrowingFee)}
                    </span>
                  </td>
                  <td><StatusBadge status={item.availability} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Edit</Button>
                      <Button size="sm" variant="outline-danger" onClick={() => setDeleteId(item.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setFormError(''); }}
        title={editTarget ? 'Edit Item' : 'Add New Item'}
        footer={<>
          <Button variant="secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Item'}</Button>
        </>}>
        <form onSubmit={handleSubmit}>
          {/* Firestore error banner — shown inside the modal so it's visible */}
          {formError && (
            <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', padding: '0.625rem 0.875rem', fontSize: '0.875rem', color: 'var(--danger)', marginBottom: '1rem' }}>
              ⚠️ {formError}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Canon DSLR Camera" />
            {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.name}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.category}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-control" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                {['Very Good', 'Good', 'Fair'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Library — Room 104" />
            {errors.location && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.location}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the item…" />
            {errors.description && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.description}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Availability</label>
              <select className="form-control" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Max Borrow Period (days)</label>
              <input type="number" className="form-control" min={1} max={30} value={form.borrowPeriod} onChange={(e) => setForm({ ...form, borrowPeriod: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Borrowing Fee (₱) — enter 0 for Free</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--gray-500)', fontSize: '0.9375rem', pointerEvents: 'none' }}>₱</span>
              <input type="number" className="form-control" min={0} step={1} value={form.borrowingFee} onChange={(e) => setForm({ ...form, borrowingFee: e.target.value })} style={{ paddingLeft: '1.75rem' }} placeholder="0" />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.25rem', display: 'block' }}>Set to 0 to mark as <strong>Free</strong>.</span>
          </div>
          <div className="form-group">
            <label className="form-label">Image URL (optional)</label>
            <input className="form-control" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tags (comma-separated)</label>
            <input className="form-control" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g. math, engineering, science" />
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)}
        title="Delete Item" message="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete Item" variant="danger" />
    </div>
  );
}
