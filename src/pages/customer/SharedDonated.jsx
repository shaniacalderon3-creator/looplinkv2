import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';
import SearchBar from '../../components/shared/SearchBar';
import EmptyState from '../../components/shared/EmptyState';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { SD_CATEGORIES } from '../../data/sharedDonated';

// ── Status badge variants for SD-specific statuses ───────────────────────────
const SD_STATUS_COLORS = {
  pending:   { bg: 'var(--warning-light)',  color: '#92400e'         },
  approved:  { bg: 'var(--info-light)',     color: 'var(--info)'     },
  available: { bg: 'var(--success-light)',  color: 'var(--success)'  },
  claimed:   { bg: 'var(--primary-light)',  color: 'var(--primary)'  },
  completed: { bg: 'var(--gray-100)',       color: 'var(--gray-500)' },
  rejected:  { bg: 'var(--danger-light)',   color: 'var(--danger)'   },
};

function SDBadge({ type }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.65rem', borderRadius: '999px',
      fontSize: '0.75rem', fontWeight: 700,
      background: type === 'donated' ? '#fdf2f2' : 'var(--primary-light)',
      color:      type === 'donated' ? '#7c1c1c' : 'var(--primary)',
    }}>
      {type === 'donated' ? '🎁 Donated' : '📦 Shared'}
    </span>
  );
}

function SDStatusBadge({ status }) {
  const cfg = SD_STATUS_COLORS[status] ?? SD_STATUS_COLORS.available;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.2rem 0.65rem', borderRadius: '999px',
      fontSize: '0.75rem', fontWeight: 700,
      background: cfg.bg, color: cfg.color,
      textTransform: 'capitalize',
    }}>
      {status}
    </span>
  );
}

const EMPTY_FORM = {
  name: '', category: '', description: '',
  condition: 'Good', type: 'donated',
  image: '', contactMethod: '',
};

// Only show listings that are approved/available to students
const VISIBLE_STATUSES = ['approved', 'available', 'claimed', 'completed'];

