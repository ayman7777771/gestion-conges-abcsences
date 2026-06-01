import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Trash2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNotificationContext } from "../context/NotificationContext";
import "./Navbar.css";

const ROUTE_TITLES = {
  "/dashboard": "Dashboard",
  "/": "Dashboard",
  "/new-request": "Nouvelle demande",
  "/my-requests": "Mes demandes",
  "/team-requests": "Demandes de l'équipe",
  "/calendar": "Calendrier des absences",
  "/users": "Gestion des utilisateurs",
  "/leave-types": "Configuration des types",
  "/export": "Exportation des données",
};

const ROLE_LABELS = {
  admin: "Admin RH",
  manager: "Manager",
  employee: "Employé",
};

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    removeNotification,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotificationContext();

  const [showDropdown, setShowDropdown] = useState(false);
  const pageTitle = ROUTE_TITLES[location.pathname] || "CHU Fès";
  const roleLabel = ROLE_LABELS[user?.role] || "Employé";

  useEffect(() => {
    if (user) fetchNotifications();
  }, [fetchNotifications, user]);

  const getInitials = () => {
    if (!user?.name) return "AE";

    return user.name
      .split(" ")
      .map((namePart) => namePart[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const diff = Math.floor((new Date() - date) / 1000);

    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;

    return date.toLocaleDateString("fr-FR");
  };

  const openNotification = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    setShowDropdown(false);

    if (notification.related_type === "leave_request") {
      navigate(user?.role === "manager" ? "/team-requests" : "/my-requests");
    }
  };

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <h2 className="page-title">{pageTitle}</h2>
      </div>

      <div className="navbar-right">
        <div className="notification-container">
          <button
            className="notification-trigger"
            aria-label="Notifications"
            onClick={() => setShowDropdown((prev) => !prev)}
            type="button"
          >
            <span className="navbar-icon-wrapper">
              <Bell size={20} strokeWidth={2} />
            </span>

            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>

          {showDropdown && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>

                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="clear-all-btn" type="button">
                    Tout marquer lu
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <Bell size={32} opacity={0.3} />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item notification-${notification.type} ${
                        notification.is_read ? "is-read" : ""
                      }`}
                      onClick={() => openNotification(notification)}
                    >
                      <div className="notification-content">
                        <h4 className="notification-title">{notification.title}</h4>
                        <p className="notification-message">{notification.message}</p>
                        <small className="notification-time">
                          {formatTime(notification.created_at)}
                        </small>
                      </div>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="notification-delete-btn"
                        title="Supprimer"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-profile-card">
          <div className="user-details">
            <span className="user-display-name">{user?.name || "Utilisateur"}</span>
            <span className="user-display-role">{roleLabel}</span>
          </div>

          <div className="user-avatar-circle">{getInitials()}</div>
        </div>
      </div>
    </header>
  );
}
