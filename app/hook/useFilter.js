import { useState, useMemo } from "react";

export const PRICE_FILTERS = [
  { label: "All",         min: 0,   max: Infinity },
  { label: "Under ₹50",   min: 0,   max: 50       },
  { label: "₹50 – ₹100",  min: 50,  max: 100      },
  { label: "₹100 – ₹200", min: 100, max: 200      },
  { label: "Above ₹200",  min: 200, max: Infinity  },
];

const ITEMS_PER_PAGE = 8;

export function useFilter(items = []) {
  const [priceFilter, setPriceFilter] = useState(0);
  const [sort, setSort]               = useState("default");
  const [search, setSearch]           = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const { min, max } = PRICE_FILTERS[priceFilter];

    let list = items.filter((item) => {
      const inPrice  = item.price >= min && item.price <= max;
      const inSearch = item.name?.toLowerCase().includes(search.toLowerCase());
      return inPrice && inSearch;
    });

    if (sort === "price_asc")  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name_asc")   list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "name_desc")  list = [...list].sort((a, b) => b.name.localeCompare(a.name));

    return list;
  }, [items, priceFilter, sort, search]);

  useMemo(() => {
    setCurrentPage(1);
  }, [priceFilter, sort, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
     currentPage      * ITEMS_PER_PAGE
  );

  return {
    search, setSearch,
    priceFilter, setPriceFilter,
    sort, setSort,
    currentPage, setCurrentPage,
    filtered,
    paginated,
    totalPages,
  };
}