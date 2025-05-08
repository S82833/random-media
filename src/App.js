import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import ImageTable from './ImageTable';

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        setUsuario(data.session.user);
      }
    });
  }, []);

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  return (
    <div className="container mt-4">
      <h1>Admin Panel</h1>
      <ImageTable />
    </div>
  );
}

export default App;
