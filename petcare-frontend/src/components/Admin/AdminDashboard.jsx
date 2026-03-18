import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketApi from '../../services/marketApi';
import './Admin.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch Products
            const productsRes = await MarketApi.getAllProducts();
            const products = productsRes.data || [];

            // Fetch Orders
            const ordersRes = await MarketApi.getAllOrders();
            const orders = ordersRes.data || [];

            // Calculate Stats
            const totalProducts = products.length;
            const totalOrders = orders.length;

            // Calculate Revenue
            const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

            // Calculate Pending Orders
            const pendingOrders = orders.filter(o =>
                !['DELIVERED', 'RETURNED', 'CANCELLED'].includes(o.status)
            ).length;

            setStats({
                totalProducts,
                totalOrders,
                totalRevenue,
                pendingOrders
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading dashboard data...</div>
            ) : (
                <div className="stats-grid">
                    <div className="stat-card" onClick={() => navigate('/admin/products')} style={{ cursor: 'pointer' }}>
                        <div className="stat-icon products">📦</div>
                        <div className="stat-info">
                            <h3>{stats.totalProducts}</h3>
                            <p>Total Products</p>
                        </div>
                    </div>

                    <div className="stat-card" onClick={() => navigate('/admin/orders')} style={{ cursor: 'pointer' }}>
                        <div className="stat-icon orders">🚚</div>
                        <div className="stat-info">
                            <h3>{stats.totalOrders}</h3>
                            <p>Total Orders</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon revenue">💰</div>
                        <div className="stat-info">
                            <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>

                    <div className="stat-card" onClick={() => navigate('/admin/orders')} style={{ cursor: 'pointer' }}>
                        <div className="stat-icon users">⏳</div>
                        <div className="stat-info">
                            <h3>{stats.pendingOrders}</h3>
                            <p>Pending Orders</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-card">
                <div className="card-title">🚀 Quick Actions</div>
                <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                    <button className="btn-primary" onClick={() => navigate('/admin/products')}>
                        Manage Products
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/admin/orders')}>
                        Manage Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
