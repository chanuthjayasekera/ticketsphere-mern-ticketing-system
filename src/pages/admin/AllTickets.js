import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AllTickets() {
  const [tickets, setTickets] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");

  useEffect(() => {
    api.get("/tickets").then(({ data }) => setTickets(data)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const term = q.toLowerCase();
      const okQ =
        (t.title || "").toLowerCase().includes(term) ||
        (t.category || "").toLowerCase().includes(term) ||
        ((t.createdBy && t.createdBy.email) || "").toLowerCase().includes(term);

      const okS = status === "All" ? true : t.status === status;
      const okP = priority === "All" ? true : t.priority === priority;
      return okQ && okS && okP;
    });
  }, [tickets, q, status, priority]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <div>
          <h2 className="mb-1">Ticket Queue</h2>
          <div className="text-muted">Filter by status/priority and manage conversations.</div>
        </div>
        <Link to="/admin/dashboard" className="btn btn-outline-primary btn-lg mt-3 mt-md-0">Back to Dashboard</Link>
      </div>

      <div className="card card-soft mb-3">
        <div className="card-body">
          <div className="form-row">
            <div className="form-group col-md-6">
              <label className="small text-muted">Search</label>
              <input className="form-control form-control-lg" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, category, user email..." />
            </div>
            <div className="form-group col-md-3">
              <label className="small text-muted">Status</label>
              <select className="form-control form-control-lg" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>All</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
            <div className="form-group col-md-3">
              <label className="small text-muted">Priority</label>
              <select className="form-control form-control-lg" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option>All</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-soft">
        <div className="card-body">
          <div className="table-responsive">
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
                {filtered.map((t) => (
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
                {!filtered.length && (
                  <tr><td colSpan="6" className="text-muted">No tickets match filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
