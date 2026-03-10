import React, { useContext, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../components/AuthContext";

export default function AdminRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [err, setErr] = useState("");
  const { login } = useContext(AuthContext);
  const history = useHistory();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/auth/admin/register", { name, email, password, adminCode });
      login(data);
      history.push("/admin/dashboard");
    } catch (e2) {
      setErr((e2.response && e2.response.data && e2.response.data.message) || "Register failed");
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card card-soft shadow-soft">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <img src="/logo.svg" alt="logo" className="logo-sm mr-2" />
                <h4 className="mb-0">Create Admin Account</h4>
              </div>

              <div className="alert alert-info">
                Admin signup requires <b>ADMIN_REGISTER_CODE</b> from server .env.
              </div>

              {err && <div className="alert alert-danger">{err}</div>}

              <form onSubmit={onSubmit}>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Name</label>
                    <input className="form-control form-control-lg" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Email</label>
                    <input className="form-control form-control-lg" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Password</label>
                    <input className="form-control form-control-lg" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <small className="form-text text-muted">At least 8 characters.</small>
                  </div>
                  <div className="form-group col-md-6">
                    <label>Admin Code</label>
                    <input className="form-control form-control-lg" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} required />
                  </div>
                </div>

                <button className="btn btn-primary btn-lg btn-block">Create admin</button>
              </form>

              <div className="text-center mt-3 text-muted">
                Already admin? <Link to="/admin/login">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
