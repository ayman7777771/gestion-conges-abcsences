import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import './MainLayout.css';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  return (
    <div className={`app-container ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
        onNavigate={() => window.innerWidth < 768 && setSidebarOpen(false)}
      />
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fermer le menu"
          type="button"
        />
      )}
      {!sidebarOpen && (
        <button
          className="mobile-sidebar-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Ouvrir le menu"
          type="button"
        >
          <Menu size={20} />
        </button>
      )}

      <div className="main-content">
        <Navbar />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
