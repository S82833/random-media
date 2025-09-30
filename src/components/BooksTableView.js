import { useEffect, useState } from "react";

function BooksTableView({ assigneeSeleccionado }) {
    const [libros, setLibros] = useState([]);
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [editingRowId, setEditingRowId] = useState(null);
    const [newAssignee, setNewAssignee] = useState("");


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

    const handleSave = async (id) => {
      // Actualizar estado local
      setLibros((prev) =>
        prev.map((libro) =>
          libro.id === id ? { ...libro, assignee: newAssignee } : libro
        )
      );

      // Reset edición
      setEditingRowId(null);

      try {
        const res = await fetch('https://media.authormedia.org/api/book_summary/update_assignee', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({id: editingRowId , assignee: newAssignee }),
        });

        if (!res.ok) {
          console.error("Error al actualizar en backend");
          // opcional: revertir el cambio local
        }
      } catch (err) {
        console.error("Error de red:", err);
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
              <td
                className="text-center align-middle"
                style={{
                  color:
                    row.used_variants > row.total_variants
                      ? "red"
                      : row.total_variants - row.used_variants < 50
                      ? "orange"
                      : "inherit",
                  fontWeight:
                    row.used_variants > row.total_variants ||
                    row.total_variants - row.used_variants < 50
                      ? "bold"
                      : "normal",
                }}
              >
                {row.used_variants}
              </td>
              <td className="text-center align-middle">
                {row.last_created_at
                  ? new Date(row.last_created_at).toLocaleDateString()
                  : "—"}
              </td>
              <td
                className="text-center align-middle"
                onDoubleClick={() => {
                  setEditingRowId(row.id);
                  setNewAssignee(row.assignee || "");
                }}
              >
                {editingRowId === row.id ? (
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    onBlur={() => handleSave(row.id)} // al salir del input
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave(row.id);
                    }}
                    autoFocus
                  />
                ) : (
                  row.assignee
                )}
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BooksTableView;
