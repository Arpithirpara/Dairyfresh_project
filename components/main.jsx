"use client";

import { useEffect, useState } from "react";
import styles from "./main.module.css";
import Link from "next/link";

export default function Home() {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const getBanners = async () => {
      try {
        const response = await fetch(
          "http://localhost:3002/api/benner/getall"
        );
        const data = await response.json();
        console.log("Banner Data:", data);

        if (data.success) {
          setSlides(
            data.data.filter((banner) => banner.isActive)
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    getBanners();
  }, []);

  // Auto Slider
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides]);

  if (slides.length === 0) {
    return (
      <div style={{
        minHeight: "82vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fffdf5"
      }}>
        <p style={{ color: "#66745f", fontSize: 18 }}>Loading...</p>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <section className={styles.sliderContainer}>
        <div className={styles.slide}>

          {/* BACKGROUND IMAGE */}
          <div className={styles.heroImage}>
            <img
              key={slides[index].image}
              src={slides[index].image}
              alt={slides[index].title}
            />
          </div>

          {/* TEXT OVERLAY - left bottom */}
          <div
            className={styles.heroContent}
            key={`text-${slides[index]._id}`}
          >
            <h1>{slides[index].title}</h1>
            <p>{slides[index].subtitle}</p>

            <div className={styles.heroButtons}>
              <Link href="/category/fresh-milk">
                <button className={styles.primaryBtn}>
                  Get Fresh Milk
                </button>
              </Link>
              <button className={styles.secondaryBtn}>
                Discover More
              </button>
            </div>
          </div>

        </div>

        {/* DOTS */}
        <div className={styles.dots}>
          {slides.map((_, i) => (
            <span
              key={i}
              onClick={() => setIndex(i)}
              className={`${styles.dot} ${
                index === i ? styles.activeDot : ""
              }`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
