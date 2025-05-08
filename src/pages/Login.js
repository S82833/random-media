import { useState } from "react";
import { supabase } from '../supabaseClient'

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleLogin(e) {
        e.preventDefault();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error){
            alert("Error al iniciar sesion " + error.message);
        } else {
            onLogin(data.session.user);
        }
    }

    return (
        <div className="container mt-5">
            <h2>Iniciar Sesion</h2>
            <form onSubmit={handleLogin}>
                <input className="form-control mb-2" type="email" value={email} onChange={ e => setEmail(e.target.value)} placeholder="Correo" />
                <input className="form-control mb-2" type="password" value={password} onChange={ e => setPassword(e.target.value)} placeholder="Contraseña" />
                <button className="btn btn-primary" type="submit">Entrar</button>
            </form>
        </div>
    );
}

