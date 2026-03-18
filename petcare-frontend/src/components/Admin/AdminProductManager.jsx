import React, { useState, useEffect } from 'react';
import MarketApi from '../../services/marketApi';
import './Admin.css'; // New admin dashboard styles

const AdminProductManager = () => {
    const [products, setProducts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({ title: '', price: '', category: '', stockQuantity: '', description: '', imageUrl: '' });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await MarketApi.getAllProducts();
            setProducts(res.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', currentProduct.title);
            formData.append('price', currentProduct.price);
            formData.append('category', currentProduct.category);
            formData.append('stockQuantity', currentProduct.stockQuantity);
            formData.append('description', currentProduct.description);

            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (isEditing) {
                await MarketApi.updateProduct(currentProduct.id, formData);
            } else {
                await MarketApi.createProduct(formData);
            }
            setIsEditing(false);
            setCurrentProduct({ title: '', price: '', category: '', stockQuantity: '', description: '', imageUrl: '' });
            setImageFile(null);
            loadProducts(); // Refresh
            alert("Success!");
        } catch (err) {
            console.error(err);
            alert("Failed to save product");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        try {
            await MarketApi.deleteProduct(id);
            loadProducts();
        } catch (e) { alert("Delete failed"); }
    };

    const handleEdit = (prod) => {
        setCurrentProduct(prod);
        setIsEditing(true);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Admin Product Manager</h1>
            </header>

            {/* Product Form Card */}
            <div className="admin-card">
                <div className="card-title">
                    {isEditing ? "✏️ Edit Product" : "✨ Add New Product"}
                </div>

                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-field">
                        <label>Product Title</label>
                        <input
                            className="admin-input"
                            placeholder="e.g. Premium Dog Food"
                            value={currentProduct.title}
                            onChange={e => setCurrentProduct({ ...currentProduct, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label>Price (₹)</label>
                        <input
                            className="admin-input"
                            placeholder="0.00"
                            type="number"
                            value={currentProduct.price}
                            onChange={e => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label>Category</label>
                        <select
                            className="admin-input"
                            value={currentProduct.category}
                            onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="FOOD">Food</option>
                            <option value="TOYS">Toys</option>
                            <option value="ACCESSORIES">Accessories</option>
                            <option value="MEDICINE">Medicine</option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Stock Quantity</label>
                        <input
                            className="admin-input"
                            placeholder="0"
                            type="number"
                            value={currentProduct.stockQuantity}
                            onChange={e => setCurrentProduct({ ...currentProduct, stockQuantity: e.target.value })}
                        />
                    </div>

                    <div className="form-field full-width">
                        <label>Product Image</label>
                        <div className="file-input-wrapper">
                            <input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" />
                        </div>
                        {currentProduct.imageUrl && (
                            <div className="preview-image">
                                <img
                                    src={MarketApi.getImageUrl(currentProduct.imageUrl)}
                                    alt="Preview"
                                    className="preview-thumb"
                                />
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>Current Image</span>
                            </div>
                        )}
                    </div>

                    <div className="form-field full-width">
                        <label>Description</label>
                        <textarea
                            className="admin-textarea"
                            placeholder="Enter detailed product description..."
                            value={currentProduct.description}
                            onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            {isEditing ? "Update Product" : "Create Product"}
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => {
                                    setIsEditing(false);
                                    setCurrentProduct({ title: '', price: '', category: '', stockQuantity: '', description: '', imageUrl: '' });
                                    setImageFile(null);
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Product Table */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product Details</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>#{p.id}</td>
                                <td>
                                    <div style={{ fontWeight: '600' }}>{p.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>{p.description?.substring(0, 30)}...</div>
                                </td>
                                <td><span style={{ background: '#eef2ff', color: '#4a90e2', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }}>{p.category}</span></td>
                                <td>₹{p.price}</td>
                                <td>
                                    {p.stockQuantity > 0 ? (
                                        <span>{p.stockQuantity} units</span>
                                    ) : (
                                        <span style={{ color: '#e74c3c', fontWeight: '700', fontSize: '0.85rem' }}>OUT OF STOCK</span>
                                    )}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon edit" onClick={() => handleEdit(p)}>
                                            Edit
                                        </button>
                                        <button className="btn-icon delete" onClick={() => handleDelete(p.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProductManager;
