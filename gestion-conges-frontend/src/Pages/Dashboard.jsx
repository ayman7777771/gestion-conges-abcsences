import React from 'react';
import {useAuth} from '../hooks/useAuth';
import UserDashboard from './Dashboards/UserDashboard';
import ManagerDashboard from './Dashboards/ManagerDashboard';
import AdminDashboard from './Dashboards/AdminDashboard';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const userRole = user?.role;

  return (
    <div className="dashboard-page-wrapper fade-in">
      <UserDashboard />
      {userRole === 'manager' && <ManagerDashboard />}
      {userRole === 'admin' && <AdminDashboard />}
    </div>
  );
}