import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/auth_context.jsx";
import ProtectedRoute from "./components/protected_route.jsx";
import LoadingSpinner from "./components/loading_spinner.jsx";

import LoginPage from "./pages/login_page.jsx";
import StaffRecordWastePage from "./pages/staff_record_waste_page.jsx";
import StaffMyEntriesPage from "./pages/staff_my_entries_page.jsx";
import ManagerDashboardPage from "./pages/manager_dashboard_page.jsx";
import ManagerAllEntriesPage from "./pages/manager_all_entries_page.jsx";
import ManagerItemPricesPage from "./pages/manager_item_prices_page.jsx";
import AdminUsersPage from "./pages/admin_users_page.jsx";
import AdminCategoriesPage from "./pages/admin_categories_page.jsx";
import AdminWasteReasonsPage from "./pages/admin_waste_reasons_page.jsx";
import AdminBranchesPage from "./pages/admin_branches_page.jsx";
import NotFoundPage from "./pages/not_found_page.jsx";

// sends a logged in user to the first page that makes sense for their role
function HomeRedirect() {
  const { current_user, is_loading } = useAuth();

  if (is_loading) return <LoadingSpinner />;
  if (!current_user) return <Navigate to="/login" replace />;
  if (current_user.role === "staff") return <Navigate to="/record-waste" replace />;
  return <Navigate to="/dashboard" replace />;
}

// declares every page in the app and which roles are allowed to see it
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route
        path="/record-waste"
        element={
          <ProtectedRoute allowed_roles={["staff"]}>
            <StaffRecordWastePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-entries"
        element={
          <ProtectedRoute allowed_roles={["staff"]}>
            <StaffMyEntriesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowed_roles={["manager", "admin"]}>
            <ManagerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/all-entries"
        element={
          <ProtectedRoute allowed_roles={["manager", "admin"]}>
            <ManagerAllEntriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/item-prices"
        element={
          <ProtectedRoute allowed_roles={["manager", "admin"]}>
            <ManagerItemPricesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowed_roles={["admin"]}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowed_roles={["admin"]}>
            <AdminCategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/waste-reasons"
        element={
          <ProtectedRoute allowed_roles={["admin"]}>
            <AdminWasteReasonsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/branches"
        element={
          <ProtectedRoute allowed_roles={["admin"]}>
            <AdminBranchesPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
