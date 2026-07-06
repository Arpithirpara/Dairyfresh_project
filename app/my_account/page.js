"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./account.module.css";

import Sidebar   from "./components/Sidebar";
import Overview  from "./components/Overview";
import Orders    from "./components/Orders";
import Addresses from "./components/Address";
import Wishlist  from "./components/Wishlist";
import Settings  from "./components/Setting";

import API_URL from "../../config";

export default function ProfilePage() {
  const [active, setActive] = useState("overview");
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/getuser`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.log("❌ Backend did not return JSON:", text);
          throw new Error("Invalid JSON response from server");
        }

        if (!res.ok) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        setUser(data?.data || null);

      } catch (err) {
        console.error("Fetch user error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading...
      </div>
    );

  if (!user)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        User not found
      </div>
    );

  function renderPanel() {
    switch (active) {
      case "overview":  return <Overview  user={user} onUpdate={(updatedUser) => setUser(updatedUser)} />; // ✅ FIX
      case "orders":    return <Orders    user={user} />;
      case "addresses": return <Addresses user={user} />;
      case "wishlist":  return <Wishlist  user={user} />;
      case "settings":  return <Settings  user={user} />;
      default:          return <Overview  user={user} onUpdate={(updatedUser) => setUser(updatedUser)} />; // ✅ FIX
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Sidebar user={user} active={active} setActive={setActive} />
        <main className={styles.main}>{renderPanel()}</main>
      </div>
    </div>
  );
}