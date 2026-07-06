// app/contact/page.jsx
"use client";
import { useState } from "react";
import styles from "./contact.module.css";
import API_URL from "../../config";
export default function ContactPage() {
const [form, setForm] = useState({
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  status: "pending",
});
  const [submitted, setSubmitted] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    subject: form.subject,
    message: form.message,
  };

  try {
    const res = await fetch(`${API_URL}/api/contact/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log("Response:", data);

    if (data.success) {
      alert("Success");
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.log(err);
  }
};

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>📞 Contact Us</h1>
        <p className={styles.heroSubtitle}>Koi bhi sawaal ho — hum yahan hain!</p>
      </section>

      <div className={styles.container}>

        {/* Left — Info */}
        <div className={styles.infoSection}>
          <h2>Hamse Miliye 👋</h2>
          <p className={styles.infoDesc}>
            DairyFresh team hamesha aapki madad ke liye taiyaar hai.
            Neeche diye contact details pe pahunch sakte ho ya form bharo.
          </p>

          <div className={styles.infoCards}>
            <div className={styles.infoCard}>
              <span>📍</span>
              <div>
                <h4>Address</h4>
                <p>123, Dairy Farm Road, Ahmedabad, Gujarat - 380001</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <span>📞</span>
              <div>
                <h4>Phone</h4>
                <p>+91 98765 43210</p>
                <p>+91 91234 56789</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <span>📧</span>
              <div>
                <h4>Email</h4>
                <p>support@dairyfresh.in</p>
                <p>info@dairyfresh.in</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <span>🕐</span>
              <div>
                <h4>Working Hours</h4>
                <p>Mon - Sat: 6:00 AM – 8:00 PM</p>
                <p>Sunday: 6:00 AM – 12:00 PM</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className={styles.social}>
            <h4>Follow Us</h4>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialBtn}>📘 Facebook</a>
              <a href="#" className={styles.socialBtn}>📸 Instagram</a>
              <a href="#" className={styles.socialBtn}>🐦 Twitter</a>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className={styles.formSection}>
          <h2>Message Bhejo ✉️</h2>

          {submitted ? (
            <div className={styles.successMsg}>
              <span>✅</span>
              <h3>Message Send Ho Gaya!</h3>
              <p>Hum jald hi aapse contact karenge.</p>
              <button onClick={() => setSubmitted(false)} className={styles.backBtn}>
                Dobara Bhejo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Aapka Naam *</label>
               <input
  type="text"
  placeholder="Full name "
  value={form.fullName}
  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
  required
/>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Mobile</label>
                  <input
  type="text"
  placeholder="98765 43210"
  maxLength={10}
  value={form.phone}
  onChange={(e) => setForm({ ...form, phone: e.target.value })}
/>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                >
                  <option value="">Select subject...</option>
                  <option value="order">Order Related</option>
                  <option value="delivery">Delivery Issue</option>
                  <option value="quality">Quality Complaint</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Message *</label>
                <textarea
                  placeholder="write message here"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                🚀 Send Message
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Map Section */}
      <section className={styles.mapSection}>
        <h2 className={styles.mapTitle}>📍 Hamare Yahan Aao</h2>
        <div className={styles.mapPlaceholder}>
          <span>🗺️</span>
          <p>123, Dairy Farm Road, Ahmedabad, Gujarat</p>
        </div>
      </section>

    </div>
  );
}