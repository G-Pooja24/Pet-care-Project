import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketApi from '../../services/marketApi';
import './ProductList.css';
import { useCart } from '../../context/CartContext';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('ALL');
    const nav = useNavigate();
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await MarketApi.getAllProducts(); // Assuming returns list directly or inside data
            setProducts(res.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load products", err);
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'ALL' || p.category === category;
        return matchesSearch && matchesCategory;
    });

    const categories = ['ALL', 'Food', 'Toys', 'Accessories', 'Medicine'];

    return (
        <div className="marketplace-container">
            <div className="marketplace-header">
                <h1>Pet Essentials Marketplace</h1>
            </div>

            <div className="filters-bar">
                <input
                    className="search-input"
                    type="text"
                    placeholder="🔍  Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {categories.map(c => (
                        <option key={c} value={c === 'ALL' ? 'ALL' : c.toUpperCase()}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading-spinner">
                    <div style={{ fontSize: '2rem' }}>⌛</div>
                    <div>Loading products...</div>
                </div>
            ) : (
                <>
                    {filteredProducts.length > 0 ? (
                        <div className="products-grid">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="product-card" onClick={() => nav(`/product/${product.id}`)}>
                                    <div className="product-image-container">
                                        <img
                                            src={MarketApi.getImageUrl(product.imageUrl)}
                                            alt={product.title}
                                            className="product-image"
                                        />
                                    </div>
                                    <div className="product-info">
                                        <div className="product-category">{product.category}</div>
                                        <h3 className="product-title">{product.title}</h3>
                                        <div className="product-price">₹{product.price}</div>
                                        {product.stockQuantity > 0 ? (
                                            <button
                                                className="btn-add-cart"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const token = sessionStorage.getItem('token');
                                                    if (!token) {
                                                        alert("Please login to add items to cart!");
                                                        nav('/login');
                                                        return;
                                                    }
                                                    addToCart(product);
                                                    alert("Added to cart!");
                                                }}
                                            >
                                                🛒 Add to Cart
                                            </button>
                                        ) : (
                                            <button
                                                className="btn-add-cart"
                                                disabled
                                                style={{ background: '#e0e0e0', color: '#888', cursor: 'not-allowed', transform: 'none' }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                🚫 OUT OF STOCK
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="loading-spinner" style={{ minHeight: '300px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                            <h3>No products found</h3>
                            <p>Try adjusting your search or category filter</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductList;
