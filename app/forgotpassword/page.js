"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "../login/login.module.css";
import toast from "react-hot-toast";
import API_URL from "../../config";

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong ❌");
        setLoading(false);
        return;
      }

      toast.success(data.message || "Reset link sent ✅");
      setSent(true);
      setLoading(false);

    } catch (error) {
      console.error(error);
      toast.error("Server Error");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🐄 DairyFresh</h1>
        <p className={styles.subtitle}>
          {sent ? "Check Your Inbox!" : "Forgot Your Password?"}
        </p>

        {!sent ? (
          <>
            <p style={{ textAlign: "center", marginBottom: "16px", color: "#666" }}>
              Enter your registered email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button
                type="submit"
                className={styles.loginBtn}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <p style={{ textAlign: "center", color: "#666" }}>
            We've sent a password reset link to <b>{email}</b>. Please check
            your inbox (and spam folder).
          </p>
        )}

        <p className={styles.registerText}>
          Remembered your password?{" "}
          <Link href="/login" className={styles.registerLink}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}