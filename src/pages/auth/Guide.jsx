import { Link } from 'react-router-dom';
import { styles, logoUrl } from './Login';

// ── Shared text styles ────────────────────────────────────────────────────────
const p  = { fontSize: '0.9rem',    color: 'var(--gray-600)', lineHeight: 1.7, margin: '0.4rem 0' };
const li = { fontSize: '0.875rem',  color: 'var(--gray-600)', lineHeight: 1.65 };
const h2 = { fontSize: '1rem',      fontWeight: 700, color: 'var(--gray-800)', margin: '1.5rem 0 0.4rem' };
const h3 = { fontSize: '0.875rem',  fontWeight: 700, color: 'var(--gray-700)', margin: '0.75rem 0 0.25rem' };

function P({ children }) { return <p style={p}>{children}</p>; }
function Ul({ items })   {
  return (
    <ul style={{ paddingLeft: '1.25rem', margin: '0.4rem 0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {items.map((item, i) => <li key={i} style={li}>{item}</li>)}
    </ul>
  );
}

// ── Step card ─────────────────────────────────────────────────────────────────
function StepCard({ n, title, children }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: '1.1rem 1.25rem', marginBottom: '0.75rem' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7c1c1c, #b8860b)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9375rem', flexShrink: 0 }}>
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gray-800)', margin: '0 0 0.3rem' }}>{title}</p>
        {children}
      </div>
    </div>
  );
}

