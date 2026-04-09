import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NewTicketModal from './NewTicketModal';
import ViewTicketModal from './ViewTicketModal';
import './Tickets.css';

// Icons
import { FaTools, FaLaptop, FaBroom, FaStickyNote } from 'react-icons/fa';

const MOCK_TICKETS = [
  { id: 'TKT-1042', title: 'A/C not working in Room 302', category: 'MAINTENANCE', priority: 'HIGH', status: 'OPEN', date: '2023-10-25T09:30:00' },
  { id: 'TKT-1041', title: 'Wifi dropping intermittently', category: 'IT_SUPPORT', priority: 'MEDIUM', status: 'IN_PROGRESS', date: '2023-10-24T14:15:00' },
  { id: 'TKT-1039', title: 'Broken lightbulb in hallway', category: 'MAINTENANCE', priority: 'LOW', status: 'RESOLVED', date: '2023-10-22T11:00:00' }
];

const TicketsPage = () => {
  const { user, isAdmin } = useAuth();

  const [filter, setFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState(MOCK_TICKETS);

  // ✅ CREATE
  const handleCreateTicket = (ticketData) => {
    const newTicket = {
      id: `TKT-${1000 + Math.floor(Math.random() * 900)}`,
      ...ticketData,
      status: 'OPEN',
      date: new Date().toISOString(),
    };
    setTickets([newTicket, ...tickets]);
  };

  // ✅ UPDATE STATUS
  const handleUpdateStatus = (ticketId, newStatus) => {
    setTickets(tickets.map(t =>
      t.id === ticketId ? { ...t, status: newStatus } : t
    ));

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => ({ ...prev, status: newStatus }));
    }
  };

  // ✅ DELETE WITH REASON
  const handleDeleteTicket = (ticketId, reason) => {
    console.log("Deleted:", ticketId, "Reason:", reason);

    // 👉 later connect to backend
    // await api.delete(`/tickets/${ticketId}`, { data: { reason } });

    setTickets(tickets.filter(t => t.id !== ticketId));

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
    }
  };

  // FILTER
  const filteredTickets = tickets.filter(
    t => filter === 'ALL' || t.status === filter
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'var(--danger)';
      case 'MEDIUM': return 'var(--warning)';
      case 'LOW': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return <span className="status-badge open">Open</span>;
      case 'IN_PROGRESS': return <span className="status-badge in-progress">In Progress</span>;
      case 'RESOLVED': return <span className="status-badge resolved">Resolved</span>;
      default: return null;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'MAINTENANCE': return <FaTools size={24} color="var(--primary)" />;
      case 'IT_SUPPORT': return <FaLaptop size={24} color="var(--primary)" />;
      case 'CLEANING': return <FaBroom size={24} color="var(--primary)" />;
      default: return <FaStickyNote size={24} color="var(--primary)" />;
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">
            {isAdmin
              ? "Manage and resolve support tickets"
              : "Report and track your requests"}
          </p>
        </div>

        {/* ❌ Hide create for admin (optional rule) */}
        {!isAdmin && (
          <button
            className="btn btn-primary create-ticket-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <span>+</span> New Ticket
          </button>
        )}
      </div>

      {/* FILTER */}
      <div className="filter-bar">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All Tickets' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* LIST */}
      {filteredTickets.length > 0 ? (
        <div className="tickets-list">
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              className="ticket-card"
              onClick={() => setSelectedTicket(ticket)}
              style={{ cursor: 'pointer' }}
            >
              <div className="ticket-icon">
                {getCategoryIcon(ticket.category)}
              </div>

              <div className="ticket-body">
                <div className="ticket-meta">
                  <span className="ticket-id">{ticket.id}</span>
                  <span className="ticket-date">{formatDate(ticket.date)}</span>
                </div>

                <h3 className="ticket-title">{ticket.title}</h3>

                <div className="ticket-footer">
                  <div
                    className="ticket-priority"
                    style={{ color: getPriorityColor(ticket.priority) }}
                  >
                    <span
                      className="priority-dot"
                      style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                    ></span>
                    {ticket.priority} PRIORITY
                  </div>

                  {getStatusBadge(ticket.status)}
                </div>
              </div>

              <div className="ticket-actions">
                <button
                  className="btn-icon-sm"
                  title="View details"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTicket(ticket);
                  }}
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🏖️</div>
          <h3>No tickets found</h3>
          <p>No tickets match this filter.</p>
        </div>
      )}

      {/* CREATE MODAL */}
      <NewTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTicket}
      />

      {/* VIEW MODAL */}
      <ViewTicketModal
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDeleteTicket}
        isAdmin={isAdmin}   // ✅ CRITICAL FIX
      />
    </div>
  );
};

export default TicketsPage;