import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Calendar,
  ClipboardList,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import chuLogo from "../assets/images/CHU_logo.png";
import "./Sidebar.css";

export default function Sidebar({ isOpen = true, onToggle, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || "employee";

  const navigationItems = [
    { path: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, roles: ["employee", "manager", "admin"] },
    { path: "/new-request", label: "Nouvelle demande", icon: FileText, roles: ["employee", "manager", "admin"] },
    { path: "/my-requests", label: "Mes demandes", icon: ClipboardList, roles: ["employee", "manager", "admin"] },
    { path: "/team-requests", label: "Demandes équipe", icon: Users, roles: ["manager"], section: "Gestion équipe" },
    { path: "/calendar", label: "Calendrier absences", icon: Calendar, roles: ["manager"], section: "Gestion équipe" },
    { path: "/users", label: "Gestion utilisateurs", icon: UserCog, roles: ["admin"], section: "Administration" },
    { path: "/leave-types", label: "Configuration types", icon: Settings, roles: ["admin"], section: "Administration" },
    { path: "/export", label: "Exportation CSV", icon: Download, roles: ["admin"], section: "Administration" },
  ];

  const filteredNavItems = useMemo(
    () => navigationItems.filter((item) => item.roles.includes(userRole)),
    [userRole],
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  return (
    <aside className={`app-sidebar ${isOpen ? "" : "is-collapsed"}`}>
      <div className="sidebar-header">
        <img src={chuLogo} alt="Logo CHU Fès" className="sidebar-logo-img" />
        <button className="sidebar-toggle" onClick={onToggle} type="button" aria-label="Basculer le menu">
          {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      <nav className="sidebar-navigation">
        {filteredNavItems.map((item, index) => {
          const Icon = item.icon;
          const showSectionTitle = item.section && filteredNavItems[index - 1]?.section !== item.section;

          return (
            <React.Fragment key={item.path}>
              {showSectionTitle && <div className="nav-section-divider">{item.section}</div>}
              <NavLink
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) => isActive ? "sidebar-nav-item active" : "sidebar-nav-item"}
              >
                <span className="sidebar-nav-icon"><Icon size={18} strokeWidth={2} /></span>
                <span className="sidebar-nav-label">{item.label}</span>
              </NavLink>
            </React.Fragment>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout-button" aria-label="Se déconnecter">
          <span className="sidebar-nav-icon"><LogOut size={18} strokeWidth={2} /></span>
          <span className="sidebar-nav-label">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
