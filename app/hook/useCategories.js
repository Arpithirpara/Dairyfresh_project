"use client";

import { useEffect, useState } from "react";
import API_URL from "../../config";

function toSlug(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/category/getall`, {
          cache: "no-store",
        });
        const data = await res.json();
        const items = Array.isArray(data?.data) ? data.data : [];

        if (!isMounted) return;

        setCategories(
          items
            .filter((category) => category?.isActive !== false)
            .map((category) => ({
              id: category._id,
              name: category.name,
              slug: category.slug || toSlug(category.name),
              description: category.description || "",
              image: category.image || "",
            }))
        );
      } catch (error) {
        console.error("Failed to load categories:", error);
        if (isMounted) setCategories([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, loading };
}
