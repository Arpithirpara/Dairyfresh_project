"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import styles from "../login/login.module.css";
import toast from "react-hot-toast";
import API_URL from "../../config";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token ❌");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters ❌");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Reset Failed ❌");
        setLoading(false);
        return;
      }

      toast.success("Password Reset Successful ✅");
      setDone(true);
      setLoading(false);

      setTimeout(() => {
        router.push("/login");
      }, 1500);

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
          {done ? "Password Updated!" : "Set New Password"}
        </p>

        {!token ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            This reset link is invalid or has expired. Please request a new
            one.
          </p>
        ) : done ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            Your password has been reset successfully. Redirecting to login…
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="New Password"
              className={styles.input}
              value={form.password}
              onChange={handleChange}
              required
            />

            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm New Password"
              className={styles.input}
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className={styles.showBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide Password" : "Show Password"}
            </button>

            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
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

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}