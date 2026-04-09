import { useState } from "react";

const ViewTicketModal = ({
  ticket,
  isOpen,
  onClose,
  onUpdateStatus,
  onDelete,
  isAdmin
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  if (!isOpen || !ticket) return null;

  const handleStatusChange = (e) => {
    onUpdateStatus(ticket.id, e.target.value);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteReason.trim()) return;

    onDelete(ticket.id, deleteReason);
    setShowDeleteConfirm(false);
    setDeleteReason("");
    onClose();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteReason("");
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "var(--danger)";
      case "MEDIUM":
        return "var(--warning)";
      case "LOW":
        return "var(--success)";
      default:
        return "var(--text-muted)";
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={!showDeleteConfirm ? onClose : undefined}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="modal-header">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span className="ticket-id" style={{ fontSize: "0.7rem" }}>
              {ticket.id}
            </span>
            <h2 className="modal-title" style={{ fontSize: "1.25rem" }}>
              {ticket.title}
            </h2>
          </div>

          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          
          {/* STATUS (Admin only) */}
          {isAdmin && (
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select
                className="form-select"
                value={ticket.status}
                onChange={handleStatusChange}
                style={{ width: "100%" }}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          )}

          <div
            style={{
              padding: "1rem",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              marginTop: "0.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Category
                </span>
                <span style={{ fontSize: "0.9rem", fontWeight: "600", display: "block" }}>
                  {ticket.category.replaceAll("_", " ")}
                </span>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Priority
                </span>
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    color: getPriorityColor(ticket.priority),
                    display: "block"
                  }}
                >
                  {ticket.priority}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Details
              </span>
              <p style={{ fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                {ticket.description || "No additional details provided."}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="modal-footer"
          style={{
            justifyContent: "space-between",
            alignItems: "center" // ✅ FIXES STRETCHING
          }}
        >
          
          {/* ADMIN DELETE */}
          {isAdmin && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              
              {showDeleteConfirm && (
                <div className="form-group" style={{ marginTop: "0.3rem" }}>
                  
                  <label className="form-label" style={{ color: "var(--danger)" }}>
                    Reason for Deletion
                  </label>

                  <textarea
                    placeholder="Enter reason for deletion..."
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="form-select"
                    style={{
                      minWidth: "220px",
                      resize: "none",
                      height: "70px"
                    }}
                  />

                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--danger)",
                      marginTop: "0.2rem"
                    }}
                  >
                    This action cannot be undone.
                  </span>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem" }}>
                {showDeleteConfirm ? (
                  <>
                    <button
                      className="btn btn-danger"
                      onClick={handleConfirmDelete}
                      disabled={!deleteReason.trim()}
                    >
                      Confirm Delete
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={handleCancelDelete}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-danger"
                    onClick={handleDeleteClick}
                  >
                    Delete Ticket
                  </button>
                )}
              </div>
            </div>
          )}

          {/* CLOSE BUTTON */}
          <button
            className="btn btn-primary"
            onClick={onClose}
            style={{ height: "fit-content" }} // ✅ extra safety
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTicketModal;