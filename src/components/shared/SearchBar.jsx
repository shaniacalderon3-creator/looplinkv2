// Reusable search input with optional filter selects
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  children, // optional filter elements rendered inline
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        background: 'var(--white)',
        border: '1.5px solid var(--gray-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.625rem 1rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Search icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          minWidth: 160,
          border: 'none',
          outline: 'none',
          fontSize: '0.9375rem',
          color: 'var(--gray-800)',
          background: 'transparent',
        }}
      />
      {children}
    </div>
  );
}
