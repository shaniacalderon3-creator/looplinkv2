import { useNavigate } from 'react-router-dom';
import { styles, logoUrl } from './Login';

// ── Section heading ───────────────────────────────────────────────────────────
function H({ n, children }) {
  return (
    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-800)', margin: '1.75rem 0 0.5rem' }}>
      {n}. {children}
    </h2>
  );
}

// ── Bullet list ───────────────────────────────────────────────────────────────
function Ul({ items }) {
  return (
    <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.65 }}>{item}</li>
      ))}
    </ul>
  );
}

// ── Numbered list ─────────────────────────────────────────────────────────────
function Ol({ items }) {
  return (
    <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.65 }}>{item}</li>
      ))}
    </ol>
  );
}

// ── Body paragraph ────────────────────────────────────────────────────────────
function P({ children }) {
  return <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.7, margin: '0.5rem 0' }}>{children}</p>;
}

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

        {/* Title */}
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gray-800)', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
          LoopLink Terms and Conditions
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginBottom: '0.5rem' }}>
          Prototype version · Effective November 22, 2026
        </p>
        <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '1.25rem 0' }} />

        {/* ── Section 1 ── */}
        <H n={1}>About LoopLink</H>
        <P>
          LoopLink is a campus web application that lets students borrow items, report lost and found belongings, and share or donate items within the school community. LoopLink is currently a prototype. Features may change, data may be reset, and the service may be unavailable at times without notice. By creating an account or using LoopLink, you agree to these Terms and Conditions. If you do not agree, please do not use the app.
        </P>

        {/* ── Section 2 ── */}
        <H n={2}>Eligibility and Accounts</H>
        <Ul items={[
          'LoopLink is intended for students and authorized personnel of the school community.',
          'You may sign in with a Google account or register with your school email.',
          'You are responsible for the accuracy of the information you provide and for keeping your login secure. Do not share your account with others.',
          'You must tell an administrator right away if you believe your account has been accessed without your permission.',
        ]} />

        {/* ── Section 3 ── */}
        <H n={3}>User Roles</H>
        <Ul items={[
          'Students can browse items, request to borrow, post lost and found reports, and view their own activity.',
          'Administrators manage items, review borrow requests, manage lost and found reports, and manage users. Administrator access is granted only by the LoopLink team and may be removed at any time.',
        ]} />

        {/* ── Section 4 ── */}
        <H n={4}>Borrowing Items</H>
        <Ol items={[
          'A borrow request is not a guarantee. An item is borrowed only after an administrator approves the request.',
          'Each item has a maximum borrow period set by the administrators. You agree to return the item in the same condition, on or before the agreed date.',
          'Where a borrowing fee in pesos (₱) is shown, the fee is collected in person under the administrators\' instructions. LoopLink does not process online payments.',
          'You are responsible for any item that is lost, damaged, or returned late while it is under your name. Administrators may require repair, replacement, or other reasonable remedies.',
          'Administrators may decline, cancel, or recall a request or item when necessary, including for misuse or repeated late returns.',
        ]} />

        {/* ── Section 5 ── */}
        <H n={5}>Lost and Found</H>
        <Ul items={[
          'Reports must be truthful and relate to a real lost or found item.',
          'Report details, including the contact information you enter, may be seen by other signed-in users and by administrators so that items can be returned. Share only the contact details you are comfortable making visible.',
          'Posting a report does not guarantee that an item will be found or returned. Administrators may edit, resolve, or remove reports.',
          'If you claim an item, you may be asked to describe it or show proof of ownership.',
        ]} />

        {/* ── Section 6 ── */}
        <H n={6}>Shared, Donated, and Listed Items</H>
        <Ul items={[
          'Items may be offered for borrowing, sharing, or donation and, where enabled, for sale.',
          'Only list items that you own or are authorized to give or sell.',
          'LoopLink only connects users. Meetups, handovers, and any payments happen outside the app, at the users\' own risk.',
        ]} />

        {/* ── Section 7 ── */}
        <H n={7}>Acceptable Use</H>
        <P>You agree not to:</P>
        <Ul items={[
          'give false information or pretend to be someone else;',
          'post content that is offensive, harassing, hateful, sexually explicit, or unlawful;',
          'list or request stolen, prohibited, or dangerous items;',
          'try to access other users\' data, change your own role, or bypass the app\'s security;',
          'interfere with, overload, or damage the app or its data;',
          'use LoopLink for commercial purposes without permission.',
        ]} />
        <P>Administrators may remove content, suspend or deactivate accounts, and report serious violations to school authorities.</P>

        {/* ── Section 8 ── */}
        <H n={8}>Privacy and Your Data</H>
        <P>We handle personal data in line with the Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines.</P>
        <P><strong>What we collect:</strong> account details from your sign-in (name, email address, profile photo); profile details such as student ID and department, if provided; your activity in the app (borrow requests, lost and found reports, and the contact details you enter in them).</P>
        <P><strong>Why we use it:</strong> to create and secure your account; to process borrow requests and return items; to let administrators manage items, reports, and users.</P>
        <P><strong>Who can see it:</strong> your profile and borrow requests are visible to you and to administrators; lost and found reports are visible to other signed-in users and administrators; we do not sell your personal data.</P>
        <P><strong>Where it is stored:</strong> sign-in is handled by Google and Firebase Authentication, and app data is stored in Google Cloud Firestore. These services may process data on servers outside the Philippines. The app is hosted on Vercel.</P>
        <P><strong>Your rights:</strong> you may ask to see, correct, or delete your personal data, and you may withdraw your consent at any time by contacting an administrator. Deleting your data may limit your use of the app. As a prototype, data may also be deleted when the project ends or the system is reset.</P>

        {/* ── Section 9 ── */}
        <H n={9}>Content You Post</H>
        <P>You keep ownership of what you post. By posting, you allow LoopLink and its administrators to store, display, edit, or remove that content as needed to run the service. You are responsible for what you post.</P>

        {/* ── Section 10 ── */}
        <H n={10}>Disclaimers and Limits of Liability</H>
        <Ul items={[
          'LoopLink is provided "as is" and "as available" during its prototype stage. We do not promise that it will be uninterrupted, error-free, or free of data loss.',
          'LoopLink does not own, inspect, or guarantee the items listed and does not take part in the dealings between users.',
          'To the extent allowed by law, the LoopLink team and the school are not liable for lost, damaged, or stolen items, failed transactions, disputes between users, or any indirect loss arising from use of the app.',
        ]} />

        {/* ── Section 11 ── */}
        <H n={11}>Changes to These Terms</H>
        <P>We may update these Terms from time to time. The latest version will be shown in the app with its effective date. Continued use of LoopLink after a change means you accept the updated Terms.</P>

        {/* ── Section 12 ── */}
        <H n={12}>Governing Law</H>
        <P>These Terms are governed by the laws of the Republic of the Philippines.</P>

        {/* ── Section 13 ── */}
        <H n={13}>Contact</H>
        <P>For questions, concerns, or data requests, please contact the LoopLink administrators through the school's designated administrator office or the contact details provided in the app.</P>

        <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '2rem 0 1rem' }} />

        {/* Closing note */}
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', textAlign: 'center', lineHeight: 1.6 }}>
          These Terms were prepared for a student prototype and are not a substitute for legal advice.
        </p>

        {/* Back button at bottom */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
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
