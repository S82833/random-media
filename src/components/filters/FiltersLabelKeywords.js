import Select from "react-select";

function FiltersLabelKeywords({ labelsDisponibles, labelsSeleccionados, setLabelsSeleccionados, keywordsDisponibles, keywordsSeleccionados, setKeywordsSeleccionados, keywordsMode, setKeywordsMode }) {
  return (
    <>
      <label>Filtrar por Labels</label>
      <Select isMulti options={labelsDisponibles} value={labelsSeleccionados} onChange={setLabelsSeleccionados} className="mb-3" />

      <div className="row">
        <div className="col-auto">
          <Select options={[{ label: "and", value: "and" }, { label: "or", value: "or" }]} value={keywordsMode} onChange={setKeywordsMode} />
        </div>
        <div className="col">
          <Select isMulti options={keywordsDisponibles} value={keywordsSeleccionados} onChange={setKeywordsSeleccionados} className="mb-3" />
        </div>
      </div>
    </>
  );
}

export default FiltersLabelKeywords;
