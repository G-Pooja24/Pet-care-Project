import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScrollReveal from 'scrollreveal'

export default function Products() {
  const navigate = useNavigate();

  useEffect(() => {
    const sr = ScrollReveal()
    sr.reveal('.product__card', { distance: '50px', origin: 'bottom', duration: 1000, interval: 500 })
  }, [])

  const handleAddToCart = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert("Please login to see more details and shop!");
      navigate('/login');
    } else {
      navigate('/shop');
    }
  };

  return (
    <section className="product" id="store">
      <div className="section__container product__container">
        <p className="section__subheader">Products</p>
        <h2 className="section__header">Featured pet products</h2>
        <div className="product__grid">
          <div className="product__card">
            <div className="product__image-wrapper">
              <img src="/assets/product-1.jpg" alt="product" />
              <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
            </div>
            <h4>Dog Trash Bag</h4>
            <p>
              Convenient and eco-friendly trash bags for easy pet waste
              disposal.
            </p>
            <h3 className="product__price">Rs. 99.00</h3>
          </div>
          <div className="product__card">
            <div className="product__image-wrapper">
              <img src="/assets/product-2.jpg" alt="product" />
              <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
            </div>
            <h4>Pet Accessories</h4>
            <p>
              Explore our range of stylish and functional accessories for your
              furry friends.
            </p>
            <h3 className="product__price">Rs. 199.00</h3>
          </div>
          <div className="product__card">
            <div className="product__image-wrapper">
              <img src="/assets/product-3.jpg" alt="product" />
              <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
            </div>
            <h4>Dog Food</h4>
            <p>
              Nutritious and delicious dog food to keep your pet healthy and
              happy.
            </p>
            <h3 className="product__price">Rs. 299.00</h3>
          </div>
        </div>
      </div>
    </section>
  )
}