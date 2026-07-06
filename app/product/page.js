"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./allproduct.module.css";
import API_URL from "../../config";
import ProductCard from "../../components/ProductCard";
import { useFilter, PRICE_FILTERS } from "../hook/useFilter";

const normalizeSlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

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

        const nextCategories = Array.isArray(categoriesJson?.data) ? categoriesJson.data : [];
        const nextProducts = Array.isArray(productsJson?.data) ? productsJson.data : [];

        setCategories(nextCategories);
        setProducts(
          nextProducts.map((product) => {
            const categoryId = product.pcategory?._id || product.categoryId?._id || product.categoryId || "";
            const category = nextCategories.find((item) => String(item._id) === String(categoryId));

            return {
              id: product._id,
              name: product.pname,
              desc: product.pdescription ? product.pdescription.replace(/<[^>]*>/g, "").trim() : "",
              image: product.p_img || null,
              price: product.p_price,
              size: product.pweightUnit ? `${product.pweight} ${product.pweightUnit}` : "",
              categoryName: category?.name || product.pcategory?.name || product.pcategory || "",
              categorySlug: normalizeSlug(category?.slug || category?.name || product.pcategory?.name || product.pcategory || ""),
            };
          })
        );
      } catch (error) {
        console.error("Product catalog fetch failed:", error);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeCategory === "all") return true;
      return product.categorySlug === activeCategory;
    });
  }, [products, activeCategory]);

  const {
    search,
    setSearch,
    priceFilter,
    setPriceFilter,
    sort,
    setSort,
    currentPage,
    setCurrentPage,
    filtered,
    paginated,
    totalPages,
  } = useFilter(visibleProducts);

  const categoryChips = [
    { value: "all", label: "All Products" },
    ...categories.map((category) => ({
      value: normalizeSlug(category.slug || category.name),
      label: category.name,
    })),
  ];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Dairy catalog</p>
          <h1>Fresh products, all in one place</h1>
          <p className={styles.heroText}>
            Browse milk, protein, chocolates, cold drinks, biscuits, tea, and more with a proper category filter.
          </p>
          <div className={styles.heroActions}>
            <Link href="/" className={styles.primaryBtn}>Home</Link>
            <Link href="/search" className={styles.secondaryBtn}>Search Products</Link>
          </div>
        </div>
      </section>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <i className="ti ti-search" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.chipGroup}>
          {PRICE_FILTERS.map((item, index) => (
            <button
              key={item.label}
              type="button"
              className={`${styles.chip} ${priceFilter === index ? styles.chipActive : ""}`}
              onClick={() => setPriceFilter(index)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <select className={styles.sortSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">Sort: Default</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="name_asc">Name: A → Z</option>
          <option value="name_desc">Name: Z → A</option>
        </select>
      </div>

      <div className={styles.categoryBar}>
        {categoryChips.map((category) => (
          <button
            key={category.value}
            type="button"
            className={`${styles.categoryChip} ${activeCategory === category.value ? styles.categoryChipActive : ""}`}
            onClick={() => setActiveCategory(category.value)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className={styles.sectionHeader}>
        <h2>{activeCategory === "all" ? "All Products" : categoryChips.find((item) => item.value === activeCategory)?.label}</h2>
        <span>{filtered.length} items</span>
      </div>

      <div className={styles.grid}>
        {loading ? (
          <div className={styles.emptyState}>
            <h3>Loading products...</h3>
          </div>
        ) : paginated.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No Products Found</h3>
            <p>Try another category or search term.</p>
          </div>
        ) : (
          paginated.map((item) => <ProductCard key={item.id} item={item} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
