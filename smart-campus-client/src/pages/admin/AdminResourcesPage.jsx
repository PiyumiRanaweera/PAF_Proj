import { useState, useEffect } from 'react';
import { resourceApi } from '../../api/resourceApi';
import StatusBadge from '../../components/bookings/StatusBadge';

const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT', 'SPORTS_FACILITY', 'OTHER'];
const STATUSES = ['ACTIVE', 'UNDER_MAINTENANCE', 'INACTIVE'];

const INITIAL_FORM = {
  name: '',
  type: 'LECTURE_HALL',
  location: '',
  capacity: '',
  status: 'ACTIVE',
  availabilityWindows: 'Mon-Fri 08:00-20:00',
  description: '',
};

const AdminResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await resourceApi.getResources();
      setResources(res.data || []);
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (resource = null) => {
    if (resource) {
      setEditingId(resource.id);
      setForm({
        name: resource.name,
        type: resource.type,
        location: resource.location,
        capacity: resource.capacity || '',
        status: resource.status,
        availabilityWindows: resource.availabilityWindows || '',
        description: resource.description || '',
      });
    } else {
      setEditingId(null);
      setForm(INITIAL_FORM);
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await resourceApi.updateResource(editingId, form);
      } else {
        await resourceApi.addResource(form);
      }
      setIsModalOpen(false);
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) return;
    try {
      await resourceApi.deleteResource(id);
      fetchResources();
    } catch (err) {
      alert('Failed to delete resource. It might be linked to existing bookings.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Resource Catalogue</h1>
          <p className="page-subtitle">Manage campus facilities, labs, and equipment inventory.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Add New Resource
        </button>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search by name or location..." 
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-spinner"><div className="spinner-large" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Type</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="user-name">{r.name}</div>
                    <div className="email-cell" style={{ fontSize: '0.75rem' }}>ID: {r.id}</div>
                  </td>
                  <td><span className="resource-type-chip">{r.type}</span></td>
                  <td className="date-cell">{r.location}</td>
                  <td className="date-cell">{r.capacity || 'N/A'}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon-sm" onClick={() => handleOpenModal(r)} title="Edit">✏️</button>
                      <button className="btn-icon-sm btn-danger-sm" onClick={() => handleDelete(r.id)} title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">No resources found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Resource' : 'Add New Resource'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="booking-alert booking-alert-error">{error}</div>}
                
                <div className="form-group">
                  <label className="form-label">Resource Name *</label>
                  <input 
                    type="text" className="premium-input" required 
                    value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="e.g. Computing Lab 01"
                  />
                </div>

                <div className="booking-row-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select 
                      className="booking-select"
                      value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}
                    >
                      {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                      className="booking-select"
                      value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>

                <div className="booking-row-3" style={{ gridTemplateColumns: '1.5fr 0.5fr' }}>
                   <div className="form-group">
                    <label className="form-label">Location *</label>
                    <input 
                      type="text" className="premium-input" required 
                      value={form.location} onChange={(e) => setForm({...form, location: e.target.value})}
                      placeholder="e.g. Block B, Level 2"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacity</label>
                    <input 
                      type="number" className="premium-input"
                      value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})}
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="form-group">
                   <label className="form-label">Availability Windows</label>
                   <input 
                    type="text" className="premium-input"
                    value={form.availabilityWindows} onChange={(e) => setForm({...form, availabilityWindows: e.target.value})}
                    placeholder="e.g. Mon-Fri 08:00-18:00"
                  />
                </div>

                <div className="form-group">
                   <label className="form-label">Description</label>
                   <textarea 
                    className="booking-textarea" 
                    value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                    placeholder="Briefly describe the resource..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingId ? 'Update Resource' : 'Create Resource')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResourcesPage;
