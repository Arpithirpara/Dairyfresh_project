"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./view_order.module.css";

export default function OrderDetailPage() {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Back button block
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const blockBack = () => router.replace("/");
    window.addEventListener("popstate", blockBack);
    return () => window.removeEventListener("popstate", blockBack);
  }, []);

  // ✅ Order fetch
  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);

        const userId = localStorage.getItem("userId");
        const orderId = sessionStorage.getItem("lastOrderId");

        if (!orderId) {
          router.replace("/");
          return;
        }

        if (!userId) throw new Error("User not logged in");

        const res = await fetch(`http://localhost:3002/api/orders/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch orders");

        const response = await res.json();
        const orders = response.data;

        const foundOrder = orders.find(
          (o) => String(o._id) === String(orderId)
        );

        if (!foundOrder) throw new Error("Order not found");

        // ✅ Sirf tab remove karo jab order successfully mil jaye
        sessionStorage.removeItem("lastOrderId");
        setOrder(foundOrder);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, []);

  if (loading) return <div className={styles.page}><p>Loading order...</p></div>;
  if (error)   return <div className={styles.page}><p>Error: {error}</p></div>;
  if (!order)  return <div className={styles.page}><p>Order not found.</p></div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => router.replace("/")}>
          ← Back to Home
        </button>

        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Order #{order._id}</h1>
              <p className={styles.date}>
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
            <span className={styles.status}>{order.status}</span>
          </div>

          <div className={styles.section}>
            <h3>Customer Information</h3>
            <div className={styles.row}><span>Name</span><strong>{order.customer || order.name}</strong></div>
            <div className={styles.row}><span>Address</span><strong>
              {typeof order.address === "object"
                ? `${order.address.fullAddress}, ${order.address.city} - ${order.address.pincode}`
                : order.address}
              </strong></div>
          </div>

          <div className={styles.section}>
            <h3>Items Ordered</h3>
            {order.items?.map((item, i) => (
              <div className={styles.row} key={i}>
                <span>{item.name} × {item.qty}</span>
                <strong>₹{item.price * item.qty}</strong>
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <h3>Payment Summary</h3>
            <div className={styles.row}>
              <span>Total Amount</span>
              <strong>₹{order.total}</strong>
            </div>
            <div className={styles.row}>
              <span>Payment Method</span>
              <strong>{order.payment === "cod" ? "Cash on Delivery" : "Online"}</strong>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.primaryBtn}>Download Invoice</button>
            <button className={styles.dangerBtn}>Cancel Order</button>
          </div>
        </div>
      </div>
    </div>
  );
}