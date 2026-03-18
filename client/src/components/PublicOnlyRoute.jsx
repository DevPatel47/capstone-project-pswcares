import { Navigate, Outlet } from "react-router-dom";
import {
  getAuthSession,
  getDashboardPathByRole,
} from "../services/authStorage";

const PublicOnlyRoute = () => {
  const session = getAuthSession();

  if (session?.token && session?.user) {
    return <Navigate to={getDashboardPathByRole(session.user.role)} replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;
