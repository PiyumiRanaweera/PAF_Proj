import { useState } from 'react';

const NewTicketModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'MAINTENANCE',
    priority: 'MEDIUM'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: '', description: '', category: 'MAINTENANCE', priority: 'MEDIUM' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Ticket</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                name="title"
                required
                className="premium-input"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={handleChange}
                style={{ marginBottom: '0' }}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                name="category" 
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="MAINTENANCE">Maintenance</option>
                <option value="IT_SUPPORT">IT Support</option>
                <option value="CLEANING">Cleaning</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <div className="radio-group" style={{ marginTop: '0.25rem' }}>
                <label className="radio-label">
                  <input type="radio" name="priority" value="LOW" checked={formData.priority === 'LOW'} onChange={handleChange} /> Low
                </label>
                <label className="radio-label">
                  <input type="radio" name="priority" value="MEDIUM" checked={formData.priority === 'MEDIUM'} onChange={handleChange} /> Medium
                </label>
                <label className="radio-label">
                  <input type="radio" name="priority" value="HIGH" checked={formData.priority === 'HIGH'} onChange={handleChange} /> High
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Details</label>
              <textarea
                name="description"
                required
                className="premium-input"
                rows="4"
                placeholder="Provide detailed information..."
                value={formData.description}
                onChange={handleChange}
                style={{ marginBottom: '0' }}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTicketModal;
