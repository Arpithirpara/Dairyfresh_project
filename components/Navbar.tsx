"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

const navLinks = [
  { href: "/",         label: "Home" },
  { href: "/product/category", label: "Category" },
  { href: "/product",  label: "products" },
  { href: "/contact",  label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const closeMenu = () => setOpen(false);

  const handleSearch = (event) => {
    event.preventDefault();
    const q = searchTerm.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    closeMenu();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("customerName");
    setIsLoggedIn(false);
    setCustomerName("");
    router.push("/login");
  };

  // ✅ Auth check — pathname change pe re-run
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setCustomerName("");
        return;
      }

      try {
        const res = await fetch("http://localhost:3002/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setCustomerName("");
          return;
        }

        setIsLoggedIn(true);
        setCustomerName(localStorage.getItem("customerName") || "");
      } catch (err) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setCustomerName("");
      }
    };

    checkAuth();
  }, [pathname]); // ✅ Har route change pe check karega

  // ✅ Cart updated event
  useEffect(() => {
    const handler = (e) => setCartCount(e.detail.count);
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  // ✅ Escape key se menu close
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") closeMenu(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Display label for the account link — falls back to "My Account"
  // if customerName isn't available yet, so it never shows blank.
  const accountLabel = customerName ? customerName : "My Account";

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Link href="/">🐄 DairyFresh</Link>
        </div>

        <ul className={styles.navLinks}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? styles.activeLink : ""}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <form className={styles.actions} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>Search</button>

          <Link href="/cart" className={styles.cartBtn}>
            🛒 Cart
            {cartCount > 0 && (
              <span className={styles.cartBadge}>
                {cartCount > 25 ? "25+" : cartCount}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <div className={styles.profileMenu}>
              <Link href="/my_account" className={styles.accountBtn}>
                👤 {accountLabel}
              </Link>
             
            </div>
          ) : (
            <Link href="/login" className={styles.accountBtn}>
              👤 Login
            </Link>
          )}
        </form>

        <button
          className={styles.hamburger}
          onClick={() => setOpen(true)}
          aria-label="Open Menu"
        >
          ☰
        </button>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`${styles.sidebar} ${open ? styles.show : ""}`}>
        <button className={styles.close} onClick={closeMenu} aria-label="Close Menu">
          ✕
        </button>

        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            className={pathname === link.href ? styles.activeSidebarLink : ""}
          >
            {link.label}
          </Link>
        ))}

        <Link href="/cart" onClick={closeMenu} className={styles.cartBtn}>
          🛒 Cart
          {cartCount > 0 && (
            <span className={styles.cartBadge}>
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>

        {isLoggedIn ? (
          <>
            <Link href="/my_account" onClick={closeMenu}>
              👤 {accountLabel}
            </Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" onClick={closeMenu}>
            👤 Login
          </Link>
        )}
      </div>

      {open && <div className={styles.overlay} onClick={closeMenu} />}
    </>
  );
}
