import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiUsers, FiFileText, FiActivity, FiClipboard,
  FiDownload, FiSettings, FiLogOut, FiHeart, FiShield, FiList
} from 'react-icons/fi';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Tableau de bord', icon: <FiHome />, roles: ['medecin', 'infirmier', 'administrateur', 'technicien'] },
    { path: '/patients', label: 'Patients', icon: <FiUsers />, roles: ['medecin', 'infirmier', 'administrateur'] },
    { path: '/dossiers', label: 'Dossiers Médicaux', icon: <FiFileText />, roles: ['medecin', 'administrateur'] },
    { path: '/signes-vitaux', label: 'Signes Vitaux', icon: <FiActivity />, roles: ['infirmier', 'medecin', 'administrateur'] },
    { path: '/analyses', label: 'Analyses Labo', icon: <FiClipboard />, roles: ['technicien', 'medecin', 'administrateur'] },
    { path: '/rapports', label: 'Rapports PDF', icon: <FiDownload />, roles: ['medecin', 'administrateur'] },
    { path: '/documents', label: 'Documents Sécurisés', icon: <FiShield />, roles: ['medecin', 'infirmier', 'administrateur', 'technicien'] },
    { path: '/journal', label: 'Journal d\'activités', icon: <FiList />, roles: ['administrateur'] },
    { path: '/utilisateurs', label: 'Utilisateurs', icon: <FiSettings />, roles: ['administrateur'] },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}` : '';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2><FiHeart style={{ marginRight: 8 }} />MediSuivi</h2>
          <p>Système de Suivi Médical</p>
        </div>

        <nav className="sidebar-nav">
          {visibleMenuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <div className="name">{user?.prenom} {user?.nom}</div>
              <div className="role">{user?.role}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <FiLogOut /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
