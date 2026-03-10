import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";

const FILE_BASE = process.env.REACT_APP_FILE_BASE_URL || "http://localhost:5000";

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // ✅ add attachments for messages
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef(null);

  async function load() {
    const { data } = await api.get(`/tickets/mine/${id}`);
    setTicket(data);
  }

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ auto scroll to bottom (no optional chaining call)
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket && ticket.messages ? ticket.messages.length : 0]);

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
    const finalMessage = trimmed || (files.length ? "Files attached" : "");

    if (!finalMessage) {
      setErr("Message is required.");
      return;
    }

    // OPTIONAL: block sending when resolved
    // if (ticket?.status === "Resolved") {
    //   setErr("This ticket is resolved. You can't send new messages.");
    //   return;
    // }

    try {
      setSending(true);

      // ✅ send as multipart/form-data (message + attachments)
      const form = new FormData();
      form.append("message", finalMessage);
      files.forEach((f) => form.append("attachments", f));

      await api.post(`/tickets/mine/${id}/messages`, form, {
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
          <div className="card-body">Loading...</div>
        </div>
      </div>
    );
  }

  // WhatsApp-like styles
  const styles = {
    chatBox: {
      height: 420,
      overflowY: "auto",
      background: "#efeae2",
      borderRadius: 16,
      padding: 14,
      border: "1px solid rgba(0,0,0,0.06)",
    },
    row: (isUser) => ({
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 10,
    }),
    bubble: (isUser) => ({
      maxWidth: "78%",
      padding: "10px 12px",
      borderRadius: 16,
      borderTopRightRadius: isUser ? 6 : 16,
      borderTopLeftRadius: isUser ? 16 : 6,
      background: isUser ? "#d9fdd3" : "#ffffff",
      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    }),
    meta: {
      fontSize: 12,
      opacity: 0.7,
      marginTop: 6,
      display: "flex",
      gap: 8,
      justifyContent: "space-between",
    },
    name: { fontWeight: 700, fontSize: 12, opacity: 0.8 },
    time: { fontSize: 11, opacity: 0.65, marginLeft: 10, whiteSpace: "nowrap" },

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
    sendBtn: {
      borderRadius: 999,
      padding: "12px 18px",
      fontSize: 15,
      fontWeight: 600,
    },
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
    attachmentBox: {
      marginTop: 8,
      paddingTop: 6,
      borderTop: "1px solid rgba(0,0,0,0.06)",
    },
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <div>
          <h2 className="mb-1">{ticket.title}</h2>
          <div className="text-muted">
            <span className={"badge badge-status badge-" + ticket.status.replace(" ", "")}>
              {ticket.status}
            </span>
            <span className="ml-2">
              Priority: <b>{ticket.priority}</b> • {ticket.category}
            </span>
          </div>
        </div>
        <div className="mt-3 mt-md-0">
          <Link to="/user/tickets" className="btn btn-outline-primary mr-2">
            Back
          </Link>
          {ticket.status !== "Resolved" && (
            <Link to={`/user/tickets/${ticket._id}/edit`} className="btn btn-primary">
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8 mb-3">
          <div className="card card-soft shadow-soft">
            <div className="card-body">
              <h5>Description</h5>
              <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
                {ticket.description}
              </p>

              {!!ticket.attachments?.length && (
                <>
                  <h6 className="mt-4">Attachments</h6>
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
                <span className="small text-muted">
                  {ticket.messages?.length || 0} message(s)
                </span>
              </div>

              {/* ✅ WhatsApp style conversation + show attachments */}
              <div className="mt-3" style={styles.chatBox}>
                {(ticket.messages || []).map((m) => {
                  const isUser = m.senderRole === "user";
                  return (
                    <div key={m._id || m.createdAt} style={styles.row(isUser)}>
                      <div style={styles.bubble(isUser)}>
                        <div style={{ fontSize: 15 }}>{m.message}</div>

                        {/* ✅ SHOW ADMIN/USER MESSAGE ATTACHMENTS */}
                        {!!m.attachments?.length && (
                          <div style={styles.attachmentBox}>
                            {m.attachments.map((a, idx) => (
                              <div key={idx}>
                                <a
                                  href={`${FILE_BASE}${a.url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  📎 {a.originalName || "Attachment"}
                                </a>
                                <span className="text-muted small ml-2">
                                  {a.size ? `${Math.round(a.size / 1024)} KB` : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={styles.meta}>
                          <span style={styles.name}>{isUser ? "You" : "Admin"}</span>
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

              {err && <div className="alert alert-danger mt-3">{err}</div>}

              {/* ✅ Selected files preview */}
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

              {/* ✅ Sending box + upload */}
              <form onSubmit={sendMessage} style={styles.inputWrap}>
                <input
                  style={styles.input}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Write a message..."
                  // required removed because files-only is allowed
                />

                <label className="btn btn-outline-secondary mb-0" style={{ borderRadius: 999 }}>
                  📎 Attach
                  <input
                    type="file"
                    multiple
                    onChange={onPickFiles}
                    style={{ display: "none" }}
                  />
                </label>

                <button className="btn btn-primary" style={styles.sendBtn} disabled={sending}>
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>

              <small className="form-text text-muted mt-2">
                You can send a message with files, or files only.
              </small>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-3">
          <div className="card card-soft">
            <div className="card-body">
              <h6 className="text-muted">Ticket Info</h6>
              <div className="mt-2">
                <span className="text-muted">Created:</span>{" "}
                {new Date(ticket.createdAt).toLocaleString()}
              </div>
              <div className="mt-2">
                <span className="text-muted">Updated:</span>{" "}
                {new Date(ticket.updatedAt).toLocaleString()}
              </div>
              <div className="mt-2">
                <span className="text-muted">Contact:</span> {ticket.contactEmail}
                {ticket.contactPhone ? ` • ${ticket.contactPhone}` : ""}
              </div>

              {ticket.resolutionSummary && (
                <>
                  <hr />
                  <h6 className="text-muted">Resolution</h6>
                  <div className="text-muted" style={{ whiteSpace: "pre-line" }}>
                    {ticket.resolutionSummary}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
