import React, { useEffect, useState } from 'react'
import ScrollReveal from 'scrollreveal'

export default function Intro() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    const scrollRevealOption = { distance: '50px', origin: 'bottom', duration: 1000 }
    const sr = ScrollReveal()
    sr.reveal('.intro__card', { ...scrollRevealOption, interval: 500 })
  }, [])

  const features = [
    {
      id: 1,
      title: "Expert Veterinary Care",
      shortDesc: "Comprehensive health services for your beloved pets.",
      image: "/assets/intro-1.png",
      details: "Our team of certified veterinarians provides top-notch medical care, from routine check-ups to complex surgeries. We use state-of-the-art equipment to ensure your pet receives the best diagnosis and treatment available. Trust us to keep your furry friends healthy and thriving throughout their lives."
    },
    {
      id: 2,
      title: "Comprehensive Services",
      shortDesc: "Everything your pet needs under one roof.",
      image: "/assets/intro-2.png",
      details: "Beyond medical care, we offer a full suite of services including grooming, dental care, nutritional counseling, and vaccinations. We create personalized care plans tailored to your pet's specific breed, age, and lifestyle to promote long-term wellness."
    },
    {
      id: 3,
      title: "Pet Grooming",
      shortDesc: "Professional grooming to keep them looking their best.",
      image: "/assets/intro-3.png",
      details: "Our grooming services include bathing, hair trimming, nail clipping, and more. We handle your pets with care and patience, ensuring a stress-free experience."
    }
  ];

  return (
    <section className="section__container intro__container">
      <p className="section__subheader">Why Choose Us</p>
      <h2 className="section__header">Dedicated to Pet Wellness</h2>
      <div className="intro__grid">
        {features.map((feature) => (
          <div className="intro__card" key={feature.id}>
            <div className="intro__image">
              <img src={feature.image} alt="intro" />
            </div>
            <h4>{feature.title}</h4>
            <p>{feature.shortDesc}</p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedFeature(feature);
              }}
            >
              Read More
            </a>
          </div>
        ))}
      </div>

      {selectedFeature && (
        <div className="intro-detail-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="intro-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedFeature(null)}>&times;</button>
            <div className="modal-content-flex">
              <div className="modal-image">
                <img src={selectedFeature.image} alt={selectedFeature.title} />
              </div>
              <div className="modal-text">
                <h3>{selectedFeature.title}</h3>
                <p>{selectedFeature.details}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}