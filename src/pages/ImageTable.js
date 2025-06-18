import { useEffect, useState, useMemo } from "react";
import { useFilteredImages } from "../hooks/useFilteredImages";
import FiltersLabelKeywords from "../components/filters/FiltersLabelKeywords";
import ImageTableView from "../components/ImageTableView";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function ImageTable() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(100);
    const [deleted, setDeleted] = useState(false)

    const [labelsDisponibles, setLabelsDisponibles] = useState([]);
    const [labelsSeleccionados, setLabelsSeleccionados] = useState([]);

    const [keywordsDisponibles, setKeywordsDisponibles] = useState([]);
    const [keywordsSeleccionados, setKeywordsSeleccionados] = useState([])

    const [keywordsMode, setKeywordsMode] = useState({ label: "or", value: "or" });

    const [seleccionados, setSeleccionados] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

        //cargar labels
    useEffect(() => {
        const url = new URL("https://media.authormedia.org/api/labels");
        url.searchParams.append("deleted", deleted)
        if (keywordsMode?.value) url.searchParams.append("keywords_mode", keywordsMode);
        if (keywordsSeleccionados.length > 0) {
            const keywordValues = keywordsSeleccionados.map(k => k.value).join(",");
            url.searchParams.append("keywords", keywordValues);
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
    },[keywordsSeleccionados, keywordsMode, deleted])

    //cargar keywords
    useEffect(() => {
        const url = new URL("https://media.authormedia.org/api/keywords");
        url.searchParams.append("deleted", deleted)
        if (labelsSeleccionados.length > 0) {
            const labelValues = labelsSeleccionados.map(l => l.value).join(",");
            url.searchParams.append("labels", labelValues);
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
    }, [labelsSeleccionados, deleted])
        
    //hook para obtener imagenes
     const filtros = useMemo(() => ({
        labels: labelsSeleccionados.map(l => l.value),
        keywords: keywordsSeleccionados.map(k => k.value),
        keywords_mode: keywordsMode.value
    }), [labelsSeleccionados, keywordsSeleccionados, keywordsMode])

    const { imagenes, imagesCount, loading } = useFilteredImages({
        page,
        limit,
        deleted,
        filtros,
        endpoint: "/api/images",
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

    //restaurar o ocultar media
    const handleAccionSeleccionados = async () => {
        const endpoint = deleted ? "/api/restore" : "/api/delete";
        await fetch(`https://media.authormedia.org${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: seleccionados }),
        });
        setSeleccionados([]);
        setRefreshKey((prev) => prev + 1);
    };   

    const handleDownloadZip = async () => {
        const zip = new JSZip();

        // Filtra las imágenes seleccionadas
        const imagenesFiltradas = imagenes.filter((img) =>
            seleccionados.includes(img.id)
        );

        // Descarga cada imagen y agrégala al zip
        await Promise.all(
            imagenesFiltradas.map(async (img, idx) => {
                try {
                    const response = await fetch(img.image_url); // Asegúrate de que `img.url` exista y apunte a una imagen
                    const blob = await response.blob();
                    const nombre = (img.image_url.split("cdn.midjourney.com/")[1] || `img_${idx}.jpg`).replaceAll("/", "_");
                    zip.file(nombre, blob);
                } catch (err) {
                    console.error("Error descargando:", img.image_url);
                }
            })
        );

        // Genera y descarga el zip
        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, "imagenes_seleccionadas.zip");
        });
    };

    return (
        <div>
            <FiltersLabelKeywords
                labelsDisponibles={labelsDisponibles}
                labelsSeleccionados={labelsSeleccionados}
                setLabelsSeleccionados={setLabelsSeleccionados}
                keywordsDisponibles={keywordsDisponibles}
                keywordsSeleccionados={keywordsSeleccionados}
                setKeywordsSeleccionados={setKeywordsSeleccionados}
                keywordsMode={keywordsMode}
                setKeywordsMode={setKeywordsMode}
            />

            <select
                className="form-select mb-3"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                >
                <option key={100} value={100}>100</option>
                <option key={500} value={500}>500</option>
                <option key={1000} value={1000}>1000</option>
                <option key={10000} value={10000}>10000</option>
            </select>

            <button
                className={`btn mb-3 ${deleted ? "btn-success" : "btn-danger"}`}
                onClick={handleAccionSeleccionados}
                disabled={seleccionados.length === 0}
            >
                {deleted ? "Restaurar Seleccionados" : "Borrar Seleccionados"}
            </button>

            <button
                className="btn btn-secondary mb-3 ms-3"
                onClick={handleDownloadZip}
                disabled={seleccionados.length === 0}
            >
                Descargar seleccionados
            </button>


            <div className="container">
                <div className="row align-items-end">
                <h2 className="col-3">Tabla de Media</h2>
                <div className="col-7" />
                <button
                    className="col text-end mb-0 btn btn-link"
                    onClick={() => {
                    setDeleted(!deleted);
                    setPage(1);
                    }}
                >
                    {deleted ? "Mostrar Media" : "Mostrar Media Oculta"}
                </button>
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
                        header: "Keywords",
                        render: (img) => (img.keywords ? img.keywords.join(", "): "-")
                    }
                ]}
            />
        </div>
    );
}

export default ImageTable;