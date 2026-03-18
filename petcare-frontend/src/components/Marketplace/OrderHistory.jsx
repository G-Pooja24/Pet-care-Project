import React, { useState, useEffect } from 'react';
import MarketApi from '../../services/marketApi';
import './ProductList.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await MarketApi.getUserOrders();
                // Sort by ID descending (newest first) assuming sequential IDs, or Date if available
                const sortedOrders = res.data.sort((a, b) => {
                    // Try Date first, fallback to ID
                    const dateA = new Date(a.orderDate).getTime();
                    const dateB = new Date(b.orderDate).getTime();
                    if (dateA !== dateB) return dateB - dateA; // Descending Date
                    return b.id - a.id; // Fallback to Descending ID
                });
                // Filter out empty orders (removes duplicate 'Payment Init' records)
                const validOrders = sortedOrders.filter(order => {
                    const items = order.orderItems || order.items;
                    return items && items.length > 0;
                });
                setOrders(validOrders);
            } catch (err) {
                console.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return '#28a745';
            case 'SHIPPED': return '#007bff';
            case 'CANCELLED': return '#dc3545';
            default: return '#ffc107'; // PLACED, PACKED
        }
    };

    return (
        <div className="marketplace-container">
            <h1 style={{ marginBottom: '2rem' }}>My Orders</h1>
            {loading ? <div className="loading-spinner">Loading orders...</div> : (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {orders.length === 0 ? <p>No orders found.</p> : orders.map(order => (
                        <div key={order.id} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Order #{order.id}</div>
                                    <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                                        {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#444' }}>
                                        <span style={{ fontWeight: '500' }}>Payment:</span> {order.paymentMethod || 'Online'}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>₹{order.totalAmount}</div>
                                </div>
                            </div>

                            {/* Tracking Stepper */}
                            <div className="order-progress" style={{ margin: '2rem 0', position: 'relative', padding: '0 1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                                    {['PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((step, index) => {
                                        const statusOrder = ['PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                                        // Default to 'PLACED' if status is missing (fixes Online Order display issue)
                                        const currentStatus = order.status || 'PLACED';

                                        const currentStatusIndex = statusOrder.indexOf(currentStatus);
                                        const stepIndex = statusOrder.indexOf(step);
                                        const isCompleted = stepIndex <= currentStatusIndex;
                                        const isCurrent = stepIndex === currentStatusIndex;

                                        // Handle RETURNED or CANCELLED
                                        const isCancelled = order.status === 'CANCELLED';
                                        const isReturned = order.status === 'RETURNED';

                                        if (isCancelled || isReturned) {
                                            if (index === 0) return (
                                                <div key={step} style={{ textAlign: 'center', width: '20%' }}>
                                                    <div style={{
                                                        width: '30px', height: '30px', borderRadius: '50%',
                                                        background: '#dc3545', color: 'white',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                                                        fontWeight: 'bold'
                                                    }}>✕</div>
                                                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                                                        {isCancelled ? 'CANCELLED' : 'RETURNED'}
                                                    </div>
                                                </div>
                                            );
                                            return null;
                                        }

                                        return (
                                            <div key={step} style={{ textAlign: 'center', width: '20%', opacity: stepIndex > currentStatusIndex ? 0.5 : 1 }}>
                                                <div style={{
                                                    width: '30px', height: '30px', borderRadius: '50%',
                                                    background: isCompleted ? '#28a745' : '#e9ecef',
                                                    color: isCompleted ? 'white' : '#6c757d',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                                                    border: isCurrent ? '3px solid #c3e6cb' : 'none',
                                                    fontWeight: 'bold', fontSize: '0.9rem'
                                                }}>
                                                    {isCompleted ? '✓' : (index + 1)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: isCurrent ? 'bold' : 'normal', color: isCompleted ? '#28a745' : '#6c757d' }}>
                                                    {step.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Progress Bar Line */}
                                {!['CANCELLED', 'RETURNED'].includes(order.status) && (
                                    <div style={{
                                        position: 'absolute', top: '15px', left: '10%', right: '10%', height: '3px', background: '#e9ecef', zIndex: 0
                                    }}>
                                        <div style={{
                                            height: '100%', background: '#28a745',
                                            width: `${Math.max(0, ['PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].indexOf(order.status) * 25)}%`,
                                            transition: 'width 0.3s ease'
                                        }}></div>
                                    </div>
                                )}
                            </div>

                            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items</h4>
                                {(order.orderItems || order.items || []).map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '0.5rem', borderBottom: idx !== (order.orderItems || order.items || []).length - 1 ? '1px solid #eee' : 'none', paddingBottom: idx !== (order.orderItems || order.items || []).length - 1 ? '0.5rem' : '0' }}>
                                        <span style={{ color: '#333' }}>{item.product?.title || item.title || item.productName || item.product?.name || 'Product'} <span style={{ color: '#777' }}>x{item.quantity}</span></span>
                                        <span style={{ fontWeight: '500' }}>₹{(item.price || item.product?.price || 0) * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
