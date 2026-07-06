const GUEST_CART_KEY = "guest_cart_v1";
const GUEST_CART_COOKIE = "guest_cart_session";

function isBrowser() {
  return typeof window !== "undefined";
}

function setGuestCookie() {
  if (!isBrowser()) return;
  document.cookie = `${GUEST_CART_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}

function clearGuestCookie() {
  if (!isBrowser()) return;
  document.cookie = `${GUEST_CART_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

function readGuestCart() {
  if (!isBrowser()) return [];

  try {
    const raw = sessionStorage.getItem(GUEST_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items) {
  if (!isBrowser()) return;
  sessionStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  setGuestCookie();
}

function clearGuestCart() {
  if (!isBrowser()) return;
  sessionStorage.removeItem(GUEST_CART_KEY);
  clearGuestCookie();
}

function addGuestCartItem(item) {
  const cart = readGuestCart();
  const index = cart.findIndex((entry) => entry.productId === item.productId);

  if (index >= 0) {
    const next = [...cart];
    next[index] = {
      ...next[index],
      qty: (Number(next[index].qty) || 0) + (Number(item.qty) || 1),
    };
    writeGuestCart(next);
    return next;
  }

  const next = [
    ...cart,
    {
      productId: item.productId,
      name: item.name,
      image: item.image,
      price: Number(item.price) || 0,
      qty: Number(item.qty) || 1,
      unit: item.unit || "scoop",
      variation: item.variation || "",
    },
  ];

  writeGuestCart(next);
  return next;
}

function updateGuestCartQty(productId, delta) {
  const cart = readGuestCart();
  const next = cart
    .map((item) => {
      if (item.productId !== productId) return item;
      return {
        ...item,
        qty: (Number(item.qty) || 0) + delta,
      };
    })
    .filter((item) => Number(item.qty) > 0);

  writeGuestCart(next);
  return next;
}

function removeGuestCartItem(productId) {
  const next = readGuestCart().filter((item) => item.productId !== productId);
  writeGuestCart(next);
  return next;
}

export {
  GUEST_CART_KEY,
  readGuestCart,
  writeGuestCart,
  clearGuestCart,
  addGuestCartItem,
  updateGuestCartQty,
  removeGuestCartItem,
};
