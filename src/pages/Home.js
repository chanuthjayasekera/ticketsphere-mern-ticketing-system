import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="badge badge-pill badge-soft mb-3">Modern Ticketing • User + Admin</div>
              <h1 className="display-4 hero-title">Support that feels <span className="text-accent">professional</span>.</h1>
              <p className="lead text-muted">
                Create clean tickets with multiple attachments, track replies, and get fast resolutions — all in a beautiful dashboard.
              </p>

              {!user && (
                <div className="d-flex flex-column flex-sm-row">
                  <Link to="/user/login" className="btn btn-primary btn-lg mr-sm-3 mb-3 mb-sm-0">User Login</Link>
                  <Link to="/admin/login" className="btn btn-outline-primary btn-lg">Admin Login</Link>
                </div>
              )}

              {user && user.role === "user" && (
                <div className="d-flex flex-column flex-sm-row">
                  <Link to="/user/tickets/new" className="btn btn-primary btn-lg mr-sm-3 mb-3 mb-sm-0">Create Ticket</Link>
                  <Link to="/user/tickets" className="btn btn-outline-primary btn-lg">My Tickets</Link>
                </div>
              )}

              {user && user.role === "admin" && (
                <div className="d-flex flex-column flex-sm-row">
                  <Link to="/admin/tickets" className="btn btn-primary btn-lg mr-sm-3 mb-3 mb-sm-0">All Tickets</Link>
                  <Link to="/admin/dashboard" className="btn btn-outline-primary btn-lg">Dashboard</Link>
                </div>
              )}
            </div>

            <div className="col-lg-6">
              <div className="hero-art shadow-soft">
                <img className="img-fluid" src="/hero.svg" alt="TicketSphere hero" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mt-5">
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card card-soft h-100">
              <div className="card-body">
                <div className="icon-bubble mb-3">📎</div>
                <h5 className="card-title">Multi-file Attachments</h5>
                <p className="card-text text-muted">Upload screenshots, logs, PDFs, and images to explain issues clearly.</p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card card-soft h-100">
              <div className="card-body">
                <div className="icon-bubble mb-3">💬</div>
                <h5 className="card-title">Replies & Updates</h5>
                <p className="card-text text-muted">Admins respond inside the ticket. Users see every reply in one place.</p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card card-soft h-100">
              <div className="card-body">
                <div className="icon-bubble mb-3">✅</div>
                <h5 className="card-title">Resolution Workflow</h5>
                <p className="card-text text-muted">Open → In Progress → Resolved with a clean, trackable history.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mt-4 mb-5">
        <div className="card card-soft">
          <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
            <div>
              <h4 className="mb-1">New here?</h4>
              <div className="text-muted">Register as a user to start creating tickets in seconds.</div>
            </div>
            <Link to="/user/register" className="btn btn-primary mt-3 mt-md-0">Create User Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
