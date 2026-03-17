import React, { useState, useEffect } from 'react';
import MarketApi from '../../services/marketApi';
import './Admin.css';

const AdminOrderManager = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await MarketApi.getAllOrders();
            // Filter out empty/sparse orders (backend legacy / payment init records)
            const validOrders = (res.data || []).filter(o =>
                (o.orderItems && o.orderItems.length > 0) || (o.items && o.items.length > 0)
            );
            setOrders(validOrders);
        } catch (e) {
            console.error(e);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await MarketApi.updateOrderStatus(id, newStatus);
            loadOrders(); // Refresh
        } catch (e) {
            alert("Update failed");
        }
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Admin Order Management</h1>
            </header>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>User</th>
                            <th>Total</th>
                            <th>Payment Type</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id}>
                                <td>#{o.id}</td>
                                <td>{o.userName || o.userId}</td>
                                <td>₹{o.totalAmount}</td>
                                <td>
                                    <span style={{
                                        border: '1px solid #ccc', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem',
                                        background: o.paymentMethod === 'COD' ? '#fff3cd' : '#d1ecf1',
                                        color: o.paymentMethod === 'COD' ? '#856404' : '#0c5460'
                                    }}>
                                        {o.paymentMethod || 'Online'}
                                    </span>
                                </td>
                                <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                                <td>
                                    <span style={{
                                        padding: '0.2rem 0.8rem',
                                        borderRadius: '20px',
                                        background: o.status === 'DELIVERED' ? '#d4edda' : '#e2e3e5',
                                        color: o.status === 'DELIVERED' ? '#155724' : '#383d41',
                                        fontWeight: 600,
                                        fontSize: '0.8rem'
                                    }}>
                                        {o.status}
                                    </span>
                                </td>
                                <td>
                                    <select
                                        value={o.status}
                                        onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                                        style={{ padding: '0.4rem', borderRadius: '4px', borderColor: '#ccc' }}
                                    >
                                        <option value="PLACED">PLACED</option>
                                        <option value="PACKED">PACKED</option>
                                        <option value="SHIPPED">SHIPPED</option>
                                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                        <option value="DELIVERED">DELIVERED</option>
                                        <option value="RETURNED">RETURNED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrderManager;
