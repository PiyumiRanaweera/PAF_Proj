import { useEffect, useMemo, useState } from 'react';
import { resourceApi } from '../../api/resourceApi';
import { useAuth } from '../../context/AuthContext';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const RESOURCE_STATUS = ['ACTIVE', 'OUT_OF_SERVICE'];

const defaultForm = {
  name: '',
  type: 'LECTURE_HALL',
  capacity: 1,
  location: '',
  availableFrom: '08:00',
  availableTo: '17:00',
  status: 'ACTIVE',
  description: '',
};

const ResourcesPage = () => {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({ name: '', type: '', status: '', location: '', minCapacity: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async (appliedFilters = {}) => {
    try {
      setLoading(true);
      setError('');
      const cleanParams = Object.fromEntries(
        Object.entries(appliedFilters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      const res = await resourceApi.getAll(cleanParams);
      setResources(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    const total = resources.length;
    const active = resources.filter((r) => r.status === 'ACTIVE').length;
    return { total, active };
  }, [resources]);

  const handleApplyFilters = () => {
    fetchResources(filters);
  };

  const handleResetFilters = () => {
    const reset = { name: '', type: '', status: '', location: '', minCapacity: '' };
    setFilters(reset);
    fetchResources(reset);
  };

  const openCreateModal = () => {
    setEditingResource(null);
    setForm(defaultForm);
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setForm({
      name: resource.name || '',
      type: resource.type || 'LECTURE_HALL',
      capacity: resource.capacity || 1,
      location: resource.location || '',
      availableFrom: formatTimeForInput(resource.availableFrom),
      availableTo: formatTimeForInput(resource.availableTo),
      status: resource.status || 'ACTIVE',
      description: resource.description || '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!isValidTimeRange(form.availableFrom, form.availableTo)) {
      setModalError('Available From must be earlier than Available To.');
      return;
    }

    setSubmitting(true);

    const payload = {
      ...form,
      capacity: Number(form.capacity),
      availableFrom: normalizeTime(form.availableFrom),
      availableTo: normalizeTime(form.availableTo),
    };

    try {
      if (editingResource) {
        const res = await resourceApi.update(editingResource.id, payload);
        setResources((prev) => prev.map((r) => (r.id === editingResource.id ? { ...r, ...res.data } : r)));
      } else {
        const res = await resourceApi.create(payload);
        setResources((prev) => [res.data, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setModalError(extractSaveError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusToggle = async (resource) => {
    const nextStatus = resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
    try {
      const res = await resourceApi.updateStatus(resource.id, nextStatus);
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, status: res.data.status || nextStatus } : r))
      );
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update resource status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource from the catalogue?')) return;
    try {
      await resourceApi.delete(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete resource');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Facilities & Assets</h1>
          <p className="page-subtitle">Search, filter, and manage campus resources</p>
        </div>
        <div className="page-stats">
          <span className="stat-chip">{counts.total} Total</span>
          <span className="stat-chip active">{counts.active} Active</span>
          {isAdmin() && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              + Add Resource
            </button>
          )}
        </div>
      </div>

      <div className="resource-filters">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            className="resource-input"
            placeholder="e.g., A401"
            value={filters.name}
            onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Type</label>
          <select
            className="form-select"
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All Types</option>
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>{prettyEnum(type)}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            {RESOURCE_STATUS.map((status) => (
              <option key={status} value={status}>{prettyEnum(status)}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <input
            className="resource-input"
            placeholder="e.g., Main Building"
            value={filters.location}
            onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Min Capacity</label>
          <input
            type="number"
            min="1"
            className="resource-input"
            value={filters.minCapacity}
            onChange={(e) => setFilters((prev) => ({ ...prev, minCapacity: e.target.value }))}
          />
        </div>

        <div className="resource-filter-actions">
          <button className="btn btn-primary" onClick={handleApplyFilters}>Apply</button>
          <button className="btn btn-secondary" onClick={handleResetFilters}>Reset</button>
        </div>
      </div>

      {error && <div className="resource-error">{error}</div>}

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <h3>No resources found</h3>
          <p>Try changing your filters or add a new resource.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Availability</th>
                <th>Status</th>
                {isAdmin() && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id}>
                  <td>
                    <div className="resource-name-cell">
                      <span className="user-name">{resource.name}</span>
                      {resource.description && <span className="resource-description">{resource.description}</span>}
                    </div>
                  </td>
                  <td><span className="provider-badge">{prettyEnum(resource.type)}</span></td>
                  <td>{resource.capacity}</td>
                  <td>{resource.location}</td>
                  <td>{formatTime(resource.availableFrom)} - {formatTime(resource.availableTo)}</td>
                  <td>
                    <span className={`status-badge ${resource.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                      {prettyEnum(resource.status)}
                    </span>
                  </td>
                  {isAdmin() && (
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-primary" onClick={() => openEditModal(resource)}>Edit</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleQuickStatusToggle(resource)}>
                          {resource.status === 'ACTIVE' ? 'Set Out' : 'Set Active'}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(resource.id)}>Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingResource ? 'Edit Resource' : 'Add Resource'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {modalError && <div className="resource-form-error">{modalError}</div>}

                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    required
                    className="resource-input"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="resource-grid-2">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={form.type}
                      onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                    >
                      {RESOURCE_TYPES.map((type) => (
                        <option key={type} value={type}>{prettyEnum(type)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="resource-input"
                      value={form.capacity}
                      onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    required
                    className="resource-input"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="resource-grid-3">
                  <div className="form-group">
                    <label className="form-label">Available From</label>
                    <input
                      type="time"
                      required
                      className="resource-input"
                      value={form.availableFrom}
                      onChange={(e) => setForm((prev) => ({ ...prev, availableFrom: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Available To</label>
                    <input
                      type="time"
                      required
                      className="resource-input"
                      value={form.availableTo}
                      onChange={(e) => setForm((prev) => ({ ...prev, availableTo: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                    >
                      {RESOURCE_STATUS.map((status) => (
                        <option key={status} value={status}>{prettyEnum(status)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows="3"
                    className="resource-textarea"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function prettyEnum(value) {
  if (!value) return '';
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatTimeForInput(value) {
  if (!value) return '08:00';
  return value.slice(0, 5);
}

function normalizeTime(value) {
  if (!value) return value;
  return value.length === 5 ? `${value}:00` : value;
}

function formatTime(value) {
  if (!value) return '-';
  return value.slice(0, 5);
}

function isValidTimeRange(from, to) {
  if (!from || !to) return true;
  return normalizeTime(from) < normalizeTime(to);
}

function extractSaveError(err) {
  const fieldErrors = err?.response?.data?.fieldErrors;
  if (fieldErrors && typeof fieldErrors === 'object') {
    const firstMessage = Object.values(fieldErrors)[0];
    if (firstMessage) return String(firstMessage);
  }
  return err?.response?.data?.message || 'Failed to save resource';
}

export default ResourcesPage;