export default function SharedDonated() {
  const { sharedDonated, addSharedDonated } = useApp();
  const { customer: user } = useAuth();

  const [search,    setSearch]    = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterType,setFilterType]= useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState({});
  const [detailItem,setDetailItem]= useState(null);

  // Students only see admin-approved listings (not pending/rejected)
  const visible = sharedDonated.filter((l) => VISIBLE_STATUSES.includes(l.status));

  const filtered = visible.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
    const matchCat    = !filterCat  || l.category === filterCat;
    const matchType   = !filterType || l.type === filterType;
    return matchSearch && matchCat && matchType;
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name          = 'Item name is required.';
    if (!form.category)             e.category      = 'Please select a category.';
    if (!form.description.trim())   e.description   = 'Description is required.';
    if (!form.contactMethod.trim()) e.contactMethod = 'Contact method is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addSharedDonated({
      ...form,
      postedById: user?.id ?? '',
      postedBy:   user?.name ?? 'Anonymous',
    });
    setShowForm(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const counts = {
    all:     visible.length,
    donated: visible.filter((l) => l.type === 'donated').length,
    shared:  visible.filter((l) => l.type === 'shared').length,
  };

  return (
    <div className="page-content">
      <div className="container">
        <PageHeader
          title="Shared & Donated"
          subtitle="Browse items freely shared or donated by fellow students"
          action={
            <Button onClick={() => setShowForm(true)}>
              + Share or Donate an Item
            </Button>
          }
        />

        {/* Info strip */}
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem',
        }}>
          {[
            { label: 'All Listings', value: counts.all,     color: 'var(--primary)' },
            { label: '🎁 Donated',    value: counts.donated, color: '#7c1c1c'        },
            { label: '📦 Shared',     value: counts.shared,  color: 'var(--accent)'  },
          ].map((s) => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius)', padding: '0.625rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-500)' }}>{s.label}</span>
            </div>
          ))}

          {/* Distinction note */}
          <div style={{
            background: 'var(--primary-light)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius)', padding: '0.625rem 1rem',
            fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1,
          }}>
            💡 <span>These items are <strong>FREE</strong> — no borrowing fee. Separate from the regular Borrow system.</span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '1.5rem' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search shared or donated items…">
            <select
              className="form-control"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              style={{ width: 'auto', minWidth: 160, border: 'none', boxShadow: 'none', background: 'transparent' }}
            >
              <option value="">All Categories</option>
              {SD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
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

        {/* Cards */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="🎁"
            title="No listings found"
            description="Try a different search, or be the first to share something!"
          />
        ) : (
          <div className="grid-3">
            {filtered.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onView={() => setDetailItem(listing)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {detailItem && (
        <Modal
          open
          onClose={() => setDetailItem(null)}
          title={detailItem.name}
          footer={
            <Button variant="secondary" onClick={() => setDetailItem(null)}>Close</Button>
          }
        >
          <DetailContent listing={detailItem} />
        </Modal>
      )}

      {/* ── Submit Form Modal ── */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setErrors({}); }}
        title="Share or Donate an Item"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit Listing</Button>
          </>
        }
      >
        <SubmitForm form={form} setForm={setForm} errors={errors} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}

// ── Listing card ──────────────────────────────────────────────────────────────
function ListingCard({ listing, onView }) {
  const isFree    = listing.type === 'donated';
  const statusCfg = SD_STATUS_COLORS[listing.status] ?? SD_STATUS_COLORS.available;
  const isUnavailable = ['claimed', 'completed'].includes(listing.status);

  return (
    <div
      className="card"
      style={{
        display: 'flex', flexDirection: 'column', opacity: isUnavailable ? 0.72 : 1,
        borderTop: `3px solid ${isFree ? '#7c1c1c' : 'var(--primary)'}`,
      }}
    >
      {/* Image */}
      {listing.image && (
        <div style={{ height: 160, overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0 }}>
          <img src={listing.image} alt={listing.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      {!listing.image && (
        <div style={{ height: 100, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
          {isFree ? '🎁' : '📦'}
        </div>
      )}

      <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {/* Type + status row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <SDBadge type={listing.type} />
          <SDStatusBadge status={listing.status} />
        </div>

        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--gray-800)', lineHeight: 1.3 }}>
          {listing.name}
        </h3>

        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', lineHeight: 1.5, flex: 1 }}>
          {listing.description.length > 90 ? listing.description.slice(0, 90) + '…' : listing.description}
        </p>

        {/* Meta */}
        <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.25rem' }}>
          <span>📂 {listing.category}</span>
          <span>🛠 {listing.condition}</span>
          <span>👤 {listing.postedBy} · {listing.datePosted}</span>
        </div>

        {/* FREE label */}
        <div style={{
          marginTop: '0.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
        }}>
          <span style={{
            fontSize: '0.875rem', fontWeight: 900,
            color: 'var(--success)', background: 'var(--success-light)',
            padding: '0.15rem 0.6rem', borderRadius: '999px',
          }}>
            FREE
          </span>
          <Button
            size="sm"
            variant={isUnavailable ? 'secondary' : (isFree ? 'primary' : 'outline')}
            disabled={isUnavailable}
            onClick={onView}
            style={!isUnavailable && isFree ? { background: 'linear-gradient(135deg,#7c1c1c,#b8860b)', border: 'none' } : {}}
          >
            {isUnavailable
              ? (listing.status === 'claimed' ? 'Claimed' : 'Completed')
              : isFree ? '🎁 Request Item' : '📦 Request to Share'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Detail content (inside modal) ─────────────────────────────────────────────
function DetailContent({ listing }) {
  const isFree = listing.type === 'donated';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {listing.image && (
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', maxHeight: 240, background: 'var(--gray-100)' }}>
          <img src={listing.image} alt={listing.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <SDBadge type={listing.type} />
        <SDStatusBadge status={listing.status} />
        <span style={{
          fontSize: '0.75rem', fontWeight: 900,
          color: 'var(--success)', background: 'var(--success-light)',
          padding: '0.2rem 0.65rem', borderRadius: '999px',
        }}>FREE</span>
      </div>

      <p style={{ color: 'var(--gray-600)', lineHeight: 1.75, fontSize: '0.9375rem' }}>
        {listing.description}
      </p>

      {/* Detail grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
        {[
          { label: 'Category',  value: listing.category   },
          { label: 'Condition', value: listing.condition  },
          { label: 'Posted by', value: listing.postedBy   },
          { label: 'Date',      value: listing.datePosted },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '0.625rem 0.875rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>{label}</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-700)' }}>{value}</p>
          </div>
        ))}
      </div>

      {listing.contactMethod && (
        <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem' }}>
            📬 How to {isFree ? 'request this item' : 'use this shared item'}
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', fontWeight: 600 }}>{listing.contactMethod}</p>
        </div>
      )}

      {listing.adminNote && (
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '0.625rem 0.875rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          💬 <strong>Admin note:</strong> {listing.adminNote}
        </div>
      )}
    </div>
  );
}

// ── Submit form ───────────────────────────────────────────────────────────────
function SubmitForm({ form, setForm, errors, onSubmit }) {
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit}>
      {/* Type toggle */}
      <div className="form-group">
        <label className="form-label">Type *</label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[
            { value: 'donated', label: '🎁 Donate', hint: 'Give it away permanently — FREE' },
            { value: 'shared',  label: '📦 Share',  hint: 'Let others use it temporarily — FREE' },
          ].map((t) => (
            <label key={t.value} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
              padding: '0.6rem 0.5rem', borderRadius: 'var(--radius)',
              border: `1.5px solid ${form.type === t.value ? 'var(--primary)' : 'var(--gray-200)'}`,
              background: form.type === t.value ? 'var(--primary-light)' : 'var(--gray-50)',
              cursor: 'pointer', textAlign: 'center',
            }}>
              <input type="radio" name="sd-type" value={t.value} checked={form.type === t.value}
                onChange={(e) => set('type', e.target.value)} style={{ display: 'none' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: form.type === t.value ? 'var(--primary)' : 'var(--gray-600)' }}>
                {t.label}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{t.hint}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Item Name *</label>
        <input className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Mathematics Textbook" />
        {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.name}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select className="form-control" value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">Select category</option>
            {SD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.category}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Condition</label>
          <select className="form-control" value={form.condition} onChange={(e) => set('condition', e.target.value)}>
            {['Very Good', 'Good', 'Fair'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea className="form-control" rows={3}
          placeholder="Describe the item — what it is, its current state, any details a student should know…"
          value={form.description} onChange={(e) => set('description', e.target.value)} />
        {errors.description && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.description}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Image URL (optional)</label>
        <input className="form-control" value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://…" />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Contact / How to Request *</label>
        <input className="form-control" value={form.contactMethod}
          onChange={(e) => set('contactMethod', e.target.value)}
          placeholder="e.g. your email, room number, or message method" />
        {errors.contactMethod && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.contactMethod}</span>}
      </div>

      {/* No-fee notice */}
      <div style={{
        marginTop: '1rem', padding: '0.6rem 0.875rem',
        background: 'var(--success-light)', border: '1px solid var(--success)',
        borderRadius: 'var(--radius)', fontSize: '0.8125rem', color: '#065f46',
      }}>
        ✅ Shared / Donated items are always <strong>FREE</strong>. No borrowing fee will be added.
      </div>
    </form>
  );
}
