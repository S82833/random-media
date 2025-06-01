import Select from "react-select";

function FiltersLabelPrompt({
  labelsDisponibles,
  labelSeleccionado,
  setLabelSeleccionado,
  promptsDisponibles,
  promptSeleccionado,
  setPromptSeleccionado
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

      <label>Filtrar por Prompt</label>
      <Select
        options={promptsDisponibles}
        value={promptSeleccionado}
        onChange={setPromptSeleccionado}
        className="mb-3"
        isClearable
      />
    </>
  );
}

export default FiltersLabelPrompt;
