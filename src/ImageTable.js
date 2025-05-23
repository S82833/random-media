import { useEffect, useState } from "react";
import Select from "react-select";

function ImageTable() {
    const [imagenes, setImagenes] = useState([]);
    const [labelsDisponibles, setLabelsDisponibles] = useState([]);
    const [labelsSeleccionados, setLabelsSeleccionados] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const [page, setPage] = useState(1);
    const [limitSeleccionado, setLimitSeleccionado] = useState(100);
    const [deleted, setDeleted] = useState(false)
    const [imagesCount, setImagesCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [keywordsDisponibles, setKeywordsDisponibles] = useState([]);
    const [keywordsSeleccionados, setKeywordsSeleccionados] = useState([])
    const [keywordsMode, setKeywordsMode] = useState({ label: "or", value: "or" });


    function cargarImagenes() {
        setLoading(true);

        const url = new URL("https://media.authormedia.org/api/images");
        const url_count = new URL("https://media.authormedia.org/api/images_count");

        url.searchParams.append("page", page);
        url.searchParams.append("limit", limitSeleccionado);
        url.searchParams.append("deleted", deleted);
        url_count.searchParams.append("deleted", deleted);

        if (keywordsMode?.value && keywordsSeleccionados.length > 0) {
        url.searchParams.append("keywords_mode", keywordsMode.value);
        url_count.searchParams.append("keywords_mode", keywordsMode.value);
        }

        if (labelsSeleccionados.length > 0) {
            const labelValues = labelsSeleccionados.map(l => l.value).join(",");
            url.searchParams.append("labels", labelValues);
            url_count.searchParams.append("labels", labelValues);
        }
        if (keywordsSeleccionados.length > 0) {
            const keywordValues = keywordsSeleccionados.map(k => k.value).join(",");
            url.searchParams.append("keywords", keywordValues);
            url_count.searchParams.append("keywords", keywordValues);
        }

        Promise.all([
            fetch(url.toString()).then(r => r.json()),
            fetch(url_count.toString()).then(r => r.json())
        ])
        .then(([imagenesData, countData]) => {
            setImagenes(imagenesData);
            setImagesCount(countData.count);
            setLoading(false);
        })
        .catch(error => {
            console.log("Error al obtener media", error);
            setLoading(false);
        });
    }

    function cargarLabels(){
        const url = new URL("https://media.authormedia.org/api/labels");
        url.searchParams.append("deleted", deleted)
        if (keywordsMode) url.searchParams.append("keywords_mode", keywordsMode);
        if (labelsSeleccionados.length > 0) {
            const labelValues = labelsSeleccionados.map(l => l.value).join(",");
            url.searchParams.append("labels", labelValues);
        }
        fetch(url.toString())
        .then(response => response.json())
        .then(labelsData => {
            const options = labelsData.map(label => ({
                value: label,
                label: label
            }));
            setLabelsDisponibles(options);
        })
        .catch(error => {
            console.log("Error al obtener labels", error)
        })
    }

    function cargarKeywords(){
        const url = new URL("https://media.authormedia.org/api/keywords");
        url.searchParams.append("deleted", deleted)
        if (keywordsSeleccionados.length > 0) {
            const keywordValues = keywordsSeleccionados.map(k => k.value).join(",");
            url.searchParams.append("keywords", keywordValues);
        }
        fetch(url.toString())
        .then(response => response.json())
        .then(keywordsData => {
            const options = keywordsData.map(keyword => ({
                value: keyword,
                label: keyword
            }));
            setKeywordsDisponibles(options);
        })
        .catch(error => {
            console.log("Error al obtener keywords", error)
        })
    }

    function toggleSeleccion(id){
        setSeleccionados(prev =>
            prev.includes(id)
            ? prev.filter(i => i !== id)
            :[...prev, id]
        );
    }

    function toggleSeleccionarTodos(){
        const idsFiltrados = imagenes.map(img => img.id);
        const todosSeleccionados = idsFiltrados.every(id => seleccionados.includes(id));

        if (todosSeleccionados){
            setSeleccionados(prev => prev.filter(id => !idsFiltrados.includes(id)));
        } else {
            setSeleccionados(prev => [...new Set([...prev, ...idsFiltrados])])
        }
    }

    function handleBorrarSeleccionados(){
        fetch('https://media.authormedia.org/api/delete',{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ids: seleccionados })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Media eliminada:", data);
            cargarImagenes();
            setSeleccionados([]);
        })
        .catch(error => {
            console.log("Error al eliminar media", error)
        });
    }

    function handleRestaurarSeleccionados(){
        fetch("https://media.authormedia.org/api/restore", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ids: seleccionados })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Media restaurada", data);
            cargarImagenes();
            setSeleccionados([]);
        })
        .catch(error => {
            console.log("Error al restaurar media", error)
        });
    }

    //Cargar labels
    useEffect(() => {
        cargarLabels()
    }, [keywordsSeleccionados])

    //Cargar keywords
    useEffect(() => {
        cargarKeywords()
    }, [labelsSeleccionados])

    //Cargar imagenes
    useEffect(() => {
        cargarImagenes();
    }, [page, labelsSeleccionados, keywordsSeleccionados, limitSeleccionado, deleted])

    return (
        <div>
            <label className="form-label">Filtrar por labels:</label>
            <Select
                isMulti
                options={labelsDisponibles}
                value={labelsSeleccionados}
                onChange={setLabelsSeleccionados}
                className="mb-3"
            />
            <div className="row">
                <div className="col-auto">
                    <Select
                    options={[{label:"and", value:"and"}, {label:"or", value:"or"}]}
                    value={keywordsMode}
                    onChange={setKeywordsMode}
                    />
                </div>
                <div className="col">
                    <Select
                    isMulti
                    options={keywordsDisponibles}
                    value={keywordsSeleccionados}
                    onChange={setKeywordsSeleccionados}
                    className="col mb-3"
                    />
                </div>
            </div>
            <select
                className="form-select mb-3"
                value={limitSeleccionado}
                onChange={(e) => setLimitSeleccionado(e.target.value)}
                >
                <option key={10000} value={10000}>10000</option>
                <option key={1000} value={1000}>1000</option>
                <option key={500} value={500}>500</option>
                <option key={100} value={100}>100</option>

            </select>
            {deleted ? (
                <button
                    className="btn btn-success mb-3"
                    onClick={handleRestaurarSeleccionados}
                    disabled={seleccionados.length===0}
                >
                    Restaurar Seleccionados
                </button>
            ) : (
                <button
                    className="btn btn-danger mb-3"
                    onClick={handleBorrarSeleccionados}
                    disabled={seleccionados.length===0}
                >
                    Borrar Seleccionados
                </button>
            )}

            <div className="container">
                <div className="row align-items-end">
                    <h2 className="col-3">Tabla de Media</h2>
                    <div className="col-7"></div>
                    {deleted ? (
                        <button 
                            className="col text-end mb-0 btn btn-link"
                            onClick={() => {
                                setDeleted(false);
                                setPage(1);
                            }}
                        >
                            Mostrar Media
                        </button>
                    ) : (
                        <button 
                            className="col text-end mb-0 btn btn-link"
                            onClick={() => {
                                setDeleted(true);
                                setPage(1);
                            }}
                        >
                            Mostrar Media Oculta
                        </button>
                    )}
                </div>
            </div>
            
            <div className="d-flex justify-content-between mb-3 mt-3">
                <button
                    className="btn btn-primary"
                    disabled={page === 1}
                    onClick={() => {
                        setPage(page - 1)
                        setSeleccionados([])
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
                            {(limitSeleccionado * (page-1))}-
                            {imagenes.length < limitSeleccionado
                                ? ((page - 1) * limitSeleccionado + imagenes.length)
                                : page * limitSeleccionado
                            }
                            /{imagesCount}
                        </span>
                    )}
                </div>
                <button
                    className="btn btn-primary"
                    disabled={imagenes.length < limitSeleccionado}
                    onClick={() => {
                        setPage(page + 1);
                        setSeleccionados([]);
                    }}
                >
                    Página siguiente
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>Media URL</th>
                            <th>Media</th>
                            <th className="d-flex align-items-center justify-content-between">
                                <span>Seleccionar</span>
                                <input
                                    className="form-check-input ms"
                                    type="checkbox"
                                    checked={
                                        imagenes.length > 0 &&
                                        imagenes.every(img => seleccionados.includes(img.id))
                                    }
                                    onChange={() => toggleSeleccionarTodos()}
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {imagenes.map(img => (
                            <tr key={img.id}>
                                <td><a href={img.image_url}>{img.image_url}</a></td>
                                <td><img src={img.image_url} alt={img.label} width="100"/></td>
                                <td className="text-center align-middle">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="flexSwitchCheckDefault"
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
        </div>
    );
}

export default ImageTable;