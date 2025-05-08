import { useEffect, useState } from "react";

function ImageTable() {
    const [imagenes, setImagenes] = useState([]);
    const [labelsDisponibles, setLabelsDisponibles] = useState([]);
    const [labelSeleccionado, setLabelSeleccionado] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [seleccionados, setSeleccionados] = useState([]);
    const [busquedaInput, setBusquedaInput] = useState("");

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
        fetch('http://127.0.0.1:8000/api/delete',{
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

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/images')
        .then(response => response.json())
        .then(data => {
            setImagenes(data);

            //extraer labels unicos
            const labels = [...new Set(data.map(img => img.label))];
            setLabelsDisponibles(labels);
        })
        .catch(error => {
            console.error('Error al obtener media', error)
        });
    }, [])

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
                    <option key={label} value={label}>{label}</option>
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
                        setBusqueda(busquedaInput)
                    }
                }}
            />
            <button
                className="btn btn-danger mb-3"
                onClick={handleBorrarSeleccionados}
                disabled={seleccionados.length===0}
            >
                Borrar Seleccionados
            </button>
            <h2>Tabla de Media</h2>
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>Media URL</th>
                            <th>Label</th>
                            <th>Media</th>
                            <th>
                                Seleccionar
                                <input 
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
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={seleccionados.includes(img.id)}
                                        onChange={() => toggleSeleccion(img.id)}
                                    />
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