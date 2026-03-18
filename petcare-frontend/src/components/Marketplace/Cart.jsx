import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import MarketApi from '../../services/marketApi';
import './ProductList.css'; // Global marketplace styles
import './Cart.css'; // Cart specific styles

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="marketplace-container">
                <div className="empty-cart-container">
                    <div className="empty-cart-icon">🛒</div>
                    <h2>Your Cart is Empty</h2>
                    <p style={{ color: '#666', marginTop: '1rem' }}>
                        Looks like you haven't added any items yet.
                    </p>
                    <button
                        onClick={() => navigate('/shop')}
                        className="btn-add-cart"
                        style={{ width: 'auto', padding: '0.8rem 2rem', marginTop: '2rem', marginInline: 'auto' }}
                    >
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="marketplace-container">
            <div className="marketplace-header">
                <h1>Shopping Cart ({cartItems.length} items)</h1>
            </div>

            <div className="cart-grid">
                {/* Cart Items List */}
                <div className="cart-items-container">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item">
                            <img
                                src={MarketApi.getImageUrl(item.imageUrl)}
                                alt={item.title}
                                className="cart-item-image"
                            />

                            <div className="cart-item-details">
                                <h3 className="cart-item-title">{item.title}</h3>
                                <p className="cart-item-price">Overview: {item.category} • ₹{item.price}</p>
                            </div>

                            <div className="quantity-controls">
                                <button
                                    className="qty-btn"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    aria-label="Decrease quantity"
                                >-</button>
                                <span className="qty-value">{item.quantity}</span>
                                <button
                                    className="qty-btn"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    aria-label="Increase quantity"
                                >+</button>
                            </div>

                            <div className="cart-item-total">
                                ₹{item.price * item.quantity}
                            </div>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="remove-btn"
                                title="Remove item"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="cart-summary">
                    <h3 className="summary-title">Order Summary</h3>

                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{cartTotal}</span>
                    </div>

                    <div className="summary-row">
                        <span>Shipping Estimate</span>
                        <span style={{ color: '#27ae60', fontWeight: 'bold' }}>Free</span>
                    </div>

                    <div className="summary-row total">
                        <span>Total</span>
                        <span>₹{cartTotal}</span>
                    </div>

                    <button
                        className="btn-checkout"
                        onClick={() => navigate('/checkout')}
                    >
                        Proceed to Checkout ➜
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
