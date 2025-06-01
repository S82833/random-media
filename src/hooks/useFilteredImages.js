import { useEffect, useState } from "react";

export function useFilteredImages({ page, limit, deleted, filtros, endpoint = "/api/images", refreshKey}) {
  const [imagenes, setImagenes] = useState([]);
  const [imagesCount, setImagesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const baseUrl = "https://media.authormedia.org";

    const url = new URL(baseUrl + endpoint);
    const url_count = new URL(baseUrl + endpoint + "_count");

    url.searchParams.append("page", page);
    url.searchParams.append("limit", limit);
    url.searchParams.append("deleted", deleted);
    url_count.searchParams.append("deleted", deleted);

    if (filtros.labels?.length) {
      const joined = filtros.labels.join(",");
      url.searchParams.append("labels", joined);
      url_count.searchParams.append("labels", joined);
    }

    if (filtros.keywords?.length) {
      const joined = filtros.keywords.join(",");
      url.searchParams.append("keywords", joined);
      url_count.searchParams.append("keywords", joined);
    }

    if (filtros.keywords_mode) {
      url.searchParams.append("keywords_mode", filtros.keywords_mode);
      url_count.searchParams.append("keywords_mode", filtros.keywords_mode);
    }

    if (filtros.prompts?.length) {
      const joined = filtros.prompts.join(",");
      url.searchParams.append("prompts", joined);
      url_count.searchParams.append("prompts", joined);
    }

    setLoading(true);

    Promise.all([
      fetch(url.toString()).then((res) => res.json()),
      fetch(url_count.toString()).then((res) => res.json())
    ])
      .then(([data, count]) => {
        setImagenes(data);
        setImagesCount(count.count);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener imágenes:", err);
        setLoading(false);
      });
  }, [page, limit, deleted, filtros, endpoint, refreshKey]);

  return { imagenes, imagesCount, loading };
}
