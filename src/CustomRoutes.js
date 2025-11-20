import { Navigate, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import SuperAdminDashboard from "./layouts/superAdminPanel/SuperAdminDashboard";
// import WarehouseAdminDashboard from "./layouts/warehousePanel/WarehouseAdminDashboard";
import StoreAdminDashboard from "./layouts/storePanel/storeAdminPanel/StoreAdminDashboard";
import CategoriesPage from "./layouts/superAdminPanel/CategoriesPage";
// import PaymentsReceived from "./layouts/superAdminPanel/EmployeePayments";
import SuppliersPage from "./layouts/superAdminPanel/SuppliersPage";
import BrandsPage from "./layouts/superAdminPanel/BrandsPage";
import UnitsPage from "./layouts/superAdminPanel/UnitsPage";
import StoresPage from "./layouts/superAdminPanel/StoresPage";
import UsersManagement from "./layouts/superAdminPanel/UsersManagement";
import ProductsPage from "./layouts/superAdminPanel/ProductsPage";
import CreateMainProducts from "./layouts/superAdminPanel/CreateMainProducts";
import AddStoreProducts from "./layouts/superAdminPanel/storeProducts/AddStoreProducts";
import StorePendings from "./layouts/superAdminPanel/storeProducts/StorePendings";
import InventoryByStore from "./layouts/superAdminPanel/storeProducts/InventoryByStore";
import ConfirmStoreInventory from "./layouts/superAdminPanel/storeProducts/ConfirmStoreInventory";
import StoreRecivedProducts from "./layouts/storePanel/storeAdminPanel/StoreRecivedProducts";
import StoreInventory from "./layouts/storePanel/storeAdminPanel/StoreInventory";
import AddComboProducts from "./layouts/storePanel/storeAdminPanel/combos/AddComboProducts";
import Page404 from "./components/Page404";
import ProtectedRoute from "./components/ProtectedRoute";
import CashierDashboard from "./layouts/storePanel/casherPanel/CashierDashboard";
import Billings from "./layouts/superAdminPanel/adminBillingTables/Billings";
import StoreBillings from "./layouts/storePanel/storeAdminPanel/StoreBillings";
import CashierBillings from "./layouts/storePanel/casherPanel/CashierBillings";
import DisplayCombos from "./layouts/storePanel/storeAdminPanel/combos/DisplayCombos";

const CustomeRoutes = () => {
  return (
    <Routes>
      {/* home */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/404" element={<Page404 />} />

      <Route element={<ProtectedRoute loggedinUserRole="admin" />}>
        <Route path="/super-admin" element={<SuperAdminDashboard />} />

        <Route path="/billings" element={<Billings />} />
        <Route path="/users_management" element={<UsersManagement />} />

        {/* <Route path="/stores" element={<StoresPage />} /> */}

        <Route path="/products" element={<ProductsPage />} />
        <Route path="/add-to-main" element={<CreateMainProducts />} />

        <Route path="/categories" element={<CategoriesPage />} />
        {/* <Route path="/suppliers" element={<SuppliersPage />} /> */}
        <Route path="/brands" element={<BrandsPage />} />
        {/* <Route path="/units" element={<UnitsPage />} /> */}
        <Route path="/add-store-combos" element={<AddComboProducts />} />
        <Route path="/display-combos" element={<DisplayCombos />} />

        {/* <Route path="/add-store-products" element={<AddStoreProducts />} /> */}
        {/* <Route path="/store-pendings" element={<StorePendings />} /> */}
        {/* <Route path="/confirm-store-inventory" element={<ConfirmStoreInventory />} /> */}
        {/* <Route path="/inventory-by-store" element={<InventoryByStore />} /> */}

        {/* <Route path="/employee-payments" element={<PaymentsReceived />} /> */}
      </Route>

      {/* <Route path="/warehouse-admin" element={<WarehouseAdminDashboard />} /> */}

      {/* <Route element={<ProtectedRoute loggedinUserRole="store" />}>
        <Route path="/store-manager" element={<StoreAdminDashboard />} />
        <Route path="/store-recived-products" element={<StoreRecivedProducts />} />
        <Route path="/store-inventory" element={<StoreInventory />} />
        <Route path="/store-billings" element={<StoreBillings />} />
      </Route> */}

      <Route element={<ProtectedRoute loggedinUserRole="cashier" />}>
        <Route path="/cashier-panel" element={<CashierDashboard />} />
        <Route path="/cashier-billing-history" element={<CashierBillings />} />
      </Route>

      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

export default CustomeRoutes;
