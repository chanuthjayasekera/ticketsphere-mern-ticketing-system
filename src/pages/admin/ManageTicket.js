import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";

const FILE_BASE = process.env.REACT_APP_FILE_BASE_URL || "http://localhost:5000";

const statuses = ["Open", "In Progress", "Resolved"];
const priorities = ["Low", "Medium", "High", "Urgent"];

export default function ManageTicket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("Open");
  const [priority, setPriority] = useState("Medium");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef(null);

  async function load() {
    const { data } = await api.get(`/tickets/${id}`);
    setTicket(data);
    setStatus(data.status);
    setPriority(data.priority);
    setResolutionSummary(data.resolutionSummary || "");
  }

  useEffect(() => {
    load().catch(() => setErr("Ticket not found"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket && ticket.messages ? ticket.messages.length : 0]);

  async function saveMeta(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await api.put(`/tickets/${id}`, { status, priority, resolutionSummary });
      await load();
    } catch (e2) {
      setErr(
        (e2.response && e2.response.data && e2.response.data.message) ||
          "Update failed"
      );
    } finally {
      setBusy(false);
    }
  }

  function onPickFiles(e) {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    setFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function sendMessage(e) {
    e.preventDefault();
    setErr("");

    const trimmed = msg.trim();

   
    const finalMessage =
      trimmed || (files.length ? "Files attached" : "");

    if (!finalMessage) {
      setErr("Message is required.");
      return;
    }

    try {
      setSending(true);


      const form = new FormData();
      form.append("message", finalMessage);

      
      files.forEach((f) => form.append("attachments", f));

      await api.post(`/tickets/${id}/messages`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg("");
      setFiles([]);
      await load();
    } catch (e2) {
      setErr(
        (e2.response && e2.response.data && e2.response.data.message) ||
          "Failed to send"
      );
    } finally {
      setSending(false);
    }
  }

  if (!ticket) {
    return (
      <div className="container py-5">
        <div className="card card-soft">
          <div className="card-body">{err || "Loading..."}</div>
        </div>
      </div>
    );
  }

  const styles = {
    chatBox: {
      height: 420,
      overflowY: "auto",
      background: "#efeae2",
      borderRadius: 16,
      padding: 14,
      border: "1px solid rgba(0,0,0,0.06)",
    },
    row: (isAdmin) => ({
      display: "flex",
      justifyContent: isAdmin ? "flex-end" : "flex-start",
      marginBottom: 10,
    }),
    bubble: (isAdmin) => ({
      maxWidth: "78%",
      padding: "10px 12px",
      borderRadius: 16,
      borderTopRightRadius: isAdmin ? 6 : 16,
      borderTopLeftRadius: isAdmin ? 16 : 6,
      background: isAdmin ? "#d9fdd3" : "#ffffff",
      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    }),
    meta: {
      fontSize: 12,
      opacity: 0.7,
      marginTop: 6,
      display: "flex",
      justifyContent: "space-between",
    },
    name: { fontWeight: 700, fontSize: 12, opacity: 0.8 },
    time: { fontSize: 11, opacity: 0.65, whiteSpace: "nowrap" },
    inputWrap: {
      marginTop: 12,
      display: "flex",
      gap: 10,
      alignItems: "center",
      flexWrap: "wrap",
    },
    input: {
      flex: 1,
      minWidth: 220,
      padding: "14px 14px",
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.10)",
      outline: "none",
      fontSize: 15,
      background: "#fff",
    },
    sendBtn: { borderRadius: 999, padding: "12px 18px", fontWeight: 600 },
    fileChip: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "#fff",
      border: "1px solid rgba(0,0,0,0.10)",
      padding: "6px 10px",
      borderRadius: 999,
      marginTop: 8,
      marginRight: 8,
      fontSize: 13,
    },
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Manage Ticket</h2>
          <div className="text-muted">
            <b>{ticket.title}</b> • {ticket.createdBy && ticket.createdBy.email}
          </div>
        </div>
        <Link to="/admin/tickets" className="btn btn-outline-primary">
          Back
        </Link>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row">
        <div className="col-lg-8 mb-3">
          <div className="card card-soft shadow-soft">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className={"badge badge-status badge-" + ticket.status.replace(" ", "")}>
                    {ticket.status}
                  </span>
                  <span className="ml-2 text-muted">
                    Priority: <b>{ticket.priority}</b> • {ticket.category}
                  </span>
                </div>
                <div className="small text-muted">
                  {new Date(ticket.createdAt).toLocaleString()}
                </div>
              </div>

              <hr />

              <h6>Description</h6>
              <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
                {ticket.description}
              </p>

              {!!ticket.attachments?.length && (
                <>
                  <h6 className="mt-4">Ticket Attachments</h6>
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
                        <span className="small text-muted">
                          {Math.round((a.size || 0) / 1024)} KB
                        </span>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card card-soft shadow-soft mt-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Conversation</h5>
                <span className="small text-muted">{ticket.messages?.length || 0} message(s)</span>
              </div>

              <div className="mt-3" style={styles.chatBox}>
                {(ticket.messages || []).map((m) => {
                  const isAdmin = m.senderRole === "admin";
                  return (
                    <div key={m._id || m.createdAt} style={styles.row(isAdmin)}>
                      <div style={styles.bubble(isAdmin)}>
                        <div style={{ fontSize: 15 }}>{m.message}</div>

                        {!!m.attachments?.length && (
                          <div style={{ marginTop: 8 }}>
                            {m.attachments.map((a, idx) => (
                              <div key={idx}>
                                <a href={`${FILE_BASE}${a.url}`} target="_blank" rel="noreferrer">
                                  📎 {a.originalName || "Attachment"}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={styles.meta}>
                          <span style={styles.name}>{isAdmin ? "Admin" : "User"}</span>
                          <span style={styles.time}>
                            {new Date(m.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {!!files.length && (
                <div className="mt-3">
                  <div className="small text-muted mb-1">Selected attachments:</div>
                  <div>
                    {files.map((f, i) => (
                      <span key={i} style={styles.fileChip}>
                        📎 {f.name}
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0"
                          onClick={() => removeFile(i)}
                          style={{ textDecoration: "none" }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={sendMessage} style={styles.inputWrap}>
                <input
                  style={styles.input}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Write a reply to the user..."
                />

                <label className="btn btn-outline-secondary mb-0" style={{ borderRadius: 999 }}>
                  📎 Attach
                  <input type="file" multiple onChange={onPickFiles} style={{ display: "none" }} />
                </label>

                <button className="btn btn-primary" style={styles.sendBtn} disabled={sending}>
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>

              <small className="form-text text-muted mt-2">
                If you send only files, it will automatically send “Files attached”.
              </small>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-3">
          <div className="card card-soft shadow-soft">
            <div className="card-body">
              <h5 className="mb-3">Workflow</h5>

              <form onSubmit={saveMeta}>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control form-control-lg" value={status} onChange={(e) => setStatus(e.target.value)}>
                    {statuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-control form-control-lg" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    {priorities.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Resolution Summary</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                    placeholder="Explain the fix, next steps, or closure reason..."
                  />
                </div>

                <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
                  {busy ? "Saving..." : "Save Changes"}
                </button>
              </form>

              <hr />
              <div className="small text-muted">
                Contact: <b>{ticket.contactEmail}</b>
                {ticket.contactPhone ? ` • ${ticket.contactPhone}` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
