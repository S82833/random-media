import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

import Login from './pages/Login';
import ImageTable from './pages/ImageTable';
import ApproveImages from './pages/ApproveImages';
import PreApproveImages from './pages/PreApproveImages';
import AssignKeywords from './pages/AssignKeywords'; 
import Metrics from './pages/Metrics';
import Navbar from './components/Navbar'; 

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        setUsuario(data.session.user);
      }
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUsuario(null);
  }

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  const isAdmin = usuario.email === 'admin@talentedgeperu.com'
                || usuario.email === 'jorge@talentedgeperu.com'
                || usuario.email === 'piero@talentedgeperu.com'
                || usuario.email === 'sebastian.s@talentedgeperu.com'
                || usuario.email === 'stefano@talentedgeperu.com';

  return (
    <Router>
      <div className="container mt-4">
        <Navbar isAdmin={isAdmin} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<ImageTable />}/>
          {isAdmin && <Route path="/approve_images" element={<ApproveImages />}/>}
          {isAdmin && <Route path="/metrics" element={<Metrics />} />}
          <Route path="/assign_keywords" element={<AssignKeywords />}/>
          <Route path='/preapprove_images' element={<PreApproveImages />}/>
          <Route path="*" element={<Navigate to="/" />}/>
        </Routes>
      </div>
    </Router>

  );
}

export default App;
