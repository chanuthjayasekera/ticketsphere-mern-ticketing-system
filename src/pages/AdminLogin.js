import React, { useContext, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../components/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { login } = useContext(AuthContext);
  const history = useHistory();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/auth/admin/login", { email, password });
      login(data);
      history.push("/admin/dashboard");
    } catch (e2) {
      setErr((e2.response && e2.response.data && e2.response.data.message) || "Login failed");
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5">
          <div className="card card-soft shadow-soft">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <img src="/logo.svg" alt="logo" className="logo-sm mr-2" />
                <h4 className="mb-0">Admin Login</h4>
              </div>

              {err && <div className="alert alert-danger">{err}</div>}

              <form onSubmit={onSubmit}>
                <div className="form-group">
                  <label>Admin Email</label>
                  <input className="form-control form-control-lg" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input className="form-control form-control-lg" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <button className="btn btn-primary btn-lg btn-block">Login</button>
              </form>

              <div className="text-center mt-3 text-muted">
                First admin? <Link to="/admin/register">Create admin</Link>
              </div>

              <div className="text-center mt-2 small text-muted">
                User? <Link to="/user/login">Go to User Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
