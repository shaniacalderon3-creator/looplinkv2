import { useState, useEffect } from 'react';
import {
  collection, query, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';
import SearchBar from '../../components/shared/SearchBar';
import Modal from '../../components/shared/Modal';
import { ConfirmModal } from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';
import { SD_CATEGORIES } from '../../data/sharedDonated';

// ── Badge helpers ─────────────────────────────────────────────────────────────
const TYPE_CFG = {
  lend:   { label: '📦 Lend',   bg: 'var(--primary-light)', color: 'var(--primary)' },
  donate: { label: '🎁 Donate', bg: '#fdf2f2',              color: '#7c1c1c'        },
};
const STATUS_CFG = {
  available: { bg: 'var(--success-light)', color: 'var(--success)' },
  reserved:  { bg: 'var(--warning-light)', color: '#92400e'        },
  lent:      { bg: 'var(--primary-light)', color: 'var(--primary)' },
  given:     { bg: 'var(--gray-100)',      color: 'var(--gray-500)'},
};
const ALL_STATUSES = ['available', 'reserved', 'lent', 'given'];

function TypeBadge({ type }) {
  const c = TYPE_CFG[type] ?? TYPE_CFG.lend;
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'0.2rem 0.6rem', borderRadius:'999px', fontSize:'0.7rem', fontWeight:700, background:c.bg, color:c.color }}>{c.label}</span>;
}
function StatusBadge({ status }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.available;
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'0.2rem 0.6rem', borderRadius:'999px', fontSize:'0.7rem', fontWeight:700, background:c.bg, color:c.color, textTransform:'capitalize' }}>{status}</span>;
}

const EMPTY_FORM = {
  title: '', category: '', description: '',
  condition: 'Good', type: 'donate',
  imageUrl: '', pickupLocation: '', status: 'available', adminNote: '',
  ownerName: '',
};

