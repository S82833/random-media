import { useEffect, useState } from "react";

export function useFilteredImages({ limit, deleted, filtros, endpoint = "/api/images", after, refreshKey }) {
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const baseUrl = "https://media.authormedia.org";
    const url = new URL(baseUrl + endpoint);

    url.searchParams.append("limit", limit);
    url.searchParams.append("deleted", deleted);

    if (after) {
      url.searchParams.append("after", after);
    }

    if (filtros.labels?.length) {
      url.searchParams.append("labels", filtros.labels.join(","));
    }

    if (filtros.keywords?.length) {
      url.searchParams.append("keywords", filtros.keywords.join(","));
    }

    if (filtros.keywords_mode) {
      url.searchParams.append("keywords_mode", filtros.keywords_mode);
    }

    if (filtros.prompts?.length) {
      url.searchParams.append("prompts", filtros.prompts.join(","));
    }

    if (filtros.sort_by) {
      url.searchParams.append("sort_by", filtros.sort_by);
    }

    if (filtros.sort_direction) {
      url.searchParams.append("sort_direction", filtros.sort_direction);
    }

    setLoading(true);

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        setImagenes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener imágenes:", err);
        setLoading(false);
      });
  }, [after, limit, deleted, filtros, endpoint, refreshKey]);

  return { imagenes, loading };
}
