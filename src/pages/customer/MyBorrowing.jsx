import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, orderBy,
  onSnapshot, getDoc, doc,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/shared/StatusBadge';
import PageHeader from '../../components/shared/PageHeader';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/shared/Button';

const TABS = ['all', 'pending', 'approved', 'returned', 'rejected'];

export default function MyBorrowing() {
  const { customer: user } = useAuth();
  const navigate = useNavigate();

  const [requests,  setRequests]  = useState([]);
  const [itemsCache,setItemsCache]= useState({});   // itemId → { name, image, category, location }
  const [loading,   setLoading]   = useState(true);
  const [dbError,   setDbError]   = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Keep a ref to the cache so the snapshot callback always sees the latest version
  const cacheRef = useRef({});

  useEffect(() => {
    if (!db) {
      setDbError('Firestore is not initialised. Check your Firebase environment variables.');
      setLoading(false);
      return;
    }

    const fbUser = auth.currentUser;
    if (!fbUser) {
      setDbError('Please log in to view your borrow requests.');
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'borrowRequests'),
      where('studentId', '==', fbUser.uid),
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(
      q,
      async (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRequests(rows);
        setLoading(false);
        setDbError('');

        // Fetch item details for any itemId not yet cached
        const uncached = [...new Set(rows.map((r) => r.itemId).filter((id) => id && !cacheRef.current[id]))];
        if (uncached.length === 0) return;

        const fetched = await Promise.all(
          uncached.map((itemId) =>
            getDoc(doc(db, 'items', itemId))
              .then((d) => d.exists() ? [itemId, d.data()] : null)
              .catch(() => null),
          ),
        );

        const updates = {};
        for (const entry of fetched) {
          if (!entry) continue;
          const [itemId, data] = entry;
          updates[itemId] = {
            name:     data.title    ?? '',
            image:    data.imageUrl ?? '',
            category: data.category ?? '',
            location: data.location ?? '',
          };
        }

        if (Object.keys(updates).length > 0) {
          cacheRef.current = { ...cacheRef.current, ...updates };
          setItemsCache((prev) => ({ ...prev, ...updates }));
        }
      },
      (err) => {
        setDbError(`Failed to load requests: ${err.message}`);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []); // runs once on mount — auth.currentUser is stable after login

  const filtered = activeTab === 'all'
    ? requests
    : requests.filter((r) => (r.status ?? '').toLowerCase() === activeTab);

  return (
    <div className="page-content">
      <div className="container">
        <PageHeader
          title="My Borrowing"
          subtitle="Track all your borrow requests and their current status"
        />

        {dbError && (
          <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--danger)', marginBottom: '1.25rem' }}>
            ⚠️ {dbError}
          </div>
        )}

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', background: 'var(--white)', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: '0.375rem', marginBottom: '1.75rem', width: 'fit-content' }}>
          {TABS.map((tab) => {
            const count = tab === 'all'
              ? requests.length
              : requests.filter((r) => (r.status ?? '').toLowerCase() === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ padding: '0.45rem 1rem', borderRadius: 'var(--radius)', border: 'none', background: activeTab === tab ? 'var(--primary)' : 'transparent', color: activeTab === tab ? '#fff' : 'var(--gray-600)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'capitalize' }}
              >
                {tab}
                {count > 0 && (
                  <span style={{ background: activeTab === tab ? 'rgba(255,255,255,.3)' : 'var(--gray-200)', color: activeTab === tab ? '#fff' : 'var(--gray-600)', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, padding: '0.05rem 0.45rem' }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>Loading your requests…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No requests yet"
            description={activeTab === 'all' ? 'Browse items and submit a borrow request.' : `No ${activeTab} requests.`}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                itemInfo={itemsCache[req.itemId] ?? null}
                onViewItem={() => navigate(`/items/${req.itemId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestCard({ request, itemInfo, onViewItem }) {
  const status = (request.status ?? 'pending').toLowerCase();
  const statusColors = {
    pending:  'var(--warning)',
    approved: 'var(--success)',
    rejected: 'var(--danger)',
    returned: 'var(--gray-400)',
    overdue:  'var(--danger)',
  };

  // Dates from Firestore are plain strings (YYYY-MM-DD)
  const requestDate = request.createdAt?.toDate
    ? request.createdAt.toDate().toISOString().slice(0, 10)
    : (typeof request.createdAt === 'string' ? request.createdAt.slice(0, 10) : '—');

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', borderLeft: `4px solid ${statusColors[status] ?? 'var(--gray-300)'}` }}>
      <div className="card-body" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Thumbnail */}
        <div style={{ width: 72, height: 72, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0, border: '1px solid var(--gray-200)' }}>
          {itemInfo?.image
            ? <img src={itemInfo.image} alt={itemInfo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📦</div>}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-800)' }}>
              {request.itemTitle || itemInfo?.name || 'Unknown Item'}
            </h3>
            <StatusBadge status={status} />
          </div>

          {itemInfo && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
              {itemInfo.category} · {itemInfo.location}
            </p>
          )}

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
            <span>📅 <strong>Requested:</strong> {requestDate}</span>
            <span>📅 <strong>From:</strong> {request.startDate}</span>
            <span>📅 <strong>Until:</strong> {request.endDate}</span>
          </div>

          {request.purpose && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
              <strong>Purpose:</strong> {request.purpose}
            </p>
          )}

          {request.adminNote && (
            <div style={{ marginTop: '0.625rem', padding: '0.5rem 0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
              💬 <strong>Admin note:</strong> {request.adminNote}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <Button size="sm" variant="outline" onClick={onViewItem}>View Item</Button>
        </div>
      </div>
    </div>
  );
}
