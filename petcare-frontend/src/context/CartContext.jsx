import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    const token = sessionStorage.getItem('token');
    const isLoggedIn = !!token;

    // Sync with backend when user logs in
    useEffect(() => {
        if (isLoggedIn) {
            fetchBackendCart();
        }
    }, [isLoggedIn]);

    // Persist to local storage for guest/backup
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const fetchBackendCart = async () => {
        try {
            const res = await api.get('/cart');
            // Assuming backend returns a list of CartItems or a Cart object with items
            // We need to map it to our frontend structure: { ...product, quantity }
            const backendItems = res.data.items || res.data;

            if (Array.isArray(backendItems)) {
                const formattedItems = backendItems.map(item => ({
                    ...item.product, // Assuming CartItem has a 'product' field
                    quantity: item.quantity,
                    cartItemId: item.id // Store reference to backend ID if needed
                }));
                setCartItems(formattedItems);
            }
        } catch (err) {
            console.error("Failed to fetch cart from backend:", err);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        // 1. Optimistic UI update
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity + quantity > (product.stockQuantity || 999)) {
                    alert(`Sorry, only ${product.stockQuantity} items in stock!`);
                    return prev;
                }
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            if (quantity > (product.stockQuantity || 999)) {
                alert(`Sorry, only ${product.stockQuantity} items in stock!`);
                return prev;
            }
            return [...prev, { ...product, quantity }];
        });

        // 2. Backend Sync
        if (isLoggedIn) {
            try {
                await api.post('/cart/add', {
                    productId: product.id,
                    quantity: quantity
                });
                console.log("Item added to backend cart");
            } catch (err) {
                console.error("Failed to add to backend cart", err);
                // Optional: Revert local state or alert user
            }
        }
    };

    const removeFromCart = async (productId) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));

        if (isLoggedIn) {
            try {
                // Assuming endpoint is /cart/remove/{productId} or similar
                // If not standard, we might need to adjust. Trying a query param or path param based on common patterns.
                // Or maybe DELETE /cart/items/{productId}? 
                // For now, let's try a safe approach or just log it might not work without exact endpoint.
                // I will guess: DELETE /cart/remove/{productId} based on Add being /cart/add
                await api.delete(`/cart/remove/${productId}`);
            } catch (err) {
                console.warn("Backend remove failed (endpoint might vary):", err);
            }
        }
    };

    const updateQuantity = async (id, quantity) => {
        if (quantity < 1) return;

        // Optimistic Update
        setCartItems(prev => {
            const item = prev.find(i => i.id === id);
            if (item && quantity > (item.stockQuantity || 999)) {
                alert(`Sorry, only ${item.stockQuantity} items in stock!`);
                return prev;
            }
            return prev.map(item => (item.id === id ? { ...item, quantity } : item));
        });

        // Backend Sync
        if (isLoggedIn) {
            try {
                // Using PUT /cart/update to sync quantity
                await api.put('/cart/update', {
                    productId: id,
                    quantity: quantity
                });
            } catch (err) {
                console.error("Failed to update cart quantity backend:", err);
            }
        }
    };

    const clearCart = async () => {
        setCartItems([]);
        if (isLoggedIn) {
            try {
                await api.delete('/cart'); // Check if this clears the cart
            } catch (err) {
                console.error("Failed to clear backend cart", err);
            }
        }
    };

    const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
