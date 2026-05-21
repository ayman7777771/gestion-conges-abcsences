import React, { useState } from 'react';
import './leave-request-table.css';

const ROLE_COLUMNS = {
  employee: ['date', 'type', 'days', 'status', 'action'],
  manager: ['employee', 'date', 'type', 'days', 'status', 'review', 'actions'],
  admin: ['employee', 'department', 'date', 'type', 'days', 'status', 'reviewer', 'actions']
};

const HEADERS = {
  employee: 'Employé',
  department: 'Département',
  date: 'Période',
  type: 'Type de congé',
  days: 'Jours',
  status: 'Statut',
  review: 'Avis',
  reviewer: 'Validateur',
  action: 'Action',
  actions: 'Actions'
};

const STATUS = {
  pending: ['En attente', 'badge-pending'],
  approved: ['Approuvé', 'badge-approved'],
  rejected: ['Refusé', 'badge-rejected'],
  cancelled: ['Annulé', 'badge-cancelled']
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('fr-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

const StatusBadge = ({ status }) => {
  const [label, cls] = STATUS[status] || STATUS.pending;
  return <span className={`badge ${cls}`}>{label}</span>;
};

const LeaveRequestTable = ({
  data = [],
  role = 'employee',
  loading = false,
  onApprove,
  onReject,
  onCancel,
  pagination = { current_page: 1, last_page: 1 }
}) => {
  const [activeAction, setActiveAction] = useState(null);
  const [comment, setComment] = useState('');

  const columns = ROLE_COLUMNS[role] || [];

  const requestById = (id) => data.find(r => r.id === id);

  if (loading) return <div className="loading">Chargement...</div>;

  if (!data.length)
    return <div className="empty-state">Aucune demande de congé</div>;

  const ReviewModal = ({ request }) => (
    <div className="modal-overlay" onClick={() => setActiveAction(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Révision de la demande</h3>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="review-textarea"
        />

        <div className="modal-footer">
          <button onClick={() => onReject?.(request.id, comment)}>
            Refuser
          </button>

          <button onClick={() => onApprove?.(request.id, comment)}>
            Approuver
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="table-wrapper">
      <table className="leave-table">

        <thead>
          <tr>
            {columns.map(col => (
              <th key={col}>{HEADERS[col]}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map(request => (
            <tr key={request.id} className={`row-${request.status}`}>

              {columns.includes('employee') && (
                <td>
                  {request.user?.name}
                </td>
              )}

              {columns.includes('department') && (
                <td>
                  {request.user?.department?.name || '-'}
                </td>
              )}

              {columns.includes('date') && (
                <td>
                  {formatDate(request.start_date)} → {formatDate(request.end_date)}
                </td>
              )}

              {columns.includes('type') && (
                <td>{request.leaveType?.name}</td>
              )}

              {columns.includes('days') && (
                <td>{request.days_count}</td>
              )}

              {columns.includes('status') && (
                <td><StatusBadge status={request.status} /></td>
              )}

              {columns.includes('reviewer') && (
                <td>
                  {request.reviewer?.name || '-'}
                </td>
              )}

              {columns.includes('actions') && (
                <td>
                  {role === 'employee' && request.status === 'pending' && (
                    <button onClick={() => onCancel?.(request.id)}>
                      Annuler
                    </button>
                  )}

                  {(role === 'manager' || role === 'admin') &&
                    request.status === 'pending' && (
                      <button onClick={() => setActiveAction(request.id)}>
                        Traiter
                      </button>
                  )}
                </td>
              )}

              {columns.includes('action') && role === 'employee' && (
                <td>
                  {request.status === 'pending'
                    ? <button onClick={() => onCancel?.(request.id)}>Annuler</button>
                    : '-'}
                </td>
              )}

            </tr>
          ))}
        </tbody>
      </table>

      {pagination.last_page > 1 && (
        <div className="pagination">
          Page {pagination.current_page} / {pagination.last_page}
        </div>
      )}

      {activeAction && (
        <ReviewModal request={requestById(activeAction)} />
      )}
    </div>
  );
};

export default LeaveRequestTable;