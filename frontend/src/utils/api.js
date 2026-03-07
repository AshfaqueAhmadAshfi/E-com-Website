import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
});

// Auth
export const loginAPI = (data) => api.post('/auth/login', data);
export const registerAPI = (data) => api.post('/auth/register', data);
export const logoutAPI = () => api.post('/auth/logout');
export const getMeAPI = () => api.get('/auth/me');
export const updateProfileAPI = (data) => api.put('/auth/profile', data);
export const updatePasswordAPI = (data) => api.put('/auth/password', data);

// Products
export const getProductsAPI = (params) => api.get('/products', { params });
export const getProductAPI = (id) => api.get(`/products/${id}`);
export const getFeaturedAPI = () => api.get('/products/featured');
export const getTopRatedAPI = () => api.get('/products/top-rated');
export const createProductAPI = (fd) => api.post('/products', fd);
export const updateProductAPI = (id, fd) => api.put(`/products/${id}`, fd);
export const deleteProductAPI = (id) => api.delete(`/products/${id}`);
export const toggleProductAPI = (id) => api.put(`/products/${id}/toggle`);
export const addReviewAPI = (id, data) => api.post(`/products/${id}/reviews`, data);
export const updateReviewAPI = (pid, rid, data) => api.put(`/products/${pid}/reviews/${rid}`, data);
export const deleteReviewAPI = (pid, rid) => api.delete(`/products/${pid}/reviews/${rid}`);

// Categories
export const getCategoriesAPI = () => api.get('/categories');
export const getAllCategoriesAPI = () => api.get('/categories?all=true');
export const createCategoryAPI = (fd) => api.post('/categories', fd);
export const updateCategoryAPI = (id, fd) => api.put(`/categories/${id}`, fd);
export const deleteCategoryAPI = (id) => api.delete(`/categories/${id}`);
export const toggleCategoryAPI = (id) => api.put(`/categories/${id}/toggle`);

// Orders
export const createOrderAPI = (data) => api.post('/orders', data);
export const getMyOrdersAPI = () => api.get('/orders/my-orders');
export const getOrderAPI = (id) => api.get(`/orders/${id}`);
export const getAllOrdersAPI = (params) => api.get('/orders', { params });
export const updateOrderStatusAPI = (id, data) => api.put(`/orders/${id}/status`, data);
export const deleteOrderAPI = (id) => api.delete(`/orders/${id}`);
export const cancelOrderAPI = (id) => api.put(`/orders/${id}/cancel`);
export const submitPaymentInfoAPI = (id, data) => api.put(`/orders/${id}/payment-info`, data);

// Coupons
export const getCouponsAPI = () => api.get('/coupons');
export const createCouponAPI = (data) => api.post('/coupons', data);
export const updateCouponAPI = (id, data) => api.put(`/coupons/${id}`, data);
export const deleteCouponAPI = (id) => api.delete(`/coupons/${id}`);
export const validateCouponAPI = (data) => api.post('/coupons/validate', data);

// Admin
export const getAdminUsersAPI = (params) => api.get('/admin/users', { params });
export const toggleBlockUserAPI = (id) => api.put(`/admin/users/${id}/block`);
export const changeRoleAPI = (id, data) => api.put(`/admin/users/${id}/role`, data);
export const getDashboardAPI = (params) => api.get('/admin/dashboard', { params });
export const generateDescriptionAPI = (data) => api.post('/admin/generate-description', data);

export default api;
