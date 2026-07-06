"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../app/styles/shop-common.module.css";
import { useCart } from "../app/hook/usecart";
import {
  isInWishlist,
  readWishlist,
  toggleWishlistItem,
  WISHLIST_EVENT,
} from "../app/utils/wishlist";

export default function ProductCard({ item }) {
  const router = useRouter();
  const { qty, increase, decrease } = useCart();

  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const sync = () => setWishlist(readWishlist());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(WISHLIST_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(WISHLIST_EVENT, sync);
    };
  }, []);

  const isWishlisted = useMemo(
    () => isInWishlist(item.id, wishlist),
    [wishlist, item.id]
  );

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setWishlist(toggleWishlistItem(item));
  };

  const currentQty = qty[item.id] || 0;

  return (
    <div
      className={styles.card}
      onClick={() => router.push(`/Details/${item.id}`)}
    >
      {item.size && <div className={styles.badge}>{item.size}</div>}

      {/* Wishlist Button */}
      <button
        type="button"
        className={`${styles.wishlistBtn} ${
          isWishlisted ? styles.wishlistBtnActive : ""
        }`}
        onClick={toggleWishlist}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isWishlisted}
      >
        <i className={`ti ${isWishlisted ? "ti-heart-filled" : "ti-heart"}`} />
      </button>

      {/* Product Image */}
      <img
        src={item.image || "/produtc_img/cold_drink.jpg"}
        alt={item.name}
      />

      {/* Content */}
      <div className={styles.content}>
        <h3>{item.name}</h3>
        <p>{item.desc}</p>

        <div className={styles.bottom}>
          <span className={styles.price}>₹{item.price}</span>

          {/* Quantity / Add to Cart */}
          <div className={styles.qtyBox}>
            {currentQty === 0 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  increase(item);
                }}
                className={styles.addBtn}
              >
                Add
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    decrease(item);
                  }}
                  className={styles.qtyBtn}
                >
                  −
                </button>
                <span className={styles.qtyCount}>{currentQty}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    increase(item);
                  }}
                  className={styles.qtyBtn}
                >
                  +
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




