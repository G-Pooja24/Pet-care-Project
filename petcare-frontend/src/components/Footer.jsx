import React from 'react'

export default function Footer() {
  return (
    <footer id="contact">
      <div className="section__container footer__container">
        <div className="footer__col">
          <div className="footer__logo">
            <a href="#home">Pawfect Care</a>
          </div>
        </div>
        <div className="footer__col">
          <h4>Company</h4>
          <ul className="footer__links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#service">Services</a></li>
            <li><a href="#store">Store</a></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>Address</h4>
          <ul className="footer__links">
            <li><a href="#">Odisha, India</a></li>
            <li><a href="#">View on Maps</a></li>
          </ul>
          <br />
          <h4>Inquiries</h4>
          <ul className="footer__links">
            <li><a href="#">+91 0987654321</a></li>
            <li><a href="#">info@website.com</a></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>Follow Us</h4>
          <ul className="footer__socials">
            <li><a href="#"><i className="ri-facebook-fill"></i></a></li>
            <li><a href="#"><i className="ri-twitter-fill"></i></a></li>
            <li><a href="#"><i className="ri-youtube-fill"></i></a></li>
            <li><a href="#"><i className="ri-pinterest-line"></i></a></li>
            <li><a href="#"><i className="ri-instagram-line"></i></a></li>
            <li><a href="#"><i className="ri-tiktok-fill"></i></a></li>
          </ul>
        </div>
      </div>
      <div className="footer__bar">
        Copyright © 2025 by G. Pooja. All rights reserved.
      </div>
    </footer>
  )
}