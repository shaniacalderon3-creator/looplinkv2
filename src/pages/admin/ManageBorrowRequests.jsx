import { useState, useEffect, useCallback } from 'react';
import { supabase, rowToRequest } from '../../lib/supabase';
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

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true); setDbError('');
    if (!supabase) { setDbError('Supabase is not configured.'); setLoading(false); return; }
    // Join items to get the item name in one query
    const { data, error } = await supabase
      .from('borrow_requests')
      .select('*, items(name, image_url)')
      .order('created_at', { ascending: false });
    if (error) { setDbError(error.message); setLoading(false); return; }
    const rows = (data ?? []).map((r) => ({
      ...rowToRequest(r),
      itemName:  r.items?.name      ?? r.item_id ?? '—',
      itemImage: r.items?.image_url ?? '',
    }));
    setRequests(rows);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.itemName.toLowerCase().includes(q) || r.studentName.toLowerCase().includes(q);
    const matchTab    = tab === 'all' || r.status.toLowerCase() === tab;
    return matchSearch && matchTab;
  });

  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t] = t === 'all' ? requests.length : requests.filter((r) => r.status.toLowerCase() === t).length;
    return acc;
  }, {});

  const openDetail = (req) => { setDetailReq(req); setAdminNote(req.adminNote ?? ''); };

  // ── Change status ───────────────────────────────────────────────────────────
  const changeStatus = async (req, newStatus) => {
    setSaving(true); setDbError('');
    // Capitalise first letter to match DB convention
    const dbStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

    const { error } = await supabase
      .from('borrow_requests')
      .update({ status: dbStatus, admin_note: adminNote })
      .eq('id', req.id);

    if (error) { setDbError(error.message); setSaving(false); return; }

    // Sync item status when approving or returning
    if (newStatus === 'approved' && req.itemId) {
      await supabase.from('items').update({ status: 'Borrowed' }).eq('id', req.itemId);
    }
    if (newStatus === 'returned' && req.itemId) {
      await supabase.from('items').update({ status: 'Available' }).eq('id', req.itemId);
    }

    setSaving(false);
    setDetailReq(null);
    await load();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Borrow Requests"
        subtitle={loading ? 'Loading…' : `${counts.pending ?? 0} pending review`}
        action={<Button size="sm" variant="secondary" onClick={load} disabled={loading}>↻ Refresh</Button>}
      />

      {dbError && <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--danger)', marginBottom: '1.25rem' }}>⚠️ {dbError}</div>}

      {/* Tabs */}
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
                <th>Item</th><th>Student</th><th>Dates</th>
                <th>Requested</th><th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0 }}>
                        {req.itemImage
                          ? <img src={req.itemImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>📦</div>}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{req.itemName}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{req.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{req.studentId}</div>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{req.startDate} → {req.endDate}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{req.requestDate ? req.requestDate.slice(0, 10) : '—'}</td>
                  <td><StatusBadge status={req.status.toLowerCase()} /></td>
                  <td><div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}><Button size="sm" variant="outline" onClick={() => openDetail(req)}>Review</Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {detailReq && (
        <Modal open onClose={() => setDetailReq(null)} title="Review Borrow Request"
          footer={
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setDetailReq(null)}>Close</Button>
              {detailReq.status.toLowerCase() === 'pending' && (
                <>
                  <Button variant="danger"   disabled={saving} onClick={() => changeStatus(detailReq, 'rejected')}>Reject</Button>
                  <Button variant="success"  disabled={saving} onClick={() => changeStatus(detailReq, 'approved')}>Approve</Button>
                </>
              )}
              {detailReq.status.toLowerCase() === 'approved' && (
                <Button variant="secondary" disabled={saving} onClick={() => changeStatus(detailReq, 'returned')}>Mark Returned</Button>
              )}
              {['rejected','returned','overdue'].includes(detailReq.status.toLowerCase()) && (
                <Button variant="ghost" disabled={saving} onClick={() => changeStatus(detailReq, 'pending')} style={{ color: 'var(--warning)' }}>Reset to Pending</Button>
              )}
            </div>
          }>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <D label="Item"      value={detailReq.itemName} />
            <D label="Student"   value={`${detailReq.studentName} (${detailReq.studentId})`} />
            <D label="Dates"     value={`${detailReq.startDate} → ${detailReq.endDate}`} />
            <D label="Requested" value={detailReq.requestDate ? detailReq.requestDate.slice(0, 10) : '—'} />
            <D label="Status"    value={<StatusBadge status={detailReq.status.toLowerCase()} />} />
            {detailReq.purpose && <D label="Purpose" value={detailReq.purpose} />}
            {detailReq.notes   && <D label="Notes"   value={detailReq.notes} />}
            <div className="form-group" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              <label className="form-label">Admin Note</label>
              <textarea className="form-control" rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Leave a note for the student…" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function D({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <span style={{ width: 90, flexShrink: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', paddingTop: '0.15rem' }}>{label}</span>
      <span style={{ fontSize: '0.9rem', color: 'var(--gray-700)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
