// Section page header with optional action slot
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--gray-800)', lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ marginTop: '0.3rem', color: 'var(--gray-500)', fontSize: '0.9375rem' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
