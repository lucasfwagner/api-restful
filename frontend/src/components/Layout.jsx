import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Container, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const icons = {
  dashboard: (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
      <path d="M2 2h4v4H2V2zm0 6h4v4H2V8zm6-6h4v4H8V2zm0 6h4v4H8V8z"/>
    </svg>
  ),
  products: (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
      <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"/>
    </svg>
  ),
  orders: (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>
    </svg>
  ),
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div>
      <div className={`sidebar d-flex flex-column py-3 ${sidebarOpen ? 'open' : ''}`}>
        <div className="px-3 mb-4">
          <h5 className="text-white fw-bold mb-0">
            <span style={{ color: '#7c8cf8' }}>◆</span> Loja Online
          </h5>
          <small className="text-white-50">Projeto Universitário</small>
        </div>

        <nav className="nav flex-column flex-grow-1">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            {icons.dashboard} Dashboard
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            {icons.products} Produtos
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            {icons.orders} Pedidos
          </NavLink>
        </nav>

        <div className="px-3 mt-auto">
          <div className="d-flex align-items-center text-white-50 small">
            <div
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
              style={{ width: 32, height: 32, fontSize: 14, flexShrink: 0 }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-white text-truncate fw-semibold" style={{ fontSize: 13 }}>{user?.name}</div>
              <div className="text-truncate" style={{ fontSize: 11 }}>{user?.role}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="topbar d-flex align-items-center px-4">
          <Button
            variant="link"
            className="d-md-none me-2 text-dark p-0"
            onClick={() => setSidebarOpen((o) => !o)}
          >
            ☰
          </Button>
          <span className="fw-semibold text-secondary ms-auto me-3 d-none d-md-block">
            Olá, {user?.name}
          </span>
          <Button variant="outline-danger" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>

        <main className="p-4">{children}</main>

        <footer className="text-center text-muted py-3 border-top bg-white">
          <small>© 2024 Loja Online — Projeto Universitário · Desenvolvido com React + Node.js</small>
        </footer>
      </div>

      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-md-none"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}