'use client'

import { useState, useEffect } from "react";
import styles from "../account.module.css";
import API_URL from "../../../config";

export default function Overview({ user, onUpdate }) {

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [mobile, setMobile] = useState(user.mobile || "");
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    wishlistItems: 0,
    savedAddresses: 0,
  });

  useEffect(() => {
    setName(user.name || "");
    setMobile(user.mobile || "");
  }, [user]);

  // Fetch Dashboard Stats
 useEffect(() => {

  const fetchStats = async () => {

    try {

      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token || ""}`,
      };

      const [ordersRes, addressRes, addressListRes] =
        await Promise.all([
          fetch(
            `${API_URL}/api/orders/user/${userId}`,
            { headers }
          ),
          fetch(
            `${API_URL}/api/address/me`,
            { headers }
          ),
          fetch(
            `${API_URL}/api/address/user/${userId}`,
            { headers }
          )
        ]);

      const ordersData =
        await ordersRes.json();

      const addressData =
        await addressRes.json();

      const addressListData =
        await addressListRes.json();
        

      console.log("Orders:", ordersData);
      console.log("Addresses:", addressData);
      console.log("Address list:", addressListData);

      const orders =
        Array.isArray(ordersData?.data)
          ? ordersData.data
          : Array.isArray(ordersData?.orders)
            ? ordersData.orders
            : [];

      const addresses = Array.isArray(addressListData?.data)
        ? addressListData.data
        : addressData?.data
          ? [addressData.data]
          : [];

      setStats({
        totalOrders: orders.length,

        deliveredOrders:
          orders.filter(
            (item) =>
              item.status === "Delivered"
          ).length,

        wishlistItems: 0, // add wishlist api later

        savedAddresses:
          addresses.length
      });

    } catch (error) {

      console.log(
        "Stats fetch error:",
        error
      );

    }
  };

  fetchStats();

}, []);
  const handleSave = async () => {

    setLoading(true);

    try {

      const userId =
        localStorage.getItem("userId");

      const res = await fetch(
        `${API_URL}/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${
                localStorage.getItem("token") || ""
              }`,
          },

          body: JSON.stringify({
            name,
            mobile,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {

        setEditing(false);

        onUpdate?.({
          ...user,
          name,
          mobile,
        });

      } else {
        console.log(data.message);
      }

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  };

  const handleCancel = () => {
    setName(user.name || "");
    setMobile(user.mobile || "");
    setEditing(false);
  };

  return (
    <div>

      <h2 className={styles.heading}>
        Welcome back,
        {" "}
        {user.name?.split(" ")[0]}
        👋
      </h2>

      <p className={styles.subtext}>
        Member since{" "}
        {user.createdAt
          ? new Date(
              user.createdAt
            ).toLocaleDateString(
              "en-IN",
              {
                month: "short",
                year: "numeric",
              }
            )
          : "N/A"}
      </p>

      {/* Stats */}

      <div className={styles.statsGrid}>

        <div className={styles.statCard}>
          <i
            className="ti ti-shopping-bag"
            style={{
              fontSize: 24,
              color:
              "var(--color-text-info)"
            }}
          />

          <p className={styles.statNum}>
            {stats.totalOrders}
          </p>

          <p className={styles.statLabel}>
            Total Orders
          </p>
        </div>

        <div className={styles.statCard}>
          <i
            className="ti ti-truck-delivery"
            style={{
              fontSize: 24,
              color:
              "var(--color-text-success)"
            }}
          />

          <p className={styles.statNum}>
            {stats.deliveredOrders}
          </p>

          <p className={styles.statLabel}>
            Delivered
          </p>
        </div>

        <div className={styles.statCard}>
          <i
            className="ti ti-heart"
            style={{
              fontSize: 24,
              color:
              "var(--color-text-danger)"
            }}
          />

          <p className={styles.statNum}>
            {stats.wishlistItems}
          </p>

          <p className={styles.statLabel}>
            Wishlist Items
          </p>
        </div>

        <div className={styles.statCard}>
          <i
            className="ti ti-map-pin"
            style={{
              fontSize: 24,
              color:
              "var(--color-text-warning)"
            }}
          />

          <p className={styles.statNum}>
            {stats.savedAddresses}
          </p>

          <p className={styles.statLabel}>
            Saved Addresses
          </p>
        </div>

      </div>

      {/* Personal Info */}

      <div className={styles.card}>

        <h3 className={styles.cardTitle}>
          Personal Information
        </h3>

        <div className={styles.infoGrid}>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              Full Name
            </span>

            {editing ? (
              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className={
                  styles.inputField
                }
              />
            ) : (
              <span className={styles.infoValue}>
                {user.name}
              </span>
            )}
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              Email
            </span>

            <span className={styles.infoValue}>
              {user.email}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              Phone
            </span>

            {editing ? (
              <input
                type="text"
                value={mobile}
                onChange={(e) =>
                  setMobile(
                    e.target.value
                  )
                }
                className={
                  styles.inputField
                }
              />
            ) : (
              <span className={styles.infoValue}>
                {user.mobile ||
                  "Not Added"}
              </span>
            )}
          </div>

        </div>

        {editing ? (

          <div className={styles.actionBtns}>

            <button
              className={styles.editBtn}
              onClick={handleSave}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save"}
            </button>

            <button
              className={styles.exportBtn}
              onClick={handleCancel}
            >
              Cancel
            </button>

          </div>

        ) : (

          <button
            className={styles.editBtn}
            onClick={() =>
              setEditing(true)
            }
          >
            <i className="ti ti-edit" />
            Edit Profile
          </button>

        )}

      </div>

    </div>
  );
}
