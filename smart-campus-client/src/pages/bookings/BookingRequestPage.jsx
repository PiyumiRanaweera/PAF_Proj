import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingApi } from '../../api/bookingApi';
import { resourceApi } from '../../api/resourceApi';

/* ─────────────────────────────────────────────────────────── */
/*  Helpers                                                    */
/* ─────────────────────────────────────────────────────────── */
const today = () => new Date().toISOString().split('T')[0];

const INITIAL = {
  resourceId: '',
  bookingDate: today(),
  startTime: '',
  endTime: '',
  purpose: '',
  expectedAttendees: '',
  notes: '',
};

/* ─────────────────────────────────────────────────────────── */
/*  Component                                                  */
/* ─────────────────────────────────────────────────────────── */
const BookingRequestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('resourceId');

  const [form, setForm] = useState({ ...INITIAL, resourceId: preselectedId || '' });
  const [errors, setErrors] = useState({});
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [loadingResources, setLoadingResources] = useState(true);
  const [conflictMsg, setConflictMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [apiError, setApiError] = useState('');

  /* Load bookable resources */
  useEffect(() => {
    setLoadingResources(true);
    resourceApi
      .getResources({ status: 'ACTIVE' })
      .then((res) => setResources(res.data?.content || res.data || []))
      .catch(() => setResources([]))
      .finally(() => setLoadingResources(false));
  }, []);

  /* Update selectedResource card when resourceId changes */
  useEffect(() => {
    if (!form.resourceId) { setSelectedResource(null); return; }
    const found = resources.find((r) => String(r.id) === String(form.resourceId));
    setSelectedResource(found || null);
  }, [form.resourceId, resources]);

  /* Clear conflict when time/resource changes */
  useEffect(() => {
    setConflictMsg('');
  }, [form.resourceId, form.bookingDate, form.startTime, form.endTime]);

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.resourceId) errs.resourceId = 'Please select a resource.';
    if (!form.bookingDate) errs.bookingDate = 'Booking date is required.';
    if (!form.startTime) errs.startTime = 'Start time is required.';
    if (!form.endTime) errs.endTime = 'End time is required.';
    if (form.startTime && form.endTime && form.startTime >= form.endTime)
      errs.endTime = 'End time must be after start time.';
    if (!form.purpose.trim()) errs.purpose = 'Purpose is required.';
    if (form.expectedAttendees !== '' && Number(form.expectedAttendees) < 1)
      errs.expectedAttendees = 'Attendees must be a positive number.';
    if (selectedResource?.capacity && Number(form.expectedAttendees) > selectedResource.capacity)
      errs.expectedAttendees = `Exceeds resource capacity (${selectedResource.capacity}).`;
    const today = new Date().toISOString().split('T')[0];
    if (form.bookingDate < today) errs.bookingDate = 'Booking date cannot be in the past.';
    return errs;
  };

  const checkConflict = async () => {
    if (!form.resourceId || !form.bookingDate || !form.startTime || !form.endTime) return false;
    try {
      const res = await bookingApi.checkConflict({
        resourceId: form.resourceId,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      if (res.data?.conflict) {
        const msg = res.data.existingBooking
          ? `This resource is already booked from ${res.data.existingBooking.startTime} to ${res.data.existingBooking.endTime}.`
          : 'This time slot is already booked for this resource.';
        setConflictMsg(msg);
        return true;
      }
    } catch {
      // If endpoint doesn't exist yet, skip
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');
    setConflictMsg('');

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const hasConflict = await checkConflict();
    if (hasConflict) return;

    setSubmitting(true);
    try {
      await bookingApi.createBooking({
        resourceId: Number(form.resourceId),
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose.trim(),
        expectedAttendees: form.expectedAttendees !== '' ? Number(form.expectedAttendees) : null,
        notes: form.notes.trim() || null,
      });
      setSuccessMsg('✅ Booking request submitted! Status: PENDING — awaiting admin review.');
      setForm({ ...INITIAL, resourceId: preselectedId || '' });
    } catch (err) {
      const status = err.response?.status;
      const errorMessage = err.response?.data?.message || 'Failed to submit booking. Please try again.';
      
      if (status === 409) {
        setConflictMsg(errorMessage);
      } else {
        setApiError(errorMessage);
        // Map field specific errors back to the form if present
        if (err.response?.data?.errors) {
          setErrors(err.response.data.errors);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Render ── */
  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">New Booking Request</h1>
          <p className="page-subtitle">Reserve a facility or asset for your event or session.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/bookings/my')}>
          ← My Bookings
        </button>
      </div>

      <div className="booking-form-layout">
        {/* ── Form ── */}
        <form className="booking-form-card" onSubmit={handleSubmit} noValidate>
          {/* Success */}
          {successMsg && (
            <div className="booking-alert booking-alert-success">
              {successMsg}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.75rem' }}
                onClick={() => navigate('/bookings/my')}
              >
                View My Bookings →
              </button>
            </div>
          )}

          {/* API error */}
          {apiError && <div className="booking-alert booking-alert-error">{apiError}</div>}

          {/* Conflict warning */}
          {conflictMsg && (
            <div className="booking-alert booking-alert-conflict">
              ⛔ {conflictMsg}
            </div>
          )}

          {/* Resource selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="resourceId">
              Resource <span className="required-star">*</span>
            </label>
            {loadingResources ? (
              <div className="booking-inline-loader"><div className="spinner" /></div>
            ) : (
              <select
                id="resourceId"
                name="resourceId"
                className={`booking-select${errors.resourceId ? ' input-error' : ''}`}
                value={form.resourceId}
                onChange={handleChange}
              >
                <option value="">— Select a resource —</option>
                {resources.map((r) => (
                  <option key={r.id || Math.random()} value={r.id} disabled={r.status !== 'ACTIVE'}>
                    {r.name || 'Unknown Resource'} ({r.type || 'Facility'}) {r.status !== 'ACTIVE' ? '— Unavailable' : ''}
                  </option>
                ))}
              </select>
            )}
            {errors.resourceId && <p className="field-error">{errors.resourceId}</p>}
          </div>

          {/* Date / Time row */}
          <div className="booking-row-3">
            <div className="form-group">
              <label className="form-label" htmlFor="bookingDate">
                Date <span className="required-star">*</span>
              </label>
              <input
                id="bookingDate"
                type="date"
                name="bookingDate"
                className={`booking-input${errors.bookingDate ? ' input-error' : ''}`}
                value={form.bookingDate}
                min={today()}
                onChange={handleChange}
              />
              {errors.bookingDate && <p className="field-error">{errors.bookingDate}</p>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="startTime">
                Start Time <span className="required-star">*</span>
              </label>
              <input
                id="startTime"
                type="time"
                name="startTime"
                className={`booking-input${errors.startTime ? ' input-error' : ''}`}
                value={form.startTime}
                onChange={handleChange}
              />
              {errors.startTime && <p className="field-error">{errors.startTime}</p>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="endTime">
                End Time <span className="required-star">*</span>
              </label>
              <input
                id="endTime"
                type="time"
                name="endTime"
                className={`booking-input${errors.endTime ? ' input-error' : ''}`}
                value={form.endTime}
                onChange={handleChange}
              />
              {errors.endTime && <p className="field-error">{errors.endTime}</p>}
            </div>
          </div>

          {/* Purpose */}
          <div className="form-group">
            <label className="form-label" htmlFor="purpose">
              Purpose <span className="required-star">*</span>
            </label>
            <input
              id="purpose"
              type="text"
              name="purpose"
              className={`booking-input${errors.purpose ? ' input-error' : ''}`}
              placeholder="E.g., Lecture — Database Systems, Group project meeting…"
              value={form.purpose}
              onChange={handleChange}
            />
            {errors.purpose && <p className="field-error">{errors.purpose}</p>}
          </div>

          {/* Attendees */}
          <div className="form-group">
            <label className="form-label" htmlFor="expectedAttendees">
              Expected Attendees
              {selectedResource?.capacity && (
                <span className="capacity-hint"> (max {selectedResource.capacity})</span>
              )}
            </label>
            <input
              id="expectedAttendees"
              type="number"
              name="expectedAttendees"
              className={`booking-input${errors.expectedAttendees ? ' input-error' : ''}`}
              placeholder="e.g. 30"
              min={1}
              max={selectedResource?.capacity || undefined}
              value={form.expectedAttendees}
              onChange={handleChange}
            />
            {errors.expectedAttendees && (
              <p className="field-error">{errors.expectedAttendees}</p>
            )}
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="notes">
              Additional Notes <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              className="booking-textarea"
              rows={3}
              placeholder="Any special requirements or notes for the admin…"
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="submit-booking-btn"
            className="btn btn-primary booking-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="btn-spinner" /> Submitting…
              </>
            ) : (
              '📅 Submit Booking Request'
            )}
          </button>
        </form>

        {/* ── Resource Info Card ── */}
        <div className="booking-resource-preview">
          {!selectedResource ? (
            <div className="resource-preview-placeholder">
              <div className="resource-preview-icon">🏢</div>
              <p>Select a resource to see its details</p>
            </div>
          ) : (
            <div className="resource-preview-card">
              <div className="resource-preview-header">
                <span className="resource-type-chip">{selectedResource.type}</span>
                <span
                  className={`booking-status-badge ${
                    selectedResource.status === 'ACTIVE' ? 'status-approved' : 'status-cancelled'
                  }`}
                >
                  {selectedResource.status}
                </span>
              </div>
              <h3 className="resource-preview-name">{selectedResource.name}</h3>
              <div className="resource-preview-meta">
                <div className="resource-meta-item">
                  <span>📍</span>
                  <span>{selectedResource.location || '—'}</span>
                </div>
                <div className="resource-meta-item">
                  <span>👥</span>
                  <span>Capacity: {selectedResource.capacity || '—'}</span>
                </div>
                {selectedResource.availabilityWindows && (
                  <div className="resource-meta-item">
                    <span>🕐</span>
                    <span>Available: {selectedResource.availabilityWindows}</span>
                  </div>
                )}
                {selectedResource.description && (
                  <p className="resource-preview-desc">{selectedResource.description}</p>
                )}
              </div>
              {selectedResource.status !== 'ACTIVE' && (
                <div className="booking-alert booking-alert-error" style={{ marginTop: '1rem' }}>
                  ⚠️ This resource is currently unavailable and cannot be booked.
                </div>
              )}
            </div>
          )}

          {/* Tip */}
          <div className="booking-tip-card">
            <h4>💡 Booking Tips</h4>
            <ul>
              <li>All bookings start as <strong>PENDING</strong> and require admin approval.</li>
              <li>Bookings are subject to availability — conflicts are automatically detected.</li>
              <li>You can cancel an approved booking from My Bookings.</li>
              <li>Check the resource availability window before choosing a time.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingRequestPage;
