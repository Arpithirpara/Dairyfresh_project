"use client";

import { useState, useEffect } from "react";
import styles from "./payment.module.css";
import { useRouter } from "next/navigation";
import API_URL from "../../config";

export default function PaymentPage() {
  const [method, setMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const submitOrder = async (payload) => {
    try {
      const res = await fetch(`${API_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {

       sessionStorage.setItem("lastOrderId", data.order._id);
        // ✅ Payment save karo
        await fetch(`${API_URL}/api/payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id:            data.order._id,
            user_id:             payload.user,
            amount:              payload.total,
            p_method:            payload.payment === "cod" ? "Cash" : "Razorpay",
            razorpay_payment_id: payload.razorpay_payment_id || null,
          }),
        });

        // ✅ Cart clear karo
        await fetch(`${API_URL}/api/cart/clear`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        localStorage.removeItem("cart");
        localStorage.removeItem("cartTotal");
        router.replace("/order_success"); // ✅ replace
      } else {
        setError(data.message || "Order was not placed, please try again.");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  const handleRazorpay = (payload, total) => {
    if (!window.Razorpay) {
      setError("Razorpay load nahi hua. Page refresh karo.");
      setLoading(false);
      return;
    }

    const options = {
      key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount:      total * 100,
      currency:    "INR",
      name:        "Tera Store",
      description: "Order Payment",
      handler: async (response) => {
        await submitOrder({
          ...payload,
          razorpay_payment_id: response.razorpay_payment_id,
        });
      },
      prefill: { name: payload.customer },
      theme:   { color: "#1D9E75" },
      modal: {
        ondismiss: () => {
          setError("Payment was cancelled. Please try again.");
          setLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      setError("Payment fail: " + response.error.description);
      setLoading(false);
    });
    rzp.open();
    setLoading(false);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");

    try {
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
      const customer  = localStorage.getItem("customerName") || "";
      const userId    = localStorage.getItem("userId") || "";

      let address = {};
      try {
        address = JSON.parse(localStorage.getItem("address") || "{}");
      } catch {
        address = {};
      }

      const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.qty, 0
      );

      const payload = {
        user:     userId,
        customer: customer,
        items:    cartItems,
        address:  address,
        total:    total,
        payment:  method,
      };

      if (method === "cod") {
        await submitOrder(payload);
      } else {
        handleRazorpay(payload, total);
      }
    } catch (err) {
      setError("Network error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <h2>💳 Payment</h2>
        <div className={styles.steps}>
          <span>Address</span>
          <span className={styles.active}>Payment</span>
          <span>Success</span>
        </div>
      </div>

      <div className={styles.container}>

        <div className={styles.box}>
          <h3>Select Payment Method</h3>

          <label className={styles.option}>
            <input
              type="radio"
              name="payment"
              checked={method === "cod"}
              onChange={() => setMethod("cod")}
            />
            <div>
              <h4>Cash on Delivery (COD)</h4>
              <p>Pay when your order arrives</p>
            </div>
          </label>

          <label className={styles.option}>
            <input
              type="radio"
              name="payment"
              checked={method === "razorpay"}
              onChange={() => setMethod("razorpay")}
            />
            <div>
              <h4>Pay Online (Razorpay)</h4>
              <p>UPI / Card / Netbanking / Wallet</p>
            </div>
          </label>
        </div>

        <div className={styles.summary}>
          <h3>Order Summary</h3>

          <div className={styles.row}>
            <span>Items Total</span>
            <span>₹550</span>
          </div>
          <div className={styles.row}>
            <span>Delivery</span>
            <span>Free</span>
          </div>
          <hr />
          <div className={styles.total}>
            <span>Total</span>
            <span>₹550</span>
          </div>

          {error && (
            <p style={{ color: "red", fontSize: "13px", marginTop: "8px" }}>
              {error}
            </p>
          )}

          <button
            className={styles.payBtn}
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Loading..." : method === "cod" ? "Place Order" : "Pay with Razorpay"}
          </button>
        </div>

      </div>
    </div>
  );
}