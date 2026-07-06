"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../styles/shop-common.module.css";
import API_URL from "../../config";
import ProductCard from "../../components/ProductCard";
import Fuse from "fuse.js";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = (searchParams.get("q") || "").trim();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
  setLoading(true);
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${API_URL}/api/product/getall`, { cache: "no-store" }),
      fetch(`${API_URL}/api/category/getall`, { cache: "no-store" }),
    ]);

    const productsJson = await productsRes.json();
    const categoriesJson = await categoriesRes.json();
    const categories = Array.isArray(categoriesJson?.data) ? categoriesJson.data : [];
    const products = Array.isArray(productsJson?.data) ? productsJson.data : [];

    const mapped = products.map((product) => {
      const categoryId = product.pcategory?._id || product.categoryId?._id || product.categoryId || "";
      const categoryName =
        categories.find((category) => String(category._id) === String(categoryId))?.name ||
        product.pcategory?.name ||
        product.pcategory ||
        "";

      return {
        id: product._id,
        name: product.pname,
        desc: product.pdescription ? product.pdescription.replace(/<[^>]*>/g, "").trim() : "",
        image: product.p_img || null,
        price: product.p_price,
        size: product.pweightUnit ? `${product.pweight} ${product.pweightUnit}` : "",
        categoryName,
      };
    });

    // agar query empty hai to sab dikhao, warna fuzzy search lagao
    if (!query) {
      setItems(mapped);
    } else {
      const fuse = new Fuse(mapped, {
        keys: ["name", "desc", "categoryName"],
        threshold: 0.4, // 0 = exact match, 1 = bahut loose match
        ignoreLocation: true, // pure string me kahin bhi match ho jaaye
      });

      const results = fuse.search(query).map((result) => result.item);
      setItems(results);
    }
  } catch (error) {
    console.error(error);
    setItems([]);
  } finally {
    setLoading(false);
  }
};
    fetchData();
  }, [query]);

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader} style={{ marginTop: 32 }}>
        <h2 className={styles.heading}>Search Results</h2>
        <span className={styles.productCount}>{query ? `for "${query}"` : "all products"}</span>
      </div>

      <div className={styles.grid} style={{ marginTop: 0 }}>
        {loading ? (
          <div className={styles.emptyState}>
            <h3>Searching...</h3>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No Products Found</h3>
            <p>Try a different product name or category.</p>
            <button className={styles.bannerBtn} onClick={() => router.push("/product")}>
              Browse Categories
            </button>
          </div>
        ) : (
          items.map((item) => <ProductCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
