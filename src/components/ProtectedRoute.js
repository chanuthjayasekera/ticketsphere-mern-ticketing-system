import React, { useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function ProtectedRoute({ component: Component, role, ...rest }) {
  const { user } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!user) return <Redirect to="/" />;
        if (role && user.role !== role) return <Redirect to="/" />;
        return <Component {...props} />;
      }}
    />
  );
}
