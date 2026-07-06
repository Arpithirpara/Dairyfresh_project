"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../../styles/shop-common.module.css";
import { useFilter, PRICE_FILTERS } from "../../hook/useFilter";
import API_URL from "../../../config";
import ProductCard from "../../../components/ProductCard";

function toDisplayName(slug = "") {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function CategoryPage() {
  const { slug } = useParams();
  const [banner, setBanner] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState(toDisplayName(slug));

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
  } = useFilter(items);

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

        const matchedCategory = categories.find((category) => {
          const categorySlug = (category.slug || "")
            .trim()
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          return categorySlug === slug;
        });

        const categoryName = matchedCategory?.name || toDisplayName(slug);
        setCategoryTitle(categoryName);
        setBanner(matchedCategory || null);

        const filteredProducts = products
          .filter((product) => {
            const productCategoryId = product.pcategory?._id || product.categoryId?._id || product.categoryId || "";
            const productCategoryName = (product.pcategory?.name || product.pcategory || "").toString().trim().toLowerCase();
            return (
              (matchedCategory?._id && String(productCategoryId) === String(matchedCategory._id)) ||
              productCategoryName === categoryName.trim().toLowerCase()
            );
          })
          .map((product) => ({
            id: product._id,
            name: product.pname,
            desc: product.pdescription ? product.pdescription.replace(/<[^>]*>/g, "").trim() : "",
            image: product.p_img || null,
            price: product.p_price,
            size: product.pweightUnit ? `${product.pweight} ${product.pweightUnit}` : "",
          }));

        setItems(filteredProducts);
      } catch (error) {
        console.error(error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  if (loading) {
    return <div className={styles.container}><div style={{ padding: 24 }}>Loading...</div></div>;
  }

  return (
    <div
      className={styles.container}
      style={{
        "--accent": "#0284c7",
        "--accent-dark": "#075985",
        "--accent-darker": "#0c4a6e",
        "--accent-light": "#f0f9ff",
        "--accent-tint": "#e0f2fe",
        "--accent-border": "rgba(56, 189, 248, 0.18)",
        "--accent-border-strong": "rgba(56, 189, 248, 0.28)",
        "--accent-shadow": "rgba(7, 89, 133, 0.08)",
        "--accent-shadow-strong": "rgba(7, 89, 133, 0.14)",
        "--gradient-start": "#0ea5e9",
        "--gradient-end": "#38bdf8",
        "--bg-top": "#f7fdff",
        "--bg-bottom": "#f0f9ff",
        "--muted-text": "#4f7080",
      }}
    >
      <section className={styles.banner}>
        <img
          src={banner?.image || "/produtc_img/cold_drink/benner.jpg"}
          alt={categoryTitle}
          className={styles.bannerImg}
        />
        <div className={styles.bannerContent}>
          <h1>{categoryTitle}</h1>
          <p>Browse products from this category.</p>
        </div>
      </section>

      <div className={styles.sectionHeader}>
        <h2 className={styles.heading}>{categoryTitle}</h2>
        <span className={styles.productCount}>{filtered.length} products</span>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <i className="ti ti-search" />
          <input
            type="text"
            placeholder={`Search ${categoryTitle.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.chipGroup}>
          <span className={styles.filterLabel}>Price:</span>
          {PRICE_FILTERS.map((f, i) => (
            <button
              key={i}
              className={`${styles.filterChip} ${priceFilter === i ? styles.filterChipActive : ""}`}
              onClick={() => setPriceFilter(i)}
            >
              {f.label}
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

      <div className={styles.grid}>
        {paginated.length === 0 ? (
          <div className={styles.emptyState}>
            <span>🥛</span>
            <h3>No Products Found</h3>
            <p>Try a different filter or search term.</p>
          </div>
        ) : (
          paginated.map((item) => <ProductCard key={item.id} item={item} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.navBtn} onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
            <i className="ti ti-chevron-left" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.pageBtn} ${currentPage === page ? styles.pageActive : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button className={styles.navBtn} onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
            <i className="ti ti-chevron-right" />
          </button>
        </div>
      )}
    </div>
  );
}
