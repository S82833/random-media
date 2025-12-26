import { useEffect, useState } from "react";

function BooksTableView({ assigneeSeleccionado }) {
  const [libros, setLibros] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [editingRowId, setEditingRowId] = useState(null);
  const [newAssignee, setNewAssignee] = useState("");

  // NEW: deliverables edit state
  const [editingDeliverablesRowId, setEditingDeliverablesRowId] = useState(null);
  const [newDeliverables, setNewDeliverables] = useState("");

  useEffect(() => {
    const url = new URL("https://media.authormedia.org/api/book_summary");
    if (assigneeSeleccionado?.value) {
      url.searchParams.set("assignee", assigneeSeleccionado.value);
    }

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLibros(data);
        else {
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
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(campo);
      setSortDirection("asc");
    }
  };

  const handleSaveAssignee = async (id) => {
    setLibros((prev) =>
      prev.map((libro) => (libro.id === id ? { ...libro, assignee: newAssignee } : libro))
    );
    setEditingRowId(null);

    try {
      const res = await fetch("https://media.authormedia.org/api/book_summary/update_assignee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, assignee: newAssignee }),
      });

      if (!res.ok) console.error("Error al actualizar assignee en backend");
    } catch (err) {
      console.error("Error de red:", err);
    }
  };

  // NEW: save deliverables
  const handleSaveDeliverables = async (id) => {
    const parsed = parseInt(newDeliverables, 10);

    // opcional: si no es número válido, cancela edición sin guardar
    if (Number.isNaN(parsed)) {
      setEditingDeliverablesRowId(null);
      return;
    }

    // optimista local
    setLibros((prev) =>
      prev.map((libro) => (libro.id === id ? { ...libro, deliverables: parsed } : libro))
    );
    setEditingDeliverablesRowId(null);

    try {
      const res = await fetch(
        "https://media.authormedia.org/api/book_summary/update_deliverables",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, deliverables: parsed }),
        }
      );

      if (!res.ok) console.error("Error al actualizar deliverables en backend");
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

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (sortBy === "last_created_at") {
      return sortDirection === "asc"
        ? new Date(aVal) - new Date(bVal)
        : new Date(bVal) - new Date(aVal);
    }

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
              Imágenes Base{" "}
              {sortBy === "base_images" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("total_variants")} style={{ cursor: "pointer" }}>
              Variaciones{" "}
              {sortBy === "total_variants" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("used_variants")} style={{ cursor: "pointer" }}>
              Usadas{" "}
              {sortBy === "used_variants" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("last_created_at")} style={{ cursor: "pointer" }}>
              Última Creación{" "}
              {sortBy === "last_created_at" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th className="text-center">Assignee</th>
            <th onClick={() => handleSort("images_zero_uses")} style={{ cursor: "pointer" }}>
              Images Without Use{" "}
              {sortBy === "images_zero_uses" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th className="text-center">Deliverables</th>
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
                    row.view_count > row.total_variants
                      ? "red"
                      : row.total_variants - row.view_count < 300
                        ? "orange"
                        : "inherit",
                  fontWeight:
                    row.view_count > row.total_variants ||
                      row.total_variants - row.view_count < 300
                      ? "bold"
                      : "normal",
                }}
              >
                {row.view_count}
              </td>

              <td className="text-center align-middle">
                {row.last_created_at ? new Date(row.last_created_at).toLocaleDateString() : "—"}
              </td>

              {/* Assignee editable */}
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
                    onBlur={() => handleSaveAssignee(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveAssignee(row.id);
                      if (e.key === "Escape") setEditingRowId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  row.assignee
                )}
              </td>

              <td className="text-center align-middle">{row.images_zero_uses}</td>

              {/* NEW: Deliverables editable */}
              <td
                className="text-center align-middle"
                onDoubleClick={() => {
                  setEditingDeliverablesRowId(row.id);
                  setNewDeliverables(
                    row.deliverables === null || row.deliverables === undefined
                      ? ""
                      : String(row.deliverables)
                  );
                }}
              >
                {editingDeliverablesRowId === row.id ? (
                  <input
                    type="number"
                    value={newDeliverables}
                    onChange={(e) => setNewDeliverables(e.target.value)}
                    onBlur={() => handleSaveDeliverables(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveDeliverables(row.id);
                      if (e.key === "Escape") setEditingDeliverablesRowId(null);
                    }}
                    autoFocus
                    style={{ width: 90 }}
                  />
                ) : (
                  row.deliverables ?? ""
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
