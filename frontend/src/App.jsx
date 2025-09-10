import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Importación de páginas
import Login from "./login";
import Home from "./home/Home";
import ShowEmployees from "./employees/ShowEmployees";
import ShowUsers from "./users/ShowUsers";
import ShowNovedades from "./novedades/ShowNovedades";
import ShowPayments from "./payments/ShowPayments";
import ShowReports from "./reportes/ShowReports";


// Componente para proteger rutas privadas
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const [user, setUser] = useState(null);

  // ✅ Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (token, usuario) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(usuario));
    setUser(usuario);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: login */}
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />

        {/* Ruta protegida: Home */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home user={user} />
            </PrivateRoute>
          }
        />

        {/* Ruta protegida: Empleados */}
        <Route
          path="/empleados"
          element={
            <PrivateRoute>
              <ShowEmployees />
            </PrivateRoute>
          }
        />

        {/* Ruta protegida: Usuarios */}
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <ShowUsers />
            </PrivateRoute>
          }
        />

        {/* Ruta protegida: Novedades */}
        <Route
          path="/novedades"
          element={
            <PrivateRoute>
              <ShowNovedades />
            </PrivateRoute>
          }
        />

        {/* Ruta protegida: Pagos */}
        <Route
          path="/pagos"
          element={
            <PrivateRoute>
              <ShowPayments />
            </PrivateRoute>
          }
        />

        {/* Ruta protegida: Reportes */}
        <Route
          path="/reportes"
          element={
            <PrivateRoute>
              <ShowReports />
            </PrivateRoute>
          }
        />


        {/* Ruta por defecto → redirigir a login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        newestOnTop
        theme="colored"
        toastStyle={{
          fontSize: "14px",
          padding: "14px 16px",
          minWidth: "340px",
        }}
      />
    </BrowserRouter>
  );
}

export default App;
