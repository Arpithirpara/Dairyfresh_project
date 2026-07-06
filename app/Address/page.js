"use client";

import { useState, useEffect } from "react";
import styles from "./address.module.css";
import { useRouter } from "next/navigation";
import API_URL from "../../config";

export default function AddressPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", phone: "", address: "", city: "", pincode: "",
  });
  const [savedAddress, setSavedAddress] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_URL}/api/address/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSavedAddress(data.data);
          setForm({
            name:    data.data.fullName,
            phone:   data.data.mobile,
            address: data.data.fullAddress,
            city:    data.data.city,
            pincode: data.data.pincode,
          });
          setEditing(false);
        } else {
          setEditing(true);
        }
      })
      .catch(() => setEditing(true))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUseSaved = () => {
    localStorage.setItem("customerName", savedAddress.fullName);
    localStorage.setItem("address", JSON.stringify({
      fullName:    savedAddress.fullName,
      mobile:      savedAddress.mobile,
      fullAddress: savedAddress.fullAddress,
      city:        savedAddress.city,
      pincode:     savedAddress.pincode,
    }));
    router.push("/payment");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Pehle login karo");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName:    form.name,
          mobile:      form.phone,
          fullAddress: form.address,
          city:        form.city,
          pincode:     form.pincode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("customerName", form.name);
        localStorage.setItem("address", JSON.stringify({
          fullName:    form.name,
          mobile:      form.phone,
          fullAddress: form.address,
          city:        form.city,
          pincode:     form.pincode,
        }));
        router.push("/payment");
      } else {
        alert(data.message);
      }
    } catch {
      alert("Server error. Please try again.");
    }
  };

  const getInitials = (name = "") =>
    name.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Loading your details…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <span className={styles.brandName}>FreshCart</span>
        </div>

        <nav className={styles.steps} aria-label="Checkout steps">
          <div className={`${styles.step} ${styles.active}`}>
            <span className={styles.stepNum}>1</span>
            <span className={styles.stepLabel}>Address</span>
          </div>
          <div className={styles.stepDivider} />
          <div className={styles.step}>
            <span className={styles.stepNum}>2</span>
            <span className={styles.stepLabel}>Payment</span>
          </div>
          <div className={styles.stepDivider} />
          <div className={styles.step}>
            <span className={styles.stepNum}>3</span>
            <span className={styles.stepLabel}>Confirm</span>
          </div>
        </nav>
      </header>

      {/* ── Main layout ── */}
      <div className={styles.layout}>

        {/* ── Address card ── */}
        <div className={styles.card}>
          <p className={styles.sectionLabel}>Delivery address</p>

          {/* Saved address block */}
          {savedAddress && !editing && (
            <>
              <div className={styles.savedCard}>
                <div className={styles.savedHeader}>
                  <div className={styles.avatar}>
                    {getInitials(savedAddress.fullName)}
                  </div>
                  <div>
                    <p className={styles.savedName}>{savedAddress.fullName}</p>
                    <p className={styles.savedMeta}>{savedAddress.mobile}</p>
                  </div>
                </div>
                <p className={styles.savedAddressLine}>
                  {savedAddress.fullAddress}, {savedAddress.city} — {savedAddress.pincode}
                </p>
                <div className={styles.savedActions}>
                  <button className={styles.btnPrimary} onClick={handleUseSaved}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Use this address
                  </button>
                  <button className={styles.btnGhost} onClick={() => setEditing(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Change
                  </button>
                </div>
              </div>

              <button className={styles.btnNewAddress} onClick={() => setEditing(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Deliver to a different address
              </button>
            </>
          )}

          {/* New address form */}
          {(!savedAddress || editing) && (
            <>
              {savedAddress && editing && (
                <div className={styles.dividerOr}><span>or enter a new address</span></div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                  <label htmlFor="name">Full name</label>
                  <input id="name" type="text" name="name"
                    placeholder="e.g. Rahul Kumar"
                    value={form.name} onChange={handleChange} required />
                </div>

                <div className={styles.field}>
                  <label htmlFor="phone">Mobile number</label>
                  <input id="phone" type="tel" name="phone"
                    placeholder="10-digit number"
                    value={form.phone} maxLength={10} onChange={handleChange} required />
                </div>

                <div className={styles.field}>
                  <label htmlFor="address">Street address</label>
                  <textarea id="address" name="address"
                    placeholder="Flat / house no., building, colony, street"
                    value={form.address} onChange={handleChange} required />
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label htmlFor="city">City</label>
                    <input id="city" type="text" name="city"
                      placeholder="e.g. Ahmedabad"
                      value={form.city} onChange={handleChange} required />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="pincode">Pincode</label>
                    <input id="pincode" type="text" name="pincode"
                      placeholder="6-digit code"
                      value={form.pincode} maxLength={6} onChange={handleChange} required />
                  </div>
                </div>

                {savedAddress && (
                  <button type="button" className={styles.btnGhost}
                    style={{ marginBottom: 14 }} onClick={() => setEditing(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    Back to saved address
                  </button>
                )}

                <button type="submit" className={styles.submitBtn}>
                  Save &amp; continue
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>

            {/* Why we need this */}
            <div className={styles.sideSection}>
              <p className={styles.sectionLabel}>Why we need this</p>
              <p className={styles.sideBody}>
                Your address lets us route your order to the nearest fulfillment centre
                and get it to you as fast as possible.
              </p>
            </div>

            {/* Trust signals */}
            <div className={styles.sideSection}>
              <div className={styles.trustRow}>
                <div className={styles.trustIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <div>
                  <p className={styles.trustTitle}>Fast delivery</p>
                  <p className={styles.trustSub}>Delivered in 2–4 hours</p>
                </div>
              </div>

              <div className={styles.trustRow}>
                <div className={styles.trustIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <p className={styles.trustTitle}>Safe packaging</p>
                  <p className={styles.trustSub}>Tamper-proof and insulated</p>
                </div>
              </div>

              <div className={`${styles.trustRow} ${styles.trustRowLast}`}>
                <div className={styles.trustIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                </div>
                <div>
                  <p className={styles.trustTitle}>Easy returns</p>
                  <p className={styles.trustSub}>No questions asked</p>
                </div>
              </div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}