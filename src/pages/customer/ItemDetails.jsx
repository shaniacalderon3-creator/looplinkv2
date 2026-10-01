import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import { formatPrice } from '../../utils/formatPrice';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItemById, addBorrowRequest, borrowRequests } = useApp();
  const { customer: user } = useAuth();

  const item = getItemById(id);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ startDate: '', endDate: '', purpose: '', notes: '' });
  const [errors, setErrors]       = useState({});

  if (!item) {
    return (
      <div className="page-content">
        <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
          <h2 style={{ color: 'var(--gray-700)' }}>Item not found</h2>
          <p style={{ color: 'var(--gray-400)', marginBottom: '1.5rem' }}>This item may have been removed.</p>
          <Button onClick={() => navigate('/browse')}>Back to Browse</Button>
        </div>
      </div>
    );
  }

  // Check if user already has a pending/approved request for this item
  const existingRequest = borrowRequests.find(
    (r) => r.itemId === item.id && r.userId === user?.id && ['pending', 'approved'].includes(r.status)
  );

  const validate = () => {
    const e = {};
    if (!form.startDate) e.startDate = 'Start date is required.';
    if (!form.endDate)   e.endDate   = 'End date is required.';
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = 'End date must be after start date.';
    if (!form.purpose.trim()) e.purpose = 'Please describe your purpose.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addBorrowRequest({ itemId: item.id, userId: user.id, ...form });
    setShowModal(false);
    setForm({ startDate: '', endDate: '', purpose: '', notes: '' });
  };

  const canBorrow = item.availability === 'available' && !existingRequest;

  return (
    <div className="page-content">
      <div className="container">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          ← Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Left — image */}
          <div>
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'var(--gray-100)',
                aspectRatio: '4/3',
                border: '1px solid var(--gray-200)',
              }}
            >
              {item.image
                ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>📦</div>
              }
            </div>

            {/* Tags */}
            {item.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '0.2rem 0.65rem',
                      borderRadius: '999px',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right — details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <StatusBadge status={item.availability} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', fontWeight: 600 }}>{item.category}</span>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-800)', lineHeight: 1.2, marginBottom: '1rem' }}>
              {item.name}
            </h1>

            <p style={{ color: 'var(--gray-600)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              {item.description}
            </p>

            {/* Meta grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.75rem',
              }}
            >
              {[
                { label: 'Condition',     value: item.condition },
                { label: 'Location',      value: item.location  },
                { label: 'Borrow Period', value: `Up to ${item.borrowPeriod} day${item.borrowPeriod !== 1 ? 's' : ''}` },
                { label: 'Added',         value: item.createdAt },
              ].map((meta) => (
                <div
                  key={meta.label}
                  style={{
                    background: 'var(--gray-50)',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius)',
                    padding: '0.75rem 1rem',
                  }}
                >
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                    {meta.label}
                  </p>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--gray-700)' }}>{meta.value}</p>
                </div>
              ))}

              {/* Borrowing Fee — full width */}
              <div
                style={{
                  gridColumn: '1 / -1',
                  background: (!item.borrowingFee || item.borrowingFee <= 0) ? 'var(--success-light)' : '#fdf2f2',
                  border: `1px solid ${(!item.borrowingFee || item.borrowingFee <= 0) ? 'var(--success)' : '#f5b8b8'}`,
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Borrowing Fee
                </p>
                <p style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: (!item.borrowingFee || item.borrowingFee <= 0) ? 'var(--success)' : '#7c1c1c',
                  letterSpacing: '-0.01em',
                }}>
                  {formatPrice(item.borrowingFee)}
                </p>
              </div>
            </div>

            {/* Action */}
            {existingRequest && (
              <div
                style={{
                  background: 'var(--warning-light)',
                  border: '1px solid var(--warning)',
                  borderRadius: 'var(--radius)',
                  padding: '0.875rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: '#92400e',
                }}
              >
                You already have a <strong>{existingRequest.status}</strong> request for this item.{' '}
                <button
                  onClick={() => navigate('/my-borrow')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  View it →
                </button>
              </div>
            )}

            <Button
              size="lg"
              fullWidth
              disabled={!canBorrow}
              onClick={() => setShowModal(true)}
            >
              {item.availability !== 'available'
                ? 'Currently Unavailable'
                : existingRequest
                ? 'Already Requested'
                : 'Request to Borrow'}
            </Button>

            {item.availability === 'available' && !existingRequest && (
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.5rem', textAlign: 'center' }}>
                Your request will be reviewed by an admin.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Borrow Request Modal ── */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Request to Borrow"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSubmit}>Submit Request</Button>
          </>
        }
      >
        <p style={{ color: 'var(--gray-600)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Submitting a request for: <strong>{item.name}</strong>
        </p>

        {/* Fee notice */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: (!item.borrowingFee || item.borrowingFee <= 0) ? 'var(--success-light)' : '#fdf2f2',
          border: `1px solid ${(!item.borrowingFee || item.borrowingFee <= 0) ? 'var(--success)' : '#f5b8b8'}`,
          borderRadius: 'var(--radius)',
          padding: '0.625rem 0.875rem',
          marginBottom: '1.25rem',
        }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-600)' }}>
            💰 Borrowing Fee
          </span>
          <span style={{
            fontSize: '1.0625rem',
            fontWeight: 900,
            color: (!item.borrowingFee || item.borrowingFee <= 0) ? 'var(--success)' : '#7c1c1c',
          }}>
            {formatPrice(item.borrowingFee)}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                min={new Date().toISOString().slice(0, 10)}
              />
              {errors.startDate && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.startDate}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Return Date</label>
              <input
                type="date"
                className="form-control"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                min={form.startDate || new Date().toISOString().slice(0, 10)}
              />
              {errors.endDate && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.endDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Purpose / Reason *</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Why do you need to borrow this item?"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            />
            {errors.purpose && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.purpose}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Additional Notes (optional)</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Any extra details for the admin…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
