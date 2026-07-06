"use client";

import styles from "../product.module.css";
import Link from "next/link";
import { useCategories } from "../../hook/useCategories";

export default function ProductPage() {
  const { categories, loading } = useCategories();

  return (
    <div className={styles.container}>
      
      <h1 className={styles.heading}>
             Our Premium Categories
      </h1>

      <div className={styles.grid}>
        {loading ? (
          <div className={styles.card}>
            <div style={{ padding: 24 }}>Loading categories...</div>
          </div>
        ) : categories.length === 0 ? (
          <div className={styles.card}>
            <div style={{ padding: 24 }}>No categories found.</div>
          </div>
        ) : (
          categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className={styles.cardlink}>
              <div className={styles.card}>
                <img
                  src={category.image || "/produtc_img/cold_drink.jpg"}
                  alt={category.name}
                />
                <h3>{category.name}</h3>
                <p>{category.description || `Explore ${category.name.toLowerCase()} products.`}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
