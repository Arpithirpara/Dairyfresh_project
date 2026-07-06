"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "./login.module.css";
import toast from "react-hot-toast";
import API_URL from "../../config";
import { clearGuestCart, readGuestCart } from "../lib/cartStorage";

export default function Login() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login Failed ❌");
        return;
      }

      if (!data.token) {
        toast.error("Token missing from server ❌");
        return;
      }

      toast.success("Login Successful ✅");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("customerName", data.user.name);

      const guestCart = readGuestCart();
      if (guestCart.length > 0) {
        await Promise.all(
          guestCart.map((item) =>
            fetch(`${API_URL}/api/cart`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.token}`,
              },
              body: JSON.stringify({
                productId: item.productId,
                itemname: item.name,
                image: item.image,
                itemPrice: item.price,
                item_qty: item.qty,
                quantity: item.qty,
                variation: item.variation || "",
              }),
            })
          )
        );
        clearGuestCart();
      }

      const redirectTarget = new URLSearchParams(window.location.search).get("redirect");
      router.push(redirectTarget || "/");
      router.refresh();

    } catch (error) {
      console.error(error);
      toast.error("Server Error");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <h1 className={styles.title}>
          🐄 DairyFresh
        </h1>

        <p className={styles.subtitle}>
          Welcome Back!
        </p>

        <form onSubmit={handleSubmit}>

          {/* Email */}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className={styles.input}
            value={form.email}
            onChange={handleChange}
            required
          />

          {/* Password with Eye */}

          <div className={styles.passwordWrapper}>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className={styles.input}
              value={form.password}
              onChange={handleChange}
              required
            />

            <span
              className={styles.eyeIcon}
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              <i
                className={
                  showPassword
                    ? "ti ti-eye-off"
                    : "ti ti-eye"
                }
              />
            </span>

          </div>

          <div className={styles.options}>

            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <Link href="/forgotpassword">
              Forgot Password?
            </Link>

          </div>

          <button
            type="submit"
            className={styles.loginBtn}
          >
            Login
          </button>

        </form>

        <p className={styles.registerText}>
          Don't have an account?{" "}
          <Link
            href="/register"
            className={styles.registerLink}
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}
