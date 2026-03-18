import React, { useEffect } from 'react'
import ScrollReveal from 'scrollreveal'


export default function Instagram() {
    useEffect(() => {
        const sr = ScrollReveal()
        sr.reveal('.instagram__grid img', { duration: 1000, interval: 500 })
    }, [])


    return (
        <section className="section__container instagram__container">
            {/* <p>FOLLOW</p>
        <h2 className="section__header">Instagram</h2> */}
            <div className="instagram__grid">
                <img src="/assets/instagram-1.jpg" alt="instagram" />
                <img src="/assets/instagram-2.jpg" alt="instagram" />
                <img src="/assets/instagram-3.jpg" alt="instagram" />
                <img src="/assets/instagram-4.jpg" alt="instagram" />
            </div>
        </section>
    )
}