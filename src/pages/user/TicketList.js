import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [closingId, setClosingId] = useState(null);

  useEffect(() => {
    api
      .get("/tickets/mine")
      .then(({ data }) => setTickets(data))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const okQ =
        (t.title || "").toLowerCase().includes(q.toLowerCase()) ||
        (t.category || "").toLowerCase().includes(q.toLowerCase());
      const okS = status === "All" ? true : t.status === status;
      return okQ && okS;
    });
  }, [tickets, q, status]);

  const handleClose = async (id) => {
    const ok = window.confirm("Close this ticket? It will be marked as Resolved.");
    if (!ok) return;

    try {
      setClosingId(id);

      // ✅ close (resolve) ticket
      const { data: updated } = await api.patch(`/tickets/${id}/close`);

      // ✅ update in UI
      setTickets((prev) => prev.map((t) => (t._id === id ? updated : t)));
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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <div>
          <h2 className="mb-1">My Tickets</h2>
          <div className="text-muted">Search, filter, and open conversations.</div>
        </div>
        <Link to="/user/tickets/new" className="btn btn-primary btn-lg mt-3 mt-md-0">
          + Create Ticket
        </Link>
      </div>

      <div className="card card-soft mb-3">
        <div className="card-body">
          <div className="form-row">
            <div className="form-group col-md-8">
              <label className="small text-muted">Search</label>
              <input
                className="form-control form-control-lg"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title or category..."
              />
            </div>
            <div className="form-group col-md-4">
              <label className="small text-muted">Status</label>
              <select
                className="form-control form-control-lg"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>All</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {filtered.map((t) => (
          <div className="col-lg-6 mb-3" key={t._id}>
            <div className="card card-soft h-100">
              <div className="card-body">
                <div
                  className="d-flex flex-wrap justify-content-between align-items-start"
                  style={{ gap: 10 }}
                >
                  <div className="pr-2" style={{ minWidth: 0 }}>
                    <h5 className="mb-1 text-truncate" title={t.title}>
                      {t.title}
                    </h5>
                    <div className="text-muted small">
                      {t.category} • {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <span
                    className={"badge badge-status badge-" + (t.status || "").replace(" ", "")}
                    style={{ flexShrink: 0 }}
                  >
                    {t.status}
                  </span>
                </div>

                <div
                  className="mt-3 d-flex justify-content-between align-items-center flex-wrap"
                  style={{ gap: 10 }}
                >
                  <div className="text-muted small">
                    Priority: <b>{t.priority}</b>
                  </div>

                  <div className="d-flex align-items-center flex-wrap" style={{ gap: 8 }}>
                    <Link className="btn btn-sm btn-outline-primary" to={`/user/tickets/${t._id}`}>
                      Open
                    </Link>

                    {t.status !== "Resolved" && (
                      <>
                        <Link className="btn btn-sm btn-primary" to={`/user/tickets/${t._id}/edit`}>
                          Edit
                        </Link>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleClose(t._id)}
                          disabled={closingId === t._id}
                        >
                          {closingId === t._id ? "Closing..." : "Close"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!filtered.length && (
          <div className="col-12">
            <div className="card card-soft">
              <div className="card-body text-muted">No tickets match your filters.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