export default function ManageSharedDonated() {
  const [listings,  setListings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [dbError,   setDbError]   = useState('');
  const [search,    setSearch]    = useState('');
  const [filterType,setFilterType]= useState('');
  const [filterStat,setFilterStat]= useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [editTarget,setEditTarget]= useState(null);
  const [deleteId,  setDeleteId]  = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState({});
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);

  // ── Live listener ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!db) {
      setDbError('Firestore is not initialised. Check your Firebase environment variables.');
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(
      query(collection(db, 'sharedItems')),
      (snap) => {
        const toMs = (ts) => ts?.toDate ? ts.toDate().getTime() : Number(ts) || 0;
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
        setListings(rows);
        setLoading(false);
        setDbError('');
      },
      (err) => {
        setDbError(`Failed to load listings: ${err.message}`);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = listings.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (l.title ?? '').toLowerCase().includes(q) || (l.ownerName ?? '').toLowerCase().includes(q);
    const matchType   = !filterType || l.type   === filterType;
    const matchStat   = !filterStat || l.status === filterStat;
    return matchSearch && matchType && matchStat;
  });

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = listings.filter((l) => l.status === s).length;
    return acc;
  }, { all: listings.length });

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM); setErrors({}); setFormError(''); setEditTarget(null); setShowForm(true);
  };
  const openEdit = (listing) => {
    setForm({
      title:          listing.title          ?? '',
      category:       listing.category       ?? '',
      description:    listing.description    ?? '',
      condition:      listing.condition      ?? 'Good',
      type:           listing.type           ?? 'donate',
      imageUrl:       listing.imageUrl       ?? '',
      pickupLocation: listing.pickupLocation ?? '',
      status:         listing.status         ?? 'available',
      adminNote:      listing.adminNote      ?? '',
      ownerName:      listing.ownerName      ?? '',
    });
    setErrors({}); setFormError(''); setEditTarget(listing); setShowForm(true);
  };

  const validate = () => {
    const e = {};
    if (!(form.title ?? '').trim())       e.title       = 'Name is required.';
    if (!form.category)                   e.category    = 'Category is required.';
    if (!(form.description ?? '').trim()) e.description = 'Description is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true); setFormError('');

    const payload = {
      title:          (form.title ?? '').trim(),
      description:    (form.description ?? '').trim(),
      category:       form.category   || '',
      condition:      form.condition  || 'Good',
      type:           form.type       || 'donate',
      imageUrl:       (form.imageUrl ?? '').trim(),
      pickupLocation: (form.pickupLocation ?? '').trim(),
      status:         form.status     || 'available',
      adminNote:      (form.adminNote ?? '').trim(),
      ownerName:      (form.ownerName ?? '').trim(),
    };

    try {
      if (editTarget) {
        await updateDoc(doc(db, 'sharedItems', editTarget.id), payload);
      } else {
        const fbUser = auth.currentUser;
        await addDoc(collection(db, 'sharedItems'), {
          ...payload,
          ownerId:   fbUser?.uid ?? '',
          createdAt: serverTimestamp(),
        });
      }
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Quick status ──────────────────────────────────────────────────────────────
  const quickStatus = async (listing, status) => {
    setDbError('');
    try {
      await updateDoc(doc(db, 'sharedItems', listing.id), { status });
    } catch (err) {
      setDbError(`Status update failed: ${err.message}`);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDbError('');
    try {
      await deleteDoc(doc(db, 'sharedItems', id));
    } catch (err) {
      setDbError(`Delete failed: ${err.message}`);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Shared & Donated"
        subtitle={loading ? 'Loading…' : `${listings.length} listings`}
        action={<Button onClick={openAdd}>+ Add Listing</Button>}
      />

      {dbError && (
        <div style={{ background:'var(--danger-light)', border:'1px solid var(--danger)', borderRadius:'var(--radius)', padding:'0.75rem 1rem', fontSize:'0.875rem', color:'var(--danger)', marginBottom:'1.25rem' }}>
          ⚠️ {dbError}
        </div>
      )}

      {/* Status filter chips */}
      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
        {[
          { key:'',          label:`All (${counts.all})`           },
          { key:'available', label:`Available (${counts.available})` },
          { key:'reserved',  label:`Reserved (${counts.reserved})`  },
          { key:'lent',      label:`Lent (${counts.lent})`          },
          { key:'given',     label:`Given (${counts.given})`         },
        ].map((t) => (
          <button key={t.key} onClick={() => setFilterStat(t.key)} style={{ padding:'0.35rem 0.875rem', borderRadius:'999px', cursor:'pointer', border:`1.5px solid ${filterStat===t.key?'var(--primary)':'var(--gray-200)'}`, background:filterStat===t.key?'var(--primary-light)':'#fff', color:filterStat===t.key?'var(--primary)':'var(--gray-600)', fontWeight:700, fontSize:'0.8rem' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + type filter */}
      <div style={{ marginBottom:'1.5rem' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by title or owner name…">
          <select className="form-control" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ width:'auto', minWidth:130, border:'none', boxShadow:'none', background:'transparent' }}>
            <option value="">All Types</option>
            <option value="donate">🎁 Donate</option>
            <option value="lend">📦 Lend</option>
          </select>
        </SearchBar>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--gray-400)' }}>Loading listings…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🎁" title="No listings found" description="Adjust the filters or add a listing." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Pickup Location</th>
                <th>Owner</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign:'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((listing) => {
                const dateStr = listing.createdAt?.toDate
                  ? listing.createdAt.toDate().toISOString().slice(0, 10)
                  : (typeof listing.createdAt === 'string' ? listing.createdAt.slice(0, 10) : '—');
                return (
                  <tr key={listing.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                        <div style={{ width:40, height:40, borderRadius:'var(--radius)', overflow:'hidden', background:'var(--gray-100)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem' }}>
                          {listing.imageUrl
                            ? <img src={listing.imageUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            : (listing.type === 'donate' ? '🎁' : '📦')}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--gray-800)' }}>{listing.title}</div>
                          {listing.adminNote && <div style={{ fontSize:'0.7rem', color:'var(--gray-400)', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>💬 {listing.adminNote}</div>}
                        </div>
                      </div>
                    </td>
                    <td><TypeBadge type={listing.type} /></td>
                    <td style={{ fontSize:'0.8125rem', color:'var(--gray-600)' }}>{listing.category}</td>
                    <td style={{ fontSize:'0.8125rem', color:'var(--gray-500)' }}>{listing.condition}</td>
                    <td style={{ fontSize:'0.8125rem', color:'var(--gray-500)', maxWidth:140 }}><span className="truncate" style={{ display:'block' }}>{listing.pickupLocation}</span></td>
                    <td style={{ fontSize:'0.8125rem' }}>{listing.ownerName ?? '—'}</td>
                    <td style={{ fontSize:'0.8125rem', color:'var(--gray-500)', whiteSpace:'nowrap' }}>{dateStr}</td>
                    <td><StatusBadge status={listing.status} /></td>
                    <td>
                      <div style={{ display:'flex', gap:'0.375rem', justifyContent:'flex-end', flexWrap:'wrap' }}>
                        {listing.status === 'available' && (
                          <Button size="sm" variant="secondary" onClick={() => quickStatus(listing, 'reserved')}>Reserve</Button>
                        )}
                        {listing.status === 'reserved' && (
                          <Button size="sm" variant="success" onClick={() => quickStatus(listing, listing.type === 'lend' ? 'lent' : 'given')}>Handed over</Button>
                        )}
                        {listing.status === 'lent' && (
                          <Button size="sm" variant="secondary" onClick={() => quickStatus(listing, 'available')}>Returned</Button>
                        )}
                        <Button size="sm" variant="outline"       onClick={() => openEdit(listing)}>Edit</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => setDeleteId(listing.id)}>Delete</Button>
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
      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={editTarget ? 'Edit Listing' : 'Add Listing'}
        footer={<><Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Listing'}</Button></>}>
        <form onSubmit={handleSubmit}>
          {formError && <div style={{ background:'var(--danger-light)', border:'1px solid var(--danger)', borderRadius:'var(--radius)', padding:'0.625rem 0.875rem', fontSize:'0.875rem', color:'var(--danger)', marginBottom:'1rem' }}>⚠️ {formError}</div>}

          {/* Type */}
          <div className="form-group">
            <label className="form-label">Type</label>
            <div style={{ display:'flex', gap:'0.625rem' }}>
              {['donate','lend'].map((t) => (
                <label key={t} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', padding:'0.5rem', borderRadius:'var(--radius)', cursor:'pointer', border:`1.5px solid ${form.type===t?'var(--primary)':'var(--gray-200)'}`, background:form.type===t?'var(--primary-light)':'var(--gray-50)', fontWeight:700, fontSize:'0.875rem', color:form.type===t?'var(--primary)':'var(--gray-600)' }}>
                  <input type="radio" name="type" value={t} checked={form.type===t} onChange={(e)=>setForm({...form,type:e.target.value})} style={{ display:'none' }} />
                  {t==='donate'?'🎁 Donate':'📦 Lend'}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-control" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="e.g. Mathematics Textbook" />
            {errors.title && <span style={{ color:'var(--danger)', fontSize:'0.8rem' }}>{errors.title}</span>}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>
                <option value="">Select category</option>
                {SD_CATEGORIES.map((c)=><option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span style={{ color:'var(--danger)', fontSize:'0.8rem' }}>{errors.category}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-control" value={form.condition} onChange={(e)=>setForm({...form,condition:e.target.value})}>
                {['Very Good','Good','Fair'].map((c)=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="Describe the item…" />
            {errors.description && <span style={{ color:'var(--danger)', fontSize:'0.8rem' }}>{errors.description}</span>}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}>
                {ALL_STATUSES.map((s)=><option key={s} value={s} style={{ textTransform:'capitalize' }}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Owner Name</label>
              <input className="form-control" value={form.ownerName} onChange={(e)=>setForm({...form,ownerName:e.target.value})} placeholder="Student name" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pickup Location</label>
            <input className="form-control" value={form.pickupLocation} onChange={(e)=>setForm({...form,pickupLocation:e.target.value})} placeholder="e.g. CAEc Building Lobby" />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (optional)</label>
            <input className="form-control" value={form.imageUrl} onChange={(e)=>setForm({...form,imageUrl:e.target.value})} placeholder="https://…" />
          </div>

          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Admin Note (visible to poster)</label>
            <textarea className="form-control" rows={2} value={form.adminNote} onChange={(e)=>setForm({...form,adminNote:e.target.value})} placeholder="Optional note…" />
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)}
        title="Delete Listing" message="Are you sure you want to delete this listing? This cannot be undone."
        confirmLabel="Delete Listing" variant="danger" />
    </div>
  );
}
