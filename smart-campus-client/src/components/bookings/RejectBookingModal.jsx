import { useState } from 'react';

const RejectBookingModal = ({ booking, onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A rejection reason is required.');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Reject Booking</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="bdetail-alert bdetail-alert-danger">
              <span>❌</span>
              <div>
                <strong>Reject booking #{booking?.id || booking?.bookingId}</strong>
                <p>
                  Resource: <strong>{booking?.resourceName || '—'}</strong><br />
                  Date: <strong>{booking?.bookingDate}</strong> — {booking?.startTime} to {booking?.endTime}
                </p>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reject-reason">
                Rejection Reason <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                id="reject-reason"
                className={`booking-textarea${error ? ' input-error' : ''}`}
                rows={3}
                placeholder="Provide a clear reason for rejection…"
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError(''); }}
                required
              />
              {error && <p className="field-error">{error}</p>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? 'Rejecting…' : '❌ Reject Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectBookingModal;
