import Select from "react-select";

function FiltersAssignee({
  assigneeDisponibles,
  assigneeSeleccionado,
  setAssigneeSeleccionado,
}) {
  return (
    <>
      <label>Filtrar por Persona</label>
      <Select
        options={assigneeDisponibles}
        value={assigneeSeleccionado}
        onChange={setAssigneeSeleccionado}
        className="mb-3"
        isClearable
      />
    </>
  );
}

export default FiltersAssignee;
