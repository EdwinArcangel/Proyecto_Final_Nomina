import { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

function ShowLiquidacion() {
  const [empleados, setEmpleados] = useState([]);
  const [selected, setSelected] = useState("");
  const [liquidacion, setLiquidacion] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener lista de empleados
  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const res = await api.get("/empleados");
        setEmpleados(res.data);
      } catch (err) {
        toast.error("❌ Error cargando empleados");
      }
    };
    fetchEmpleados();
  }, []);

  // Consultar liquidación
  const handleConsultar = async () => {
    if (!selected) {
      toast.warning("⚠️ Selecciona un empleado");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/liquidacion/${selected}`);
      setLiquidacion(res.data);
    } catch (err) {
      toast.error("❌ Error consultando liquidación");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📑 Liquidación de Nómina</h2>

      <div style={styles.form}>
        <select
          style={styles.input}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Seleccione empleado</option>
          {empleados.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.nombre_empleado}
            </option>
          ))}
        </select>
        <button style={styles.button} onClick={handleConsultar}>
          Calcular
        </button>
      </div>

      {loading && <p>⏳ Calculando...</p>}

      {liquidacion && (
        <div style={styles.card}>
          <h3>👤 {liquidacion.empleado}</h3>
          <p><strong>Salario base:</strong> ${liquidacion.salario_base.toLocaleString()}</p>
          <p><strong>Auxilio transporte:</strong> ${liquidacion.auxilio_transporte.toLocaleString()}</p>
          <p><strong>Extras:</strong> ${liquidacion.extras.toLocaleString()}</p>
          <p><strong>Bonificaciones:</strong> ${liquidacion.bonificaciones.toLocaleString()}</p>

          <h4>📉 Deducciones</h4>
          <ul>
            <li>Salud: ${liquidacion.deducciones.salud.toLocaleString()}</li>
            <li>Pensión: ${liquidacion.deducciones.pension.toLocaleString()}</li>
            <li>Otros: ${liquidacion.deducciones.otros.toLocaleString()}</li>
          </ul>

          <p><strong>Total Devengado:</strong> ${liquidacion.total_devengado.toLocaleString()}</p>
          <p><strong>Total Deducciones:</strong> ${liquidacion.total_deducciones.toLocaleString()}</p>
          <h3 style={{ color: "green" }}>
            Neto a Pagar: ${liquidacion.neto_pagar.toLocaleString()}
          </h3>
        </div>
      )}
    </div>
  );
}

export default ShowLiquidacion;

const styles = {
  container: { padding: "2rem", background: "#f4f6f9", minHeight: "100vh" },
  title: { textAlign: "center", color: "#4b0082", marginBottom: "1rem" },
  form: { display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "1.5rem" },
  input: { padding: "0.8rem", border: "1px solid #ccc", borderRadius: "6px" },
  button: {
    padding: "0.8rem 1.5rem",
    border: "none",
    borderRadius: "6px",
    background: "#4facfe",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  card: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    margin: "0 auto",
  },
};
