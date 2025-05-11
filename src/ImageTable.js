import { useEffect, useState } from "react";

function ImageTable() {
    const [imagenes, setImagenes] = useState([]);
    const [labelsDisponibles, setLabelsDisponibles] = useState([]);
    const [labelSeleccionado, setLabelSeleccionado] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [seleccionados, setSeleccionados] = useState([]);
    const [busquedaInput, setBusquedaInput] = useState("");
    const [page, setPage] = useState(1);
    const [limitSeleccionado, setLimitSeleccionado] = useState(10000)
    const [deleted, setDeleted] = useState(false)
    const [imagesCount, setImagesCount] = useState(0)
    const [loading, setLoading] = useState(false);


    function cargarImagenes() {
    setLoading(true);

    const url = new URL("https://media.authormedia.org/api/images");
    const url_count = new URL("https://media.authormedia.org/api/images_count");

    url.searchParams.append("page", page);
    url.searchParams.append("limit", limitSeleccionado);
    if (deleted) url.searchParams.append("deleted", deleted);
    if (labelSeleccionado) url.searchParams.append("label", labelSeleccionado);
    if (busqueda) url.searchParams.append("search", busqueda);

    url_count.searchParams.append("deleted", deleted);
    if (labelSeleccionado) url_count.searchParams.append("label", labelSeleccionado);
    if (busqueda) url_count.searchParams.append("search", busqueda);

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


    function toggleSeleccion(id){
        setSeleccionados(prev =>
            prev.includes(id)
            ? prev.filter(i => i !== id)
            :[...prev, id]
        );
    }

    function toggleSeleccionarTodos(){
        const idsFiltrados = imagenesFiltradas.map(img => img.id);
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
            setImagenes(imagenes.filter(img => !seleccionados.includes(img.id)));
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
            setImagenes(imagenes.filter(img => !seleccionados.includes(img.id)));
            setSeleccionados([]);
        })
        .catch(error => {
            console.log("Error al restaurar media", error)
        });
    }

    useEffect(() => {
        fetch('https://media.authormedia.org/api/labels')
        .then(response => response.json())
        .then(labels => {
            console.log(labels)
            setLabelsDisponibles(labels)
        })
        .catch(error => {
            console.error('Error al obtener labels', error)
        })
    }, [])

    useEffect(() => {
        cargarImagenes();
    }, [page, labelSeleccionado, busqueda, limitSeleccionado, deleted])

    const imagenesFiltradas = imagenes.filter(img => {
        const coincideLabel =
        labelSeleccionado === "" || img.label === labelSeleccionado;
        
        const coincideBusqueda = 
        busqueda === "" || img.image_url.toLowerCase().includes(busqueda.toLowerCase());

        return coincideLabel && coincideBusqueda;
    });

    return (
        <div>
            <select
                className="form-select mb-3"
                value={labelSeleccionado}
                onChange={(e) => setLabelSeleccionado(e.target.value)}
                >
                <option value="">-- Filtrar por label --</option>
                {labelsDisponibles.map(label => (
                    <option key={label.label} value={label.label}>{label.label}</option>
                ))}
            </select>
            <input
                className="form-control mb-3"
                type="text"
                placeholder="Buscar en URL"
                value={busquedaInput}
                onChange={(e) => setBusquedaInput(e.target.value)}
                onKeyDown={(e) => {
                    if(e.key === 'Enter'){
                        setPage(1);
                        setBusqueda(busquedaInput);
                    }
                }}
            />
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
                    onClick={() => setPage(page - 1)}
                >
                    Página anterior
                </button>
                <span className="align-self-center">Página {page}</span>
                <div className="d-flex align-items-center">
                    {loading ? (
                        <span className="me-2">Cargando...</span>
                    ) : (
                        <span className="me-2">
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
                    onClick={() => setPage(page + 1)}
                >
                    Página siguiente
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>Media URL</th>
                            <th>Label</th>
                            <th>Media</th>
                            <th className="d-flex align-items-center justify-content-between">
                                <span>Seleccionar</span>
                                <input
                                    className="form-check-input ms"
                                    type="checkbox"
                                    checked={
                                        imagenesFiltradas.length > 0 &&
                                        imagenesFiltradas.every(img => seleccionados.includes(img.id))
                                    }
                                    onChange={() => toggleSeleccionarTodos()}
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {imagenesFiltradas.map(img => (
                            <tr key={img.id}>
                                <td><a href={img.image_url}>{img.image_url}</a></td>
                                <td>{img.label}</td>
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