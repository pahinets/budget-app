import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ReceiptText, LogOut, Wallet } from "lucide-react";

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Transactions", path: "/transactions", icon: ReceiptText },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <Wallet />
          </div>
          <h1 className="logo-text">Budgetify</h1>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon className={`nav-icon ${isActive ? "active" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="db-status">
            <p className="db-status-title">Database Status</p>
            <div className="db-status-value">
              <div className="status-dot"></div>
              Prisma + PostgreSQL
            </div>
          </div>
          <button className="logout-btn">
            <LogOut />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="main-footer">
          <div className="footer-content">
            <div className="footer-tags">
              <span>PB</span>
              <span>•</span>
              <span>PRISMA ORM</span>
              <span>•</span>
              <span>POSTGRESQL</span>
              <span>•</span>
              <span>ESBUILD</span>
              <span>•</span>
              <span>VERSION 3.0.0</span>
            </div>
            <div className="footer-copy">
              © 2026 PERSONAL BUDGET
            </div>
            <div className="footer-links">
              <a href="#">Support</a>
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
