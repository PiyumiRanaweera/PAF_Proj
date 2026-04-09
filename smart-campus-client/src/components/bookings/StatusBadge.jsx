/**
 * StatusBadge — shows booking status with appropriate colour
 * statuses: PENDING | APPROVED | REJECTED | CANCELLED
 */
const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   cls: 'status-pending'   },
  APPROVED:  { label: 'Approved',  cls: 'status-approved'  },
  REJECTED:  { label: 'Rejected',  cls: 'status-rejected'  },
  CANCELLED: { label: 'Cancelled', cls: 'status-cancelled' },
  // Resource Statuses
  ACTIVE:            { label: 'Active',            cls: 'status-approved'  },
  UNDER_MAINTENANCE: { label: 'Maintenance',       cls: 'status-pending'   },
  INACTIVE:          { label: 'Inactive',          cls: 'status-cancelled' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: '' };
  return (
    <span className={`booking-status-badge ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
