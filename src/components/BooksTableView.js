import { useEffect, useState } from "react";

function BooksTableView({ assigneeSeleccionado }) {
    const [libros, setLibros] = useState([]);
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    const url = new URL("https://media.authormedia.org/api/book_summary");
    if (assigneeSeleccionado?.value) {
      url.searchParams.set("assignee", assigneeSeleccionado.value);
    }

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLibros(data);
        } else {
          console.error("Data inesperada:", data);
          setLibros([]);
        }
      })
      .catch((err) => {
        console.error("Error al obtener libros:", err);
        setLibros([]);
      });
  }, [assigneeSeleccionado]);

    const handleSort = (campo) => {
        if (sortBy === campo) {
            // Si ya está ordenando por ese campo, invierte la dirección
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(campo);
            setSortDirection("asc");
        }
    };

    const librosOrdenados = [...libros].sort((a, b) => {
        if (!sortBy) return 0;

        const aVal = a[sortBy];
        const bVal = b[sortBy];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        // Si es string (ej. label), usar localeCompare
        if (typeof aVal === "string" && typeof bVal === "string") {
            return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        // Si es fecha (última creación)
        if (sortBy === "last_created_at") {
            return sortDirection === "asc"
            ? new Date(aVal) - new Date(bVal)
            : new Date(bVal) - new Date(aVal);
        }

        // Para números (base_images, used_variants, etc.)
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });




  return (
    <div className="table-responsive mt-4">
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th onClick={() => handleSort("label")} style={{ cursor: "pointer" }}>
            Label {sortBy === "label" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("base_images")} style={{ cursor: "pointer" }}>
            Imágenes Base {sortBy === "base_images" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("total_variants")} style={{ cursor: "pointer" }}>
            Variaciones {sortBy === "total_variants" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("used_variants")} style={{ cursor: "pointer" }}>
            Usadas {sortBy === "used_variants" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("last_created_at")} style={{ cursor: "pointer" }}>
            Última Creación {sortBy === "last_created_at" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th className="text-center">Assignee</th>
          </tr>
        </thead>
        <tbody>
          {librosOrdenados.map((row) => (
            <tr key={row.id}>
              <td>{row.label}</td>
              <td className="text-center align-middle">{row.base_images}</td>
              <td className="text-center align-middle">{row.total_variants}</td>
              <td className="text-center align-middle">{row.used_variants}</td>
              <td className="text-center align-middle">
                {row.last_created_at
                  ? new Date(row.last_created_at).toLocaleDateString()
                  : "—"}
              </td>
              <td className="text-center align-middle">{row.assignee}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BooksTableView;
