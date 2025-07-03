import { useEffect, useState } from "react";

export function useImageCount({ filtros, deleted }) {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = new URL("https://media.authormedia.org/api/image_count");
    url.searchParams.append("deleted", deleted);

    if (filtros.labels?.length) {
      url.searchParams.append("labels", filtros.labels.join(","));
    }

    if (filtros.keywords?.length) {
      url.searchParams.append("keywords", filtros.keywords.join(","));
    }

    if (filtros.keywords_mode) {
      url.searchParams.append("keywords_mode", filtros.keywords_mode);
    }

    setLoading(true);

    fetch(url.toString())
      .then(res => res.json())
      .then(data => {
        setCount(data.count);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al obtener count de imágenes:", err);
        setLoading(false);
      });
  }, [filtros, deleted]);

  return { count, loading };
}
