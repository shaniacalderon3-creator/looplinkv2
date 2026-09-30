// Empty state block — shown when a list has no items
export default function EmptyState({ icon = '📭', title = 'Nothing here yet', description = '' }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{icon}</div>
      <p style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>{title}</p>
      {description && <p style={{ fontSize: '0.9rem', color: 'var(--gray-400)' }}>{description}</p>}
    </div>
  );
}
