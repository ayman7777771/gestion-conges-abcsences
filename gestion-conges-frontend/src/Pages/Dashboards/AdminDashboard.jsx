import React, { useEffect, useState } from "react";
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
import { TrendingUp, Calendar, Percent } from "lucide-react";
import api from "../../api/axios";
import "../Dashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const response = await api.get(
          `/admin/stats?month=${currentMonth}&year=${currentYear}`
        );

        if (response && response.data) {
          setStats(response.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des stats admin", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des statistiques...</p>
      </div>
    );

  if (error || !stats)
    return (
      <div className="error-container">
        <span className="error-icon">⚠️</span>
        <p>Erreur de communication avec le serveur.</p>
      </div>
    );

  // Transform data for chart
  const departmentsArray = stats.top_departments
    ? Object.entries(stats.top_departments).map(([name, days]) => ({
        name,
        "Jours Absents": days,
      }))
    : [];

  return (
    <div className="admin-dashboard-content">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Statistiques Globales</h2>
        <p className="dashboard-subtitle">Vue d'ensemble RH</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon-wrapper primary">
            <TrendingUp size={28} className="stat-icon" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Demandes ce mois</span>
            <span className="stat-value">
              {stats.total_absences_count ?? stats.total_absences ?? 0}
            </span>
          </div>
          <div className="stat-indicator primary"></div>
        </div>

        <div className="stat-card stat-card-secondary">
          <div className="stat-icon-wrapper secondary">
            <Calendar size={28} className="stat-icon" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Jours d'absence cumulés</span>
            <span className="stat-value">
              {stats.total_absent_days ?? 0}
              <small> jours</small>
            </span>
          </div>
          <div className="stat-indicator secondary"></div>
        </div>

        <div className="stat-card stat-card-tertiary">
          <div className="stat-icon-wrapper tertiary">
            <Percent size={28} className="stat-icon" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Taux d'absence</span>
            <span className="stat-value">
              {typeof stats.absence_rate === "string" &&
              stats.absence_rate.includes("%")
                ? stats.absence_rate
                : `${stats.absence_rate ?? 0}%`}
            </span>
          </div>
          <div className="stat-indicator tertiary"></div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="section-header">
          <h3 className="section-title">Top Départements</h3>
          <p className="section-subtitle">Jours perdus par département</p>
        </div>

        {departmentsArray.length > 0 ? (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={departmentsArray}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#1079CF" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#0D5FA0" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E2E8F0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  tick={{ fontSize: 12, fill: "#64748B" }}
                />
                <YAxis stroke="#64748B" tick={{ fontSize: 12, fill: "#64748B" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  cursor={{ fill: "rgba(16, 121, 207, 0.05)" }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="square"
                />
                <Bar
                  dataKey="Jours Absents"
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-state">
            <p>Aucune donnée disponible pour ce mois.</p>
          </div>
        )}
      </div>
    </div>
  );
}