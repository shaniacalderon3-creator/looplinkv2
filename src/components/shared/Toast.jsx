import { useEffect } from 'react';

// Single toast message — used by ToastContainer
function Toast({ message, type = 'default', onRemove }) {
  useEffect(() => {
    const t = setTimeout(onRemove, 3200);
    return () => clearTimeout(t);
  }, [onRemove]);

  const icons = { success: '✓', error: '✕', default: 'ℹ' };

  return (
    <div className={`toast ${type}`}>
      <span style={{ fontWeight: 700 }}>{icons[type] ?? icons.default}</span>
      {message}
    </div>
  );
}

// Renders all active toasts — place once at the app root
export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onRemove={() => removeToast(t.id)}
        />
      ))}
    </div>
  );
}
