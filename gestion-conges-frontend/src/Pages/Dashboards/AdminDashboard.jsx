import React, { useEffect, useState, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import { TrendingUp, Calendar, Percent } from "lucide-react";
import api from "../../api/axios";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasShownError = useRef(false);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const response = await api.get(
          `/admin/stats?month=${currentMonth}&year=${currentYear}`,
        );

        if (response?.data) {
          setStats(response.data);
          hasShownError.current = false; // reset error flag
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        console.error("Erreur lors du chargement des stats admin", err);

        if (!hasShownError.current) {
          toast.error(
            err.response?.data?.message ||
              "Erreur de communication avec le serveur.",
            {
              duration: 7000,
              className: "custom-error-toast",
              iconTheme: {
                primary: "#fdf2f2",
                secondary: "#dc3545",
              },
            },
          );

          hasShownError.current = true;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const departmentsArray = stats?.top_departments
    ? Object.entries(stats.top_departments).map(([name, days]) => ({
        name,
        "Jours Absents": days,
      }))
    : [];

  return (
    <div className="admin-dashboard-content">
      {loading ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              marginBottom: "40px",
            }}
          > 
            <Skeleton height={120} />
            <Skeleton height={120} />
            <Skeleton height={120} />
            </div>
        </>
      ) : (
        <>
          <div className="dashboard-header">
            <h2 className="dashboard-title">Statistiques Globales</h2>
            <p className="dashboard-subtitle">Vue d'ensemble RH</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card stat-card-primary">
              <div className="stat-icon-wrapper primary">
                <TrendingUp size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Demandes ce mois</span>
                <span className="stat-value">
                  {stats?.total_absences_count ?? stats?.total_absences ?? 0}
                </span>
              </div>
            </div>

            <div className="stat-card stat-card-secondary">
              <div className="stat-icon-wrapper secondary">
                <Calendar size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Jours d'absence cumulés</span>
                <span className="stat-value">
                  {stats?.total_absent_days ?? 0} <small>jours</small>
                </span>
              </div>
            </div>

            <div className="stat-card stat-card-tertiary">
              <div className="stat-icon-wrapper tertiary">
                <Percent size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Taux d'absence</span>
                <span className="stat-value">
                  {typeof stats?.absence_rate === "string" &&
                  stats.absence_rate.includes("%")
                    ? stats.absence_rate
                    : `${stats?.absence_rate ?? 0}%`}
                </span>
              </div>
            </div>
          </div>
          <div className="chart-section">
            <div className="section-header">
              <h3 className="section-title">Top Départements</h3>
              <p className="section-subtitle">Jours perdus par département</p>
            </div>
            {departmentsArray.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentsArray}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Jours Absents" fill="#1079CF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state">
                <p>Aucune donnée disponible pour ce mois.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
