import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FeedPage from "./pages/FeedPage";
import VerificationDashboardPage from "./pages/VerificationDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import SearchResultsPage from "./pages/SeachResultsPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <RoleProtectedRoute
                allowedRoles={["super_admin", "municipal_admin", "barangay_admin"]}
              >
                <AdminDashboardPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/verification"
            element={
              <RoleProtectedRoute
                allowedRoles={["barangay_admin", "municipal_admin", "super_admin"]}
              >
                <VerificationDashboardPage />
              </RoleProtectedRoute>
            }
          />

          <Route path="*" element={<h2>404 - Page not found</h2>} />
        </Routes>
      </main>
    </div>
  );
}