import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/shared/Button';
import SearchBar from '../../components/shared/SearchBar';
import Modal from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';

const STATUS_TABS = ['all', 'pending', 'approved', 'returned', 'rejected', 'overdue'];

export default function ManageBorrowRequests() {
  const { borrowRequests, updateBorrowRequest, deleteBorrowRequest, getItemById, getUserById } = useApp();

  const [tab,         setTab]         = useState('pending');
  const [search,      setSearch]      = useState('');
  const [detailReq,   setDetailReq]   = useState(null);
  const [adminNote,   setAdminNote]   = useState('');

  const filtered = borrowRequests.filter((r) => {
    const item = getItemById(r.itemId);
    const user = getUserById(r.userId);
    const q    = search.toLowerCase();
    const matchSearch = !q || item?.name.toLowerCase().includes(q) || user?.name.toLowerCase().includes(q);
    const matchTab    = tab === 'all' || r.status === tab;
    return matchSearch && matchTab;
  });

  const sorted = [...filtered].sort((a, b) => (b.requestDate > a.requestDate ? 1 : -1));

  const openDetail = (req) => {
    setDetailReq(req);
    setAdminNote(req.adminNote ?? '');
  };

  const changeStatus = (req, status) => {
    updateBorrowRequest({ ...req, status, adminNote });
    setDetailReq(null);
  };

  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t] = t === 'all' ? borrowRequests.length : borrowRequests.filter((r) => r.status === t).length;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Borrow Requests"
        subtitle={`${borrowRequests.filter(r => r.status === 'pending').length} pending review`}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '999px',
              border: `1.5px solid ${tab === t ? 'var(--primary)' : 'var(--gray-200)'}`,
              background: tab === t ? 'var(--primary-light)' : 'var(--white)',
              color: tab === t ? 'var(--primary)' : 'var(--gray-600)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by item or student name…" />
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
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
              {sorted.map((req) => {
                const item = getItemById(req.itemId);
                const user = getUserById(req.userId);
                return (
                  <tr key={req.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0 }}>
                          {item?.image
                            ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>📦</div>
                          }
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name ?? '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{user?.studentId}</div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>
                      {req.startDate} → {req.endDate}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{req.requestDate}</td>
                    <td><StatusBadge status={req.status} /></td>
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

      {/* Detail Modal */}
      {detailReq && (
        <ReviewModal
          req={detailReq}
          item={getItemById(detailReq.itemId)}
          user={getUserById(detailReq.userId)}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          onClose={() => setDetailReq(null)}
          onChangeStatus={changeStatus}
        />
      )}
    </div>
  );
}

function ReviewModal({ req, item, user, adminNote, setAdminNote, onClose, onChangeStatus }) {
  return (
    <Modal
      open
      onClose={onClose}
      title="Review Borrow Request"
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          {req.status === 'pending' && (
            <>
              <Button variant="danger"   onClick={() => onChangeStatus(req, 'rejected')}>Reject</Button>
              <Button variant="success"  onClick={() => onChangeStatus(req, 'approved')}>Approve</Button>
            </>
          )}
          {req.status === 'approved' && (
            <Button variant="secondary" onClick={() => onChangeStatus(req, 'returned')}>Mark Returned</Button>
          )}
          {['rejected','returned','overdue'].includes(req.status) && (
            <Button variant="ghost" onClick={() => onChangeStatus(req, 'pending')} style={{ color: 'var(--warning)' }}>Reset to Pending</Button>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Detail label="Item"      value={item?.name ?? '—'} />
        <Detail label="Student"   value={`${user?.name ?? '—'} (${user?.studentId ?? ''})`} />
        <Detail label="Dates"     value={`${req.startDate} → ${req.endDate}`} />
        <Detail label="Requested" value={req.requestDate} />
        <Detail label="Status"    value={<StatusBadge status={req.status} />} />
        {req.purpose && <Detail label="Purpose" value={req.purpose} />}
        {req.notes   && <Detail label="Notes"   value={req.notes} />}

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
}

function Detail({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <span style={{ width: 90, flexShrink: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', paddingTop: '0.15rem' }}>{label}</span>
      <span style={{ fontSize: '0.9rem', color: 'var(--gray-700)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