// ── Two-column table ──────────────────────────────────────────────────────────
function TwoColTable({ left, right, leftHead, rightHead }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
      {[{ head: leftHead, items: left, accent: 'var(--success)' }, { head: rightHead, items: right, accent: 'var(--primary)' }].map((col) => (
        <div key={col.head} style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <p style={{ fontWeight: 700, fontSize: '0.875rem', color: col.accent, marginBottom: '0.6rem' }}>{col.head}</p>
          <ul style={{ paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', margin: 0 }}>
            {col.items.map((item, i) => <li key={i} style={li}>{item}</li>)}
          </ul>
        </div>
      ))}
      <style>{`@media(max-width:540px){.ll-guide-twocol{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

// ── Troubleshooting row ───────────────────────────────────────────────────────
function TrRow({ problem, solution }) {
  return (
    <tr>
      <td style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem', color: 'var(--gray-700)', fontWeight: 600, borderBottom: '1px solid var(--gray-100)', verticalAlign: 'top', width: '45%' }}>{problem}</td>
      <td style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem', color: 'var(--gray-600)', borderBottom: '1px solid var(--gray-100)', verticalAlign: 'top' }}>{solution}</td>
    </tr>
  );
}

export default function Guide() {
  return (
    <div style={{ ...styles.page, alignItems: 'flex-start', padding: '2rem 1rem' }}>
      <div style={{ ...styles.card, maxWidth: 740, margin: '0 auto', width: '100%' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <img src={logoUrl} alt="LoopLink" style={{ height: 56, width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Header line */}
        <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          LOOPLINK | Borrow. Find. Return. Share.
        </p>

        {/* Title */}
        <h1 style={{ fontSize: '1.625rem', fontWeight: 900, color: 'var(--gray-800)', textAlign: 'center', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
          Getting Started Guide
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
          How to navigate the website before you log in
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '1.25rem 0' }} />

        {/* What is LOOPLINK */}
        <h2 style={{ ...h2, marginTop: '0.25rem' }}>What is LOOPLINK?</h2>
        <P>
          LOOPLINK is a student-to-student website of the College of Applied Economics (CAEc) at USeP. It works in a cycle of borrow, use, return, and share, and brings borrowing and lost-and-found together in one place. This guide shows you how to find your way around before you log in, so you know what to expect and how to get started.
        </P>

        {/* Steps */}
        <h2 style={h2}>Before You Log In: Step by Step</h2>

        <StepCard n={1} title="Open the website">
          <Ul items={[
            'Scan the QR code on the CAEc bulletin board using your phone camera, or',
            'Type the address into your browser: looplinkv2.vercel.app (home page) or looplinkv2.vercel.app/login (log-in page).',
            'Use a recent browser (Chrome, Safari, Edge) and a stable internet connection. The site works on phones and computers.',
          ]} />
        </StepCard>

        <StepCard n={2} title="Explore the Home page">
          <Ul items={[
            'The Home page introduces LOOPLINK, its tagline Borrow. Find. Return. Share., and what the platform does.',
            'Take a moment to read the short overview so you understand how the cycle of borrowing, returning, and sharing works.',
            'Scroll down to see the services and the options to start using the site.',
          ]} />
        </StepCard>

        <StepCard n={3} title="Know the services">
          <Ul items={[
            'BorrowBoard: request or lend items such as calculators, umbrellas, lab gear, and books.',
            'Shared and Donated Items: give away or claim school supplies, uniforms, and study materials.',
            'LostLink: post lost belongings or report found items so they can be returned.',
            'Basic Supplies: low-cost items such as yellow pad (PHP 30) and ballpen (PHP 8).',
          ]} />
        </StepCard>

        <StepCard n={4} title="Read the Terms and Conditions">
          <Ul items={[
            <>Before creating an account, read the <Link to="/terms" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms and Conditions</Link>. Using the site means you agree to follow them.</>,
            'Key points: be honest, take care of borrowed items, return them on time, verify ownership for lost items, and meet safely on campus.',
          ]} />
        </StepCard>

        <StepCard n={5} title="Sign up or log in">
          <Ul items={[
            'Choose Sign Up if you are new, or Log In if you already have an account.',
            'Use your student credentials. Provide accurate information, as required in the Terms.',
            'Keep your password private and never share it, even with friends.',
          ]} />
        </StepCard>

        <StepCard n={6} title="You're in! What happens next">
          <Ul items={[
            'After logging in, you can browse or post: filter available items to borrow or claim, or click Post to list an item or report a lost belonging.',
            'Message the item owner or finder to arrange a safe campus meetup, such as at the CAEc Building.',
            'Return and confirm: return borrowed items on time and mark the transaction complete.',
          ]} />
        </StepCard>

        {/* Can / Cannot table */}
        <h2 style={h2}>What You Can and Cannot Do Before Logging In</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '0.75rem 0 1rem' }}
          className="ll-guide-twocol">
          {[
            {
              head: '✅ You can',
              items: [
                'Read about LOOPLINK and its services',
                'Learn how the borrow, return, and share cycle works',
                'Read the Terms and Conditions and this guide',
                'Find the contact details and social media page',
              ],
              accent: 'var(--success)',
            },
            {
              head: '🔒 You need to log in to',
              items: [
                'Request or borrow an item',
                'Post an item to lend, share, or donate',
                'Report a lost or found item',
                'Message other students and confirm transactions',
              ],
              accent: 'var(--primary)',
            },
          ].map((col) => (
            <div key={col.head} style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '1rem' }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: col.accent, marginBottom: '0.6rem' }}>{col.head}</p>
              <ul style={{ paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', margin: 0 }}>
                {col.items.map((item, i) => <li key={i} style={li}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Tips */}
        <h2 style={h2}>Helpful Tips for First-Time Users</h2>
        <Ul items={[
          'Be clear when posting: include the item name, a short description, its condition, and where it can be picked up.',
          'Lost something? Describe it clearly but keep private details (like ID numbers) to yourself so you can prove ownership later.',
          'Found something? Report it quickly and keep it safe until the owner is verified.',
          'Plan the meetup: agree on a public campus place and a return time before you meet.',
          'Return on time: other students may be waiting to borrow the same item.',
        ]} />

        {/* Troubleshooting */}
        <h2 style={h2}>Troubleshooting</h2>
        <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', overflow: 'hidden', margin: '0.5rem 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.625rem 0.875rem', background: 'var(--gray-100)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--gray-600)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--gray-200)', width: '45%' }}>Problem</th>
                <th style={{ padding: '0.625rem 0.875rem', background: 'var(--gray-100)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--gray-600)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--gray-200)' }}>What to try</th>
              </tr>
            </thead>
            <tbody>
              <TrRow problem="The QR code does not scan" solution="Move closer, steady your phone, and improve the lighting. Or type looplinkv2.vercel.app into your browser." />
              <TrRow problem="The page does not load" solution="Check your internet connection, refresh the page, or try another browser." />
              <TrRow problem="I cannot sign up or log in" solution="Double-check your student credentials and spelling. If it still fails, email studentlooplink@gmail.com." />
              <TrRow problem="I forgot my password" solution="Use the password option on the log-in page if available, or contact the team for help." />
            </tbody>
          </table>
        </div>

        {/* Contact */}
        <h2 style={h2}>Need Help? Contact Us</h2>
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem', margin: '0.5rem 0 1.5rem' }}>
          <p style={{ ...p, margin: '0.2rem 0' }}>📍 USeP Obrero, CAEc Building, Davao City</p>
          <p style={{ ...p, margin: '0.2rem 0' }}>✉️ <a href="mailto:studentlooplink@gmail.com" style={{ color: 'var(--primary)' }}>studentlooplink@gmail.com</a> &nbsp;|&nbsp; 📞 +63 965 933 4380</p>
          <p style={{ ...p, margin: '0.2rem 0' }}>🌐 <a href="https://looplinkv2.vercel.app" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>looplinkv2.vercel.app</a> &nbsp;|&nbsp; 📱 @studentlooplink</p>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 2rem',
              background: 'linear-gradient(135deg, #7c1c1c, #b8860b)',
              color: '#fff',
              borderRadius: 'var(--radius)',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            Continue to Log In →
          </Link>
        </div>

        {/* Mobile responsive patch for two-column table */}
        <style>{`
          @media (max-width: 540px) {
            .ll-guide-twocol { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
