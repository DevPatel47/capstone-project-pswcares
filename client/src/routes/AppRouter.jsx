import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import PSWApprovedRoute from "../components/PSWApprovedRoute";
import PublicOnlyRoute from "../components/PublicOnlyRoute";
import Layout from "../components/layout/Layout";
import AboutPage from "../pages/AboutPage";
import AccessibilityPage from "../pages/AccessibilityPage";
import AdminContactsPage from "../pages/AdminContactsPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminDisputesPage from "../pages/AdminDisputesPage";
import AdminUsersPage from "../pages/AdminUsersPage";
import AdminVerifyPage from "../pages/AdminVerifyPage";
import BookingFlowPage from "../pages/BookingFlowPage";
import ChatPage from "../pages/ChatPage";
import ClientDashboardPage from "../pages/ClientDashboardPage";
import ClientDisputesPage from "../pages/ClientDisputesPage";
import ContactPage from "../pages/ContactPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import PaymentCancelPage from "../pages/PaymentCancelPage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage";
import PSWDashboardPage from "../pages/PSWDashboardPage";
import PSWProfileDisplayPage from "../pages/PSWProfileDisplayPage";
import PSWProfileEditPage from "../pages/PSWProfileEditPage";
import PSWSearchPage from "../pages/PSWSearchPage";
import RegisterPage from "../pages/RegisterPage";
import RoleSelectionPage from "../pages/RoleSelectionPage";
import TermsOfServicePage from "../pages/TermsOfServicePage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<Layout variant="public" />}>
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route
          path="/client/payment/success"
          element={<PaymentSuccessPage />}
        />
        <Route path="/client/payment/cancel" element={<PaymentCancelPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<PublicOnlyRoute />}>
        <Route element={<Layout variant="auth" />}>
          <Route path="/get-started" element={<RoleSelectionPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
        <Route element={<Layout variant="app" />}>
          <Route path="/client/dashboard" element={<ClientDashboardPage />} />
          <Route path="/client/booking" element={<BookingFlowPage />} />
          <Route path="/client/chat" element={<ChatPage />} />
          <Route path="/client/disputes" element={<ClientDisputesPage />} />
          <Route path="/client/psw-search" element={<PSWSearchPage />} />
          <Route
            path="/client/psw-profiles/:profileId"
            element={<PSWProfileDisplayPage />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["psw"]} />}>
        <Route element={<Layout variant="app" />}>
          <Route path="/psw/profile" element={<PSWProfileEditPage />} />
          <Route element={<PSWApprovedRoute />}>
            <Route path="/psw/dashboard" element={<PSWDashboardPage />} />
            <Route path="/psw/chat" element={<ChatPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<Layout variant="app" />}>
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/verify" element={<AdminVerifyPage />} />
          <Route path="/admin/disputes" element={<AdminDisputesPage />} />
          <Route path="/admin/contacts" element={<AdminContactsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;
