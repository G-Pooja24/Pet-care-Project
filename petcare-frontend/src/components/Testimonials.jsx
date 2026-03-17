import React, { useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import ScrollReveal from 'scrollreveal'

export default function Testimonials() {
  useEffect(() => {
    const sr = ScrollReveal()
    sr.reveal('.instagram__grid img', { duration: 1000, interval: 500 })
  }, [])

  return (
    <section className="client">
      <div className="section__container client__container">
        <p className="section__subheader">Testimonials</p>
        <h2 className="section__header">What people say about us</h2>
        <div className="swiper">
          <Swiper slidesPerView={3} spaceBetween={20} loop={true}>
            {[1,2,3,4,5].map((i) => (
              <SwiperSlide key={i}>
                <div className="client__card">
                  <div className="client__details">
                    <img src={`/assets/client-${i}.jpg`} alt={`client-${i}`} />
                    <div>
                      <h4>{['Sarah Johnson','Michael Adams','Emily Martinez','Jason Lee','David Thompson'][i-1]}</h4>
                      <h5>{['Graphic Designer','Software Engineer','Teacher','Marketing Specialist','Accountant'][i-1]}</h5>
                    </div>
                  </div>
                  <p>
                    {[
                      "The care my dog received at Pet Doctor was exceptional. The vets were attentive cared about my dog's well-being.",
                      "Pet Doctor saved my cat during an emergency! Their quick response and expertise made all the difference.",
                      "I trust Pet Doctor with all my pets. Their team is professional, and they always go the extra mile for their patients.",
                      "The grooming services at Pet Doctor are fantastic! My pup always comes back looking fresh and happy.",
                      "I've never seen a team so dedicated to animals. Pet Doctor is my go-to clinic for all pet-related issues."
                    ][i-1]}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}
