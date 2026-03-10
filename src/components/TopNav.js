import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function TopNav() {
  const { user, logout } = useContext(AuthContext);

  // Helper to get initials (A. B. → AB, John → J, etc.)
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="brand-mark mr-2">TS</span>
          <span className="brand-text">TicketSphere</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ml-auto align-items-center">

            {/* ─── Unauthenticated ─── */}
            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/user/login">User Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/login">Admin Login</Link>
                </li>
              </>
            )}

            {/* ─── User authenticated ─── */}
            {user && user.role === "user" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/user/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/user/tickets/new">Create Ticket</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/user/tickets">My Tickets</Link>
                </li>
              </>
            )}

            {/* ─── Admin authenticated ─── */}
            {user && user.role === "admin" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">Admin</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/tickets">All Tickets</Link>
                </li>
              </>
            )}

            {/* ─── Logged-in user avatar + logout ─── */}
            {user && (
              <li className="nav-item dropdown ml-lg-3">
                <a
                  className="nav-link dropdown-toggle p-0 d-flex align-items-center"
                  href="#"
                  id="userDropdown"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <div
                    className="user-avatar rounded-circle d-flex align-items-center justify-content-center bg-primary text-white font-weight-bold"
                    style={{
                      width: "38px",
                      height: "38px",
                      fontSize: "16px",
                      lineHeight: "38px",
                    }}
                  >
                    {getInitials(user.name || user.fullName || user.email?.split("@")[0])}
                  </div>
                </a>

                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
                  <div className="dropdown-header">
                    <strong>{user.name || user.fullName || "User"}</strong>
                    <small className="d-block text-muted">{user.email}</small>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={logout}>
                    Logout
                  </button>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}