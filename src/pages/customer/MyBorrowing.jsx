import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/shared/StatusBadge';
import PageHeader from '../../components/shared/PageHeader';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/shared/Button';

const TABS = ['all', 'pending', 'approved', 'returned', 'rejected'];

export default function MyBorrowing() {
  const { getItemById } = useApp();
  const { customer: user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const { borrowRequests } = useApp();
  const requests = borrowRequests.filter((r) => r.userId === user?.id);
  const filtered = activeTab === 'all' ? requests : requests.filter((r) => r.status === activeTab);

  // Sort newest first
  const sorted = [...filtered].sort((a, b) => (b.requestDate > a.requestDate ? 1 : -1));

  return (
    <div className="page-content">
      <div className="container">
        <PageHeader
          title="My Borrowing"
          subtitle="Track all your borrow requests and their current status"
        />

        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.25rem',
            flexWrap: 'wrap',
            background: 'var(--white)',
            border: '1.5px solid var(--gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.375rem',
            marginBottom: '1.75rem',
            width: 'fit-content',
          }}
        >
          {TABS.map((tab) => {
            const count = tab === 'all' ? requests.length : requests.filter((r) => r.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius)',
                  border: 'none',
                  background: activeTab === tab ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab ? '#fff' : 'var(--gray-600)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textTransform: 'capitalize',
                }}
              >
                {tab}
                {count > 0 && (
                  <span
                    style={{
                      background: activeTab === tab ? 'rgba(255,255,255,.3)' : 'var(--gray-200)',
                      color: activeTab === tab ? '#fff' : 'var(--gray-600)',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.05rem 0.45rem',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No requests yet"
            description={activeTab === 'all' ? 'Browse items and submit a borrow request.' : `No ${activeTab} requests.`}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sorted.map((req) => {
              const item = getItemById(req.itemId);
              return (
                <RequestCard
                  key={req.id}
                  request={req}
                  item={item}
                  onViewItem={() => navigate(`/items/${req.itemId}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestCard({ request, item, onViewItem }) {
  const statusColors = {
    pending:  'var(--warning)',
    approved: 'var(--success)',
    rejected: 'var(--danger)',
    returned: 'var(--gray-400)',
    overdue:  'var(--danger)',
  };

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `4px solid ${statusColors[request.status] ?? 'var(--gray-300)'}`,
      }}
    >
      <div className="card-body" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Item thumbnail */}
        <div
          style={{
            width: 72, height: 72, borderRadius: 'var(--radius)',
            overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0,
            border: '1px solid var(--gray-200)',
          }}
        >
          {item?.image
            ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📦</div>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-800)' }}>
              {item?.name ?? 'Unknown Item'}
            </h3>
            <StatusBadge status={request.status} />
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
            {item?.category} · {item?.location}
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
            <span>📅 <strong>Requested:</strong> {request.requestDate}</span>
            <span>📅 <strong>From:</strong> {request.startDate}</span>
            <span>📅 <strong>Until:</strong> {request.endDate}</span>
          </div>

          {request.purpose && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
              <strong>Purpose:</strong> {request.purpose}
            </p>
          )}

          {request.adminNote && (
            <div
              style={{
                marginTop: '0.625rem',
                padding: '0.5rem 0.75rem',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--gray-200)',
                fontSize: '0.8125rem',
                color: 'var(--gray-600)',
              }}
            >
              💬 <strong>Admin note:</strong> {request.adminNote}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <Button size="sm" variant="outline" onClick={onViewItem}>
            View Item
          </Button>
        </div>
      </div>
    </div>
  );
}
