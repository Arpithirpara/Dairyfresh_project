// components/FilterBar.jsx
import styles from "./FilterBar.module.css";

export default function FilterBar({
  search, setSearch,
  priceFilter, setPriceFilter,
  sort, setSort,
  PRICE_FILTERS,
  resultCount,
  accentColor = "brown",  // "brown" | "green" | "blue"
}) {
  return (
    <div className={`${styles.filterBar} ${styles[accentColor]}`}>

      {/* SEARCH */}
      <div className={styles.searchBox}>
        <i className="ti ti-search" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")}>
            <i className="ti ti-x" />
          </button>
        )}
      </div>

      {/* PRICE CHIPS */}
      <div className={styles.chipGroup}>
        <span className={styles.filterLabel}>Price:</span>
        {PRICE_FILTERS.map((f, i) => (
          <button
            key={i}
            className={`${styles.chip} ${
              priceFilter === i ? styles.chipActive : ""
            }`}
            onClick={() => setPriceFilter(i)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div className={styles.right}>
        <span className={styles.resultCount}>{resultCount} products</span>
        <select
          className={styles.sortSelect}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">Sort: Default</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="name_asc">Name: A → Z</option>
          <option value="name_desc">Name: Z → A</option>
        </select>
      </div>

    </div>
  );
}