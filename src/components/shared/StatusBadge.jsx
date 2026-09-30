import Badge from './Badge';

// Maps domain status strings to badge variants
const statusMap = {
  // Item availability
  available:   { label: 'Available',   variant: 'success' },
  borrowed:    { label: 'Borrowed',    variant: 'warning' },
  unavailable: { label: 'Unavailable', variant: 'danger'  },

  // Borrow request
  pending:     { label: 'Pending',     variant: 'warning' },
  approved:    { label: 'Approved',    variant: 'success' },
  rejected:    { label: 'Rejected',    variant: 'danger'  },
  returned:    { label: 'Returned',    variant: 'gray'    },
  overdue:     { label: 'Overdue',     variant: 'danger'  },

  // Lost & Found
  open:        { label: 'Open',        variant: 'info'    },
  resolved:    { label: 'Resolved',    variant: 'success' },

  // User
  active:      { label: 'Active',      variant: 'success' },
  inactive:    { label: 'Inactive',    variant: 'gray'    },

  // Report type
  lost:        { label: 'Lost',        variant: 'danger'  },
  found:       { label: 'Found',       variant: 'success' },
};

export default function StatusBadge({ status }) {
  const cfg = statusMap[status] ?? { label: status, variant: 'gray' };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
