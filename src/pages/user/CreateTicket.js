import React, { useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../components/AuthContext";  // ← import this

const categories = ["Bug/Error", "Feature Request", "Account/Access", "Payment/Billing", "Other"];
const priorities = ["Low", "Medium", "High", "Urgent"];

// Configurable limits
const MAX_FILES = 6;
const MAX_SIZE_MB = 15;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "text/plain", "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function CreateTicket() {
  const { user } = useContext(AuthContext);  // ← get logged-in user
  const history = useHistory();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState("Medium");
  const [contactEmail, setContactEmail] = useState(""); // will be set from user
  const [contactPhone, setContactPhone] = useState("");
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  // Pre-fill email when component mounts (and user is available)
  useEffect(() => {
    if (user?.email) {
      setContactEmail(user.email);
    }
  }, [user]);

  const validateForm = () => {
    if (!title.trim()) return "Title is required";
    if (title.length > 120) return "Title is too long (max 120 characters)";
    if (!description.trim()) return "Description is required";
    if (!contactEmail.trim()) return "Contact email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return "Invalid email format";
    }
    if (files.length > MAX_FILES) return `Maximum ${MAX_FILES} files allowed`;
    for (const file of files) {
      if (file.size > MAX_SIZE_BYTES) {
        return `File "${file.name}" exceeds ${MAX_SIZE_MB}MB limit`;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return `File "${file.name}" type not allowed`;
      }
    }
    return "";
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    setErr("");

    setFiles((prevFiles) => {
      const combined = [...prevFiles, ...newFiles];
      if (combined.length > MAX_FILES) {
        setErr(`Only first ${MAX_FILES} files kept (limit reached)`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });

    e.target.value = ""; // reset input
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
    setInputKey((prev) => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const validationMsg = validateForm();
    if (validationMsg) {
      setErr(validationMsg);
      return;
    }

    setBusy(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("contactEmail", contactEmail.trim());
      if (contactPhone.trim()) formData.append("contactPhone", contactPhone.trim());

      files.forEach((file) => {
        formData.append("attachments", file);
      });

      const { data } = await api.post("/tickets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      history.push(`/user/tickets/${data._id}`);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to create ticket. Please try again.";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-start align-items-md-center mb-3 flex-column flex-md-row">
        <div>
          <h2 className="mb-1">Create New Ticket</h2>
          <p className="text-muted mb-0">Describe your issue — we'll get back to you soon.</p>
        </div>
      </div>

      <div className="card card-soft shadow-soft">
        <div className="card-body p-4">
          {err && <div className="alert alert-danger">{err}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="title">Title <span className="text-danger">*</span></label>
              <input
                id="title"
                className="form-control form-control-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={120}
                placeholder="E.g., Unable to login after password reset"
              />
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  className="form-control form-control-lg"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group col-md-6">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  className="form-control form-control-lg"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description <span className="text-danger">*</span></label>
              <textarea
                id="description"
                className="form-control form-control-lg"
                rows={7}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Please include steps to reproduce, what you expected vs what happened..."
              />
              <small className="form-text text-muted">
                Tip: Add steps + screenshots for faster resolution
              </small>
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="contactEmail">Contact Email <span className="text-danger">*</span></label>
                <input
                  id="contactEmail"
                  type="email"
                  className="form-control form-control-lg"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  placeholder={user?.email || "you@example.com"}
                />
              </div>

              <div className="form-group col-md-6">
                <label htmlFor="contactPhone">Contact Phone (optional)</label>
                <input
                  id="contactPhone"
                  className="form-control form-control-lg"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Attachments (max {MAX_FILES} files, {MAX_SIZE_MB}MB each)</label>

              <div className="input-group">
                <div className="custom-file">
                  <input
                    key={inputKey}
                    type="file"
                    className="custom-file-input"
                    id="attachments"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.csv,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <label className="custom-file-label" htmlFor="attachments">
                    {files.length === 0
                      ? "Choose files..."
                      : `${files.length} file${files.length > 1 ? "s" : ""} selected`}
                  </label>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="small">Selected files ({files.length}/{MAX_FILES})</strong>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={clearFiles}
                    >
                      Clear all
                    </button>
                  </div>

                  <ul className="list-group list-group-flush small">
                    {files.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="list-group-item d-flex justify-content-between align-items-center px-0 py-2"
                      >
                        <div className="text-truncate pr-3" style={{ maxWidth: "80%" }}>
                          <strong>{file.name}</strong>
                          <span className="text-muted ml-2">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <small className="form-text text-muted mt-2">
                Allowed: JPG, PNG, GIF, WebP, PDF, TXT, CSV, DOC, DOCX
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg mt-3"
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2" role="status" />
                  Submitting...
                </>
              ) : (
                "Create Ticket"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}