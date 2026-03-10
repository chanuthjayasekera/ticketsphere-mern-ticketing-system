import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/theme.css";

import { AuthProvider } from "./components/AuthContext";
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";

import UserDashboard from "./pages/user/UserDashboard";
import TicketList from "./pages/user/TicketList";
import CreateTicket from "./pages/user/CreateTicket";
import TicketDetail from "./pages/user/TicketDetail";
import EditTicket from "./pages/user/EditTicket";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AllTickets from "./pages/admin/AllTickets";
import ManageTicket from "./pages/admin/ManageTicket";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <TopNav />

        <Switch>
          <Route path="/" exact component={Home} />

          <Route path="/user/login" exact component={UserLogin} />
          <Route path="/user/register" exact component={UserRegister} />

          <Route path="/admin/login" exact component={AdminLogin} />
          <Route path="/admin/register" exact component={AdminRegister} />

          {/* USER */}
          <ProtectedRoute path="/user/dashboard" exact role="user" component={UserDashboard} />
          <ProtectedRoute path="/user/tickets" exact role="user" component={TicketList} />
          <ProtectedRoute path="/user/tickets/new" exact role="user" component={CreateTicket} />
          <ProtectedRoute path="/user/tickets/:id" exact role="user" component={TicketDetail} />
          <ProtectedRoute path="/user/tickets/:id/edit" exact role="user" component={EditTicket} />

          {/* ADMIN */}
          <ProtectedRoute path="/admin/dashboard" exact role="admin" component={AdminDashboard} />
          <ProtectedRoute path="/admin/tickets" exact role="admin" component={AllTickets} />
          <ProtectedRoute path="/admin/tickets/:id" exact role="admin" component={ManageTicket} />

          <Route render={() => (
            <div className="container py-5">
              <div className="card card-soft">
                <div className="card-body">
                  <h4>404</h4>
                  <div className="text-muted">Page not found.</div>
                </div>
              </div>
            </div>
          )} />
        </Switch>

        <Footer />
      </Router>
    </AuthProvider>
  );
}
