// Reusable status/category badge
// variant: 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'primary'

const variantStyles = {
  success: { background: 'var(--success-light)', color: 'var(--success)' },
  warning: { background: 'var(--warning-light)', color: '#b45309' },
  danger:  { background: 'var(--danger-light)',  color: 'var(--danger)' },
  info:    { background: 'var(--info-light)',    color: 'var(--info)' },
  gray:    { background: 'var(--gray-100)',      color: 'var(--gray-600)' },
  primary: { background: 'var(--primary-light)', color: 'var(--primary)' },
};

export default function Badge({ children, variant = 'gray', style }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.65rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
