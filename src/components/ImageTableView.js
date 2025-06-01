function ImageTableView({ imagenes, seleccionados, toggleSeleccion, toggleSeleccionarTodos }) {
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
                  imagenes.every((img) => seleccionados.includes(img.id))
                }
                onChange={toggleSeleccionarTodos}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {imagenes.map((img) => (
            <tr key={img.id}>
              <td><a href={img.image_url}>{img.image_url}</a></td>
              <td><img src={img.image_url} alt={img.label} width="100" /></td>
              <td className="text-center align-middle">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={seleccionados.includes(img.id)}
                    onChange={() => toggleSeleccion(img.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ImageTableView;
