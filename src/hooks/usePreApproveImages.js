import { useEffect, useState } from "react";

export const usePreApproveImages = ({ page, limit, filtros, refreshKey }) => {
  const [imagenes, setImagenes] = useState([]);
  const [imagesCount, setImagesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = new URL("https://media.authormedia.org/api/approve/images");
    url.searchParams.append("page", page);
    url.searchParams.append("limit", limit);

    const labelId = filtros.labels?.[0];
    const promptId = filtros.prompts?.[0];

    if (typeof labelId === "number") {
        url.searchParams.append("id_label", labelId);
    }
    if (typeof promptId === "number") {
        url.searchParams.append("id_prompt", promptId);
    }

    setLoading(true);
    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        setImagenes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching approve images:", err);
        setLoading(false);
      });
  }, [page, limit, filtros, refreshKey]);

  useEffect(() => {
    const countUrl = new URL("https://media.authormedia.org/api/approve/images_count");

    const labelId = filtros.labels?.[0];
    const promptId = filtros.prompts?.[0];

    if (typeof labelId === "number") {
        countUrl.searchParams.append("id_label", labelId);
    }
    if (typeof promptId === "number") {
        countUrl.searchParams.append("id_prompt", promptId);
    }


    fetch(countUrl.toString())
      .then((res) => res.json())
      .then((data) => setImagesCount(data.count || 0))
      .catch((err) => {
        console.error("Error fetching approve image count:", err);
      });
  }, [filtros, refreshKey]);

  return { imagenes, imagesCount, loading };
};
