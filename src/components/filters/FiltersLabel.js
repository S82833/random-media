import Select from "react-select";

function FiltersLabel({
  labelsDisponibles,
  labelSeleccionado,
  setLabelSeleccionado,
}) {
  return (
    <>
      <label>Filtrar por Label</label>
      <Select
        options={labelsDisponibles}
        value={labelSeleccionado}
        onChange={setLabelSeleccionado}
        className="mb-3"
        isClearable
      />
    </>
  );
}

export default FiltersLabel;
