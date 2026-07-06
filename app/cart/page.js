"use client";

import { useEffect, useState } from "react";
import styles from "./cart.module.css";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  clearGuestCart,
  readGuestCart,
  removeGuestCartItem,
  updateGuestCartQty,
} from "../lib/cartStorage";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  const fetchCart = async (authToken) => {
    try {
      if (!authToken) {
        setCart(
          readGuestCart().map((item) => ({
            _id: item.productId,
            productId: item.productId,
            itemname: item.name,
            image: item.image,
            itemPrice: item.price,
            item_qty: item.qty,
          }))
        );
        return;
      }

      const res = await fetch("http://localhost:3002/api/cart", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await res.json();
      setCart(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.log("Error:", err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart(token);
  }, [token]);

  const increase = async (id) => {
    if (!token) {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === id ? { ...item, item_qty: item.item_qty + 1 } : item
        )
      );
      updateGuestCartQty(id, 1);
      return;
    }
    await fetch(`http://localhost:3002/api/cart/increase/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCart(token);
  };

  const decrease = async (id) => {
    if (!token) {
      const current = cart.find((item) => item.productId === id);
      if (!current) return;
      if (current.item_qty <= 1) {
        setCart((prev) => prev.filter((item) => item.productId !== id));
        removeGuestCartItem(id);
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.productId === id ? { ...item, item_qty: item.item_qty - 1 } : item
        )
      );
      updateGuestCartQty(id, -1);
      return;
    }
    await fetch(`http://localhost:3002/api/cart/decrease/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCart(token);
  };

  const removeItem = async (id) => {
    if (!token) {
      setCart((prev) => prev.filter((item) => item.productId !== id));
      removeGuestCartItem(id);
      return;
    }
    await fetch(`http://localhost:3002/api/cart/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCart(token);
  };

  const total = Array.isArray(cart)
    ? cart.reduce((acc, item) => acc + item.itemPrice * item.item_qty, 0)
    : 0;

  const handleCheckout = async () => {
    if (!token) {
      const cartData = cart.map((item) => ({
        name: item.itemname,
        qty: item.item_qty,
        price: item.itemPrice,
        unit: "scoop",
        image: item.image,
      }));
      localStorage.setItem("cart", JSON.stringify(cartData));
      localStorage.setItem("cartTotal", total.toString());
      toast.error("Please login to continue checkout");
      router.push("/login?redirect=/Address");
      return;
    }

    const cartData = cart.map((item) => ({
      name: item.itemname,
      qty: item.item_qty,
      price: item.itemPrice,
      unit: "scoop",
      image: item.image,
    }));
    localStorage.setItem("cart", JSON.stringify(cartData));
    localStorage.setItem("cartTotal", total.toString());
    clearGuestCart();
    router.push("/Address");
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Loading your cart…</p>
      </div>
    );
  }

  // ── Empty state ──
  if (!cart.length) {
    return (
      <div className={styles.emptyPage}>
        <div className={styles.emptyBox}>
          <div className={styles.emptyCartIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <h2 className={styles.emptyTitle}>Your cart is empty</h2>
          <p className={styles.emptySub}>
            Looks like you haven&apos;t added anything yet.<br />
            Start shopping and fill it up!
          </p>
          <button className={styles.shopBtn} onClick={() => router.push("/")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Browse products
          </button>
        </div>

        {/* Suggested products — replace these with your real data / component */}
        <p className={styles.suggestLabel}>You might like</p>
        <div className={styles.suggestGrid}>
          {[
            { name: "Organic Apples", price: "₹280 / kg", icon: "🍎" },
            { name: "Fresh Spinach",  price: "₹45 / 500g", icon: "🥬" },
            { name: "Cold Press Juice", price: "₹199 / bottle", icon: "🧃" },
          ].map((p) => (
            <div key={p.name} className={styles.suggestCard}
              onClick={() => router.push("/")}>
              <div className={styles.suggestIcon}>{p.icon}</div>
              <p className={styles.suggestName}>{p.name}</p>
              <p className={styles.suggestPrice}>{p.price}</p>
              <span className={styles.addBadge}>+ Add</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Cart with items ──
  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>My cart</h2>

      <div className={styles.container}>
        <div className={styles.items}>
          {cart.map((item) => (
            <div key={item._id} className={styles.card}>
              <img src={item.image} alt={item.itemname} className={styles.itemImg} />

              <div className={styles.content}>
                <h3 className={styles.itemName}>{item.itemname}</h3>
                <p className={styles.itemUnit}>₹{item.itemPrice} per unit</p>

                <div className={styles.qty}>
                  <button className={styles.qtyBtn} onClick={() => decrease(item._id)} aria-label="Decrease quantity">−</button>
                  <span className={styles.qtyNum}>{item.item_qty}</span>
                  <button className={styles.qtyBtn} onClick={() => increase(item._id)} aria-label="Increase quantity">+</button>
                </div>

                <p className={styles.itemTotal}>₹{item.itemPrice * item.item_qty}</p>
              </div>

              <button className={styles.removeBtn} onClick={() => removeItem(item._id)} aria-label="Remove item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>Order summary</h3>

          <div className={styles.summaryRow}>
            <span>Subtotal</span><span>₹{total}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Delivery</span>
            <span className={styles.freeTag}>Free</span>
          </div>

          <div className={styles.summaryTotal}>
            <span>Total</span><span>₹{total}</span>
          </div>

          <button className={styles.checkout} onClick={handleCheckout}>
            Proceed to checkout
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>

          <p className={styles.secureLine}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Secure checkout
          </p>
        </div>
      </div>
    </div>
  );
}