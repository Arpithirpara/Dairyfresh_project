"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import styles from "./details.module.css";
import { addGuestCartItem } from "../../lib/cartStorage";

const API = "http://localhost:3002";

function formatCurrency(value) {
  if (value === undefined || value === null || value === "") return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImg, setActiveImg] = useState(0);

  // Track the selected variant by its _id (or label fallback), NOT by array index.
  // null = no variant selected yet → show base product price/stock.
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const [adding, setAdding] = useState(false);
  const [cartMsg, setCartMsg] = useState(null); // { type: "ok"|"err", text }

  // ── Load product + related ─────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setActiveImg(0);
      setSelectedVariantId(null); // always start with no variant selected
      setCartMsg(null);

      try {
        const res = await fetch(`${API}/api/product/${id}`, { cache: "no-store" });
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const json = await res.json();
        const data = json?.data ?? null;
        if (!data) {
          setNotFound(true);
          return;
        }
        setProduct(data);

        // Fetch all products, then filter to same category (excluding this one)
        try {
          const allRes = await fetch(`${API}/api/product/getall`, { cache: "no-store" });
          const allJson = await allRes.json();
          const allProducts = allJson?.data ?? allJson ?? [];
          const sameCategory = (Array.isArray(allProducts) ? allProducts : [])
            .filter(
              (p) =>
                p._id !== data._id &&
                p.pcategory &&
                data.pcategory &&
                ((p.pcategory?.name || p.pcategory || "").toString().toLowerCase() ===
                  (data.pcategory?.name || data.pcategory || "").toString().toLowerCase() ||
                  String(p.pcategory?._id || p.pcategory) ===
                    String(data.pcategory?._id || data.pcategory))
            )
            .slice(0, 8);
          setRelated(sameCategory);
        } catch (err) {
          console.error("Failed to fetch related products:", err);
          setRelated([]);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ── Loading / not found ─────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Loading product…</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className={styles.notFoundScreen}>
        <p>Product not found.</p>
        <Link href="/products" className={styles.backLink}>← Back to products</Link>
      </div>
    );
  }

  const images = product.p_images?.length
    ? product.p_images
    : product.p_img
    ? [product.p_img]
    : [];

  const variants = product.variations || [];
  const hasVariants = variants.length > 0;

  // Give every variant a stable key, even if backend didn't send _id
  const variantKey = (v, i) => v._id || v.label || String(i);

  // Find the actual selected variant object (or undefined if none selected)
  const selectedVariant = hasVariants
    ? variants.find((v, i) => variantKey(v, i) === selectedVariantId)
    : undefined;

  const basePrice = selectedVariant
    ? Number(selectedVariant.price ?? product.p_price)
    : Number(product.p_price);

  const discountedPrice =
    product.pdiscount > 0 ? basePrice - (basePrice * product.pdiscount) / 100 : null;

  const inStock = selectedVariant
    ? Number(selectedVariant.stock ?? 0) > 0
    : Number(product.pstock) > 0;

  // ── Add to cart ──────────────────────────────────────────────
  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      addGuestCartItem({
        productId: product._id,
        name: product.pname,
        image: images[0] || "",
        price: discountedPrice ?? basePrice,
        qty: 1,
        variation: selectedVariant?.label || "",
      });
      setCartMsg({ type: "ok", text: "Added to guest cart." });
      toast.success("Added to cart");
      return;
    }

    const finalPrice = discountedPrice ?? basePrice;

    setAdding(true);
    setCartMsg(null);
    try {
      const res = await fetch(`${API}/api/cart/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          itemname: product.pname,
          image: images[0] || "",
          itemPrice: finalPrice,
          quantity: 1,
          ...(selectedVariant ? { variation: selectedVariant.label } : {}),
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      setCartMsg({ type: "ok", text: "Added to cart." });
      toast.success("Added to cart");
    } catch (err) {
      console.error(err);
      setCartMsg({ type: "err", text: "Couldn't add to cart. Please try again." });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Breadcrumb bar ── */}
      <div className={styles.breadcrumbBar}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span className={styles.crumbSep}>/</span>
          <Link href="/products">{product.pcategory?.name || product.pcategory || "Products"}</Link>
          <span className={styles.crumbSep}>/</span>
          <span className={styles.crumbCurrent}>{product.pname}</span>
        </div>
      </div>

      <div className={styles.content}>
        <button type="button" onClick={() => router.back()} className={styles.backLink}>
          ← Back to collection
        </button>

        <div className={styles.grid}>
          {/* ── Gallery: 2x2 style grid ── */}
          <div className={styles.gallery}>
            <div className={styles.galleryGrid}>
              {images.length > 0 ? (
                images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.galleryCell} ${
                      images.length === 1 ? styles.galleryCellSingle : ""
                    } ${i === activeImg ? styles.galleryCellActive : ""}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`${product.pname} ${i + 1}`} className={styles.galleryImg} />
                    {i === 0 && <span className={styles.featuredTag}>Featured</span>}
                  </button>
                ))
              ) : (
                <div className={styles.emptyImage}>No image available</div>
              )}
            </div>
          </div>

          {/* ── Info panel ── */}
          <div className={styles.info}>
            <div className={styles.infoTopRow}>
              <div className={styles.ratingRow}>
                <span className={styles.stars}>★★★★★</span>
                <span className={styles.ratingCount}>(18)</span>
              </div>
              <button type="button" className={styles.shareBtn}>Share ↗</button>
            </div>

            <h1 className={styles.title}>{product.pname}</h1>

            <div className={styles.priceRow}>
              {discountedPrice !== null && (
                <span className={styles.comparePrice}>{formatCurrency(basePrice)}</span>
              )}
              <span className={styles.price}>{formatCurrency(discountedPrice ?? basePrice)}</span>
            </div>

            <div className={styles.divider} />

            <div className={styles.stockRow}>
              <span className={`${styles.dot} ${!inStock ? styles.dotOut : ""}`} />
              {inStock ? "In stock" : "Out of stock"}
            </div>

            {hasVariants && (
              <div className={styles.variantSection}>
                <div className={styles.variantLabel}>Choose an option</div>
                <div className={styles.variantOptions}>
                  {variants.map((v, i) => {
                    const key = variantKey(v, i);
                    const isActive = key === selectedVariantId;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`${styles.variantChip} ${
                          isActive ? styles.variantChipActive : ""
                        }`}
                        onClick={() => setSelectedVariantId(key)}
                      >
                        <span
                          className={`${styles.variantBadge} ${
                            isActive ? styles.variantBadgeActive : ""
                          }`}
                        >
                          {v.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={adding || !inStock}
            >
              {!inStock ? "Out of stock" : adding ? "Adding…" : "Add to Cart"}
            </button>

            {cartMsg && (
              <div
                className={`${styles.cartFeedback} ${
                  cartMsg.type === "ok" ? styles.cartFeedbackOk : styles.cartFeedbackErr
                }`}
              >
                {cartMsg.text}
              </div>
            )}

            <ul className={styles.perks}>
              <li>🚚 Same day shipping on orders before 5 PM</li>
              <li>🛡️ Quality checked &amp; freshness guaranteed</li>
              <li>↩️ Easy returns within 24 hours</li>
            </ul>
          </div>
        </div>

        {/* ── Description ── */}
        <div className={styles.lowerGrid}>
          <div className={styles.descColumn}>
            {(product.pshortdescription || product.pdescription) && (
              <section className={styles.descSection}>
                <h2 className={styles.sectionHeading}>Product Description</h2>
                {product.psku && <div className={styles.skuTag}>SKU {product.psku}</div>}
                <p className={styles.descText}>
                  {product.pshortdescription || product.pdescription}
                </p>
              </section>
            )}
          </div>

          <div className={styles.tableColumn}>
            <section className={styles.infoTable}>
              <h2 className={styles.sectionHeading}>Product Information</h2>
              <div className={styles.metaRow}>
                <span>Category</span>
                <b>{product.pcategory?.name || product.pcategory || "—"}</b>
              </div>
              <div className={styles.metaRow}>
                <span>Weight</span>
                <b>{product.pweight ? `${product.pweight} ${product.pweightUnit || ""}` : "—"}</b>
              </div>
              <div className={styles.metaRow}>
                <span>Stock</span>
                <b>{inStock ? "In Stock" : "Out of Stock"}</b>
              </div>
            </section>
          </div>
        </div>

        {/* ── Related products ── */}
        <section className={styles.relatedSection}>
          <div className={styles.relatedHead}>
            <h2 className={styles.relatedTitle}>You may also like</h2>
            <span className={styles.relatedSub}>Explore similar products curated for you.</span>
          </div>

          {related.length > 0 ? (
            <div className={styles.relatedRow}>
              {related.map((p) => {
                const rPrice = Number(p.p_price);
                const rDiscounted =
                  p.pdiscount > 0 ? rPrice - (rPrice * p.pdiscount) / 100 : null;
                const rImg = p.p_images?.[0] || p.p_img || "";

                return (
                  <Link
                    key={p._id}
                    href={`/Details/${p._id}`}
                    className={styles.relatedCard}
                  >
                    <div className={styles.relatedImgWrap}>
                      {rImg && (
                        <img src={rImg} alt={p.pname} className={styles.relatedImg} />
                      )}
                    </div>
                    <div className={styles.relatedBody}>
                      <div className={styles.relatedName}>{p.pname}</div>
                      <div className={styles.relatedPriceRow}>
                        <span className={styles.relatedPrice}>
                          {formatCurrency(rDiscounted ?? rPrice)}
                        </span>
                        {rDiscounted !== null && (
                          <span className={styles.relatedCompare}>
                            {formatCurrency(rPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className={styles.relatedEmpty}>No related products found.</div>
          )}
        </section>
      </div>
    </div>
  );
}
