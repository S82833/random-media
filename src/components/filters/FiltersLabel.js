import Select from "react-select";

function FiltersLabel({ labelsDisponibles, labelsSeleccionados, setLabelsSeleccionados }) {
  return (
    <>
      <label>Filtrar por Labels</label>
      <Select isMulti options={labelsDisponibles} value={labelsSeleccionados} onChange={setLabelsSeleccionados} className="mb-3" />
    </>
  );
}

export default FiltersLabel;
