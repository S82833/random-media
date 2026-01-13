import { useEffect, useState, useMemo } from "react";
import ZoomModal from "../components/ZoomModal";


function ImagesStatusMetrics() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [failedImages, setFailedImages] = useState([]);
    const [loadingFailed, setLoadingFailed] = useState(false);
    const [zoomImageUrl, setZoomImageUrl] = useState(null);



    const [selectedUser, setSelectedUser] = useState("");
    const [sortKey, setSortKey] = useState("total");
    const [sortDir, setSortDir] = useState("desc");

    useEffect(() => {
        setLoading(true);
        fetch("https://media.authormedia.org/api/moderation_stats")
            .then(res => res.json())
            .then(data => setStats(data || []))
            .catch(err => console.error("Error loading stats", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedUser) {
            setFailedImages([]);
            return;
        }

        setLoadingFailed(true);
        fetch(`https://media.authormedia.org/api/images/failed?user_email=${encodeURIComponent(selectedUser)}`)
            .then(res => res.json())
            .then(data => setFailedImages(data || []))
            .catch(err => console.error("Error loading failed images", err))
            .finally(() => setLoadingFailed(false));

    }, [selectedUser]);


    const users = useMemo(() => {
        return stats.map(s => s.user_email).filter(Boolean).sort();
    }, [stats]);

    const processed = useMemo(() => {
        let rows = stats.map(row => ({
            ...row,
            total:
                row.preapproved_count +
                row.prerejected_count +
                row.approved_count +
                row.rejected_count,
        }));

        if (selectedUser) {
            rows = rows.filter(r => r.user_email === selectedUser);
        }

        return rows.sort((a, b) => {
            const dir = sortDir === "asc" ? 1 : -1;
            return (a[sortKey] - b[sortKey]) * dir;
        });
    }, [stats, selectedUser, sortKey, sortDir]);

    const toggleSort = (key) => {
        if (sortKey === key) {
            setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    };

    return (
        <div className="container">
            <h2>Moderation Metrics</h2>

            <div className="row mb-3">
                <div className="col-4">
                    <label className="form-label">Filtrar por persona</label>
                    <select
                        className="form-select"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        <option value="">Todas</option>
                        {users.map(email => (
                            <option key={email} value={email}>
                                {email}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && <div className="alert alert-info">Cargando métricas...</div>}

            <table className="table table-bordered table-striped table-hover mt-3">
                <thead>
                    <tr>
                        <th>User</th>
                        <th onClick={() => toggleSort("preapproved_count")} style={{ cursor: "pointer" }}>
                            Preapproved
                        </th>
                        <th onClick={() => toggleSort("prerejected_count")} style={{ cursor: "pointer" }}>
                            Prerejected
                        </th>
                        <th onClick={() => toggleSort("approved_count")} style={{ cursor: "pointer" }}>
                            Approved
                        </th>
                        <th onClick={() => toggleSort("rejected_count")} style={{ cursor: "pointer" }}>
                            Rejected
                        </th>
                        <th onClick={() => toggleSort("rejected_after_preapprove_count")} style={{ cursor: "pointer" }}>
                            Failures
                        </th>
                        <th onClick={() => toggleSort("rejected_after_preapprove_ratio")} style={{ cursor: "pointer" }}>
                            Failures %
                        </th>
                        <th onClick={() => toggleSort("total")} style={{ cursor: "pointer" }}>
                            Total
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {processed.map(row => (
                        <tr key={row.user_email}>
                            <td
                                style={{ cursor: "pointer", textDecoration: "underline" }}
                                onClick={() =>
                                    setSelectedUser(prev =>
                                        prev === row.user_email ? "" : row.user_email
                                    )
                                }
                            >
                                {row.user_email}
                            </td>
                            <td>{row.preapproved_count}</td>
                            <td>{row.prerejected_count}</td>
                            <td>{row.approved_count}</td>
                            <td>{row.rejected_count}</td>
                            <td>{row.rejected_after_preapprove_count}</td>
                            <td>{(row.rejected_after_preapprove_ratio * 100).toFixed(2)}%</td>
                            <td className="fw-bold">{row.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedUser && (
                <div className="mt-5">
                    <h4>Failed images</h4>

                    {loadingFailed && (
                        <div className="alert alert-info">Loading failed images...</div>
                    )}

                    {!loadingFailed && failedImages.length === 0 && (
                        <div className="alert alert-secondary">No failed images found.</div>
                    )}

                    {failedImages.length > 0 && (
                        <table className="table table-bordered table-striped table-hover mt-3">
                            <thead>
                                <tr>
                                    <th>URL</th>
                                    <th>Preview</th>
                                    <th>Label</th>
                                    <th>Rejected By</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {failedImages.map(img => (
                                    <tr key={img.image_url}>
                                        <td><a href={img.image_url}>{img.image_url}</a></td>
                                        <td>
                                            <img
                                                src={img.image_url}
                                                alt=""
                                                style={{ width: 100, borderRadius: 4, cursor: "pointer" }}
                                                onClick={() => setZoomImageUrl(img.image_url)}
                                                draggable={false}
                                            />
                                        </td>
                                        <td>{img.label}</td>
                                        <td>{img.approved_modified_by}</td>
                                        <td>{new Date(img.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
            {zoomImageUrl && (
                <ZoomModal
                    imageUrl={zoomImageUrl}
                    onClose={() => setZoomImageUrl(null)}
                />
            )}

        </div>
    );
}

export default ImagesStatusMetrics;
