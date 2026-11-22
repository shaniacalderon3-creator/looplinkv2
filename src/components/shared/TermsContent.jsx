/**
 * TermsContent — reusable Terms and Conditions renderer.
 *
 * Props:
 *   compact (bool, default false) — reduces font sizes slightly for use inside a modal.
 *
 * Self-contained: no router imports, no hooks. Works inside a page or a modal.
 */

function S(compact) {
  // Returns a style helper object so every element scales together.
  return {
    h1: {
      fontSize:     compact ? '1.125rem' : '1.375rem',
      fontWeight:   900,
      color:        'var(--gray-800)',
      letterSpacing:'-0.02em',
      marginBottom: '0.25rem',
    },
    subtitle: {
      fontSize:  compact ? '0.75rem' : '0.8125rem',
      color:     'var(--gray-400)',
      marginBottom: '0.25rem',
    },
    h2: {
      fontSize:   compact ? '0.875rem' : '0.9375rem',
      fontWeight: 700,
      color:      'var(--gray-800)',
      margin:     compact ? '1.25rem 0 0.35rem' : '1.5rem 0 0.4rem',
    },
    p: {
      fontSize:   compact ? '0.8125rem' : '0.875rem',
      color:      'var(--gray-600)',
      lineHeight: 1.7,
      margin:     '0.35rem 0',
    },
    li: {
      fontSize:   compact ? '0.8125rem' : '0.875rem',
      color:      'var(--gray-600)',
      lineHeight: 1.65,
    },
    divider: {
      border:    'none',
      borderTop: '1px solid var(--gray-200)',
      margin:    compact ? '1rem 0 0.75rem' : '1.5rem 0 1rem',
    },
    note: {
      fontSize:  compact ? '0.75rem' : '0.8rem',
      color:     'var(--gray-400)',
      textAlign: 'center',
      lineHeight: 1.6,
      marginTop: '0.75rem',
    },
  };
}

function P({ children, s }) {
  return <p style={s.p}>{children}</p>;
}

function H2({ children, s }) {
  return <h2 style={s.h2}>{children}</h2>;
}

