"use client";

import styles from "./footer.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import API_URL from "../config";
import toast from "react-hot-toast";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const [cmsPages, setCmsPages] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // ── GET CMS PAGES ──
  useEffect(() => {
    getCmsPages();
  }, []);

  const getCmsPages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/footer/getall`);
      const data = await response.json();

      if (data.success) {
        setCmsPages(data.data || []);
      } else {
        setCmsPages([]);
      }
    } catch (error) {
      console.log(error);
      setCmsPages([]);
    }
  };

  // ── SUBSCRIBE POST API ──
  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter email");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/sub/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Subscribed successfully");
        setEmail("");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const links = {
    DAIRY_FREASH: [
      { label: "ABOUT US", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "CONTACT US", href: "/contact" },
      { label: "BLOG", href: "/blog" },
    ],

    Products: [
      { label: "FRESH-MILK", href: "/fresh_milk" },
      { label: "COLD-DRINK", href: "/cold_drink" },
      { label: "TEA", href: "/tea" },
      { label: "PROTEIN", href: "/protein" },
    ],
  };

  return (
    <footer className={styles.footer}>

      {/* TOP WAVE */}
      <div className={styles.topWave}>
        <svg viewBox="0 0 1440 80">
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className={styles.container}>

        {/* BRAND */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🥛</span>
            <span className={styles.logoText}>DooddhFresh</span>
          </div>

          <p className={styles.tagline}>
            Roze subah ki taazgi, seedha aapke ghar tak.
          </p>
        </div>

        {/* STATIC LINKS */}
        {Object.entries(links).map(([section, items]) => (
          <div key={section} className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>{section}</h4>

            <ul className={styles.linkList}>
              {items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* CMS POLICIES */}
        <div className={styles.linkGroup}>
          <h4 className={styles.groupTitle}>POLICIES</h4>

          <ul className={styles.linkList}>
            {cmsPages.map((page) => (
              <li key={page._id}>
                <Link
                  href={`/cms/${page.slug}`}
                  className={styles.link}
                >
                  {page.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* NEWSLETTER */}
        <div className={styles.newsletter}>
          <h4 className={styles.groupTitle}>Newsletter</h4>

          <p className={styles.newsletterText}>
            Latest offers aur dairy updates paayein.
          </p>

          <form onSubmit={handleSubscribe} className={styles.newsletterForm}>

            <input
              type="email"
              placeholder="aapki@email.com"
              className={styles.emailInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              className={styles.subscribeBtn}
              disabled={loading}
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </button>

          </form>
        </div>

      </div>

      {/* BOTTOM */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>
            © {currentYear} DooddhFresh. All rights reserved.
          </p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;