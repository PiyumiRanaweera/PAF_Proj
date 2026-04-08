import { useState, useEffect, useCallback } from 'react';
import { adminBookingApi } from '../../api/bookingApi';
import StatusBadge from '../../components/bookings/StatusBadge';
import BookingDetailModal from '../../components/bookings/BookingDetailModal';
import RejectBookingModal from '../../components/bookings/RejectBookingModal';
import CancelBookingModal from '../../components/bookings/CancelBookingModal';

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const AdminBookingsPage = () => {
  const [bookings, setBookings]              = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [search, setSearch]                 = useState('');
  const [statusFilter, setStatusFilter]     = useState('ALL');
  const [dateFilter, setDateFilter]         = useState('');
  const [detailBooking, setDetailBooking]   = useState(null);
  const [rejectBooking, setRejectBooking]   = useState(null);
  const [cancelBooking, setCancelBooking]   = useState(null);
  const [actionLoading, setActionLoading]   = useState(false);
  const [toast, setToast]                   = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (dateFilter) params.bookingDate = dateFilter;
      const res = await adminBookingApi.getAllBookings(params);
      setBookings(res.data?.content || res.data || []);
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Failed to load bookings.';
      setError(status ? `Error ${status}: ${msg}` : msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  /* Filter by search locally */
  const displayed = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (b.resourceName || '').toLowerCase().includes(q) ||
      (b.userName || b.user?.name || '').toLowerCase().includes(q) ||
      (b.purpose || '').toLowerCase().includes(q) ||
      String(b.id || b.bookingId || '').includes(q)
    );
  });

  /* ── Actions ── */
  const handleApprove = async (b) => {
    if (!window.confirm(`Approve booking #${b.id || b.bookingId}?`)) return;
    setActionLoading(true);
    try {
      await adminBookingApi.approveBooking(b.id || b.bookingId);
      showToast(`✅ Booking #${b.id || b.bookingId} approved.`);
      fetchBookings();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to approve.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    if (!rejectBooking) return;
    setActionLoading(true);
    try {
      await adminBookingApi.rejectBooking(rejectBooking.id || rejectBooking.bookingId, reason);
      showToast(`✅ Booking #${rejectBooking.id || rejectBooking.bookingId} rejected.`);
      setRejectBooking(null);
      fetchBookings();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to reject.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (reason) => {
    if (!cancelBooking) return;
    setActionLoading(true);
    try {
      await adminBookingApi.adminCancelBooking(cancelBooking.id || cancelBooking.bookingId, reason);
      showToast(`✅ Booking #${cancelBooking.id || cancelBooking.bookingId} cancelled.`);
      setCancelBooking(null);
      fetchBookings();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to cancel.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Stats ── */
  const stats = {
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === 'PENDING').length,
    approved:  bookings.filter((b) => b.status === 'APPROVED').length,
    rejected:  bookings.filter((b) => b.status === 'REJECTED').length,
    cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  return (
    <div className="page">
      {/* Toast */}
      {toast.msg && (
        <div className={`booking-toast ${toast.type === 'error' ? 'booking-toast-error' : ''}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Booking Management</h1>
          <p className="page-subtitle">Review, approve, and manage all booking requests.</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="admin-stats-row">
        {[
          { label: 'Total',     value: stats.total,     cls: '' },
          { label: 'Pending',   value: stats.pending,   cls: 'stat-pending' },
          { label: 'Approved',  value: stats.approved,  cls: 'stat-approved' },
          { label: 'Rejected',  value: stats.rejected,  cls: 'stat-rejected' },
          { label: 'Cancelled', value: stats.cancelled,  cls: 'stat-cancelled' },
        ].map((s) => (
          <div key={s.label} className={`admin-stat-card ${s.cls}`}>
            <span className="admin-stat-value">{s.value}</span>
            <span className="admin-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="booking-filters-bar" style={{ marginBottom: '1.5rem' }}>
        {/* Search */}
        <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
          <span className="search-icon">🔍</span>
          <input
            id="admin-booking-search"
            className="search-input"
            placeholder="Search by resource, user, purpose or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="filter-bar">
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

        {(statusFilter !== 'ALL' || dateFilter || search) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setStatusFilter('ALL'); setDateFilter(''); setSearch(''); }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner-large" /></div>
      ) : error ? (
        <div className="booking-alert booking-alert-error">{error}</div>
      ) : displayed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No bookings found</h3>
          <p>No booking requests match your current filters.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Resource</th>
                <th>User</th>
                <th>Date</th>
                <th>Time</th>
                <th>Attendees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((b) => {
                const id = b.id || b.bookingId;
                return (
                  <tr key={id}>
                    <td className="booking-id-cell">#{id}</td>
                    <td>
                      <div className="booking-resource-cell">
                        <span className="booking-resource-name">
                          {b.resourceName || b.resource?.name || '—'}
                        </span>
                        <span className="booking-resource-loc">
                          {b.resourceLocation || b.resource?.location || ''}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="booking-user-cell">
                        <div className="table-avatar-fallback">
                          {(b.userName || b.user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="user-name">{b.userName || b.user?.name || '—'}</p>
                          <p className="email-cell">{b.userEmail || b.user?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="date-cell">{b.bookingDate}</td>
                    <td className="date-cell">{b.startTime} – {b.endTime}</td>
                    <td className="date-cell">{b.expectedAttendees ?? '—'}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div className="action-btns">
                        {/* View */}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setDetailBooking(b)}
                          title="View details"
                        >
                          👁
                        </button>
                        {/* Approve */}
                        {b.status === 'PENDING' && (
                          <button
                            className="btn btn-sm booking-btn-approve"
                            onClick={() => handleApprove(b)}
                            disabled={actionLoading}
                            title="Approve"
                          >
                            ✅
                          </button>
                        )}
                        {/* Reject */}
                        {b.status === 'PENDING' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setRejectBooking(b)}
                            disabled={actionLoading}
                            title="Reject"
                          >
                            ❌
                          </button>
                        )}
                        {/* Cancel */}
                        {b.status === 'APPROVED' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setCancelBooking(b)}
                            disabled={actionLoading}
                            title="Cancel"
                          >
                            🚫
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {detailBooking && (
        <BookingDetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />
      )}
      {rejectBooking && (
        <RejectBookingModal
          booking={rejectBooking}
          onConfirm={handleReject}
          onClose={() => setRejectBooking(null)}
          loading={actionLoading}
        />
      )}
      {cancelBooking && (
        <CancelBookingModal
          booking={cancelBooking}
          onConfirm={handleCancel}
          onClose={() => setCancelBooking(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminBookingsPage;
