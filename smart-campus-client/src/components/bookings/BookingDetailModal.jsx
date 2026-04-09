import StatusBadge from './StatusBadge';

const fmt = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const BookingDetailModal = ({ booking, onClose }) => {
  if (!booking) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal booking-detail-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 560 }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Booking Details</h2>
            <span className="modal-booking-id">#{booking.id || booking.bookingId}</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Status row */}
          <div className="bdetail-row bdetail-status-row">
            <span className="bdetail-label">Status</span>
            <StatusBadge status={booking.status} />
          </div>

          {/* Resource */}
          <div className="bdetail-section">
            <h4 className="bdetail-section-title">📍 Resource</h4>
            <div className="bdetail-grid">
              <span className="bdetail-label">Name</span>
              <span className="bdetail-value">{booking.resourceName || booking.resource?.name || '—'}</span>
              <span className="bdetail-label">Type</span>
              <span className="bdetail-value">{booking.resourceType || booking.resource?.type || '—'}</span>
              <span className="bdetail-label">Location</span>
              <span className="bdetail-value">{booking.resourceLocation || booking.resource?.location || '—'}</span>
              <span className="bdetail-label">Capacity</span>
              <span className="bdetail-value">{booking.resourceCapacity || booking.resource?.capacity || '—'}</span>
            </div>
          </div>

          {/* Time */}
          <div className="bdetail-section">
            <h4 className="bdetail-section-title">🕐 Schedule</h4>
            <div className="bdetail-grid">
              <span className="bdetail-label">Date</span>
              <span className="bdetail-value">{booking.bookingDate || '—'}</span>
              <span className="bdetail-label">Start</span>
              <span className="bdetail-value">{booking.startTime || '—'}</span>
              <span className="bdetail-label">End</span>
              <span className="bdetail-value">{booking.endTime || '—'}</span>
            </div>
          </div>

          {/* Booking info */}
          <div className="bdetail-section">
            <h4 className="bdetail-section-title">📋 Booking Info</h4>
            <div className="bdetail-grid">
              <span className="bdetail-label">Purpose</span>
              <span className="bdetail-value">{booking.purpose || '—'}</span>
              <span className="bdetail-label">Attendees</span>
              <span className="bdetail-value">{booking.expectedAttendees ?? '—'}</span>
              {booking.notes && (
                <>
                  <span className="bdetail-label">Notes</span>
                  <span className="bdetail-value">{booking.notes}</span>
                </>
              )}
            </div>
          </div>

          {/* Rejection reason */}
          {booking.status === 'REJECTED' && booking.rejectionReason && (
            <div className="bdetail-alert bdetail-alert-danger">
              <span>⚠️</span>
              <div>
                <strong>Rejection Reason</strong>
                <p>{booking.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Cancellation reason */}
          {booking.status === 'CANCELLED' && booking.cancellationReason && (
            <div className="bdetail-alert bdetail-alert-warning">
              <span>🚫</span>
              <div>
                <strong>Cancellation Reason</strong>
                <p>{booking.cancellationReason}</p>
              </div>
            </div>
          )}

          {/* Audit trail */}
          <div className="bdetail-section">
            <h4 className="bdetail-section-title">🔍 Audit</h4>
            <div className="bdetail-grid">
              <span className="bdetail-label">Created</span>
              <span className="bdetail-value">{fmt(booking.createdAt)}</span>
              <span className="bdetail-label">Updated</span>
              <span className="bdetail-value">{fmt(booking.updatedAt)}</span>
              {booking.approvedAt && (
                <>
                  <span className="bdetail-label">Approved by</span>
                  <span className="bdetail-value">{booking.approvedBy || '—'} · {fmt(booking.approvedAt)}</span>
                </>
              )}
              {booking.cancelledAt && (
                <>
                  <span className="bdetail-label">Cancelled by</span>
                  <span className="bdetail-value">{booking.cancelledBy || '—'} · {fmt(booking.cancelledAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
