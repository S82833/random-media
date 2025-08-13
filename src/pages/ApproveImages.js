import { useEffect, useState, useMemo } from "react";
import { useApproveImages } from "../hooks/useApproveImages";
import FiltersLabelPrompt from "../components/filters/FiltersLabelPrompts";
import ImageTableView from "../components/ImageTableView";

function ApproveImages() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(100);
    const [accepted, setAccepted] = useState()

    const [labelsDisponibles, setLabelsDisponibles] = useState([]);
    const [labelsSeleccionados, setLabelsSeleccionados] = useState(null);

    const [promptsDisponibles, setPromptsDisponibles] = useState([]);
    const [promptsSeleccionados, setPromptsSeleccionados] = useState(null)

    const [seleccionados, setSeleccionados] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const [shadeSeleccionadoPorId, setShadeSeleccionadoPorId] = useState({});



    //cargar labels
    useEffect(() => {
        const url = new URL("https://media.authormedia.org/api/status/labels")
        url.searchParams.append("status", "preapproved")
        fetch(url.toString())
        .then(response => response.json())
        .then(labelsData => {
            const options = labelsData.map((label) => ({
                value: label.id,
                label: label.name
            }));
            setLabelsDisponibles(options);
        })
        .catch(error => {
            console.log("Error al obtener labels", error)
        })
    },[])

    //cargar prompts
    useEffect(() => {
        const url = new URL("https://media.authormedia.org/api/approve/prompts");
        if (labelsSeleccionados) {
            url.searchParams.append("labels", labelsSeleccionados.label);
        }
        url.searchParams.append("status", "preapproved")
        fetch(url.toString())
        .then(response => response.json())
        .then(promptsData => {
            const options = promptsData.map(prompt => ({
                value: prompt.id,
                label: prompt.content.length > 170
                ? prompt.content.slice(0, 170) + "..."
                : prompt.content,
            }));
            setPromptsDisponibles(options);
        })

        .catch(error => {
            console.log("Error al obtener keywords", error)
        })
    }, [labelsSeleccionados])

    //hook para obtener imagenes
    const filtros = useMemo(() => ({
        labels: labelsSeleccionados ? [labelsSeleccionados.value] : [],
        prompts: promptsSeleccionados ? [promptsSeleccionados.value] : [],
    }), [labelsSeleccionados, promptsSeleccionados]);
    
    const { imagenes, imagesCount, loading } = useApproveImages({
        page,
        limit,
        filtros,
        refreshKey,
    })

     //manejar una seleccion
    const toggleSeleccion = (id) => {
        setSeleccionados(prev =>
            prev.includes(id)
            ? prev.filter(i => i !== id)
            :[...prev, id]
        );
    }

    //manejar todas las selecciones
    const toggleSeleccionarTodos = () =>{
        const idsFiltrados = imagenes.map(img => img.id);
        const todosSeleccionados = idsFiltrados.every(id => seleccionados.includes(id));

        if (todosSeleccionados){
            setSeleccionados(prev => prev.filter(id => !idsFiltrados.includes(id)));
        } else {
            setSeleccionados(prev => [...new Set([...prev, ...idsFiltrados])])
        }
    }
        //aprobar o desaprobar
    const handleAccionSeleccionados = async (accion) => {
        const endpoint = accion === "accept" ? "/api/approve/accept" : "/api/approve/reject";
        
        // solo si estamos aprobando
        const payload = accion === "accept"
            ? {
                ids: seleccionados,
                ids_with_shade: seleccionados.filter(id => shadeSeleccionadoPorId[id])
            }
            : { ids: seleccionados };

        try {
            await fetch(`https://media.authormedia.org${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            setSeleccionados([]);
            setShadeSeleccionadoPorId({});
            setRefreshKey((prev) => prev + 1);
        } catch (err) {
            console.error("Error al enviar acción:", err);
        }
    };



    return (
        <div>
            <FiltersLabelPrompt
                labelsDisponibles={labelsDisponibles}
                labelSeleccionado={labelsSeleccionados}
                setLabelSeleccionado={setLabelsSeleccionados}
                promptsDisponibles={promptsDisponibles}
                promptSeleccionado={promptsSeleccionados}
                setPromptSeleccionado={setPromptsSeleccionados}
            />

            <select
                className="form-select mb-3"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
            >
                <option value={100}>100</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
                <option value={10000}>10000</option>
            </select>

            <div className="d-flex gap-2 mb-3">
                <button
                    className="btn btn-success"
                    disabled={seleccionados.length === 0}
                    onClick={() => handleAccionSeleccionados("accept")}
                >
                    Aprobar Seleccionados
                </button>
                <button
                    className="btn btn-danger"
                    disabled={seleccionados.length === 0}
                    onClick={() => handleAccionSeleccionados("reject")}
                >
                    Rechazar Seleccionados
                </button>
            </div>

            <div className="container">
                <div className="row align-items-end">
                    <h2 className="col-3">Media por Aprobar</h2>
                    <div className="col-9" />
                </div>
            </div>

            <div className="d-flex justify-content-between mb-3 mt-3">
                <button
                    className="btn btn-primary"
                    disabled={page === 1}
                    onClick={() => {
                        setPage(page - 1);
                        setSeleccionados([]);
                    }}
                >
                    Página anterior
                </button>
                <span className="align-self-center">Página {page}</span>
                <div className="d-flex align-items-center">
                    {loading ? (
                        <span className="me-2">Cargando...</span>
                    ) : (
                        <span className="me-2">
                            {(limit * (page - 1)) + 1}-
                            {Math.min(limit * page, imagesCount)} / {imagesCount}
                        </span>
                    )}
                </div>
                <button
                    className="btn btn-primary"
                    disabled={imagenes.length < limit}
                    onClick={() => {
                        setPage(page + 1);
                        setSeleccionados([]);
                    }}
                >
                    Página siguiente
                </button>
            </div>

            <ImageTableView
                imagenes={imagenes}
                seleccionados={seleccionados}
                toggleSeleccion={toggleSeleccion}
                toggleSeleccionarTodos={toggleSeleccionarTodos}
                extraColumns={[
                    {
                        header: (
                            <div className="d-flex align-items-center gap-2">
                                <label className="form-check-label mb-0" htmlFor="shadeHeader">
                                    Shade
                                </label>
                                <input
                                    id="shadeHeader"
                                    className="form-check-input"
                                    type="checkbox"
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        const nuevosShades = {};
                                        imagenes.forEach(img => {
                                            nuevosShades[img.id] = checked;
                                        });
                                        setShadeSeleccionadoPorId(prev => ({
                                            ...prev,
                                            ...nuevosShades,
                                        }));
                                    }}
                                    checked={imagenes.length > 0 && imagenes.every(img => shadeSeleccionadoPorId[img.id])}
                                    title="Seleccionar todos los Shade"
                                />
                            </div>
                        ),
                        render: (img) => (
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={shadeSeleccionadoPorId[img.id] || false}
                                    onChange={(e) =>
                                        setShadeSeleccionadoPorId((prev) => ({
                                            ...prev,
                                            [img.id]: e.target.checked
                                        }))
                                    }
                                />
                            </div>
                        ),
                    }
                ]}
            />
        </div>
    );

}

export default ApproveImages