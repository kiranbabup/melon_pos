import { Navigate, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import SuperAdminDashboard from "./layouts/superAdminPanel/SuperAdminDashboard";
import BrandsPage from "./layouts/adminPanel/BrandsPage";
import CreateMainProducts from "./layouts/adminPanel/CreateMainProducts";
import Page404 from "./components/Page404";
import ProtectedRoute from "./components/ProtectedRoute";
import CashierBillings from "./layouts/casherPanel/CashierBillings";
import AdminPanelDashboard from "./layouts/adminPanel/AdminPanelDashboard";
import ManageClientsPage from "./layouts/superAdminPanel/ManageClientsPage";
import ManageBranchesPage from "./layouts/superAdminPanel/ManageBranches";
import ManageInventoryPage from "./layouts/adminPanel/ManageInventory";
import CashierBillGenarationPage from "./layouts/casherPanel/CashierBillGenarationPage";
import ManageCustomers from "./layouts/adminPanel/ManageCustomers";
import AdminBillingPage from "./layouts/adminPanel/AdminBillingPage";
import CreateComboPage from "./layouts/adminPanel/CreateComboPage";
import DisplayCombosTable from "./layouts/adminPanel/DisplayCombosTable";

const CustomeRoutes = () => {
  return (
    <Routes>
      {/* home */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/404" element={<Page404 />} />

      <Route element={<ProtectedRoute loggedinUserRole="super_admin" />}>
        <Route path="/super_admin" element={<SuperAdminDashboard />} />
        <Route path="/manage_clients" element={<ManageClientsPage />} />
        <Route path="/manage_branches" element={<ManageBranchesPage />} />
      </Route>
      
      <Route element={<ProtectedRoute loggedinUserRole="admin" />}>
        <Route path="/admin_panel" element={<AdminPanelDashboard />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/inventory" element={<ManageInventoryPage />} />
        <Route path="/add-to-main" element={<CreateMainProducts />} />

        <Route path="/branch-billings" element={<AdminBillingPage />} />
        <Route path="/manage_customers" element={<ManageCustomers />} />

        <Route path="/create-combos" element={<CreateComboPage />} />
        <Route path="/display-combos" element={<DisplayCombosTable />} />
      </Route>

      <Route element={<ProtectedRoute loggedinUserRole="cashier" />}>
        {/* <Route path="/cashier_panel" element={<CashierDashboard />} /> */}
        <Route path="/cashier_billing_panel" element={<CashierBillGenarationPage />} />
        <Route path="/cashier-billing-history" element={<CashierBillings />} />
      </Route>

      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

export default CustomeRoutes;
