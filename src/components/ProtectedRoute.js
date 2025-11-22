import { Navigate, Outlet, useLocation } from "react-router-dom";
import LsService, { storageKey } from "../services/localstorage";

const roleDefaultPaths = {
  super_admin: "/super_admin",
  admin: "/admin_panel",
  cashier: "/cashier_billing_panel",
};

const ProtectedRoute = ({ loggedinUserRole }) => {
  const userLoginStatus = LsService.getItem(storageKey);

  // CASE 1: Not logged in at all
  if (!userLoginStatus) {
    return <Navigate to="/login" replace />;
  }

  const userRole = userLoginStatus.role;

  // CASE 2: Logged in but role mismatch
  if (userRole !== loggedinUserRole) {
    // Option A → Show 404
    // return <Navigate to="/404" replace />;

    // Option B → Redirect to their own dashboard
    return <Navigate to={roleDefaultPaths[userRole] || "/"} replace />;
  }

  // CASE 3: Logged in with correct role
  return <Outlet />;
};

export default ProtectedRoute;
