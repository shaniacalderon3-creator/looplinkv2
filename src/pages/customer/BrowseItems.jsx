import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import SearchBar from '../../components/shared/SearchBar';
import StatusBadge from '../../components/shared/StatusBadge';
import PageHeader from '../../components/shared/PageHeader';
import EmptyState from '../../components/shared/EmptyState';
import { CATEGORIES } from '../../data/items';
import { formatPrice } from '../../utils/formatPrice';

export default function BrowseItems() {
  const { items } = useApp();
  const navigate  = useNavigate();

  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [avail,    setAvail]    = useState('');

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags?.some((t) => t.toLowerCase().includes(q));
    const matchCat   = !category || item.category === category;
    const matchAvail = !avail    || item.availability === avail;
    return matchSearch && matchCat && matchAvail;
  });

  return (
    <div className="page-content">
      <div className="container">
        <PageHeader
          title="Browse Items"
          subtitle={`${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`}
        />

        {/* Filters */}
        <div style={{ marginBottom: '1.75rem' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search items, categories, tags…">
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: 'auto', minWidth: 160, borderColor: 'transparent', boxShadow: 'none', background: 'transparent' }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              className="form-control"
              value={avail}
              onChange={(e) => setAvail(e.target.value)}
              style={{ width: 'auto', minWidth: 140, borderColor: 'transparent', boxShadow: 'none', background: 'transparent' }}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="borrowed">Borrowed</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </SearchBar>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Chip label="All" active={!category} onClick={() => setCategory('')} />
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c === category ? '' : c)} />
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState icon="🔎" title="No items match your search" description="Try different keywords or remove some filters." />
        ) : (
          <div className="grid-4">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} onClick={() => navigate(`/items/${item.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.35rem 0.875rem',
        borderRadius: '999px',
        border: `1.5px solid ${active ? 'var(--primary)' : 'var(--gray-200)'}`,
        background: active ? 'var(--primary-light)' : 'var(--white)',
        color: active ? 'var(--primary)' : 'var(--gray-600)',
        fontWeight: 600,
        fontSize: '0.8125rem',
        cursor: 'pointer',
        transition: 'all var(--transition)',
      }}
    >
      {label}
    </button>
  );
}

function ItemCard({ item, onClick }) {
  const conditionColor = { 'Very Good': 'var(--success)', 'Good': 'var(--info)', 'Fair': 'var(--warning)' };

  return (
    <div className="card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={onClick}>
      {/* Image */}
      <div style={{ height: 180, overflow: 'hidden', background: 'var(--gray-100)', position: 'relative', flexShrink: 0 }}>
        {item.image
          ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📦</div>
        }
        <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem' }}>
          <StatusBadge status={item.availability} />
        </div>
      </div>

      {/* Body */}
      <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {item.category}
        </span>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-800)', lineHeight: 1.3 }}>
          {item.name}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', lineHeight: 1.5, flex: 1 }}>
          {item.description.slice(0, 80)}…
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>📍 {item.location}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: conditionColor[item.condition] ?? 'var(--gray-500)' }}>
            {item.condition}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
            ⏱ Up to {item.borrowPeriod} day{item.borrowPeriod !== 1 ? 's' : ''}
          </span>
          {/* Borrowing fee */}
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 800,
              color: (!item.borrowingFee || item.borrowingFee <= 0) ? 'var(--success)' : '#7c1c1c',
              background: (!item.borrowingFee || item.borrowingFee <= 0) ? 'var(--success-light)' : '#fdf2f2',
              padding: '0.15rem 0.55rem',
              borderRadius: '999px',
              letterSpacing: '0.01em',
            }}
          >
            {formatPrice(item.borrowingFee)}
          </span>
        </div>
      </div>
    </div>
  );
}
