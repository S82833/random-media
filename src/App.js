import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

import Login from "./pages/Login";
import ImageTable from "./pages/ImageTable";
import ApproveImages from "./pages/ApproveImages";
import PreApproveImages from "./pages/PreApproveImages";
import AssignKeywords from "./pages/AssignKeywords";
import Metrics from "./pages/Metrics";
import BooksData from "./pages/BooksData";
import Navbar from "./components/Navbar";
import PublicImages from "./pages/PublicImages";

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data?.session?.user ?? null);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUsuario(null);
  }

  const isAdmin = !!usuario && (
    usuario.email === "admin@talentedgeperu.com" ||
    usuario.email === "jorge@talentedgeperu.com" ||
    usuario.email === "sebastian.s@talentedgeperu.com" ||
    usuario.email === "stefano@talentedgeperu.com" ||
    usuario.email === "piero.f@talentedgeperu.com" ||
    usuario.email === "larissa@talentedgeperu.com" ||
    usuario.email === "diego@talentedgeperu.com"
  );

  return (
    <Router>
      <div className="container mt-4">
        {usuario && <Navbar isAdmin={isAdmin} onLogout={handleLogout} />}

        <Routes>
          {/* Public route (no login required) */}
          <Route path="/public_images" element={<PublicImages />} />

          {/* Root: Login if logged out, ImageTable if logged in */}
          <Route
            path="/"
            element={usuario ? <ImageTable /> : <Login onLogin={setUsuario} />}
          />

          {/* Protected routes (only when logged in) */}
          {usuario && isAdmin && <Route path="/approve_images" element={<ApproveImages />} />}
          {usuario && isAdmin && <Route path="/metrics" element={<Metrics />} />}
          {usuario && <Route path="/assign_keywords" element={<AssignKeywords />} />}
          {usuario && <Route path="/preapprove_images" element={<PreApproveImages />} />}
          {usuario && <Route path="/books_data" element={<BooksData />} />}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
