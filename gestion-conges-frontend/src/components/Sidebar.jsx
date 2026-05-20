import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {useAuth} from '../hooks/useAuth';
import './Sidebar.css';
import chuLogo from '../assets/images/CHU_logo.png';

import { 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  Users, 
  Calendar, 
  UserCog, 
  Settings, 
  Download, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userRole = user?.role;

  const navigationItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['employee', 'manager', 'admin'] },
    { path: '/new-request', label: 'Nouvelle demande', icon: FileText, roles: ['employee', 'manager', 'admin'] },
    { path: '/my-requests', label: 'Mes demandes', icon: ClipboardList, roles: ['employee', 'manager', 'admin'] },
    { path: '/team-requests', label: 'Demandes équipe', icon: Users, roles: ['manager'], section: 'Gestion Équipe' },
    { path: '/calendar', label: 'Calendrier absences', icon: Calendar, roles: ['manager'], section: 'Gestion Équipe' },
    { path: '/users', label: 'Gestion utilisateurs', icon: UserCog, roles: ['admin'], section: 'Administration' },
    { path: '/leave-types', label: 'Configuration types', icon: Settings, roles: ['admin'], section: 'Administration' },
    { path: '/export', label: 'Exportation CSV', icon: Download, roles: ['admin'], section: 'Administration' },
  ];

  const filteredNavItems = useMemo(() => {
    return navigationItems.filter(item => item.roles.includes(userRole || 'employee'));
  }, [userRole, navigationItems]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="chu-logo-container">
          <img src={chuLogo} alt="Logo CHU Fès" className="sidebar-logo-img" />
        </div>
      </div>

      <nav className="sidebar-navigation">
        {filteredNavItems.map((item, index) => {
          const showSectionTitle = item.section && (index === 0 || filteredNavItems[index - 1].section !== item.section);
          
          const IconComponent = item.icon;

          return (
            <React.Fragment key={item.path}>
              {showSectionTitle && <div className="nav-section-divider">{item.section}</div>}
              
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'sidebar-nav-item active' : 'sidebar-nav-item'}
              >
                <span className="sidebar-nav-icon">
                  <IconComponent size={18} strokeWidth={2} />
                </span>
                <span className="sidebar-nav-label">{item.label}</span>
              </NavLink>
            </React.Fragment>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout-button" aria-label="Se déconnecter">
          <span className="sidebar-nav-icon">
            <LogOut size={18} strokeWidth={2} />
          </span>
          <span className="sidebar-nav-label">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}