import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicOnlyRoute from "../components/PublicOnlyRoute";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import ClientDashboardPage from "../pages/ClientDashboardPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import PSWDashboardPage from "../pages/PSWDashboardPage";
import PSWProfileDisplayPage from "../pages/PSWProfileDisplayPage";
import PSWProfileEditPage from "../pages/PSWProfileEditPage";
import RegisterPage from "../pages/RegisterPage";
import RoleSelectionPage from "../pages/RoleSelectionPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<RoleSelectionPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
        <Route path="/client/dashboard" element={<ClientDashboardPage />} />
        <Route
          path="/client/psw-profiles/:profileId"
          element={<PSWProfileDisplayPage />}
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["psw"]} />}>
        <Route path="/psw/dashboard" element={<PSWDashboardPage />} />
        <Route path="/psw/profile" element={<PSWProfileEditPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
