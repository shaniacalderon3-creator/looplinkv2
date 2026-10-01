import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/shared/Button';
import logoUrl from '../../assets/looplink-logo.jpg';

export default function Home() {
  const { items, lostFound, borrowRequests } = useApp();
  const { customer: user } = useAuth();
  const navigate = useNavigate();

  const availableItems = items.filter((i) => i.availability === 'available');
  const openReports    = lostFound.filter((r) => r.status === 'open');
  const myPending      = borrowRequests.filter((r) => r.userId === user?.id && r.status === 'pending');

  const featuredItems = availableItems.slice(0, 4);

  return (
    <div>
      {/* ── Hero ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #7c1c1c 0%, #3730a3 55%, #0e7490 100%)',
          color: '#fff',
          padding: '4rem 0 3.5rem',
        }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          {/* Logo in hero */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <img
              src={logoUrl}
              alt="LoopLink"
              style={{
                height: 72,
                width: 'auto',
                maxWidth: '80vw',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
                opacity: 0.95,
              }}
            />
          </div>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,.15)',
              borderRadius: '999px',
              padding: '0.35rem 1rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              marginBottom: '1.25rem',
              textTransform: 'uppercase',
            }}
          >
            Student Platform 2026
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
            }}
          >
            Borrow, Lend &amp; Find<br />
            <span style={{ opacity: 0.85 }}>on Campus</span>
          </h1>
          <p style={{ fontSize: '1.0625rem', opacity: 0.85, maxWidth: 600, margin: '0 auto 2rem', lineHeight: 1.75 }}>
            The ultimate student resource hub for locating, recovering, sharing, borrowing, and returning. Connect with your peers and keep your belongings in a continuous cycle of connection.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              size="lg"
              style={{ background: '#fff', color: 'var(--primary)', border: 'none', fontWeight: 700 }}
              onClick={() => navigate('/browse')}
            >
              Browse Items
            </Button>
            <Button
              size="lg"
              style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,.4)', fontWeight: 700 }}
              onClick={() => navigate('/lost-found')}
            >
              Lost &amp; Found
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0',
            }}
          >
            {[
              { value: availableItems.length, label: 'Items Available', color: 'var(--success)' },
              { value: items.length,          label: 'Total Items',     color: 'var(--primary)' },
              { value: openReports.length,    label: 'Open Reports',    color: 'var(--warning)' },
              { value: myPending.length,      label: 'My Pending',      color: 'var(--accent)'  },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding: '1.5rem 1.25rem',
                  textAlign: 'center',
                  borderRight: '1px solid var(--gray-100)',
                }}
              >
                <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.25rem', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Welcome banner ── */}
      <section style={{ padding: '2rem 0 0' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(120deg, var(--primary-light), var(--accent-light))',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={user?.avatar}
                alt={user?.name}
                style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--white)', background: 'var(--gray-100)' }}
              />
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-800)' }}>
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                  {user?.department} · {user?.studentId}
                </p>
              </div>
            </div>
            <Link to="/profile" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
              View Profile →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Items ── */}
      <section style={{ padding: '2.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--gray-800)' }}>Available Now</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Items ready to borrow today</p>
            </div>
            <Link to="/browse" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
              See all →
            </Link>
          </div>

          <div className="grid-4">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {featuredItems.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>No items available right now.</p>
          )}
        </div>
      </section>

      {/* ── Recent Lost & Found ── */}
      <section style={{ padding: '0 0 3rem' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--gray-800)' }}>Recent Lost &amp; Found</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Help reunite students with their belongings</p>
            </div>
            <Link to="/lost-found" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
              See all →
            </Link>
          </div>

          <div className="grid-3">
            {openReports.slice(0, 3).map((report) => (
              <LostFoundCard key={report.id} report={report} />
            ))}
          </div>

          {openReports.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>No open reports.</p>
          )}
        </div>
      </section>
    </div>
  );
}

// ── Mini ItemCard ─────────────────────────────────────────────────────────────
function ItemCard({ item }) {
  const navigate = useNavigate();
  return (
    <div
      className="card"
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/items/${item.id}`)}
    >
      <div style={{ height: 160, overflow: 'hidden', background: 'var(--gray-100)' }}>
        {item.image
          ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📦</div>
        }
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--gray-800)', lineHeight: 1.3 }} className="truncate">
            {item.name}
          </h3>
          <StatusBadge status={item.availability} />
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{item.category}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>📍 {item.location}</p>
      </div>
    </div>
  );
}

// ── Mini LostFoundCard ────────────────────────────────────────────────────────
function LostFoundCard({ report }) {
  const navigate = useNavigate();
  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/lost-found')}>
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <StatusBadge status={report.type} />
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{report.date}</span>
        </div>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.35rem' }}>
          {report.title}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', lineHeight: 1.5 }}>
          {report.description.slice(0, 90)}…
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>📍 {report.location}</p>
      </div>
    </div>
  );
}
