import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import logo from "../assets/logo_nomina.jpg";

export default function Home({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    empleados: 0,
    usuarios: 0,
    admins: 0,
    pagosMes: 0,
    ultimoPago: null,
    novedadesPendientes: 0,
    novedadesAprobadas: 0,
  });
  const [pagosMensuales, setPagosMensuales] = useState([]);
  const [empleadosPorCargo, setEmpleadosPorCargo] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPagosMensuales = async () => {
    try {
      const res = await api.get("/dashboard/pagos-mensuales");
      setPagosMensuales(res.data);
    } catch (err) {
      console.error("Error cargando pagos mensuales:", err);
    }
  };

  const fetchEmpleadosPorCargo = async () => {
    try {
      const res = await api.get("/dashboard/empleados-por-cargo");
      setEmpleadosPorCargo(res.data);
    } catch (err) {
      console.error("Error cargando empleados por cargo:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchPagosMensuales();
    fetchEmpleadosPorCargo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // ✅ limpiar usuario también
    navigate("/login");
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(v || 0);

  const COLORS = ["#4facfe", "#00f2fe", "#34d399", "#facc15", "#f87171"];

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logoWrapper}>
          <img src={logo} alt="Logo empresa" style={styles.logoImg} />
        </div>
        <h2 style={styles.logoText}>E - Nómina</h2>
        <ul style={styles.menu}>
          <li style={styles.menuItem} onClick={() => navigate("/home")}>📊 Dashboard</li>
          <li style={styles.menuItem} onClick={() => navigate("/empleados")}>👥 Empleados</li>
          <li style={styles.menuItem} onClick={() => navigate("/usuarios")}>🧑‍💻 Usuarios</li>
          <li style={styles.menuItem} onClick={() => navigate("/novedades")}>📌 Novedades</li>
          <li style={styles.menuItem} onClick={() => navigate("/pagos")}>💰 Pagos</li>
          <li style={styles.menuItem} onClick={() => navigate("/reportes")}>📑 Reportes</li>
        </ul>
      </aside>

      {/* Main */}
      <div style={styles.main}>
        <nav style={styles.navbar}>
          {/* ✅ Bienvenida personalizada */}
          <span>
            👋 Hola, {user?.nombre_usuario} 
          </span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </nav>

        {/* Dashboard */}
        <div style={styles.dashboard}>
          <h1 style={{ marginBottom: "1rem" }}>📊 Panel de Control</h1>

          {/* Cards */}
          <div style={styles.cardsContainer}>
            <div style={{ ...styles.card, background: "#4facfe", color: "white" }}>
              <h3>👥 Empleados</h3>
              <p>Total registrados: <strong>{stats.empleados}</strong></p>
            </div>
            <div style={{ ...styles.card, background: "#9c27b0", color: "white" }}>
              <h3>👨‍💼 Administradores</h3>
              <p>Total registrados: <strong>{stats.admins}</strong></p>
            </div>
            <div style={{ ...styles.card, background: "#ff9800", color: "white" }}>
              <h3>📌 Novedades pendientes</h3>
              <p>Total: <strong>{stats.novedadesPendientes}</strong></p>
            </div>
            <div style={{ ...styles.card, background: "#8bc34a", color: "white" }}>
              <h3>✅ Novedades aprobadas</h3>
              <p>Total: <strong>{stats.novedadesAprobadas}</strong></p>
            </div>
          </div>

          {/* Charts */}
          <div style={styles.charts}>
            <div style={styles.chartBox}>
              <h3>💵 Pagos por Mes</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pagosMensuales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="total" fill="#4facfe" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.chartBox}>
              <h3>👥 Empleados por Cargo</h3>
              {empleadosPorCargo.filter(c => c.total > 0).length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={empleadosPorCargo.filter(c => c.total > 0)}
                      dataKey="total"
                      nameKey="cargo"
                      outerRadius={100}
                      label
                    >
                      {empleadosPorCargo
                        .filter(c => c.total > 0)
                        .map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: "center", marginTop: "2rem" }}>
                  No hay empleados registrados en cargos
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" },
  sidebar: {
    width: "240px",
    background: "linear-gradient(180deg, #4facfe, #00f2fe)",
    color: "white",
    padding: "1rem",
    textAlign: "center",
  },
  logoWrapper: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 0.8rem auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  logoImg: { width: "70px" },
  logoText: { fontSize: "1.4rem", fontWeight: "bold", margin: "1rem 0" },
  menu: { listStyle: "none", padding: 0, marginTop: "1rem" },
  menuItem: {
    padding: "1rem",
    margin: "0.6rem 0",
    borderRadius: "12px",
    cursor: "pointer",
    background: "rgba(255,255,255,0.15)",
    fontSize: "1.1rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease-in-out",
  },
  main: {
    flex: 1,
    background: "#f4f6f9",
    display: "flex",
    flexDirection: "column",
    color: "#333",
  },
  navbar: {
    background: "white",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ddd",
  },
  logoutBtn: {
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "8px",
    background: "#ff4d4d",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  dashboard: { padding: "2rem" },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  card: {
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    fontSize: "1.1rem",
    fontWeight: "bold",
  },
  charts: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" },
  chartBox: {
    background: "white",
    padding: "1rem",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
};
