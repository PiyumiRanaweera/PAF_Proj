import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../../api/bookingApi';
import StatusBadge from '../../components/bookings/StatusBadge';
import BookingDetailModal from '../../components/bookings/BookingDetailModal';
import CancelBookingModal from '../../components/bookings/CancelBookingModal';

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const SORTS = [
  { value: 'newest',   label: 'Newest First' },
  { value: 'upcoming', label: 'Upcoming First' },
];

const MyBookingsPage = () => {
  const navigate = useNavigate();

  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter]     = useState('');
  const [sortMode, setSortMode]         = useState('newest');
  const [detailBooking, setDetailBooking]  = useState(null);
  const [cancelBooking, setCancelBooking]  = useState(null);
  const [cancelling, setCancelling]     = useState(false);
  const [toast, setToast]              = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (dateFilter) params.bookingDate = dateFilter;
      const res = await bookingApi.getMyBookings(params);
      let data = res.data?.content || res.data || [];
      // Client-side sort
      if (sortMode === 'newest') {
        data = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        data = [...data].sort((a, b) => {
          const da = new Date(`${a.bookingDate}T${a.startTime}`);
          const db = new Date(`${b.bookingDate}T${b.startTime}`);
          return da - db;
        });
      }
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, sortMode]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (reason) => {
    if (!cancelBooking) return;
    setCancelling(true);
    try {
      await bookingApi.cancelBooking(cancelBooking.id || cancelBooking.bookingId, reason);
      showToast('✅ Booking cancelled successfully.');
      setCancelBooking(null);
      fetchBookings();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to cancel booking.'));
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (b) => b.status === 'APPROVED' || b.status === 'PENDING';

  return (
    <div className="page">
      {/* Toast */}
      {toast && <div className="booking-toast">{toast}</div>}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <button
          id="new-booking-btn"
          className="btn btn-primary"
          onClick={() => navigate('/bookings/new')}
        >
          + New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="booking-filters-bar">
        {/* Status chips */}
        <div className="filter-bar" style={{ flex: 1, flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <input
          type="date"
          className="booking-input"
          style={{ width: 160 }}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          title="Filter by date"
        />

        {/* Sort */}
        <select
          className="booking-select"
          style={{ width: 160 }}
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {(statusFilter !== 'ALL' || dateFilter) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setStatusFilter('ALL'); setDateFilter(''); }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner-large" /></div>
      ) : error ? (
        <div className="booking-alert booking-alert-error">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '3rem' }}>
          <div className="empty-icon">📅</div>
          <h3>No bookings found</h3>
          <p>
            {statusFilter !== 'ALL'
              ? `You have no ${statusFilter.toLowerCase()} bookings.`
              : "You haven't made any booking requests yet."}
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/bookings/new')}>
            Make a Booking
          </button>
        </div>
      ) : (
        <div className="booking-cards-grid">
          {bookings.map((b) => (
            <div key={b.id || b.bookingId} className="booking-card">
              <div className="booking-card-top">
                <div>
                  <p className="booking-card-resource">{b.resourceName || b.resource?.name || 'Resource'}</p>
                  <p className="booking-card-location">
                    📍 {b.resourceLocation || b.resource?.location || '—'}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>

              <div className="booking-card-time">
                <span>📅 {b.bookingDate}</span>
                <span>🕐 {b.startTime} – {b.endTime}</span>
              </div>

              <p className="booking-card-purpose">
                {b.purpose}
                {b.expectedAttendees != null && (
                  <span className="booking-card-attendees"> · 👥 {b.expectedAttendees}</span>
                )}
              </p>

              {b.status === 'REJECTED' && b.rejectionReason && (
                <p className="booking-card-reason booking-card-reason-reject">
                  ⚠️ {b.rejectionReason}
                </p>
              )}

              <div className="booking-card-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDetailBooking(b)}
                >
                  View Details
                </button>
                {canCancel(b) && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setCancelBooking(b)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
        />
      )}
      {cancelBooking && (
        <CancelBookingModal
          booking={cancelBooking}
          onConfirm={handleCancel}
          onClose={() => setCancelBooking(null)}
          loading={cancelling}
        />
      )}
    </div>
  );
};

export default MyBookingsPage;
