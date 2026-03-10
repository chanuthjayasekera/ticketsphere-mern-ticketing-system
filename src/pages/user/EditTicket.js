import React, { useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../api/axios";

const FILE_BASE = process.env.REACT_APP_FILE_BASE_URL || "http://localhost:5000";

const categories = ["Bug/Error", "Feature Request", "Account/Access", "Payment/Billing", "Other"];
const priorities = ["Low", "Medium", "High", "Urgent"];

function fileKey(f) {
  return `${f.name}_${f.size}_${f.lastModified}`;
}

export default function EditTicket() {
  const { id } = useParams();
  const history = useHistory();

  const [ticket, setTicket] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState("Medium");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // ✅ multiple file selections (accumulate)
  const [files, setFiles] = useState([]);

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    api
      .get(`/tickets/mine/${id}`)
      .then(({ data }) => {
        setTicket(data);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setCategory(data.category || categories[0]);
        setPriority(data.priority || "Medium");
        setContactEmail(data.contactEmail || "");
        setContactPhone(data.contactPhone || "");
      })
      .catch(() => setErr("Ticket not found or you don't have permission"));
  }, [id]);

  // ✅ Add new selected files (no duplicates)
  const onFileChange = (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    setFiles((prev) => {
      const map = new Map(prev.map((f) => [fileKey(f), f]));
      picked.forEach((f) => map.set(fileKey(f), f)); // prevents duplicates
      return Array.from(map.values());
    });

    // ✅ allow selecting same file again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = (key) => {
    setFiles((prev) => prev.filter((f) => fileKey(f) !== key));
  };

  const clearSelectedFiles = () => setFiles([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("category", category);
      fd.append("priority", priority);
      fd.append("contactEmail", contactEmail);
      if (contactPhone.trim()) fd.append("contactPhone", contactPhone);

      // ✅ append all selected files
      files.forEach((f) => fd.append("attachments", f));

      await api.put(`/tickets/mine/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      history.push(`/user/tickets/${id}`);
    } catch (e2) {
      setErr(e2.response?.data?.message || "Failed to update ticket");
    } finally {
      setBusy(false);
    }
  };

  if (!ticket) {
    return (
      <div className="container py-5">
        <div className="card card-soft">
          <div className="card-body text-center">
            {err || <div className="spinner-border text-primary" role="status" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap" style={{ gap: 12 }}>
        <div>
          <h2 className="mb-1">
            Edit: {title ? title.substring(0, 80) + (title.length > 80 ? "..." : "") : "Ticket"}
          </h2>
          <div className="text-muted small">
            Ticket ID: {id.slice(-8)} • Last updated:{" "}
            {new Date(ticket.updatedAt || ticket.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="d-flex align-items-center" style={{ gap: 10 }}>
          <button
            type="button"
            className="btn btn-outline-secondary px-4 py-2"
            onClick={() => history.goBack()}
          >
            ← Back
          </button>

          <button
            type="button"
            className="btn btn-outline-info px-4 py-2"
            onClick={() => history.push(`/user/tickets/${id}`)}
          >
            View Ticket
          </button>
        </div>
      </div>

      <div className="card card-soft shadow-soft">
        <div className="card-body p-4">
          {err && <div className="alert alert-danger">{err}</div>}

          {/* If ticket is resolved, block editing */}
          {ticket.status === "Resolved" && (
            <div className="alert alert-warning">
              This ticket is <b>Resolved</b>. You can’t edit it anymore.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                className="form-control form-control-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength="120"
                disabled={ticket.status === "Resolved"}
              />
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Category</label>
                <select
                  className="form-control form-control-lg"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={ticket.status === "Resolved"}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group col-md-6">
                <label>Priority</label>
                <select
                  className="form-control form-control-lg"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={ticket.status === "Resolved"}
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control form-control-lg"
                rows="7"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={ticket.status === "Resolved"}
              />
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Contact Email</label>
                <input
                  className="form-control form-control-lg"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  disabled={ticket.status === "Resolved"}
                />
              </div>
              <div className="form-group col-md-6">
                <label>Contact Phone (optional)</label>
                <input
                  className="form-control form-control-lg"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  disabled={ticket.status === "Resolved"}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Add New Attachments (you can select multiple times)</label>

              <input
                ref={fileInputRef}
                className="form-control"
                type="file"
                multiple
                onChange={onFileChange}
                disabled={ticket.status === "Resolved"}
              />

              {/* ✅ selected new files list (removable) */}
              {files.length > 0 && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="small text-muted">
                      New files to upload: <b>{files.length}</b>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={clearSelectedFiles}
                      disabled={ticket.status === "Resolved"}
                    >
                      Clear
                    </button>
                  </div>

                  <div className="list-group">
                    {files.map((f) => (
                      <div
                        key={fileKey(f)}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div style={{ minWidth: 0 }}>
                          <div className="font-weight-bold text-truncate" title={f.name}>
                            {f.name}
                          </div>
                          <div className="small text-muted">
                            {(f.size / 1024).toFixed(1)} KB
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeSelectedFile(fileKey(f))}
                          disabled={ticket.status === "Resolved"}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* existing attachments */}
              {!!ticket.attachments?.length && (
                <div className="mt-4">
                  <div className="small text-muted mb-2">Current attachments:</div>
                  <div className="list-group">
                    {ticket.attachments.map((a, idx) => (
                      <a
                        key={idx}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        href={`${FILE_BASE}${a.url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>📎 {a.originalName}</span>
                        <small className="text-muted">{(a.size / 1024).toFixed(1)} KB</small>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg mr-3"
                disabled={busy || ticket.status === "Resolved"}
              >
                {busy ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-lg"
                onClick={() => history.goBack()}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
