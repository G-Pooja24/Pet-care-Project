import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import MarketApi from '../../services/marketApi';
import './Checkout.css'; // New modern styles

const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useContext(AuthContext);
    const [address, setAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: '' });
    const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // 'ONLINE' or 'COD'
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // TOGGLE THIS: Set to true only when you have valid Razorpay keys
    const USE_RAZORPAY = true;

    const handlePayment = async () => {
        if (!address.street || !address.city || !address.zipCode || !address.country) {
            alert("Please fill in shipping address including Country and Zip Code");
            return;
        }

        setLoading(true);

        if (paymentMethod === 'COD') {
            await completeOrder(true);
            return;
        }

        setLoading(true);

        if (USE_RAZORPAY) {
            // --- REAL RAZORPAY FLOW ---
            await handleRazorpayPayment();
        } else {
            // --- MOCK FLOW (For Development) ---
            await handleMockPayment();
        }
    };

    const handleRazorpayPayment = async () => {
        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
        }

        try {
            // 1. Create Order on Backend (Backend now saves items immediately)
            const orderData = {
                shippingAddress: address,
                paymentMethod: 'ONLINE',
                totalAmount: cartTotal,
                userName: user?.name || user?.username || "Guest",
                orderItems: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            const response = await MarketApi.createPaymentOrder(orderData);
            const { razorpayOrderId, amount: orderAmount, currency } = response.data;

            // 2. Initialize Razorpay
            const options = {
                key: "rzp_test_RzoxkAjJBMXQhI",
                amount: orderAmount * 100, // Amount is in paise
                currency: currency || "INR",
                name: "Pawfect Care",
                description: "Test Transaction",
                order_id: razorpayOrderId,
                handler: async function (response) {
                    await verifyPayment(response, orderData);
                },
                theme: { color: "#3399cc" }
            };
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
            setLoading(false);
        } catch (err) {
            console.error("Razorpay Error:", err);
            alert("Failed to initiate Razorpay payment.");
            setLoading(false);
        }
    };

    const verifyPayment = async (response, originalOrderData) => {
        const data = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            ...originalOrderData
        };
        try {
            const verifyRes = await MarketApi.verifyPayment(data);
            if (verifyRes.data.status === 'SUCCESS') {
                // SUCCESS: Backend has handled everything (Saving items, Updating status)
                clearCart();
                alert("Payment Successful!");
                navigate('/orders');
            } else {
                alert("Payment Verification Failed");
            }
        } catch (error) {
            console.error(error);
            alert("Payment verification failed on server.");
        }
    };

    const handleMockPayment = async () => {
        try {
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In Mock mode, we just create the order directly
            // You might want to pass a proper address object here if MarketApi.createOrder expects it
            await completeOrder();
        } catch (err) {
            console.error("Mock Payment Error:", err);
            alert("Mock payment failed.");
            setLoading(false);
        }
    };

    const completeOrder = async (isCod = false) => {
        try {
            // Ensure address is saved/linked to order
            const orderData = {
                shippingAddress: address,
                paymentMethod: isCod ? 'COD' : 'ONLINE',
                userName: user?.name || user?.username || "Guest",
                orderItems: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };
            // Log payload for debugging
            console.log("Creating Order with payload:", orderData);

            // Force status to PLACED for Online payments (as they are verified)
            if (!isCod) {
                orderData.status = 'PLACED';
                orderData.orderStatus = 'PLACED';
            }

            const res = await MarketApi.createOrder(orderData);

            // Double-check: Explicitly update status if backend ignored the payload field
            if (!isCod && res.data && res.data.id) {
                try {
                    await MarketApi.updateOrderStatus(res.data.id, 'PLACED');
                } catch (ignore) { /* Ignore if fails, payload might have worked */ }
            }

            clearCart();
            alert("Payment Successful!");
            navigate('/orders');
        } catch (err) {
            console.error("Error finalizing order:", err);
            alert("Payment worked, but order creation failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <h1>Secure Checkout</h1>
            </div>

            <div className="checkout-grid">
                {/* Shipping Form */}
                <div className="form-section">
                    <h3 className="section-title">Shipping Address</h3>

                    <div className="form-group">
                        <label>Street Address</label>
                        <input
                            className="form-control"
                            value={address.street}
                            onChange={e => setAddress({ ...address, street: e.target.value })}
                            placeholder="e.g. 123 Pet Lane"
                        />
                    </div>

                    <div className="form-group">
                        <label>City</label>
                        <input
                            className="form-control"
                            value={address.city}
                            onChange={e => setAddress({ ...address, city: e.target.value })}
                            placeholder="e.g. Mumbai"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>State</label>
                            <input
                                className="form-control"
                                value={address.state}
                                onChange={e => setAddress({ ...address, state: e.target.value })}
                                placeholder="State"
                            />
                        </div>
                        <div className="form-group">
                            <label>ZIP Code</label>
                            <input
                                className="form-control"
                                value={address.zipCode}
                                onChange={e => setAddress({ ...address, zipCode: e.target.value })}
                                placeholder="ZIP Code"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Country</label>
                        <input
                            className="form-control"
                            value={address.country}
                            onChange={e => setAddress({ ...address, country: e.target.value })}
                            placeholder="e.g. India"
                        />
                    </div>
                </div>

                {/* Payment Section */}
                <div className="order-summary-card">
                    <h3 className="section-title">Order Total</h3>
                    <div className="price-total">
                        <span className="price-currency">₹</span>
                        {cartTotal}
                    </div>

                    <ul className="item-list">
                        {cartItems.map(i => (
                            <li key={i.id}>
                                <span>{i.title} <span style={{ fontSize: '0.85em', opacity: 0.8 }}>x {i.quantity}</span></span>
                                <span>₹{i.price * i.quantity}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="payment-methods" style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '0.8rem', fontSize: '1rem' }}>Payment Method</h4>
                        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                            <label className={`payment-option ${paymentMethod === 'ONLINE' ? 'selected' : ''}`}
                                style={{
                                    padding: '1rem', border: `1px solid ${paymentMethod === 'ONLINE' ? '#007bff' : '#ddd'}`,
                                    borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: paymentMethod === 'ONLINE' ? '#f0f7ff' : 'white'
                                }}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="ONLINE"
                                    checked={paymentMethod === 'ONLINE'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span>Pay Online (Cards, UPI, NetBanking)</span>
                            </label>

                            <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
                                style={{
                                    padding: '1rem', border: `1px solid ${paymentMethod === 'COD' ? '#007bff' : '#ddd'}`,
                                    borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: paymentMethod === 'COD' ? '#f0f7ff' : 'white'
                                }}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span>Cash on Delivery</span>
                            </label>
                        </div>
                    </div>

                    <button
                        className="btn-pay"
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay Now')}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666', fontSize: '0.8rem' }}>
                        {USE_RAZORPAY ? 'Secured by Razorpay' : 'Development Mode'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
