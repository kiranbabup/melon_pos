// api.js
import axios from 'axios'
import LsService from './localstorage';

export const baseURL = 'https://melon.invtechnologies.in/'
// export const baseURL = 'http://192.168.0.108:1538/'

const refreshApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', },
})


/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    const user = LsService.getCurrentUser();
    if (user?.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  // (response) => { console.log("✅ API success:", response.config.url); return response; },
  async (error) => {
    // console.log("❌ API error:", error.config?.url, error.response?.status);
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/refresh-token");

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = LsService.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token");

      const res = await refreshApi.post(
        "auth/refresh",
        { refreshToken }
      );
      // console.log(res.data);
      
      const newAccessToken = res.data.accessToken;

      const user = LsService.getCurrentUser();
      user.accessToken = newAccessToken;
      LsService.setCurrentUser(user);

      api.defaults.headers.Authorization =
        `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      // console.log(err.response);
      
      // 🔥 logout ONLY if refresh token is invalid/expired
      if (err.response?.status === 500) {
        LsService.removeCurrentUser();
        window.location.href = "/login";
      }

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
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

export default api;