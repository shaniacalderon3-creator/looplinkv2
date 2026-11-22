import { useNavigate } from 'react-router-dom';
import { styles, logoUrl } from './Login';
import TermsContent from '../../components/shared/TermsContent';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div style={{ ...styles.page, alignItems: 'flex-start', padding: '2rem 1rem' }}>
      <div style={{ ...styles.card, maxWidth: 720, margin: '0 auto', width: '100%' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img src={logoUrl} alt="LoopLink" style={{ height: 56, width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', padding: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          ← Back
        </button>

        {/* Official Terms text */}
        <TermsContent />

        {/* Back button at bottom */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.75rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '0.5rem 1.25rem', color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
