"use client";                          // ← TOP PE ADD KARO
import styles from "../account.module.css";

const navItems = [
  { key: "overview",  icon: "ti-user",        label: "Overview"  },
  { key: "orders",    icon: "ti-shopping-bag", label: "My Orders" },
  { key: "addresses", icon: "ti-map-pin",      label: "Addresses" },
  { key: "wishlist",  icon: "ti-heart",        label: "Wishlist"  },
  { key: "settings",  icon: "ti-settings",     label: "Settings"  },
];

export default function Sidebar({ user, active, setActive }) {
  const avatarInitials = user.name
    ?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.avatarSection}>
        <div className={styles.avatar}>{avatarInitials}</div>
        <div>
          <p className={styles.userName}>{user.name}</p>
          <p className={styles.userEmail}>{user.email}</p>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`${styles.navItem} ${active === item.key ? styles.navActive : ""}`}
            onClick={() => setActive(item.key)}
          >
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            {item.label}
          </button>
        ))}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <i className="ti ti-logout" aria-hidden="true" />
          Logout
        </button>
      </nav>
    </aside>
  );
}