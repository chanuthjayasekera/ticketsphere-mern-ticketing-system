import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function UserDashboard() {
  const [stats, setStats] = useState({ Open: 0, "In Progress": 0, Resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [closingId, setClosingId] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await api.get("/tickets/mine");

      setAllTickets(data);

      const s = { Open: 0, "In Progress": 0, Resolved: 0 };
      data.forEach((t) => {
        s[t.status] = (s[t.status] || 0) + 1;
      });
      setStats(s);

      setRecent(data.slice(0, 5));
    }
    load().catch(() => {});
  }, []);

  const handleClose = async (id) => {
    const ok = window.confirm("Close this ticket? It will be marked as Resolved.");
    if (!ok) return;

    try {
      setClosingId(id);

      // ✅ close ticket
      const { data: updated } = await api.patch(`/tickets/${id}/close`);

      // ✅ update lists in UI
      const updatedAll = allTickets.map((t) => (t._id === id ? updated : t));
      setAllTickets(updatedAll);

      // recompute stats
      const s = { Open: 0, "In Progress": 0, Resolved: 0 };
      updatedAll.forEach((t) => {
        s[t.status] = (s[t.status] || 0) + 1;
      });
      setStats(s);

      // refresh recent list (keep top 5 order)
      setRecent(updatedAll.slice(0, 5));
    } catch (err) {
      alert(
        (err.response && err.response.data && err.response.data.message) ||
          "Close failed. Try again."
      );
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div>
          <h2 className="mb-1">User Dashboard</h2>
          <div className="text-muted">Track your ticket progress and admin replies.</div>
        </div>
        <Link to="/user/tickets/new" className="btn btn-primary btn-lg mt-3 mt-md-0">
          + Create Ticket
        </Link>
      </div>

      <div className="row">
        {["Open", "In Progress", "Resolved"].map((k) => (
          <div className="col-md-4 mb-3" key={k}>
            <div className="card card-soft h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="text-muted small">{k}</div>
                    <div className="display-4 mb-0">{stats[k] || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card card-soft mt-2">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Recent tickets</h5>
            <Link to="/user/tickets" className="btn btn-sm btn-outline-primary">
              View all
            </Link>
          </div>

          <div className="table-responsive mt-3">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t._id}>
                    <td className="font-weight-bold">{t.title}</td>
                    <td>
                      <span className={"badge badge-status badge-" + t.status.replace(" ", "")}>
                        {t.status}
                      </span>
                    </td>
                    <td>{t.priority}</td>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>

                    <td className="text-right">
                      <Link className="btn btn-sm btn-primary mr-2" to={`/user/tickets/${t._id}`}>
                        Open
                      </Link>

                      {t.status !== "Resolved" && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleClose(t._id)}
                          disabled={closingId === t._id}
                        >
                          {closingId === t._id ? "Closing..." : "Close"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {!recent.length && (
                  <tr>
                    <td colSpan="5" className="text-muted">
                      No tickets yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
