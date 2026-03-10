import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.get("/tickets").then(({ data }) => setTickets(data)).catch(() => {});
  }, []);

  const stats = useMemo(() => {
    const s = { Open: 0, "In Progress": 0, Resolved: 0 };
    tickets.forEach((t) => { s[t.status] = (s[t.status] || 0) + 1; });
    return s;
  }, [tickets]);

  const recent = tickets.slice(0, 7);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div>
          <h2 className="mb-1">Admin Dashboard</h2>
          <div className="text-muted">Monitor, respond, and resolve tickets fast.</div>
        </div>
        <Link to="/admin/tickets" className="btn btn-primary btn-lg mt-3 mt-md-0">Open Ticket Queue</Link>
      </div>

      <div className="row">
        {["Open","In Progress","Resolved"].map((k) => (
          <div className="col-md-4 mb-3" key={k}>
            <div className="card card-soft h-100">
              <div className="card-body">
                <div className="text-muted small">{k}</div>
                <div className="display-4 mb-0">{stats[k] || 0}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card card-soft mt-2">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Recent tickets</h5>
            <Link to="/admin/tickets" className="btn btn-sm btn-outline-primary">View all</Link>
          </div>

          <div className="table-responsive mt-3">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t._id}>
                    <td className="font-weight-bold">{t.title}</td>
                    <td className="text-muted">{t.createdBy && t.createdBy.email}</td>
                    <td><span className={"badge badge-status badge-" + t.status.replace(" ","")}>{t.status}</span></td>
                    <td>{t.priority}</td>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="text-right">
                      <Link className="btn btn-sm btn-primary" to={`/admin/tickets/${t._id}`}>Manage</Link>
                    </td>
                  </tr>
                ))}
                {!recent.length && (
                  <tr><td colSpan="6" className="text-muted">No tickets yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
