import React, { useEffect, useState } from "react";
import { Calendar, Trash2, Clock, CheckCircle, X, Palmtree } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";import api from "../../api/axios";
import { toast } from "react-hot-toast";
import "./UserDashboard.css";

export default function UserDashboard() {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [balancesRes, requestsRes] = await Promise.all([
        api.get("/my/balances"),
        api.get("/my/leave-requests"),
      ]);
      setBalances(balancesRes.data);
      setRequests(
        requestsRes.data.data ? requestsRes.data.data.slice(0, 5) : []
      );
    } catch (error) {
      console.error("Erreur lors du chargement des données", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette demande ?"))
      return;

    try {
      const res = await api.patch(`/leave-requests/${id}/cancel`);
      toast.success(res.data.message || "Demande annulée avec succès.");
      fetchUserData();
    } catch (error) {
      console.error("Erreur lors de l'annulation", error);
      toast.error("Échec de l'annulation de la demande.");
    }
  };

if (loading) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '20px' }}>
      {[...Array(4)].map((_, index) => (
        <div key={index} style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <Skeleton circle height={40} width={40} />
            <Skeleton height={20} width="60%" style={{ marginLeft: '15px' }} />
          </div>
          <Skeleton height={8} style={{ marginBottom: '20px' }} />
          <Skeleton height={20} width="30%" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <Skeleton height={15} width="40%" />
            <Skeleton height={15} width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}
  return (
    <div className="user-dashboard-content">
      <div className="balances-section">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Mes Soldes de Congés</h2>
          <p className="dashboard-subtitle">Jours restants par type</p>
        </div>

        <div className="balances-grid">
          {balances.length > 0 ? (
            balances.map((bal, index) => {
              const totalDays = bal.total || bal.remaining + (bal.used || 0);
              const percentage =
                totalDays > 0 ? (bal.remaining / totalDays) * 100 : 0;

              return (
                <div
                  key={bal.id}
                  className="balance-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="balance-header">
                    <div className="balance-icon-wrapper">
                      <Palmtree size={32} className="balance-icon" />
                    </div>
                    <span className="balance-title">{bal.leave_type?.name}</span>
                  </div>

                  <div className="balance-progress">
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="progress-labels">
                      <span className="remaining-label">Restant:</span>
                      <span className="remaining-value">{bal.remaining}</span>
                    </div>
                  </div>

                  {bal.used && (
                    <div className="balance-details">
                      <span className="detail-item">
                        <small>Utilisé:</small> {bal.used} j
                      </span>
                      <span className="detail-item">
                        <small>Total:</small> {totalDays} j
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <Palmtree size={56} className="empty-icon" />
              <p>Aucun solde de congés disponible.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Requests Section */}
      <div className="requests-section">
        <div className="section-header">
          <h3 className="section-title">Mes Demandes Récentes</h3>
          <p className="section-subtitle">
            {requests.length} demande{requests.length !== 1 ? "s" : ""} affichée
            {requests.length !== 1 ? "s" : ""}
          </p>
        </div>

        {requests.length > 0 ? (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>
                    <CheckCircle size={16} className="table-header-icon" /> Type
                  </th>
                  <th>
                    <Calendar size={16} className="table-header-icon" /> Début
                  </th>
                  <th>
                    <Calendar size={16} className="table-header-icon" /> Fin
                  </th>
                  <th>
                    <Clock size={16} className="table-header-icon" /> Durée
                  </th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, index) => (
                  <tr
                    key={req.id}
                    className="table-row-hover"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="type-cell">
                      <span className="request-type">{req.leave_type?.name}</span>
                    </td>
                    <td className="date-cell">
                      <span className="date-badge">{req.start_date}</span>
                    </td>
                    <td className="date-cell">
                      <span className="date-badge">{req.end_date}</span>
                    </td>
                    <td className="duration-cell">
                      <span className="duration-badge">{req.days_count}j</span>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge status-${req.status}`}>
                        {req.status === "pending" && (
                          <>
                            <Clock size={14} className="status-icon" />
                            En attente
                          </>
                        )}
                        {req.status === "approved" && (
                          <>
                            <CheckCircle size={14} className="status-icon" />
                            Approuvée
                          </>
                        )}
                        {req.status === "rejected" && (
                          <>
                            <X size={14} className="status-icon" />
                            Refusée
                          </>
                        )}
                        {req.status === "cancelled" && (
                          <>
                            <X size={14} className="status-icon" />
                            Annulée
                          </>
                        )}
                      </span>
                    </td>
                    <td className="action-cell">
                      {req.status === "pending" && (
                        <button
                          onClick={() => handleCancel(req.id)}
                          className="btn-cancel"
                          title="Annuler cette demande"
                        >
                          <Trash2 size={16} className="action-icon" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Calendar size={56} className="empty-icon" />
            <p>Vous n'avez aucune demande de congé.</p>
          </div>
        )}
      </div>
    </div>
  );
}
