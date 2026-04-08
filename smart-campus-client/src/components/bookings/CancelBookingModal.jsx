import { useState } from 'react';

const CancelBookingModal = ({ booking, onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(reason.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Cancel Booking</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="bdetail-alert bdetail-alert-warning">
              <span>🚫</span>
              <div>
                <strong>Confirm Cancellation</strong>
                <p>
                  You are about to cancel your booking for{' '}
                  <strong>{booking?.resourceName || 'this resource'}</strong> on{' '}
                  <strong>{booking?.bookingDate}</strong>.
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cancel-reason">
                Cancellation Reason <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
              </label>
              <textarea
                id="cancel-reason"
                className="booking-textarea"
                rows={3}
                placeholder="Why are you cancelling?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Keep Booking
            </button>
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? 'Cancelling…' : '🚫 Cancel Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelBookingModal;
