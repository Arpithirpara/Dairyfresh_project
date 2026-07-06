"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../account.module.css";
import {
  readWishlist,
  toggleWishlistItem,
  WISHLIST_EVENT,
} from "../../utils/wishlist";

export default function Wishlist() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const syncWishlist = () => setItems(readWishlist());

    syncWishlist();
    window.addEventListener("storage", syncWishlist);
    window.addEventListener(WISHLIST_EVENT, syncWishlist);

    return () => {
      window.removeEventListener("storage", syncWishlist);
      window.removeEventListener(WISHLIST_EVENT, syncWishlist);
    };
  }, []);

  const removeItem = (item) => {
    setItems(toggleWishlistItem(item));
  };

  return (
    <div>
      <h2 className={styles.heading}>My Wishlist</h2>
      <p className={styles.subtext}>Items you love</p>

      {items.length > 0 ? (
        <div className={styles.wishlistGrid}>
          {items.map((item) => (
            <div className={styles.wishlistCard} key={item.id}>
              <Link href={`/Details/${item.id}`} className={styles.wishlistImageLink}>
                <img
                  src={item.image || "/produtc_img/cold_drink.jpg"}
                  alt={item.name || "Wishlist product"}
                  className={styles.wishlistImage}
                />
              </Link>

              <div className={styles.wishlistInfo}>
                <Link href={`/Details/${item.id}`} className={styles.wishlistName}>
                  {item.name || "Product"}
                </Link>
                {item.desc && <p className={styles.wishlistDesc}>{item.desc}</p>}
                <div className={styles.wishlistMeta}>
                  {item.price && <span>₹{item.price}</span>}
                  {item.size && <span>{item.size}</span>}
                </div>
              </div>

              <button
                type="button"
                className={styles.wishlistRemove}
                onClick={() => removeItem(item)}
                aria-label={`Remove ${item.name || "product"} from wishlist`}
              >
                <i className="ti ti-heart-filled" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
        <i
          className="ti ti-heart"
          style={{
            fontSize: 48,
            color: "var(--color-text-tertiary)"
          }}
        />

        <p>Your wishlist is empty</p>

        <div className={styles.categoryBtns}>
          <Link href="/category/chocolate" className={styles.categoryBtn}>
            Chocolates
          </Link>

          <Link href="/category/protein" className={styles.categoryBtn}>
            Protein
          </Link>

          <Link href="/category/fresh-milk" className={styles.categoryBtn}>
            Fresh Milk
          </Link>

          <Link href="/category/cold-drink" className={styles.categoryBtn}>
            cold-drink
          </Link>

          <Link href="/category/tea" className={styles.categoryBtn}>
               Tea
          </Link>

          <Link href="/category/biscuits" className={styles.categoryBtn}>
            Biscuits
          </Link>
          <Link href="/category/ice-cream" className={styles.categoryBtn}>
                    ice-cream
           </Link>

          <Link href="/category/cake" className={styles.categoryBtn}>
            Cakes
          </Link>
        </div>
      </div>
      )}
    </div>
  );
}
