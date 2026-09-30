import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import Modal from '../../components/shared/Modal';
import SearchBar from '../../components/shared/SearchBar';
import { LF_CATEGORIES } from '../../data/lostFound';

const EMPTY_FORM = {
  type: 'lost', title: '', description: '',
  category: '', location: '', contactInfo: '', image: '',
};

export default function LostFound() {
  const { lostFound, addLostFound } = useApp();
  const { customer: user } = useAuth();

  const [tab,       setTab]       = useState('all');     // all | lost | found | mine
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState({});

  // Filter
  const filtered = lostFound.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.location.toLowerCase().includes(q);
    const matchTab =
      tab === 'all'  ? true :
      tab === 'mine' ? r.reporterId === user?.id :
      r.type === tab;
    return matchSearch && matchTab;
  });

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.category)           e.category    = 'Select a category.';
    if (!form.location.trim())    e.location    = 'Location is required.';
    if (!form.contactInfo.trim()) e.contactInfo = 'Contact info is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addLostFound({ ...form, reporterId: user.id });
    setShowModal(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const tabCounts = {
    all:   lostFound.length,
    lost:  lostFound.filter((r) => r.type === 'lost').length,
    found: lostFound.filter((r) => r.type === 'found').length,
    mine:  lostFound.filter((r) => r.reporterId === user?.id).length,
  };

  return (
    <div className="page-content">
      <div className="container">
        <PageHeader
          title="Lost & Found"
          subtitle="Report lost or found items on campus"
          action={
            <Button onClick={() => setShowModal(true)}>
              + New Report
            </Button>
          }
        />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {['all', 'lost', 'found', 'mine'].map((t) => (
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
                fontSize: '0.875rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {t === 'mine' ? 'My Reports' : t} ({tabCounts[t]})
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.75rem' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search reports, locations…" />
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <EmptyState icon="🔎" title="No reports found" description="Try a different search or tab." />
        ) : (
          <div className="grid-3">
            {filtered.map((report) => (
              <ReportCard key={report.id} report={report} isOwner={report.reporterId === user?.id} />
            ))}
          </div>
        )}
      </div>

      {/* ── New Report Modal ── */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setErrors({}); }}
        title="Submit a Report"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowModal(false); setErrors({}); }}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit Report</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div className="form-group">
            <label className="form-label">Report Type</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['lost', 'found'].map((t) => (
                <label
                  key={t}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.6rem', borderRadius: 'var(--radius)',
                    border: `1.5px solid ${form.type === t ? 'var(--primary)' : 'var(--gray-200)'}`,
                    background: form.type === t ? 'var(--primary-light)' : 'var(--gray-50)',
                    cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                    color: form.type === t ? 'var(--primary)' : 'var(--gray-600)',
                  }}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={form.type === t}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ display: 'none' }}
                  />
                  {t === 'lost' ? '😢 I Lost Something' : '🎉 I Found Something'}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Blue water bottle, Student ID card"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {errors.title && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.title}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category</option>
                {LF_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.category}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Where was it lost/found?"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              {errors.location && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.location}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Describe the item in detail — color, brand, distinguishing features…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {errors.description && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.description}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Contact Info *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Your email or phone number"
              value={form.contactInfo}
              onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
            />
            {errors.contactInfo && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.contactInfo}</span>}
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ReportCard({ report, isOwner }) {
  return (
    <div
      className="card"
      style={{
        borderTop: `3px solid ${report.type === 'lost' ? 'var(--danger)' : 'var(--success)'}`,
      }}
    >
      {report.image && (
        <div style={{ height: 150, overflow: 'hidden', background: 'var(--gray-100)' }}>
          <img src={report.image} alt={report.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <StatusBadge status={report.type} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <StatusBadge status={report.status} />
            {isOwner && (
              <span
                style={{
                  fontSize: '0.7rem', fontWeight: 700, background: 'var(--primary-light)',
                  color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '999px',
                }}
              >
                Mine
              </span>
            )}
          </div>
        </div>

        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.4rem' }}>
          {report.title}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', lineHeight: 1.55, marginBottom: '0.75rem' }}>
          {report.description.length > 100 ? report.description.slice(0, 100) + '…' : report.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>📍 {report.location}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>📅 {report.date}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>📂 {report.category}</div>
          {report.contactInfo && (
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.25rem' }}>
              📬 {report.contactInfo}
            </div>
          )}
        </div>

        {report.adminNote && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 0.75rem',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--gray-200)',
              fontSize: '0.8rem',
              color: 'var(--gray-600)',
            }}
          >
            💬 {report.adminNote}
          </div>
        )}
      </div>
    </div>
  );
}
