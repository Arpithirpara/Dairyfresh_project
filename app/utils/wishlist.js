"use client";

export const WISHLIST_KEY = "wishlist-products";
export const WISHLIST_EVENT = "wishlist-updated";

const getProductId = (product = {}) =>
  String(product.id || product._id || product.productId || "");

const normalizeWishlistItem = (product = {}) => ({
  id: getProductId(product),
  name: product.name || product.pname || "",
  desc: product.desc || product.pdescription || "",
  image: product.image || product.p_img || "",
  price: product.price || product.p_price || "",
  size: product.size || (product.pweightUnit
    ? `${product.pweight || ""} ${product.pweightUnit || ""}`.trim()
    : ""),
  categoryName: product.categoryName || product.pcategory?.name || "",
  savedAt: new Date().toISOString(),
});

export function readWishlist() {
  if (typeof window === "undefined") return [];

  try {
    const stored = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");

    return stored
      .map((item) =>
        typeof item === "string" ? { id: item } : normalizeWishlistItem(item)
      )
      .filter((item) => item.id);
  } catch {
    return [];
  }
}

export function isInWishlist(productId, wishlist = readWishlist()) {
  const id = String(productId || "");
  return wishlist.some((item) => String(item.id) === id);
}

export function toggleWishlistItem(product) {
  const current = readWishlist();
  const nextItem = normalizeWishlistItem(product);

  if (!nextItem.id) return current;

  const exists = isInWishlist(nextItem.id, current);
  const next = exists
    ? current.filter((item) => String(item.id) !== nextItem.id)
    : [nextItem, ...current];

  localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: next }));

  return next;
}
