import { useEffect, useState, useMemo } from "react";
import { useFilteredImages } from "../hooks/useFilteredImages";
import FiltersLabelKeywords from "../components/filters/FiltersLabelKeywords";
import ImageTableViewAll from "../components/ImageTableViewAll";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useImageCount } from "../hooks/useImageCount";


function PublicImages() {
    const [limit, setLimit] = useState(100);
    const [deleted, setDeleted] = useState(false);

    const [labelsDisponibles, setLabelsDisponibles] = useState([]);
    const [labelsSeleccionados, setLabelsSeleccionados] = useState([]);

    const [keywordsDisponibles, setKeywordsDisponibles] = useState([]);
    const [keywordsSeleccionados, setKeywordsSeleccionados] = useState([]);

    const [keywordsMode, setKeywordsMode] = useState({ label: "or", value: "or" });

    const [seleccionados, setSeleccionados] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const [sortBy, setSortBy] = useState("created_at");
    const [sortDirection, setSortDirection] = useState("desc");

    const [after, setAfter] = useState(null); // CURSOR

    const [vistasHastaAhora, setVistasHastaAhora] = useState(1);

    // cargar labels
    useEffect(() => {
        const url = new URL("https://media.authormedia.org/api/labels");
        url.searchParams.append("deleted", deleted);
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
                console.log("Error al obtener labels", error);
            });
    }, [keywordsSeleccionados, keywordsMode, deleted]);

    // cargar keywords
    useEffect(() => {
        const url = new URL("https://media.authormedia.org/api/keywords");
        url.searchParams.append("deleted", deleted);
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
                console.log("Error al obtener keywords", error);
            });
    }, [labelsSeleccionados, deleted]);

    // filtros para el hook
    const filtros = useMemo(() => ({
        labels: labelsSeleccionados.map(l => l.value),
        keywords: keywordsSeleccionados.map(k => k.value),
        keywords_mode: keywordsMode.value,
        sort_by: sortBy,
        sort_direction: sortDirection,
    }), [labelsSeleccionados, keywordsSeleccionados, keywordsMode, sortBy, sortDirection]);

    const { imagenes, loading } = useFilteredImages({
        limit,
        deleted,
        filtros,
        endpoint: "/api/images",
        after,
        refreshKey,
    });

    const { count: totalCount, loading: countLoading } = useImageCount({
        filtros,
        deleted
    });


    const toggleSeleccion = (id) => {
        setSeleccionados(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const toggleSeleccionarTodos = () => {
        const idsFiltrados = imagenes.map(img => img.id);
        const todosSeleccionados = idsFiltrados.every(id => seleccionados.includes(id));

        if (todosSeleccionados) {
            setSeleccionados(prev => prev.filter(id => !idsFiltrados.includes(id)));
        } else {
            setSeleccionados(prev => [...new Set([...prev, ...idsFiltrados])]);
        }
    };

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
        const imagenesFiltradas = imagenes.filter((img) =>
            seleccionados.includes(img.id)
        );

        await Promise.all(
            imagenesFiltradas.map(async (img, idx) => {
                try {
                    const response = await fetch(img.image_url);
                    const blob = await response.blob();
                    const nombre = (img.image_url.split("cdn.midjourney.com/")[1] || `img_${idx}.jpg`).replaceAll("/", "_");
                    zip.file(nombre, blob);
                } catch (err) {
                    console.error("Error descargando:", img.image_url);
                }
            })
        );

        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, "imagenes_seleccionadas.zip");
        });
    };

    const handleSort = (columnKey) => {
        if (sortBy === columnKey) {
            setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(columnKey);
            setSortDirection("desc");
        }
        setAfter(null); // reset cursor
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
                onChange={(e) => {
                    setLimit(parseInt(e.target.value));
                    setAfter(null); // reset cursor
                    setVistasHastaAhora(1);
                }}
            >
                <option key={100} value={100}>100</option>
                <option key={500} value={500}>500</option>
                <option key={1000} value={1000}>1000</option>
            </select>

            {/* <button
                className={`btn mb-3 ${deleted ? "btn-success" : "btn-danger"}`}
                onClick={handleAccionSeleccionados}
                disabled={seleccionados.length === 0}
            >
                {deleted ? "Restaurar Seleccionados" : "Borrar Seleccionados"}
            </button> */}

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
                    {/* <button
                        className="col text-end mb-0 btn btn-link"
                        onClick={() => {
                            setDeleted(!deleted);
                            setAfter(null);
                        }}
                    >
                        {deleted ? "Mostrar Media" : "Mostrar Media Oculta"}
                    </button> */}
                </div>
            </div>

            <div className="d-flex justify-content-between mb-3 mt-3">
                <button
                    className="btn btn-primary"
                    disabled={!after}
                    onClick={() => {
                        setAfter(null); // volver al principio
                        setSeleccionados([]);
                        setVistasHastaAhora(1);
                    }}
                >
                    Volver al inicio
                </button>

                <div className="d-flex align-items-center">
                    {countLoading ? (
                        <span className="me-2">Cargando...</span>
                    ) : (
                        <span className="me-2">

                            Página {vistasHastaAhora} de {Math.ceil(totalCount / limit)} | {totalCount}
                        </span>
                    )}
                </div>

                <button
                    className="btn btn-primary"
                    disabled={imagenes.length < limit}
                    onClick={() => {
                        const last = imagenes[imagenes.length - 1];
                        if (last) {
                            setAfter(last.created_at);
                            setSeleccionados([]);
                            setVistasHastaAhora(prev => prev + 1);
                        }
                    }}
                >
                    Página siguiente
                </button>
            </div>

            <ImageTableViewAll
                imagenes={imagenes}
                seleccionados={seleccionados}
                toggleSeleccion={toggleSeleccion}
                toggleSeleccionarTodos={toggleSeleccionarTodos}
                onSort={handleSort}
                sortBy={sortBy}
                sortDirection={sortDirection}
                extraColumns={[
                    {
                        header: "Keywords",
                        render: (img) => (img.keywords ? img.keywords.join(", ") : "-")
                    },
                    {
                        header: "View Count",
                        render: (img) => (img.total_views ? img.total_views : "-")
                    },
                    {
                        header: "Created At",
                        key: "created_at",
                        sortable: false,
                        render: (img) => new Date(img.created_at).toLocaleDateString()
                    },
                ]}
            />
        </div>
    );
}

export default PublicImages;
