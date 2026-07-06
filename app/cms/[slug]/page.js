"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API_URL from "../../../config";
import styles from "../cms.module.css";

export default function CmsSinglePage() {
  const { slug } = useParams();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPage = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/footer/slug/${slug}`
        );

        const data = await res.json();

        if (data.success) {
          setPage(data.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      getPage();
    }
  }, [slug]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!page) {
    return <h2>Page Not Found</h2>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        <h1 className={styles.title}>
          {page.title}
        </h1>

        {page.image && (
          <img
            src={page.image}
            alt={page.title}
            className={styles.image}
          />
        )}

        <div
          className={styles.content}
          dangerouslySetInnerHTML={{
            __html: page.content,
          }}
        />

      </div>
    </div>
  );
}