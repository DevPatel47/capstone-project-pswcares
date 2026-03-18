import { Navigate, Outlet } from "react-router-dom";
import { getAuthSession } from "../services/authStorage";

const ProtectedRoute = ({ allowedRoles }) => {
  const session = getAuthSession();

  if (!session?.token || !session?.user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
