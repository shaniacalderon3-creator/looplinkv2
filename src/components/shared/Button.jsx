// Reusable button component
// variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
// size: 'sm' | 'md' | 'lg'

const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  fontWeight: 600,
  borderRadius: 'var(--radius)',
  border: '1.5px solid transparent',
  cursor: 'pointer',
  transition: 'background var(--transition), color var(--transition), border-color var(--transition), opacity var(--transition)',
  whiteSpace: 'nowrap',
  fontFamily: 'inherit',
};

const variants = {
  primary: {
    background: 'var(--primary)',
    color: '#fff',
    borderColor: 'var(--primary)',
  },
  secondary: {
    background: 'var(--gray-100)',
    color: 'var(--gray-700)',
    borderColor: 'var(--gray-200)',
  },
  danger: {
    background: 'var(--danger)',
    color: '#fff',
    borderColor: 'var(--danger)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--primary)',
    borderColor: 'transparent',
  },
  outline: {
    background: 'transparent',
    color: 'var(--primary)',
    borderColor: 'var(--primary)',
  },
  'outline-danger': {
    background: 'transparent',
    color: 'var(--danger)',
    borderColor: 'var(--danger)',
  },
  success: {
    background: 'var(--success)',
    color: '#fff',
    borderColor: 'var(--success)',
  },
};

const sizes = {
  sm: { padding: '0.35rem 0.75rem', fontSize: '0.8125rem' },
  md: { padding: '0.55rem 1.1rem', fontSize: '0.9375rem' },
  lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  style,
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...base,
        ...variants[variant],
        ...sizes[size],
        ...(fullWidth ? { width: '100%' } : {}),
        ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}
