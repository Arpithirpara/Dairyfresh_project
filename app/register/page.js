"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./register.module.css";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import API_URL from "../../config";

export default function Register() {

  const router = useRouter();

  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      setForm({
        ...form,
        [name]: onlyNums
      });
      return;
    }

    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return toast.error(
        "Passwords do not match ❌"
      );
    }

    if (form.password.length < 6) {
      return toast.error(
        "Password must be at least 6 characters ❌"
      );
    }

    try {

      const res = await fetch(
        `${API_URL}/api/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            email: form.email
          })
        }
      );

      const data = await res.json();

      if (res.ok) {

        toast.success(
          "OTP sent to your email 📧"
        );

        router.push(
          `/verify-otp?email=${encodeURIComponent(form.email)}&name=${encodeURIComponent(form.name)}&mobile=${encodeURIComponent(form.mobile)}&password=${encodeURIComponent(form.password)}`
        );

      } else {
        toast.error(
          data.message ||
          "Failed to send OTP ❌"
        );
      }

    } catch (error) {
      toast.error(
        "Server error ❌"
      );
    }
  };

  return (

    <div className={styles.container}>

      <h1 className={styles.title}>
        🐄 DairyFresh Register
      </h1>

      <p className={styles.subtitle}>
        Join us for fresh milk & dairy products daily
      </p>

      <form onSubmit={handleSubmit}>

        <input
          className={styles.input}
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
        />

        <input
          className={styles.input}
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
        />

        <input
          className={styles.input}
          name="mobile"
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          maxLength={10}
          inputMode="numeric"
          pattern="[0-9]*"
        />

        {/* Password */}

        <div className={styles.passwordWrapper}>
          <input
            className={styles.input}
            name="password"
            type={showPass ? "text" : "password"}
            placeholder="Password"
            onChange={handleChange}
          />

          <span
            className={styles.eyeIcon}
            onClick={() =>
              setShowPass(!showPass)
            }
          >
            <i
              className={
                showPass
                ? "ti ti-eye-off"
                : "ti ti-eye"
              }
            />
          </span>
        </div>

        {/* Confirm Password */}

        <div className={styles.passwordWrapper}>
          <input
            className={styles.input}
            name="confirmPassword"
            type={showPass ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={handleChange}
          />

          <span
            className={styles.eyeIcon}
            onClick={() =>
              setShowPass(!showPass)
            }
          >
            <i
              className={
                showPass
                ? "ti ti-eye-off"
                : "ti ti-eye"
              }
            />
          </span>
        </div>

        <button
          className={styles.button}
          type="submit"
        >
          Create Account 🚀
        </button>

      </form>

      <p className={styles.loginText}>
        Already have an account?{" "}
        <Link
          href="/login"
          className={styles.loginLink}
        >
          Login here
        </Link>
      </p>

    </div>
  );
}