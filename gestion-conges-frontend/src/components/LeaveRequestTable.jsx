import React, { useMemo, useState } from "react";
import { Check, X, Ban } from "lucide-react";
import toast from "react-hot-toast";
import "./LeaveRequestTable.css";

const COLUMNS = {
  employee: ["date", "type", "days", "status", "actions"],
  manager: ["employee", "date", "type", "days", "status", "review", "actions"],
  admin: ["employee", "department", "date", "type", "days", "status", "reviewer"],
};

const HEADERS = {
  employee: "Employé",
  department: "Département",
  date: "Période",
  type: "Type de congé",
  days: "Jours",
  status: "Statut",
  review: "Avis",
  reviewer: "Validateur",
  actions: "Action",
};

const STATUS = {
  pending: ["En attente", "badge-pending"],
  approved: ["Approuvé", "badge-approved"],
  rejected: ["Refusé", "badge-rejected"],
  cancelled: ["Annulé", "badge-cancelled"],
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("fr-MA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getLeaveType = (request) => request.leaveType || request.leave_type;
const initials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

const Badge = ({ status }) => {
  const [label, cls] = STATUS[status] || STATUS.pending;
  return <span className={`status-badge ${cls}`}>{label}</span>;
};

export default function LeaveRequestTable({
  data = [],
  role = "employee",
  loading = false,
  onApprove,
  onReject,
  onCancel,
}) {
  const [active, setActive] = useState(null);
  const [comment, setComment] = useState("");

  const columns = useMemo(() => COLUMNS[role] || COLUMNS.employee, [role]);

  const closeModal = () => {
    setActive(null);
    setComment("");
  };

  const submitReject = () => {
    const value = comment.trim();
    if (value.length < 5) {
      toast.error("Le commentaire de refus est obligatoire.");
      return;
    }

    onReject?.(active.id, value);
    closeModal();
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (!data.length) return <div className="empty-state">Aucune demande</div>;

  return (
    <div className="table-wrapper">
      <div className="table-scroll">
        <table className="leave-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className={`col-${column}`}>
                  {HEADERS[column]}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((request) => (
              <tr key={request.id} className={`row-${request.status}`}>
                {columns.includes("employee") && (
                  <td>
                    <div className="employee-info">
                      <span className="employee-avatar">
                        {initials(request.user?.name)}
                      </span>
                      <span className="employee-text">
                        <span className="employee-name">{request.user?.name || "-"}</span>
                        <span className="employee-email">{request.user?.email || ""}</span>
                      </span>
                    </div>
                  </td>
                )}

                {columns.includes("department") && (
                  <td>{request.user?.department?.name || "-"}</td>
                )}

                {columns.includes("date") && (
                  <td>
                    <span className="date-range">
                      {formatDate(request.start_date)}
                      <span className="date-separator">→</span>
                      {formatDate(request.end_date)}
                    </span>
                  </td>
                )}

                {columns.includes("type") && (
                  <td>
                    <span className="type-badge">{getLeaveType(request)?.name || "-"}</span>
                  </td>
                )}

                {columns.includes("days") && (
                  <td>
                    <span className="days-count">{request.days_count}</span>
                  </td>
                )}

                {columns.includes("status") && (
                  <td>
                    <Badge status={request.status} />
                  </td>
                )}

                {columns.includes("review") && (
                  <td className="review-comment">{request.review_comment || "-"}</td>
                )}

                {columns.includes("reviewer") && (
                  <td>{request.reviewer?.name || "-"}</td>
                )}

                {columns.includes("actions") && (
                  <td>
                    <div className="action-buttons">
                      {(role === "manager" || role === "admin") && request.status === "pending" && (
                        <button
                          type="button"
                          className="btn-action btn-primary"
                          onClick={() => setActive(request)}
                          title="Traiter"
                        >
                          <Check size={16} />
                          <span>Traiter</span>
                        </button>
                      )}

                      {role === "employee" && request.status === "pending" && (
                        <button
                          type="button"
                          className="btn-action btn-danger"
                          onClick={() => onCancel?.(request.id)}
                          title="Annuler"
                        >
                          <Ban size={16} />
                          <span>Annuler</span>
                        </button>
                      )}

                      {request.status !== "pending" && <span className="text-muted">-</span>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {active && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Révision de la demande</h3>
              <button className="close-btn" onClick={closeModal} type="button">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="request-summary">
                <p>{active.user?.name}</p>
                <p>
                  {formatDate(active.start_date)} → {formatDate(active.end_date)}
                </p>
                <p>{getLeaveType(active)?.name || "-"} · {active.days_count} jours</p>
              </div>

              <label className="review-label" htmlFor="review-comment">
                Commentaire
              </label>
              <textarea
                id="review-comment"
                className="review-textarea"
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value);
                }}
                rows={4}
                placeholder="Obligatoire en cas de refus"
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-danger" type="button" onClick={submitReject}>
                Refuser
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  onApprove?.(active.id, comment.trim() || null);
                  closeModal();
                }}
              >
                Approuver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
