import { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard";
import FiltersLabel from "../components/filters/FiltersLabel";

function Metrics(){
    const [labelsDisponibles, setLabelsDisponibles] = useState([]);
    const [labelsSeleccionados, setLabelsSeleccionados] = useState(null);

    const [metricas, setMetricas] = useState([]);

    const colores = {
        "Generadas": { bg: "", text: "" },
        "Pendientes": { bg: "#d0e7ff", text: "#004085" }, // usa el color default (Bootstrap)
        "Preaprobadas": { bg: "#d4edda", text: "#155724" },    // verde tenue y texto más fuerte
        "Pre-rechazadas": { bg: "#f8d7da", text: "#721c24" },  // rojo tenue y texto fuerte
        "Aprobadas": { bg: "#28a745", text: "#ffffff" },       // verde fuerte
        "Rechazadas": { bg: "#dc3545", text: "#ffffff" },      // rojo fuerte
    };

    //cargar labels
    useEffect(() => {
        fetch("https://media.authormedia.org/api/approve/labels")
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

    useEffect(() => {
        const fetchDatos = async () => {
            const parametros = [
                { key: null, label: "Generadas" },
                { key: "pending", label: "Pendientes" },
                { key: "preapproved", label: "Preaprobadas" },
                { key: "prerejected", label: "Pre-rechazadas" },
                { key: "approved", label: "Aprobadas" },
                { key: "rejected", label: "Rechazadas" },
                
            ];

            try {
                const responses = await Promise.all(
                    parametros.map(async ({ key, label }) => {
                        const url = new URL("https://media.authormedia.org/api/images/metrics");
                        if (key !== null) {
                            url.searchParams.append("status", key);
                        }
                        if (labelsSeleccionados) {
                            url.searchParams.append("label", labelsSeleccionados.label);
                        }

                        const res = await fetch(url);
                        const data = await res.json();
                        const value = typeof data === "number" ? data : 0;
                        return { label, value };
                    })
                );
                const total = responses.find(item => item.label === "Generadas")?.value ?? 0;

                const responsesConPorcentaje = responses.map((item) => ({
                ...item,
                percentage: total > 0 ? (item.value / total) * 100 : 0,
                }));

                setMetricas(responsesConPorcentaje);
            } catch (error) {
                console.error("Error al obtener métricas:", error);
            }
        };

        fetchDatos();
    }, [labelsSeleccionados]);


    return (
        <div>
            <FiltersLabel
            labelsDisponibles={labelsDisponibles}
            labelSeleccionado={labelsSeleccionados}
            setLabelSeleccionado={setLabelsSeleccionados}
            />
            <div className="container mt-4">
            <h2 className="mb-4">Métricas</h2>

            {/* Primera fila con 1 métrica centrada */}
            <div className="row justify-content-center">
                {metricas[0] && (
                <div className="col-md mb-3">
                    <MetricCard
                        title={metricas[0].label}
                        value={metricas[0].value ?? 0}
                        percentage={metricas[0].percentage}
                        bgColor={colores[metricas[0].label]?.bg}
                        textColor={colores[metricas[0].label]?.text}
                    />
                </div>
                )}
            </div>

            {/* Segunda fila con 1 métrica centrada */}
            <div className="row justify-content-center">
                {metricas[1] && (
                <div className="col-md mb-3">
                    <MetricCard
                        title={metricas[1].label}
                        value={metricas[1].value ?? 0}
                        percentage={metricas[1].percentage}
                        bgColor={colores[metricas[1].label]?.bg}
                        textColor={colores[metricas[1].label]?.text}
                    />
                </div>
                )}
            </div>

            {/* Tercera fila con 2 métricas */}
            <div className="row">
                {metricas[2] && (
                <div className="col-md-6 mb-3">
                    <MetricCard
                        title={metricas[2].label}
                        value={metricas[2].value ?? 0}
                        percentage={metricas[2].percentage}
                        bgColor={colores[metricas[2].label]?.bg}
                        textColor={colores[metricas[2].label]?.text}
                    />
                </div>
                )}
                {metricas[3] && (
                <div className="col-md-6 mb-3">
                    <MetricCard
                        title={metricas[3].label}
                        value={metricas[3].value ?? 0}
                        percentage={metricas[3].percentage}
                        bgColor={colores[metricas[3].label]?.bg}
                        textColor={colores[metricas[3].label]?.text}
                    />
                </div>
                )}
            </div>

            {/* Cuarta fila con otras 2 métricas */}
            <div className="row">
                {metricas[4] && (
                <div className="col-md-6 mb-3">
                    <MetricCard
                        title={metricas[4].label}
                        value={metricas[4].value ?? 0}
                        percentage={metricas[4].percentage}
                        bgColor={colores[metricas[4].label]?.bg}
                        textColor={colores[metricas[4].label]?.text}
                    />
                </div>
                )}
                {metricas[5] && (
                <div className="col-md-6 mb-3">
                    <MetricCard
                        title={metricas[5].label}
                        value={metricas[5].value ?? 0}
                        percentage={metricas[5].percentage}
                        bgColor={colores[metricas[5].label]?.bg}
                        textColor={colores[metricas[5].label]?.text}
                    />
                </div>
                )}
            </div>
            </div>
        </div>
    );

}
export default Metrics