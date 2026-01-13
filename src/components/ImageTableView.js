import { useState } from "react";
import ZoomModal from "./ZoomModal";

function ImageTableView({
  imagenes,
  seleccionados,
  toggleSeleccion,
  toggleSeleccionarTodos,
  extraColumns = [],
  onSort,
  sortBy,
  sortDirection
}) {
  const [imagenModal, setImagenModal] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const cerrarModal = () => {
    setImagenModal(null);
    setZoomed(false); // reset zoom
  };

  const toggleZoom = (e) => {
    e.stopPropagation(); // no cerrar el modal
    setZoomed((prev) => !prev);
  };

  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Media URL</th>
            <th>Media</th>
            <th className="d-flex align-items-center justify-content-between">
              <span>Seleccionar</span>
              <input
                className="form-check-input"
                type="checkbox"
                checked={
                  imagenes.length > 0 &&
                  imagenes.every((img) => seleccionados.includes(img.image_id))
                }
                onChange={toggleSeleccionarTodos}
              />
            </th>
            {extraColumns.map((col, index) => (
              <th
                key={`extra-th-${index}`}
                onClick={() => col.sortable && onSort?.(col.key)}
                style={{ cursor: col.sortable ? "pointer" : "default" }}
                className="text-center align-middle"
              >
                {col.header}
                {col.sortable && sortBy === col.key && (
                  <span className="ms-1">
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {imagenes.map((img) => (
            <tr key={img.image_id}>
              <td><a href={img.image_url}>{img.image_url}</a></td>
              <td>
                <img
                  loading="lazy"
                  src={img.image_url}
                  alt={img.label}
                  width="100"
                  style={{ cursor: "pointer" }}
                  onClick={() => setImagenModal(img.image_url)}
                />
              </td>
              <td className="text-center align-middle">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={seleccionados.includes(img.image_id)}
                    onChange={() => toggleSeleccion(img.image_id)}
                  />
                </div>
              </td>
              {extraColumns.map((col, index) => (
                <td className="text-center align-middle" key={`extra-td-${index}`}>{col.render(img)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {imagenModal && (
        <ZoomModal imageUrl={imagenModal} onClose={cerrarModal} />
      )}
    </div>
  );
}

export default ImageTableView;
