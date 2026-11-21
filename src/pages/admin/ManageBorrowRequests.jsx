import { useState, useEffect } from 'react';
import {
  collection, query, orderBy, onSnapshot,
  updateDoc, doc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/shared/Button';
import SearchBar from '../../components/shared/SearchBar';
import Modal from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';

const STATUS_TABS = ['all', 'pending', 'approved', 'returned', 'rejected', 'overdue'];

export default function ManageBorrowRequests() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [dbError,  setDbError]  = useState('');
  const [tab,      setTab]      = useState('pending');
  const [search,   setSearch]   = useState('');
  const [detailReq,setDetailReq]= useState(null);
  const [adminNote,setAdminNote]= useState('');
  const [saving,   setSaving]   = useState(false);

  // ── Live listener ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!db) {
      setDbError('Firestore is not initialised. Check your Firebase environment variables.');
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'borrowRequests'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setDbError('');
      },
      (err) => {
        setDbError(`Failed to load requests: ${err.message}`);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = requests.filter((r) => {
    const status = (r.status ?? '').toLowerCase();
    const q      = search.toLowerCase();
    const matchSearch = !q ||
      (r.itemTitle    ?? '').toLowerCase().includes(q) ||
      (r.studentName  ?? '').toLowerCase().includes(q);
    const matchTab = tab === 'all' || status === tab;
    return matchSearch && matchTab;
  });

  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t] = t === 'all'
      ? requests.length
      : requests.filter((r) => (r.status ?? '').toLowerCase() === t).length;
    return acc;
  }, {});

  const openDetail = (req) => {
    setDetailReq(req);
    setAdminNote(req.adminNote ?? '');
    setDbError('');
  };

  // ── Change status (and sync item status) ────────────────────────────────────
  const changeStatus = async (req, newStatus) => {
    setSaving(true); setDbError('');
    try {
      // 1. Update the request document
      await updateDoc(doc(db, 'borrowRequests', req.id), {
        status:    newStatus,
        adminNote: adminNote || '',
      });

      // 2. Sync item availability
      if (req.itemId) {
        if (newStatus === 'approved') {
          await updateDoc(doc(db, 'items', req.itemId), { status: 'borrowed' });
        } else if (newStatus === 'returned') {
          await updateDoc(doc(db, 'items', req.itemId), { status: 'available' });
        }
      }

      setDetailReq(null);
    } catch (err) {
      setDbError(`Update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Borrow Requests"
        subtitle={loading ? 'Loading…' : `${counts.pending ?? 0} pending review`}
      />

      {dbError && (
        <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--danger)', marginBottom: '1.25rem' }}>
          ⚠️ {dbError}
        </div>
      )}

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {STATUS_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '0.45rem 1rem', borderRadius: '999px', border: `1.5px solid ${tab === t ? 'var(--primary)' : 'var(--gray-200)'}`, background: tab === t ? 'var(--primary-light)' : 'var(--white)', color: tab === t ? 'var(--primary)' : 'var(--gray-600)', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', textTransform: 'capitalize' }}>
            {t} ({counts[t] ?? 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by item or student name…" />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>Loading requests…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔄" title="No requests" description="No requests match the current filter." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Student</th>
                <th>Dates</th>
                <th>Requested</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const status      = (req.status ?? 'pending').toLowerCase();
                const requestDate = req.createdAt?.toDate
                  ? req.createdAt.toDate().toISOString().slice(0, 10)
                  : (typeof req.createdAt === 'string' ? req.createdAt.slice(0, 10) : '—');
                return (
                  <tr key={req.id}>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {req.itemTitle || req.itemId || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{req.studentName || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{req.studentEmail || req.studentId || ''}</div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>
                      {req.startDate} → {req.endDate}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{requestDate}</td>
                    <td><StatusBadge status={status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Button size="sm" variant="outline" onClick={() => openDetail(req)}>Review</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {detailReq && (() => {
        const status = (detailReq.status ?? 'pending').toLowerCase();
        const requestDate = detailReq.createdAt?.toDate
          ? detailReq.createdAt.toDate().toISOString().slice(0, 10)
          : (typeof detailReq.createdAt === 'string' ? detailReq.createdAt.slice(0, 10) : '—');
        return (
          <Modal
            open
            onClose={() => setDetailReq(null)}
            title="Review Borrow Request"
            footer={
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setDetailReq(null)}>Close</Button>
                {status === 'pending' && (
                  <>
                    <Button variant="danger"  disabled={saving} onClick={() => changeStatus(detailReq, 'rejected')}>Reject</Button>
                    <Button variant="success" disabled={saving} onClick={() => changeStatus(detailReq, 'approved')}>Approve</Button>
                  </>
                )}
                {status === 'approved' && (
                  <Button variant="secondary" disabled={saving} onClick={() => changeStatus(detailReq, 'returned')}>Mark Returned</Button>
                )}
                {['rejected', 'returned', 'overdue'].includes(status) && (
                  <Button variant="ghost" disabled={saving} onClick={() => changeStatus(detailReq, 'pending')} style={{ color: 'var(--warning)' }}>Reset to Pending</Button>
                )}
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <D label="Item"      value={detailReq.itemTitle || detailReq.itemId || '—'} />
              <D label="Student"   value={`${detailReq.studentName || '—'} (${detailReq.studentEmail || detailReq.studentId || ''})`} />
              <D label="Dates"     value={`${detailReq.startDate} → ${detailReq.endDate}`} />
              <D label="Requested" value={requestDate} />
              <D label="Status"    value={<StatusBadge status={status} />} />
              {detailReq.purpose && <D label="Purpose" value={detailReq.purpose} />}
              {detailReq.notes    && <D label="Notes"   value={detailReq.notes} />}
              <div className="form-group" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                <label className="form-label">Admin Note</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Leave a note for the student…"
                />
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

function D({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <span style={{ width: 90, flexShrink: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', paddingTop: '0.15rem' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.9rem', color: 'var(--gray-700)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
