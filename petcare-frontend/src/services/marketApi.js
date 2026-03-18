import api from '../api/axios';

const MarketApi = {
    // Products
    getAllProducts: (filters = {}) => api.get('/products', { params: filters }),
    getProductById: (id) => api.get(`/products/${id}`),
    createProduct: (data) => api.post('/products', data),
    updateProduct: (id, data) => api.put(`/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/products/${id}`),

    // Cart (Optional: if syncing with backend)
    // syncCart: (cartItems) => api.post('/cart/sync', { items: cartItems }),

    // Orders
    // Orders
    createOrder: (orderData) => api.post('/orders/checkout', orderData),
    getUserOrders: () => api.get('/orders/my-orders'),
    getAllOrders: () => api.get('/orders/admin/all'), // Admin only
    updateOrderStatus: (orderId, status) => api.put(`/orders/${orderId}/status`, null, { params: { status } }),
    getOrderById: (id) => api.get(`/orders/${id}`),

    // Payment
    createPaymentOrder: (orderData) => api.post('/payment/create-order', orderData),
    verifyPayment: (data) => api.post('/payment/verify', data),

    // Helper
    getImageUrl: (filename) => {
        if (!filename) return "https://via.placeholder.com/200?text=No+Image";
        if (filename.startsWith("http")) return filename;
        return `http://localhost:9090/uploads/${filename}`;
    }
};

export default MarketApi;
