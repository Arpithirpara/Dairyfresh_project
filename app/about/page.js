// app/about/page.jsx
"use client";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <div className={styles.page}>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>🐄 About DairyFresh</h1>
          <p className={styles.heroSubtitle}>
            Pure. Fresh. Natural. — Farm se aapke ghar tak!
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className={styles.section}>
        <div className={styles.storyGrid}>
          <div className={styles.storyImg}>
            <img src="/produtc_img/milk_product_photo.jpg" alt="Our Farm" />
          </div>
          <div className={styles.storyText}>
            <h2>Hamari Kahani 📖</h2>
            <p>
              DairyFresh ki shuruaat 2010 mein ek chhote se dairy farm se hui thi.
              Hamara ek hi sapna tha — har ghar mein pure aur fresh dairy products
              pahunchana. Aaj hum hazaron families ko roz fresh milk, curd, butter
              aur bahut kuch deliver karte hain.
            </p>
            <p>
              Hamare saare products directly farm se aate hain — koi artificial
              preservatives nahi, koi compromise nahi. Sirf 100% natural goodness!
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🏠</span>
            <h3>10,000+</h3>
            <p>Happy Families</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🐄</span>
            <h3>500+</h3>
            <p>Healthy Cows</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>📦</span>
            <h3>50+</h3>
            <p>Products</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>⭐</span>
            <h3>15+</h3>
            <p>Years Experience</p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Hamare Values 💚</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <span>🌿</span>
            <h3>100% Natural</h3>
            <p>Koi artificial color ya preservative nahi — sirf pure dairy products.</p>
          </div>
          <div className={styles.valueCard}>
            <span>🚚</span>
            <h3>Fresh Delivery</h3>
            <p>Roz subah farm se seedha aapke door tak fresh delivery.</p>
          </div>
          <div className={styles.valueCard}>
            <span>🧪</span>
            <h3>Quality Tested</h3>
            <p>Har product quality check ke baad hi dispatch hota hai.</p>
          </div>
          <div className={styles.valueCard}>
            <span>❤️</span>
            <h3>Customer First</h3>
            <p>Aapki satisfaction hamare liye sabse important hai.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <h2 className={styles.sectionTitle}>Hamari Team 👥</h2>
        <div className={styles.teamGrid}>
          {[
            { name: "Ramesh Patel",  role: "Founder & CEO",      emoji: "👨‍💼" },
            { name: "Sunita Sharma", role: "Head of Operations",  emoji: "👩‍💼" },
            { name: "Amit Verma",    role: "Farm Manager",        emoji: "👨‍🌾" },
            { name: "Priya Singh",   role: "Quality Manager",     emoji: "👩‍🔬" },
          ].map((member) => (
            <div key={member.name} className={styles.teamCard}>
              <div className={styles.teamEmoji}>{member.emoji}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2>Ready to taste the difference? 🥛</h2>
        <p>Ab aur wait mat karo — order karo aur fresh dairy ka maza lo!</p>
        <a href="/product" className={styles.ctaBtn}>Shop Now →</a>
      </section>

    </div>
  );
}