import React from 'react';
import { useLocation } from 'react-router-dom';
import {useAuth} from '../hooks/useAuth';
import './Navbar.css';
import { Bell } from 'lucide-react';
const ROUTE_TITLES = {
  '/dashboard': 'Tableau de bord',
  '/': 'Tableau de bord',
  '/new-request': 'Nouvelle demande',
  '/my-requests': 'Mes demandes',
  '/team-requests': 'Demandes équipe',
  '/calendar': 'Calendrier absences',
  '/users': 'Gestion utilisateurs',
  '/leave-types': 'Configuration types',
  '/export': 'Exportation données'
};

const ROLE_LABELS = {
  admin: 'Admin RH',
  manager: 'Manager'
};

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const pageTitle = ROUTE_TITLES[location.pathname] || 'CHU Fès';
  const roleLabel = ROLE_LABELS[user?.role] || 'Employé';

  const getInitials = () => {
    if (!user?.name) return 'AE';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <h2 className="page-title">{pageTitle}</h2>
      </div>

      <div className="navbar-right">
        <button className="notification-trigger" aria-label="Notifications">
          <span className="navbar-icon-wrapper">
            <Bell size={20} strokeWidth={2} />
          </span>
          <span className="notification-badge"></span>
        </button>

        <div className="user-profile-card">
          <div className="user-details">
            <span className="user-display-name">{user?.name || 'Ayman El Abidi'}</span>
            <span className="user-display-role">{roleLabel}</span>
          </div>
          <div className="user-avatar-circle">
            {getInitials()}
          </div>
        </div>
      </div>
    </header>
  );
}