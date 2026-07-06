import { useEffect, useState } from "react";
import API_URL from "../../config";

export function useCategory(categoryName) {
  const [items, setItems] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    setFetchLoading(true);

    fetch(`${API_URL}/api/product/getall`)
      .then((res) => res.json())
      .then((data) => {

        console.log("All Products:", data.data);

        const filtered = data.data
          .filter((p) => {
            const categoryNameFromRef = p.pcategory?.name || "";
            const categoryId = p.pcategory?._id || p.pcategory || "";
            const pageCategory = categoryName.trim().toLowerCase();
            const dbCategoryName = (p.pcategory?.name || p.pcategory || "")
              .toString()
              .trim()
              .toLowerCase();

            console.log(
              "DB Category:",
              p.pcategory
            );

            console.log(
              "Page Category:",
              categoryName
            );

            return (
              dbCategoryName === pageCategory ||
              categoryNameFromRef.toLowerCase() === pageCategory ||
              String(categoryId).toLowerCase() === pageCategory
            );

          })
          .map((p) => ({
            id: p._id,
            name: p.pname,
            desc: p.pdescription
              ? p.pdescription
                  .replace(/<[^>]*>/g, "")
                  .trim()
              : "",

            image: p.p_img || null,

            price: p.p_price,

            size: p.pweightUnit
              ? `${p.pweight} ${p.pweightUnit}`
              : "",
          }));

        console.log(
          "Filtered:",
          filtered
        );

        setItems(filtered);
      })

      .catch((err) =>
        console.error(
          "Fetch error:",
          err
        )
      )

      .finally(() =>
        setFetchLoading(false)
      );

  }, [categoryName]);

  return {
    items,
    fetchLoading,
  };
}
