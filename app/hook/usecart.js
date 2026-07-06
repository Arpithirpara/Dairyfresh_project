"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import API_URL from "../../config";

const CART_API = `${API_URL}/api/cart`;
const GUEST_CART_KEY = "guest-cart";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Guest Cart Helpers ──────────────────────────────────────────
function readGuestCart() {
  if (typeof window === "undefined") return { qty: {}, items: {} };
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '{"qty":{},"items":{}}');
  } catch {
    return { qty: {}, items: {} };
  }
}

function saveGuestCart(data) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(data));
}

export function useCart() {
  const [qty, setQty] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cartItemIds = useRef({});

  // ── Fetch cart (logged in = backend, guest = localStorage) ──────
  const fetchCart = useCallback(async () => {
    const token = getToken();

    if (!token) {
      // Guest cart from localStorage
      const guest = readGuestCart();
      setQty(guest.qty || {});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(CART_API, {
        method: "GET",
        headers: authHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        setError("Not authenticated");
        setQty({});
        return;
      }

      const data = await res.json();

      if (data.success) {
        const items = Array.isArray(data.data) ? data.data : [];
        const map = {};
        const idMap = {};

        items.forEach((entry) => {
          const productId = entry.productId;
          map[productId] = entry.item_qty || 0;
          idMap[productId] = entry._id;
        });

        setQty(map);
        cartItemIds.current = idMap;
        setError(null);
      } else {
        setError(data.message || "Failed to load cart");
      }
    } catch (err) {
      console.log("Cart fetch error:", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ── Notify Navbar ───────────────────────────────────────────────
  useEffect(() => {
    const totalCount = Object.values(qty).reduce((sum, n) => sum + n, 0);
    window.dispatchEvent(
      new CustomEvent("cart-updated", { detail: { count: totalCount } })
    );
  }, [qty]);

  // ── Add to cart ─────────────────────────────────────────────────
  const addToCart = useCallback(async (item) => {
    const token = getToken();

    if (!token) {
      // ── GUEST: save in localStorage ──
      const guest = readGuestCart();
      guest.qty[item.id] = (guest.qty[item.id] || 0) + 1;
      guest.items[item.id] = {
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
      };
      saveGuestCart(guest);
      setQty({ ...guest.qty });
      return;
    }

    // ── LOGGED IN: save in backend ──
    try {
      const res = await fetch(CART_API, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          productId: item.id,
          itemname: item.name,
          image: item.image,
          itemPrice: item.price,
        }),
      });

      const data = await res.json();

      if (data.success) {
        cartItemIds.current[item.id] = data.data._id;
        setQty((prev) => ({ ...prev, [item.id]: data.data.item_qty }));
        setError(null);
      } else {
        setError(data.message || "Failed to add to cart");
      }
    } catch (err) {
      console.log("Add to cart error:", err);
      setError("Network error");
    }
  }, []);

  // ── Increase ────────────────────────────────────────────────────
  const increase = useCallback(async (item) => {
    const token = getToken();
    const current = qty[item.id] || 0;

    if (!token) {
      // ── GUEST ──
      const guest = readGuestCart();
      guest.qty[item.id] = (guest.qty[item.id] || 0) + 1;
      guest.items[item.id] = {
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
      };
      saveGuestCart(guest);
      setQty({ ...guest.qty });
      return;
    }

    // ── LOGGED IN ──
    if (current === 0) return addToCart(item);

    const cartItemId = cartItemIds.current[item.id];
    if (!cartItemId) return fetchCart();

    setQty((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));

    try {
      const res = await fetch(`${CART_API}/increase/${cartItemId}`, {
        method: "PUT",
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!data.success) {
        setQty((prev) => ({ ...prev, [item.id]: Math.max((prev[item.id] || 1) - 1, 0) }));
        setError(data.message || "Failed to increase quantity");
      }
    } catch (err) {
      console.log("Increase cart error:", err);
      setQty((prev) => ({ ...prev, [item.id]: Math.max((prev[item.id] || 1) - 1, 0) }));
      setError("Network error");
    }
  }, [qty, addToCart, fetchCart]);

  // ── Decrease ────────────────────────────────────────────────────
  const decrease = useCallback(async (item) => {
    const token = getToken();
    const current = qty[item.id] || 0;
    if (current <= 0) return;

    if (!token) {
      // ── GUEST ──
      const guest = readGuestCart();
      if (current <= 1) {
        delete guest.qty[item.id];
        delete guest.items[item.id];
      } else {
        guest.qty[item.id] = current - 1;
      }
      saveGuestCart(guest);
      setQty({ ...guest.qty });
      return;
    }

    // ── LOGGED IN ──
    const cartItemId = cartItemIds.current[item.id];
    if (!cartItemId) return fetchCart();

    const willDelete = current <= 1;

    setQty((prev) => {
      const next = { ...prev };
      if (willDelete) delete next[item.id];
      else next[item.id] = current - 1;
      return next;
    });

    try {
      const res = await fetch(`${CART_API}/decrease/${cartItemId}`, {
        method: "PUT",
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!data.success) {
        setQty((prev) => ({ ...prev, [item.id]: current }));
        setError(data.message || "Failed to decrease quantity");
      } else if (willDelete) {
        delete cartItemIds.current[item.id];
      }
    } catch (err) {
      console.log("Decrease cart error:", err);
      setQty((prev) => ({ ...prev, [item.id]: current }));
      setError("Network error");
    }
  }, [qty, fetchCart]);

  // ── Remove Item ─────────────────────────────────────────────────
  const removeItem = useCallback(async (item) => {
    const token = getToken();

    if (!token) {
      // ── GUEST ──
      const guest = readGuestCart();
      delete guest.qty[item.id];
      delete guest.items[item.id];
      saveGuestCart(guest);
      setQty({ ...guest.qty });
      return;
    }

    // ── LOGGED IN ──
    const cartItemId = cartItemIds.current[item.id];
    if (!cartItemId) return;

    const previous = qty[item.id];
    setQty((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });

    try {
      const res = await fetch(`${CART_API}/${cartItemId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!data.success) {
        setQty((prev) => ({ ...prev, [item.id]: previous }));
        setError(data.message || "Failed to remove item");
      } else {
        delete cartItemIds.current[item.id];
      }
    } catch (err) {
      console.log("Remove item error:", err);
      setQty((prev) => ({ ...prev, [item.id]: previous }));
      setError("Network error");
    }
  }, [qty]);

  // ── Clear Cart ──────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    const token = getToken();

    if (!token) {
      // ── GUEST ──
      saveGuestCart({ qty: {}, items: {} });
      setQty({});
      return;
    }

    // ── LOGGED IN ──
    const previous = qty;
    setQty({});
    cartItemIds.current = {};

    try {
      const res = await fetch(`${CART_API}/clear`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!data.success) {
        setQty(previous);
        setError(data.message || "Failed to clear cart");
      }
    } catch (err) {
      console.log("Clear cart error:", err);
      setQty(previous);
      setError("Network error");
    }
  }, [qty]);

  // ── Guest cart items (for cart page display) ────────────────────
  const getGuestItems = useCallback(() => {
    const guest = readGuestCart();
    return Object.values(guest.items || {}).map((item) => ({
      ...item,
      quantity: guest.qty[item.id] || 0,
    }));
  }, []);

  return {
    qty,
    loading,
    error,
    addToCart,
    increase,
    decrease,
    removeItem,
    clearCart,
    refetch: fetchCart,
    getGuestItems, // ← cart page pe guest items dikhane ke liye use karo
  };
}