import React, { useEffect } from 'react'
import ScrollReveal from 'scrollreveal'

export default function Services() {
  useEffect(() => {
    const sr = ScrollReveal()
    sr.reveal('.service__card', { duration: 1000, interval: 500 })
  }, [])

  return (
    <section className="section__container service__container" id="service">
      <p className="section__subheader">Services</p>
      <h2 className="section__header">What we can do for you</h2>
      <div className="service__flex">
        <div className="service__card">
          <div>
            <img src="/assets/service-1.png" alt="service" />
          </div>
          <h4>Emergency Care</h4>
          <p>Rapid response for your pet's critical health needs.</p>
        </div>
        <div className="service__card">
          <div>
            <img src="/assets/service-2.png" alt="service" />
          </div>
          <h4>Vaccination Services</h4>
          <p>Protect your furry friend from common infections.</p>
        </div>
        <div className="service__card">
          <div>
            <img src="/assets/service-3.png" alt="service" />
          </div>
          <h4>Nutrition Counseling</h4>
          <p>Dietary plans tailored to your pet's lifestyle.</p>
        </div>
        <div className="service__card">
          <div>
            <img src="/assets/service-4.png" alt="service" />
          </div>
          <h4>Behavioral Consultation</h4>
          <p>Expert advice to solve behavioral challenges.</p>
        </div>
        <div className="service__card">
          <div>
            <img src="/assets/service-5.png" alt="service" />
          </div>
          <h4>Pet Marketplace Services</h4>
          <p>Everything you need for your pet's daily life.</p>
        </div>
      </div>
    </section>
  )
}