function Ul({ items, s }) {
  return (
    <ul style={{ paddingLeft: '1.25rem', margin: '0.4rem 0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {items.map((item, i) => <li key={i} style={s.li}>{item}</li>)}
    </ul>
  );
}

function Ol({ items, s }) {
  return (
    <ol style={{ paddingLeft: '1.5rem', margin: '0.4rem 0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {items.map((item, i) => <li key={i} style={s.li}>{item}</li>)}
    </ol>
  );
}

export default function TermsContent({ compact = false }) {
  const s = S(compact);

  return (
    <div>
      {/* Title */}
      <h1 style={s.h1}>TERMS AND CONDITIONS</h1>
      <p style={s.subtitle}>Effective date: November 22, 2026</p>
      <hr style={s.divider} />

      <P s={s}>
        These terms and conditions (the "Terms and Conditions") govern the use of LOOPLINK (the "Site"), at{' '}
        <a href="https://looplinkv2.vercel.app" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
          https://looplinkv2.vercel.app
        </a>{' '}
        or through the QR code on the CAEc bulletin board. This Site is owned and operated by the LOOPLINK Team of the College of Applied Economics (CAEc), University of Southeastern Philippines (USeP), Obrero Campus. This Site is a student-to-student borrowing and lost-and-found platform.
      </P>
      <P s={s}>
        By using this Site, you indicate that you have read and understand these Terms and Conditions and agree to abide by them at all times.
      </P>

      {/* About LOOPLINK */}
      <H2 s={s}>About LOOPLINK</H2>
      <P s={s}>
        LOOPLINK works in a cycle of borrow, use, return, and share. It offers: BorrowBoard (borrow calculators, umbrellas, academic tools, lab gear, and books); Shared and Donated Items (give away or claim school supplies, uniforms, and study materials); LostLink (post lost belongings and report found items); and Basic Supplies at low cost. LOOPLINK only connects students. We do not own, hold, or guarantee any item listed.
      </P>

      {/* Eligibility and Accounts */}
      <H2 s={s}>Eligibility and Accounts</H2>
      <P s={s}>The Site is for CAEc students of USeP. When you create an account, you agree to the following:</P>
      <Ol s={s} items={[
        'You are solely responsible for your account and the security and privacy of your password and login details, and for all activity under your account; and',
        'All personal information you provide is up to date, accurate, and truthful, and you will update it if it changes. You may keep only one account and may not use another person\'s identity.',
      ]} />
      <P s={s}>
        We reserve the right to suspend or terminate your account if you use our Site illegally, post false information, or violate these Terms and Conditions.
      </P>

      {/* Borrowing */}
      <H2 s={s}>Borrowing (BorrowBoard)</H2>
      <Ul s={s} items={[
        'Borrowers must use items only for their intended purpose, take proper care of them, not lend or sell them to others, and return them on time and in the same condition. Mark the transaction complete once returned.',
        'Lenders may list only items they own or are allowed to lend, must describe the item and its condition honestly, and must not list dangerous, illegal, or prohibited items.',
        'Both sides should agree on the pickup place and return date. If an item is lost or damaged, the borrower and lender should settle it fairly, such as by repair or replacement. LOOPLINK may help communication but is not liable for compensation.',
      ]} />

      {/* Lost and Found */}
      <H2 s={s}>Lost and Found (LostLink)</H2>
      <Ul s={s} items={[
        'Post only genuine lost items and report found items honestly and promptly. Keep found items safe, and do not use, sell, or keep them.',
        'Do not post private details (such as ID numbers or serial numbers) publicly. Keep them to verify ownership.',
        'Ownership verification: A person claiming an item must give clear proof it is theirs. The finder or LOOPLINK Team may refuse to release an item if ownership cannot be reasonably verified. False claims are a serious violation.',
        'Items left unclaimed for a reasonable time may be turned over to the appropriate college office.',
      ]} />

      {/* Shared and Donated Items */}
      <H2 s={s}>Shared and Donated Items</H2>
      <P s={s}>
        Donated items are given "as is" and must be safe, usable, and yours to give. Once an item is donated and received, ownership transfers and it need not be returned. Claim only what you need so others are not left out.
      </P>

      {/* Fees */}
      <H2 s={s}>Fees, Supplies, and Donations</H2>
      <P s={s}>
        LOOPLINK keeps borrowing fees low, and any fee is shown on the Site before you confirm. Basic supplies are sold at PHP 30 per yellow pad and PHP 8 per ballpen; the price shown at purchase applies. Operations are supported by voluntary donations and partnerships. Fees and purchases are non-refundable once the item or service is provided.
      </P>

      {/* Safe Meetups */}
      <H2 s={s}>Safe Meetups</H2>
      <P s={s}>
        Meet only in safe, public places on campus, such as the CAEc Building, preferably during school hours. Never share passwords, codes, or financial details. Do not attend a meetup if you feel unsafe, and report concerns to us right away.
      </P>

      {/* Prohibited Conduct */}
      <H2 s={s}>Prohibited Conduct</H2>
      <P s={s}>You must not:</P>
      <Ul s={s} items={[
        'post false or fraudulent listings or claims;',
        'harass, threaten, or impersonate others;',
        'post offensive or illegal content;',
        'list stolen, hazardous, or prohibited items;',
        'use the Site for commercial resale;',
        'hack, scrape, or disrupt the Site;',
        'break any school policy or law.',
      ]} />

      {/* Limitation of Liability */}
      <H2 s={s}>Limitation of Liability</H2>
      <P s={s}>
        To the fullest extent permitted by law, LOOPLINK does not guarantee the quality, safety, condition, or availability of items, and is not responsible for lost, stolen, damaged, or unreturned items, disputes between users, or harm arising from meetups. The Site may be changed, paused, or discontinued at any time. You use the Site and deal with other users at your own risk.
      </P>

      {/* Privacy */}
      <H2 s={s}>Privacy</H2>
      <P s={s}>
        We handle personal information in line with the Data Privacy Act of 2012 (Republic Act No. 10173). We collect account details, content you post, and basic usage information to run the Site, connect users, verify ownership, and prevent misuse. We do not sell your data. Your name and contact details are shared with another user only as needed to complete a transaction, or as required by law or school authorities. You may request to view, correct, or delete your data by emailing us.
      </P>

      {/* Intellectual Property */}
      <H2 s={s}>Intellectual Property</H2>
      <P s={s}>
        The LOOPLINK name, logo, tagline, design, and content are the property of the LOOPLINK Team and its creators and may not be copied or used without permission. You keep ownership of content you post, but allow LOOPLINK to display it on the Site to operate the service.
      </P>

      {/* Links */}
      <H2 s={s}>Links to Other Websites</H2>
      <P s={s}>
        Our Site may contain links to third-party websites or services that we do not own or control. We are not responsible for their content, policies, or practices. Please read their terms and privacy policies before using them.
      </P>

      {/* Enforcement and Changes */}
      <H2 s={s}>Enforcement and Changes</H2>
      <P s={s}>
        We may remove content, warn, suspend, or terminate accounts that violate these Terms, and may refer serious matters such as theft, fraud, or harassment to the college or university authorities. We may update these Terms from time to time; continued use of the Site means you accept the updated Terms. These Terms are governed by the laws of the Republic of the Philippines and USeP rules.
      </P>

      {/* Contact */}
      <H2 s={s}>Contact Us</H2>
      <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: compact ? '0.75rem' : '1rem', marginTop: '0.5rem' }}>
        <p style={{ ...s.p, margin: '0.2rem 0' }}>📍 USeP Obrero, CAEc Building, Davao City</p>
        <p style={{ ...s.p, margin: '0.2rem 0' }}>✉️ studentlooplink@gmail.com &nbsp;|&nbsp; 📞 +63 965 933 4380</p>
        <p style={{ ...s.p, margin: '0.2rem 0' }}>🌐 <a href="https://looplinkv2.vercel.app" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>looplinkv2.vercel.app</a> &nbsp;|&nbsp; 📱 @studentlooplink</p>
      </div>

      <hr style={s.divider} />
      <p style={s.note}>These Terms were prepared for a student platform and are not a substitute for legal advice.</p>
    </div>
  );
}
