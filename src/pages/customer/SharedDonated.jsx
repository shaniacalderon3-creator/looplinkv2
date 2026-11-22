import { useState, useEffect } from 'react';
import {
  collection, query, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';
import SearchBar from '../../components/shared/SearchBar';
import EmptyState from '../../components/shared/EmptyState';
import Modal from '../../components/shared/Modal';
import { ConfirmModal } from '../../components/shared/Modal';
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

function TypeBadge({ type }) {
  const c = TYPE_CFG[type] ?? TYPE_CFG.lend;
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'0.2rem 0.65rem', borderRadius:'999px', fontSize:'0.75rem', fontWeight:700, background:c.bg, color:c.color }}>{c.label}</span>;
}
function StatusBadge({ status }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.available;
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'0.2rem 0.65rem', borderRadius:'999px', fontSize:'0.75rem', fontWeight:700, background:c.bg, color:c.color, textTransform:'capitalize' }}>{status}</span>;
}

const EMPTY_FORM = {
  title: '', category: '', description: '',
  condition: 'Good', type: 'donate',
  imageUrl: '', pickupLocation: '',
};

export default function SharedDonated() {
  const { customer: user } = useAuth();

  const [listings,  setListings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [dbError,   setDbError]   = useState('');
  const [tab,       setTab]       = useState('all'); // all | lend | donate | mine
  const [search,    setSearch]    = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [editTarget,setEditTarget]= useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState({});
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [detailItem,setDetailItem]= useState(null);
  const [deleteId,  setDeleteId]  = useState(null);

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
  const myUid = auth.currentUser?.uid ?? '';

  const filtered = listings.filter((l) => {
    const q  = search.toLowerCase();
    const matchSearch = !q || (l.title ?? '').toLowerCase().includes(q) || (l.description ?? '').toLowerCase().includes(q);
    const matchCat    = !filterCat || l.category === filterCat;
    const matchTab =
      tab === 'all'  ? true :
      tab === 'mine' ? l.ownerId === myUid :
      l.type === tab;
    return matchSearch && matchCat && matchTab;
  });

  const counts = {
    all:    listings.length,
    lend:   listings.filter((l) => l.type === 'lend').length,
    donate: listings.filter((l) => l.type === 'donate').length,
    mine:   listings.filter((l) => l.ownerId === myUid).length,
  };

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!(form.title ?? '').trim())          e.title          = 'Item name is required.';
    if (!form.category)                      e.category       = 'Please select a category.';
    if (!(form.description ?? '').trim())    e.description    = 'Description is required.';
    if (!(form.pickupLocation ?? '').trim()) e.pickupLocation = 'Pickup location is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit (add or edit) ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fbUser = auth.currentUser;
    if (!fbUser) { setFormError('Please log in to post a listing.'); return; }

    setSaving(true); setFormError('');
    const payload = {
      title:          form.title.trim(),
      description:    form.description.trim(),
      category:       form.category,
      condition:      form.condition || 'Good',
      type:           form.type,
      imageUrl:       (form.imageUrl ?? '').trim(),
      pickupLocation: form.pickupLocation.trim(),
    };

    try {
      if (editTarget) {
        await updateDoc(doc(db, 'sharedItems', editTarget.id), payload);
      } else {
        await addDoc(collection(db, 'sharedItems'), {
          ...payload,
          status:    'available',
          ownerId:   fbUser.uid,
          ownerName: fbUser.displayName || user?.name || fbUser.email || '',
          adminNote: '',
          createdAt: serverTimestamp(),
        });
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setErrors({});
      setEditTarget(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
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
    });
    setFormError('');
    setErrors({});
    setEditTarget(listing);
    setShowForm(true);
  };

  // ── Quick status change ─────────────────────────────────────────────────────
  const setStatus = async (listing, newStatus) => {
    setDbError('');
    try {
      await updateDoc(doc(db, 'sharedItems', listing.id), { status: newStatus });
    } catch (err) {
      setDbError(`Status update failed: ${err.message}`);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDbError('');
    try {
      await deleteDoc(doc(db, 'sharedItems', id));
    } catch (err) {
      setDbError(`Delete failed: ${err.message}`);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="page-content">
      <div className="container">
        <PageHeader
          title="Shared & Donated"
          subtitle="Browse items freely shared or donated by fellow students"
          action={<Button onClick={() => { setForm(EMPTY_FORM); setEditTarget(null); setFormError(''); setErrors({}); setShowForm(true); }}>+ Post an Item</Button>}
        />

        {dbError && (
          <div style={{ background:'var(--danger-light)', border:'1px solid var(--danger)', borderRadius:'var(--radius)', padding:'0.75rem 1rem', fontSize:'0.875rem', color:'var(--danger)', marginBottom:'1.25rem' }}>
            ⚠️ {dbError}
          </div>
        )}

        {/* Info strip */}
        <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {[
            { label:'All Listings', value:counts.all,    color:'var(--primary)' },
            { label:'📦 Lend',      value:counts.lend,   color:'var(--accent)'  },
            { label:'🎁 Donate',    value:counts.donate, color:'#7c1c1c'        },
          ].map((s) => (
            <div key={s.label} style={{ background:'#fff', border:'1px solid var(--gray-200)', borderRadius:'var(--radius)', padding:'0.625rem 1.25rem', display:'flex', alignItems:'center', gap:'0.625rem', boxShadow:'var(--shadow-sm)' }}>
              <span style={{ fontSize:'1.25rem', fontWeight:900, color:s.color }}>{s.value}</span>
              <span style={{ fontSize:'0.8125rem', fontWeight:600, color:'var(--gray-500)' }}>{s.label}</span>
            </div>
          ))}
          <div style={{ background:'var(--primary-light)', border:'1px solid var(--primary)', borderRadius:'var(--radius)', padding:'0.625rem 1rem', fontSize:'0.8rem', color:'var(--primary)', fontWeight:600, display:'flex', alignItems:'center', gap:'0.5rem', flex:1 }}>
            💡 <span>These items are <strong>FREE</strong> — no borrowing fee. Separate from the regular Borrow system.</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'0.25rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
          {['all','lend','donate','mine'].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:'0.45rem 1rem', borderRadius:'999px', border:`1.5px solid ${tab===t?'var(--primary)':'var(--gray-200)'}`, background:tab===t?'var(--primary-light)':'var(--white)', color:tab===t?'var(--primary)':'var(--gray-600)', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', textTransform:'capitalize' }}>
              {t === 'mine' ? `My Posts (${counts.mine})` : `${t.charAt(0).toUpperCase()+t.slice(1)} (${counts[t]})`}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ marginBottom:'1.5rem' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search listings…">
            <select className="form-control" value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ width:'auto', minWidth:160, border:'none', boxShadow:'none', background:'transparent' }}>
              <option value="">All Categories</option>
              {SD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </SearchBar>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'3rem', color:'var(--gray-400)' }}>Loading listings…</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🎁" title="No listings found" description="Try a different search, or be the first to post something!" />
        ) : (
          <div className="grid-3">
            {filtered.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                currentUid={myUid}
                onView={() => setDetailItem(listing)}
                onEdit={() => openEdit(listing)}
                onDelete={() => setDeleteId(listing.id)}
                onSetStatus={setStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailItem && (
        <Modal open onClose={() => setDetailItem(null)} title={detailItem.title}
          footer={<Button variant="secondary" onClick={() => setDetailItem(null)}>Close</Button>}>
          <DetailContent listing={detailItem} />
        </Modal>
      )}

      {/* Post / Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setErrors({}); setFormError(''); }}
        title={editTarget ? 'Edit Listing' : 'Post an Item'}
        footer={<>
          <Button variant="secondary" onClick={() => { setShowForm(false); setErrors({}); setFormError(''); }}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Post Item'}</Button>
        </>}
      >
        <PostForm form={form} setForm={setForm} errors={errors} formError={formError} onSubmit={handleSubmit} />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This cannot be undone."
        confirmLabel="Delete Listing"
        variant="danger"
      />
    </div>
  );
}

// ── Listing card ──────────────────────────────────────────────────────────────
function ListingCard({ listing, currentUid, onView, onEdit, onDelete, onSetStatus }) {
  const isOwner  = listing.ownerId === currentUid;
  const { type, status } = listing;

  const dateStr = listing.createdAt?.toDate
    ? listing.createdAt.toDate().toISOString().slice(0, 10)
    : (typeof listing.createdAt === 'string' ? listing.createdAt.slice(0, 10) : '');

  return (
    <div className="card" style={{ display:'flex', flexDirection:'column', borderTop:`3px solid ${type==='donate'?'#7c1c1c':'var(--primary)'}` }}>
      {listing.imageUrl ? (
        <div style={{ height:160, overflow:'hidden', background:'var(--gray-100)', flexShrink:0 }}>
          <img src={listing.imageUrl} alt={listing.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
      ) : (
        <div style={{ height:90, background:'var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem' }}>
          {type === 'donate' ? '🎁' : '📦'}
        </div>
      )}

      <div className="card-body" style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.35rem' }}>
        {/* Badges */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
          <TypeBadge type={type} />
          <StatusBadge status={status} />
          {isOwner && <span style={{ fontSize:'0.7rem', fontWeight:700, background:'var(--primary-light)', color:'var(--primary)', padding:'0.15rem 0.5rem', borderRadius:'999px' }}>Mine</span>}
        </div>

        <h3 style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--gray-800)', lineHeight:1.3 }}>{listing.title}</h3>

        <p style={{ fontSize:'0.8125rem', color:'var(--gray-500)', lineHeight:1.5, flex:1 }}>
          {(listing.description ?? '').length > 90 ? (listing.description ?? '').slice(0, 90) + '…' : (listing.description ?? '')}
        </p>

        <div style={{ fontSize:'0.8rem', color:'var(--gray-400)', display:'flex', flexDirection:'column', gap:'0.2rem', marginTop:'0.25rem' }}>
          <span>📂 {listing.category}</span>
          <span>🛠 {listing.condition}</span>
          <span>📍 {listing.pickupLocation}</span>
          <span>👤 {listing.ownerName}{dateStr ? ` · ${dateStr}` : ''}</span>
        </div>

        {/* FREE label + primary action */}
        <div style={{ marginTop:'0.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
          <span style={{ fontSize:'0.875rem', fontWeight:900, color:'var(--success)', background:'var(--success-light)', padding:'0.15rem 0.6rem', borderRadius:'999px' }}>FREE</span>
          <Button size="sm" variant="outline" onClick={onView}>View Details</Button>
        </div>

        {/* Owner controls */}
        {isOwner && (
          <div style={{ marginTop:'0.5rem', display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
            {status === 'available' && (
              <Button size="sm" variant="secondary" onClick={() => onSetStatus(listing, 'reserved')}>Reserve</Button>
            )}
            {status === 'reserved' && (
              <Button size="sm" variant="success" onClick={() => onSetStatus(listing, type === 'lend' ? 'lent' : 'given')}>
                Mark as handed over
              </Button>
            )}
            {status === 'lent' && (
              <Button size="sm" variant="secondary" onClick={() => onSetStatus(listing, 'available')}>Mark as returned</Button>
            )}
            <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
            <Button size="sm" variant="outline-danger" onClick={onDelete}>Delete</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Detail modal content ──────────────────────────────────────────────────────
function DetailContent({ listing }) {
  const dateStr = listing.createdAt?.toDate
    ? listing.createdAt.toDate().toISOString().slice(0, 10)
    : (typeof listing.createdAt === 'string' ? listing.createdAt.slice(0, 10) : '');

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      {listing.imageUrl && (
        <div style={{ borderRadius:'var(--radius)', overflow:'hidden', maxHeight:240, background:'var(--gray-100)' }}>
          <img src={listing.imageUrl} alt={listing.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
      )}
      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
        <TypeBadge type={listing.type} />
        <StatusBadge status={listing.status} />
        <span style={{ fontSize:'0.75rem', fontWeight:900, color:'var(--success)', background:'var(--success-light)', padding:'0.2rem 0.65rem', borderRadius:'999px' }}>FREE</span>
      </div>
      <p style={{ color:'var(--gray-600)', lineHeight:1.75, fontSize:'0.9375rem' }}>{listing.description}</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.625rem' }}>
        {[
          { label:'Category',        value: listing.category       },
          { label:'Condition',       value: listing.condition      },
          { label:'Posted by',       value: listing.ownerName      },
          { label:'Date',            value: dateStr                },
          { label:'Pickup Location', value: listing.pickupLocation },
        ].filter(d => d.value).map(({ label, value }) => (
          <div key={label} style={{ background:'var(--gray-50)', border:'1px solid var(--gray-200)', borderRadius:'var(--radius)', padding:'0.625rem 0.875rem' }}>
            <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.15rem' }}>{label}</p>
            <p style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--gray-700)' }}>{value}</p>
          </div>
        ))}
      </div>
      {listing.adminNote && (
        <div style={{ background:'var(--gray-50)', border:'1px solid var(--gray-200)', borderRadius:'var(--radius)', padding:'0.625rem 0.875rem', fontSize:'0.875rem', color:'var(--gray-600)' }}>
          💬 <strong>Admin note:</strong> {listing.adminNote}
        </div>
      )}
    </div>
  );
}

// ── Post / edit form ──────────────────────────────────────────────────────────
function PostForm({ form, setForm, errors, formError, onSubmit }) {
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={onSubmit}>
      {formError && (
        <div style={{ background:'var(--danger-light)', border:'1px solid var(--danger)', borderRadius:'var(--radius)', padding:'0.625rem 0.875rem', fontSize:'0.875rem', color:'var(--danger)', marginBottom:'1rem' }}>
          ⚠️ {formError}
        </div>
      )}

      {/* Type toggle */}
      <div className="form-group">
        <label className="form-label">Type *</label>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          {[
            { value:'donate', label:'🎁 Donate', hint:'Give it away permanently — FREE' },
            { value:'lend',   label:'📦 Lend',   hint:'Let others use it temporarily — FREE' },
          ].map((t) => (
            <label key={t.value} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.2rem', padding:'0.6rem 0.5rem', borderRadius:'var(--radius)', border:`1.5px solid ${form.type===t.value?'var(--primary)':'var(--gray-200)'}`, background:form.type===t.value?'var(--primary-light)':'var(--gray-50)', cursor:'pointer', textAlign:'center' }}>
              <input type="radio" name="sd-type" value={t.value} checked={form.type===t.value} onChange={(e)=>set('type',e.target.value)} style={{ display:'none' }} />
              <span style={{ fontWeight:700, fontSize:'0.9rem', color:form.type===t.value?'var(--primary)':'var(--gray-600)' }}>{t.label}</span>
              <span style={{ fontSize:'0.7rem', color:'var(--gray-400)' }}>{t.hint}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Item Name *</label>
        <input className="form-control" value={form.title} onChange={(e)=>set('title',e.target.value)} placeholder="e.g. Mathematics Textbook" />
        {errors.title && <span style={{ color:'var(--danger)', fontSize:'0.8rem' }}>{errors.title}</span>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select className="form-control" value={form.category} onChange={(e)=>set('category',e.target.value)}>
            <option value="">Select category</option>
            {SD_CATEGORIES.map((c)=><option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <span style={{ color:'var(--danger)', fontSize:'0.8rem' }}>{errors.category}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Condition</label>
          <select className="form-control" value={form.condition} onChange={(e)=>set('condition',e.target.value)}>
            {['Very Good','Good','Fair'].map((c)=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea className="form-control" rows={3} placeholder="Describe the item…" value={form.description} onChange={(e)=>set('description',e.target.value)} />
        {errors.description && <span style={{ color:'var(--danger)', fontSize:'0.8rem' }}>{errors.description}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Pickup Location *</label>
        <input className="form-control" value={form.pickupLocation} onChange={(e)=>set('pickupLocation',e.target.value)} placeholder="e.g. CAEc Building Lobby" />
        {errors.pickupLocation && <span style={{ color:'var(--danger)', fontSize:'0.8rem' }}>{errors.pickupLocation}</span>}
      </div>

      <div className="form-group" style={{ marginBottom:0 }}>
        <label className="form-label">Image URL (optional)</label>
        <input className="form-control" value={form.imageUrl} onChange={(e)=>set('imageUrl',e.target.value)} placeholder="https://…" />
      </div>

      <div style={{ marginTop:'1rem', padding:'0.6rem 0.875rem', background:'var(--success-light)', border:'1px solid var(--success)', borderRadius:'var(--radius)', fontSize:'0.8125rem', color:'#065f46' }}>
        ✅ Shared / Donated items are always <strong>FREE</strong>. No borrowing fee.
      </div>
    </form>
  );
}
