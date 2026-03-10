import React from "react";

export default function Footer() {
  return (
    <footer className="app-footer mt-5">
      <div className="container py-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div className="small text-muted">© {new Date().getFullYear()} TicketSphere • Support made simple</div>
        <div className="small text-muted mt-2 mt-md-0">
          Built with MERN • Light Blue & Gray Theme
        </div>
      </div>
    </footer>
  );
}
