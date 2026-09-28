import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth_context.jsx";
import LoadingSpinner from "./loading_spinner.jsx";
import AppLayout from "./app_layout.jsx";

// wraps a page so only logged in users with an allowed role can see it, and gives it the sidebar shell
export default function ProtectedRoute({ children, allowed_roles }) {
  const { current_user, is_loading } = useAuth();

  if (is_loading) {
    return <LoadingSpinner />;
  }

  if (!current_user) {
    return <Navigate to="/login" replace />;
  }

  if (allowed_roles && !allowed_roles.includes(current_user.role)) {
    return <Navigate to="/" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}
