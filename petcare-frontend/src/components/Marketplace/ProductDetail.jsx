import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MarketApi from '../../services/marketApi';
import { useCart } from '../../context/CartContext';
import './ProductList.css'; // Reusing some basic styles

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const res = await MarketApi.getProductById(id);
                setProduct(res.data);
            } catch (err) {
                console.error("Error loading product", err);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (!product) return <div className="loading-spinner">Product not found.</div>;

    return (
        <div className="marketplace-container" style={{ maxWidth: '1000px' }}>
            <button onClick={() => navigate(-1)} className="btn-back">
                ← Back to Marketplace
            </button>
            <div style={{ display: 'flex', gap: '3rem', background: 'white', padding: '2rem', borderRadius: '12px' }}>
                <div style={{ flex: 1 }}>
                    <img
                        src={MarketApi.getImageUrl(product.imageUrl)}
                        alt={product.title}
                        style={{ width: '100%', borderRadius: '8px' }}
                    />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ marginBottom: '1rem' }}>{product.title}</h1>
                    <span style={{
                        background: '#e9ecef',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        alignSelf: 'flex-start',
                        fontSize: '0.9rem',
                        color: '#666',
                        marginBottom: '1rem'
                    }}>
                        {product.category}
                    </span>
                    <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '2rem' }}>
                        {product.description}
                    </p>
                    <div style={{ marginTop: 'auto' }}>
                        <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '1rem' }}>
                            ₹{product.price}
                        </h2>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn-add-cart"
                                style={{ fontSize: '1.1rem', padding: '1rem' }}
                                onClick={() => {
                                    const token = sessionStorage.getItem('token');
                                    if (!token) {
                                        alert("Please login to add items to cart!");
                                        navigate('/login');
                                        return;
                                    }
                                    addToCart(product);
                                    alert("Added to cart!");
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
