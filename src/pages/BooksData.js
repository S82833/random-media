import { useEffect, useState } from "react";
import FiltersAssignee from "../components/filters/FiltersAssignee";
import BooksTableView from "../components/BooksTableView";

function BooksData() {
    const [assigneesDisponibles, setAssigneesDisponibles] = useState([]);
    const [assigneeSeleccionado, setAssigneeSeleccionado] = useState([]);

    //Cargar asignees desde supabase
    useEffect(() =>{
        const url = new URL("https://media.authormedia.org/api/assignees");
        fetch(url.toString())
            .then(res => res.json())
            .then(data => {
                const opciones = data.map(item => ({
                value: item.assignee,
                label: item.assignee
            }));
            setAssigneesDisponibles(opciones);
            })
            .catch(err => {
                console.error("Error al obtener assignees:", err);
            });
    }, []);

    return (
        <div className="container">
            <h1>Books Data</h1>
            <FiltersAssignee
                assigneeDisponibles={assigneesDisponibles}
                assigneeSeleccionado={assigneeSeleccionado}
                setAssigneeSeleccionado={setAssigneeSeleccionado}
            />
            <BooksTableView assigneeSeleccionado={assigneeSeleccionado} />
        </div>
        
    );     

}

export default BooksData;