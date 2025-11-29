// api.js
import axios from 'axios'
import LsService from './localstorage';

export const baseURL = 'https://melon.invtechnologies.in/'
// export const baseURL = 'http://192.168.0.104:1538/'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', },
})

api.interceptors.request.use((config) => {
  const user = LsService.getCurrentUser(); // or from somewhere else
  if (user?.token) {
    // Make sure headers exists
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
},
  (error) => Promise.reject(error)
);

// login API
export const login = (data) =>
  api.post('auth/login', data);

// dashboard stats
export const getDashboardStats = (branch_id) =>
  api.get(`/user/dashboard-stats/${branch_id}`);

// users Apis
export const getAllUsers = (params) =>
  api.get('user/fetch-users', { params });

export const createUser = (data) =>
  api.post('user/create-user', data); // adjust endpoint to yours

export const updateUser = (userId, data) =>
  api.put(`user/update-user/${userId}`, data); // used for status

export const updateUserPassword = (userId, newPassword) =>
  api.patch(`user/update-password/${userId}`, {
    password: newPassword, // or `new_password` if backend expects that
  });

// ---- BRANCHES ----
// was getAllStores before – now branches
export const getAllBranches = (params) =>
  api.get('branch/fetch-branches', { params });

export const updateBranches = (brand_id, data) =>
  api.put(`/branch/update-branch/${brand_id}`, data)

// brand management APIs
export const createBrand = (data) =>
  api.post('brand/create-brand', data)

export const getAllBrands = (params) =>
  api.get('brand/fetch-brands', { params })

export const updateBrand = (brand_id, data) =>
  api.put(`brand/update-brand/${brand_id}`, data)

// product management APIs
export const createProduct = (data) =>
  api.post('/product/create-product', data)

export const fetchBySearchInventory = (branchId, searchTerm) =>
  api.get(`product/inventry-search-product/${branchId}`, {
    params: { search: searchTerm },
  });

export const getAllProducts = (branch_id, params) =>
  api.get(`/product/fetch-products/${branch_id}`, { params })

export const updateProduct = (prid, data) =>
  api.put(`product/update-product/${prid}`, data)

// billing management APIs
export const fetchBySearchMainProducts = (branchId, searchTerm) =>
  api.get(`product/search-product/${branchId}`, {
    params: { search: searchTerm },
  });

export const billOrder = (payload) => {
  return api.post('orders/place-order', payload);
}

export const fetchByOrderID = (id) =>
  api.get(`orders/fetch-order-byid/${id}`);

export const getAllOrders = (params) =>
  api.get("orders/fetch-orders", { params });

// customer management APIs
export const getAllCustomers = (params) =>
  api.get('customers/fetch-customers', { params });

export const fetchBySearchPhone = (phone) =>
  api.get(`customer/search-customer`, { params: { search: phone } });

export const fetchCustomerOrdersByPhone = (phone, params) =>
  api.get(`orders/fetch-customer-orders/${phone}`, { params });

// combos management APIs
export const addCombo = (data) =>
  api.post('combo/create-combo', data)

export const getCombosByBranch = (branch_id) =>
  api.get(`combo/fetch-combos/${branch_id}`)







// fetch API's

export const getStoreDashboardStats = (storeid) =>
  api.get(`get_store_dashboard_statastics/${storeid}`)

// category management APIs
export const getAllCategories = () =>
  api.get('get_all_categories')

export const createCategory = (data) =>
  api.post('create_category', data)

export const updateCategory = (id, data) =>
  api.put(`update_category/${id}`, data)

// supplier management APIs
export const createSupplier = (data) =>
  api.post('create_supplier', data)

export const getAllSuppliers = () =>
  api.get('get_all_suppliers')

export const updateSupplier = (id, data) =>
  api.put(`update_supplier/${id}`, data)

// unit management APIs
export const createUnit = (data) =>
  api.post('create_unit', data)

export const getAllUnits = () =>
  api.get('get_all_units')

export const updateUnit = (id, data) =>
  api.put(`update_unit/${id}`, data)

// store management APIs
export const getAllStores = () =>
  api.get('get_all_stores')

export const createStore = (data) =>
  api.post('create_stores', data)

export const updateStore = (id, data) =>
  api.put(`update_store_by_id/${id}`, data)

// store products management APIs
export const createStoreProducts = (data) =>
  api.post('crete_store_products', data)

export const getStoreDetailsbyId = (storeid) =>
  api.get(`get_dummy_store_details/${storeid}`)

export const getStoreInvtryDetails = (storeid) =>
  api.get(`get_store_details/${storeid}`)

export const updateRemarks = (id, data) =>
  api.put(`update_checked/${id}`, data)

export const updateConfirm = (id, data) =>
  api.put(`update_confirmed/${id}`, data)

export const get_store_product_details = (search, store_id) =>
  api.get('get_store_product_details', { params: { search, store_id } })

// customer management APIs
export const get_customer_data = async (phone) => {
  return await api.get(`check_customer_purchasing_data/${phone}`);
};

export const getStoreUsers = (storeid) =>
  api.get(`get_store_users/${storeid}`)

export const getLastOrder = (payload) =>
  api.post("get_last_order", payload)

// export const getAllEmployeePaymentData = () =>
//   api.get('get_all_employee_payment_data')

export default api;