"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./otp.module.css";
import  API_URL from "../../config";

function VerifyOtpInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email    = searchParams.get("email");
  const name     = searchParams.get("name");
  const mobile   = searchParams.get("mobile");
  const password = searchParams.get("password");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      return toast.error("6-digit OTP daalo ❌");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, password, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created! 🎉");
        router.push("/login");
      } else {
        toast.error(data.message || "Invalid OTP ❌");
      }
    } catch (error) {
      toast.error("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) toast.success("OTP resent 📧");
      else toast.error(data.message || "Failed ❌");
    } catch {
      toast.error("Server error ❌");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>📧</div>
        <h1 className={styles.title}>Verify Your Email</h1>
        <p className={styles.subtitle}>
          OTP sent to <strong>{email}</strong>
        </p>

        <input
          className={styles.input}
          type="text"
          placeholder="● ● ● ● ● ●"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
          maxLength={6}
          inputMode="numeric"
        />

        <button className={styles.button} onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP ✅"}
        </button>

        <button className={styles.resendBtn} onClick={handleResend}>
          Resend OTP 🔁
        </button>
      </div>
    </div>
  );
}

export default function VerifyOtp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpInner />
    </Suspense>
  );
}