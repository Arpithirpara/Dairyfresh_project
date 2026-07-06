"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "../../../config";
import "./order.css";

const ORDERS_PER_PAGE = 3;

// ---------- helpers ----------

// Always returns a safe number, never NaN
const toNum = (val) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

// Formats any value as ₹ currency, safely
const formatMoney = (val) =>
  `₹${toNum(val).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// Computes a line total for a single item, safely
const lineTotal = (item) => toNum(item?.price) * toNum(item?.quantity || 1);

// Computes the items subtotal for a whole order, safely
const itemsSubtotal = (order) =>
  (order?.items || []).reduce((sum, item) => sum + lineTotal(item), 0);

// Delivery fee — free above ₹199, else flat ₹25 (tweak to match your real business rule)
const deliveryFee = (subtotal) => (subtotal === 0 ? 0 : subtotal >= 199 ? 0 : 25);

// GST/tax — 5% of subtotal (tweak to match your real tax rule)
const taxAmount = (subtotal) => Math.round(subtotal * 0.05);

// Resolves payment info from whatever shape the backend actually sends.
// Order schema (confirmed): { status, total, items, address, createdAt, ... }
// Payment schema (separate, confirmed): { p_method, pstatus, transaction_id, amount, pdate }
// Since payment isn't nested in the order response today, we check every
// likely shape first, then fall back to a sane default — so the UI never
// shows "undefined" no matter how the backend evolves.
const resolvePayment = (order) => {
  const p = order?.payment || order?.paymentInfo || order?.paymentDetails || {};

  const method =
    p.p_method || p.method || order?.p_method || order?.paymentMethod || "COD";

  let status =
    p.pstatus || p.status || order?.pstatus || order?.paymentStatus || null;

  // No explicit payment status: infer something reasonable so the badge
  // still makes sense (COD orders are "Pending" until delivered).
  if (!status) {
    if (String(method).toUpperCase() === "COD") {
      status = order?.status === "Delivered" ? "Success" : "Pending";
    } else {
      status = "Pending";
    }
  }

  const transactionId =
    p.transaction_id || order?.transaction_id || null;

  const paidOn = p.pdate || order?.pdate || null;

  return { method: String(method), status: String(status), transactionId, paidOn };
};

const PAYMENT_STYLE = {
  success: { label: "Paid", className: "badge-success" },
  paid: { label: "Paid", className: "badge-success" },
  completed: { label: "Paid", className: "badge-success" },
  pending: { label: "Payment Pending", className: "badge-warning" },
  failed: { label: "Payment Failed", className: "badge-danger" },
  cancelled: { label: "Refunded", className: "badge-neutral" },
  refunded: { label: "Refunded", className: "badge-neutral" },
};

const getPaymentBadge = (status) => {
  const key = String(status).toLowerCase();
  return PAYMENT_STYLE[key] || { label: status, className: "badge-neutral" };
};

const ORDER_STATUS_STYLE = {
  Delivered: "badge-success",
  Processing: "badge-warning",
  Packed: "badge-info",
  "Out for Delivery": "badge-info",
  Placed: "badge-info",
  Cancelled: "badge-danger",
};

const TRACKER_STEPS = ["Placed", "Packed", "Out for Delivery", "Delivered"];

const getTrackerIndex = (status) => {
  if (status === "Cancelled") return -1;
  const idx = TRACKER_STEPS.indexOf(status);
  return idx === -1 ? (status === "Delivered" ? 3 : 0) : idx;
};

// Placeholder shown when a product image is missing or fails to load
function ImageFallback({ size = 48 }) {
  return (
    <div className="img-fallback" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill="none">
        <path
          d="M4 7h16l-1.5 12.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M8 7V5.5A4 4 0 0 1 12 1.5a4 4 0 0 1 4 4V7" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </div>
  );
}

function ProductImage({ src, alt, size = 48 }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) return <ImageFallback size={size} />;
  return (
    <img
      src={src}
      alt={alt || "Product"}
      className="product-img"
      style={{ width: size, height: size }}
      onError={() => setErrored(true)}
      loading="lazy"
    />
  );
}

// ---------- main component ----------

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/orders/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data?.data) ? data.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Couldn't load your orders. Please try again.");
        setLoading(false);
      });
  }, []);

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const currentOrders = orders.slice(startIndex, startIndex + ORDERS_PER_PAGE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="ord-skeleton-wrap">
        {[1, 2, 3].map((i) => (
          <div key={i} className="ord-skeleton-card">
            <div className="sk-row">
              <div className="sk sk-thumb" />
              <div className="sk-col">
                <div className="sk sk-line w60" />
                <div className="sk sk-line w40" />
              </div>
            </div>
            <div className="sk sk-line w100" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="ord-empty">
        <div className="ord-empty-icon">⚠️</div>
        <p className="ord-empty-title">Something went wrong</p>
        <p className="ord-empty-sub">{error}</p>
      </div>
    );
  }

  // ── DETAIL VIEW ──
  if (selected) {
    const payment = resolvePayment(selected);
    const paymentBadge = getPaymentBadge(payment.status);
    const subtotal = itemsSubtotal(selected);
    const delivery = selected.deliveryFee != null ? toNum(selected.deliveryFee) : deliveryFee(subtotal);
    const tax = selected.tax != null ? toNum(selected.tax) : taxAmount(subtotal);
    const grandTotal = selected.total != null ? toNum(selected.total) : subtotal + delivery + tax;
    const trackerIdx = getTrackerIndex(selected.status);

    return (
      <div className="ord-page">
        <button className="ord-back" onClick={() => setSelected(null)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Orders
        </button>

        <div className="ord-detail-head">
          <div>
            <h2 className="ord-heading">Order #{selected._id?.slice(-6).toUpperCase()}</h2>
            <p className="ord-subtext">
              Placed on{" "}
              {selected.createdAt
                ? new Date(selected.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
          <span className={`ord-badge ${ORDER_STATUS_STYLE[selected.status] || "badge-neutral"}`}>
            {selected.status || "Unknown"}
          </span>
        </div>

        {/* Tracker */}
        {selected.status !== "Cancelled" ? (
          <div className="tracker-card">
            <div className="tracker-track">
              {TRACKER_STEPS.map((step, i) => (
                <div key={step} className={`tracker-step ${i <= trackerIdx ? "tracker-step-done" : ""}`}>
                  <div className="tracker-dot">
                    {i <= trackerIdx ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </div>
                  <span className="tracker-label">{step}</span>
                  {i < TRACKER_STEPS.length - 1 && (
                    <div className={`tracker-line ${i < trackerIdx ? "tracker-line-done" : ""}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="tracker-card tracker-cancelled">
            <span>This order was cancelled</span>
          </div>
        )}

        {/* Items */}
        <div className="ord-card">
          <h3 className="ord-card-title">
            Items <span className="ord-card-title-count">({selected.items?.length || 0})</span>
          </h3>
          <div>
            {(selected.items || []).map((item, i) => (
              <div key={i} className="ord-item-row">
                <div className="ord-item-left">
                  <ProductImage src={item.image} alt={item.name} size={56} />
                  <div>
                    <p className="ord-item-name">{item.name || "Unnamed item"}</p>
                    <p className="ord-item-meta">
                      Qty {toNum(item.quantity) || 1} &middot; {formatMoney(item.price)} each
                    </p>
                  </div>
                </div>
                <span className="ord-item-price">{formatMoney(lineTotal(item))}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bill breakdown */}
        <div className="ord-card">
          <h3 className="ord-card-title">Bill Details</h3>
          <div className="bill-row">
            <span>Items total</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="bill-row">
            <span>Delivery fee</span>
            <span>{delivery === 0 ? <span className="bill-free">FREE</span> : formatMoney(delivery)}</span>
          </div>
          <div className="bill-row">
            <span>Taxes</span>
            <span>{formatMoney(tax)}</span>
          </div>
          <div className="bill-divider" />
          <div className="bill-row bill-row-total">
            <span>Grand total</span>
            <span>{formatMoney(grandTotal)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="ord-card">
          <h3 className="ord-card-title">Payment</h3>
          <div className="pay-row">
            <div className="pay-method">
              <div className="pay-icon">{paymentIcon(payment.method)}</div>
              <div>
                <p className="pay-method-name">{payment.method}</p>
                {payment.transactionId && (
                  <p className="pay-txn">Txn ID: {payment.transactionId}</p>
                )}
              </div>
            </div>
            <span className={`ord-badge ${paymentBadge.className}`}>{paymentBadge.label}</span>
          </div>
        </div>

        {/* Address */}
        {selected.address && (
          <div className="ord-card">
            <h3 className="ord-card-title">Delivery Address</h3>
            <p className="addr-name">{selected.address.fullName}</p>
            <p className="addr-text">
              {selected.address.fullAddress || selected.address.line1}
              {selected.address.city ? `, ${selected.address.city}` : ""}
              {selected.address.state ? `, ${selected.address.state}` : ""}
              {selected.address.pincode ? ` - ${selected.address.pincode}` : ""}
            </p>
            {selected.address.mobile && <p className="addr-text">📞 {selected.address.mobile}</p>}
          </div>
        )}
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="ord-page">
      <h2 className="ord-heading">My Orders</h2>
      <p className="ord-subtext">{orders.length} {orders.length === 1 ? "order" : "orders"} placed</p>

      {orders.length === 0 ? (
        <div className="ord-empty">
          <div className="ord-empty-icon">🛍️</div>
          <p className="ord-empty-title">No orders yet</p>
          <p className="ord-empty-sub">Your orders will show up here once you place one.</p>
        </div>
      ) : (
        <>
          <div className="ord-list">
            {currentOrders.map((order) => {
              const payment = resolvePayment(order);
              const paymentBadge = getPaymentBadge(payment.status);
              const items = order.items || [];
              const visibleThumbs = items.slice(0, 3);
              const extraCount = items.length - visibleThumbs.length;
              const orderTotal = order.total != null ? toNum(order.total) : itemsSubtotal(order);

              return (
                <div key={order._id} className="ord-card ord-card-clickable" onClick={() => setSelected(order)}>
                  <div className="ord-top">
                    <div>
                      <p className="ord-id">#{order._id?.slice(-6).toUpperCase()}</p>
                      <p className="ord-date">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                    <div className="ord-badges">
                      <span className={`ord-badge ${ORDER_STATUS_STYLE[order.status] || "badge-neutral"}`}>
                        {order.status || "Unknown"}
                      </span>
                      <span className={`ord-badge ord-badge-sm ${paymentBadge.className}`}>
                        {paymentBadge.label}
                      </span>
                    </div>
                  </div>

                  <div className="ord-thumbs-row">
                    <div className="ord-thumbs-stack">
                      {visibleThumbs.map((item, i) => (
                        <ProductImage key={i} src={item.image} alt={item.name} size={44} />
                      ))}
                      {extraCount > 0 && <div className="ord-thumb-more">+{extraCount}</div>}
                    </div>
                    <p className="ord-items-text">
                      {items.map((item) => item.name).filter(Boolean).join(", ") || "Items unavailable"}
                    </p>
                  </div>

                  <div className="ord-bottom">
                    <span className="ord-total">{formatMoney(orderTotal)}</span>
                    <button
                      className="ord-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(order);
                      }}
                    >
                      View Details
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="ord-pagination">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="page-btn page-nav">
                ← Prev
              </button>

              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="page-ellipsis">…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`page-btn ${currentPage === page ? "page-btn-active" : ""}`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-btn page-nav"
              >
                Next →
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <p className="ord-page-info">
              Page {currentPage} of {totalPages} • Showing {startIndex + 1}–
              {Math.min(startIndex + ORDERS_PER_PAGE, orders.length)} of {orders.length} orders
            </p>
          )}
        </>
      )}
    </div>
  );
}

function paymentIcon(method) {
  const m = String(method).toUpperCase();
  if (m === "COD") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="7" cy="15" r="1.3" fill="currentColor" />
      </svg>
    );
  }
  if (m === "UPI") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 12l6 8 4-6 2 3 4-11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  // Card / Razorpay / default
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 9.5h20" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
