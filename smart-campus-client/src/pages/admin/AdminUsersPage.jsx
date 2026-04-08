import { useState, useEffect } from 'react';
import { userApi } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../components/utils/dateUtils';

const ROLES = ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN'];
const ROLE_COLORS = { USER: 'blue', TECHNICIAN: 'orange', MANAGER: 'purple', ADMIN: 'red' };

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleModal, setRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('USER');
  const [roleAction, setRoleAction] = useState('ADD');
  const [submitting, setSubmitting] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getAllUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      const res = await userApi.updateUserRole(selectedUser.id, { role: selectedRole, action: roleAction });
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? res.data : u)));
      setRoleModal(false);
    } catch (err) {
      console.error('Failed to update role', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await userApi.deactivateUser(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: false } : u));
    } catch (err) {
      console.error('Failed to deactivate user', err);
    }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage user accounts and role assignments</p>
        </div>
        <div className="page-stats">
          <span className="stat-chip">{users.length} Total</span>
          <span className="stat-chip active">{users.filter(u => u.isActive).length} Active</span>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          id="user-search-input"
          type="text"
          placeholder="Search by name or email..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={!u.isActive ? 'row-inactive' : ''}>
                  <td>
                    <div className="user-cell">
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} alt={u.name} className="table-avatar" />
                        : <div className="table-avatar-fallback">{u.name?.charAt(0)}</div>
                      }
                      <span className="user-name">{u.name}</span>
                      {u.id === currentUser?.id && <span className="you-badge">You</span>}
                    </div>
                  </td>
                  <td className="email-cell">{u.email}</td>
                  <td>
                    <div className="roles-cell">
                      {u.roles?.map((r) => (
                        <span key={r} className={`role-badge role-${r.toLowerCase()}`}>{r}</span>
                      ))}
                    </div>
                  </td>
                  <td><span className="provider-badge">{u.oauthProvider || 'google'}</span></td>
                  <td>
                    <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="date-cell">{formatDateTime(u.createdAt)}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => { setSelectedUser(u); setRoleModal(true); setSelectedRole('USER'); setRoleAction('ADD'); }}
                        disabled={u.id === currentUser?.id}
                      >
                        Edit Role
                      </button>
                      {u.isActive && u.id !== currentUser?.id && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeactivate(u.id)}>
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No users found</h3>
            </div>
          )}
        </div>
      )}

      {/* Role Modal */}
      {roleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setRoleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Role — {selectedUser.name}</h2>
              <button className="modal-close" onClick={() => setRoleModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Current Roles</label>
                <div className="roles-cell">
                  {selectedUser.roles?.map((r) => (
                    <span key={r} className={`role-badge role-${r.toLowerCase()}`}>{r}</span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Action</label>
                <div className="radio-group">
                  {['ADD', 'REMOVE'].map((a) => (
                    <label key={a} className="radio-label">
                      <input type="radio" value={a} checked={roleAction === a} onChange={() => setRoleAction(a)} />
                      {a === 'ADD' ? '➕ Add Role' : '➖ Remove Role'}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRoleModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRoleUpdate} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
