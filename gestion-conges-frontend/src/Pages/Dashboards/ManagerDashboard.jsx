import React, { useEffect, useState } from "react";
import { Clock, Users, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import api from "../../api/axios";
import "../Dashboard.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
export default function ManagerDashboard() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [monthAbsences, setMonthAbsences] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const responseRequests = await api.get("/team/leave-requests");
        const requestsArray =
          responseRequests.data.data || responseRequests.data;

        if (Array.isArray(requestsArray)) {
          const pending = requestsArray.filter(
            (req) => req.status === "pending",
          );
          setPendingRequests(pending);
        }

        const responseCalendar = await api.get(
          `/team/calendar?month=${currentMonth}&year=${currentYear}`,
        );
        if (Array.isArray(responseCalendar.data)) {
          setMonthAbsences(responseCalendar.data.length);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
      } finally {
        setLoading(false);
      }
    };
    fetchManagerData();
  }, []);
  return (
    <div className="manager-dashboard-content">
      {loading ? (
        <>
          <Skeleton height={40} style={{ marginBottom: "15px" }} />

          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <Skeleton circle height={50} width={50} />
              <div style={{ flex: 1 }}>
                <Skeleton
                  height={20}
                  width="80%"
                  style={{ marginBottom: "10px" }}
                />
                <Skeleton height={20} width="60%" />
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          <div className="dashboard-header">
            <h2 className="dashboard-title">Gestion de l'Équipe</h2>
            <p className="dashboard-subtitle">Suivi des demandes et absences</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card stat-card-warning">
              <div className="stat-icon-wrapper warning">
                <AlertCircle size={28} className="stat-icon" />
              </div>
              <div className="stat-content">
                <span className="stat-label">Demandes en attente</span>
                <span className="stat-value">{pendingRequests.length}</span>
              </div>
              <div className="stat-indicator warning"></div>
            </div>
            <div className="stat-card stat-card-info">
              <div className="stat-icon-wrapper info">
                <Clock size={28} className="stat-icon" />
              </div>
              <div className="stat-content">
                <span className="stat-label">Absences du mois</span>
                <span className="stat-value">{monthAbsences}</span>
              </div>
              <div className="stat-indicator info"></div>
            </div>
            <div className="stat-card stat-card-success">
              <div className="stat-icon-wrapper success">
                <Users size={28} className="stat-icon" />
              </div>
              <div className="stat-content">
                <span className="stat-label">Équipe actuelle</span>
                <span className="stat-value">
                  {pendingRequests.length + monthAbsences}
                </span>
              </div>
              <div className="stat-indicator success"></div>
            </div>
          </div>
          <div className="table-section">
            <div className="section-header">
              <h3 className="section-title">Dernières demandes en attente</h3>
              <p className="section-subtitle">
                {pendingRequests.length} demande
                {pendingRequests.length !== 1 ? "s" : ""} à traiter
              </p>
            </div>
            {pendingRequests.length > 0 ? (
              <div className="table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>
                        <Users size={16} className="table-header-icon" />{" "}
                        Employé
                      </th>
                      <th>
                        <CheckCircle size={16} className="table-header-icon" />{" "}
                        Type
                      </th>
                      <th>
                        <Calendar size={16} className="table-header-icon" />{" "}
                        Dates
                      </th>
                      <th>
                        <Clock size={16} className="table-header-icon" /> Durée
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.slice(0, 5).map((req, index) => (
                      <tr
                        key={req.id}
                        className="table-row-hover"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="employee-cell">
                          <div className="employee-info">
                            <div className="employee-avatar">
                              {req.user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <span className="employee-name">
                              {req.user?.name || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge-type">
                            {req.leave_type?.name}
                          </span>
                        </td>
                        <td className="date-range-cell">
                          <span className="date-range-badge">
                            {req.start_date} → {req.end_date}
                          </span>
                        </td>
                        <td className="duration-cell">
                          <span className="duration-badge">
                            {req.days_count || 0}j
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pendingRequests.length > 5 && (
                  <div className="view-all-container">
                    <a href="/manager/team-requests" className="view-all-link">
                      Voir toutes les demandes →
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <CheckCircle size={56} className="empty-icon" />
                <p>Aucune demande en attente. Excellent travail!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
