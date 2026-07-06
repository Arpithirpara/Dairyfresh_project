"use client";

import styles from "./succes.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderSuccess() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const id = sessionStorage.getItem("lastOrderId");
    if (!id) {
      router.replace("/");
      return;
    }
    setOrderId(id);

    window.history.pushState(null, "", window.location.href);
    const blockBack = () => router.replace("/");
    window.addEventListener("popstate", blockBack);

    // ✅ Cleanup - listener remove karo
    return () => window.removeEventListener("popstate", blockBack);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>✅</div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for shopping with us 🎉</p>

        <div className={styles.orderBox}>
          <p><b>Order ID:</b> #{orderId || "Loading..."}</p>
          <p>Your order will be delivered soon 🚚</p>
        </div>

        <div className={styles.buttons}>
          <button className={styles.homeBtn} onClick={() => router.replace("/")}>
            Continue Shopping
          </button>
          <button
            className={styles.orderBtn}
            onClick={() => {
              if (orderId) {
                router.replace("/view-order");
              } else {
                alert("Order ID load nahi hua, thoda wait karo");
              }
            }}
          >
            View Order
          </button>
        </div>
      </div>
    </div>
  );
}