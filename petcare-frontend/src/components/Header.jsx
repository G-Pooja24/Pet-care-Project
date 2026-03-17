import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import ScrollReveal from 'scrollreveal'

export default function Header() {
  useEffect(() => {
    const scrollRevealOption = {
      distance: '50px',
      origin: 'bottom',
      duration: 1000,
    }

    const sr = ScrollReveal()
    sr.reveal('.header__content h4', { ...scrollRevealOption })
    sr.reveal('.header__content h1', { ...scrollRevealOption, delay: 500 })
    sr.reveal('.header__content h2', { ...scrollRevealOption, delay: 1000 })
    sr.reveal('.header__content p', { ...scrollRevealOption, delay: 1500 })
    sr.reveal('.header__btn', { ...scrollRevealOption, delay: 2000 })
  }, [])

  return (
    <header id="home">
      <div className="section__container header__container">
        <div className="header__content">
          <h4>Welcome to</h4>
          <h1>Pawfect<br />
            <span>Care</span>
          </h1>
          <h2>We love pets like you do :)</h2>
          <p>
            From routine check-ups to specialized treatments, we're here to
            ensure your pets lead happy, healthy lives.
          </p>
          <div className="header__btn">
            <Link to="/login">
              <button>
                Start Here!
                <span><i className="ri-arrow-right-line"></i></span>
              </button>
            </Link>
          </div>
        </div>
        <div className="header__image">
          <img src="/assets/header-bg.png" alt="header-bg" className="header__image-bg" />
          <img src="/assets/header.png" alt="header" />
        </div>
      </div>
      <div className="header__bottom"></div>
    </header>
  )
}