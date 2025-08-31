// src/payments/ShowPayments.jsx
import { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

export default function ShowPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    empleado_id: "",
    periodo_id: "",
    fecha_pago: "",
    monto: "",
    metodo_pago: "",
    estado: "",
    observaciones: ""
  });

  const [empleados, setEmpleados] = useState([]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/pagos");
      setPayments(res.data);
    } catch (err) {
      console.error("Error cargando pagos:", err);
      toast.error("❌ Error cargando pagos");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpleados = async () => {
    try {
      const res = await api.get("/empleados");
      setEmpleados(res.data);
    } catch (err) {
      console.error("Error cargando empleados:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchEmpleados();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/pagos", form);
      toast.success("💰 Pago registrado con éxito");
      setShowForm(false);
      setForm({
        empleado_id: "",
        periodo_id: "",
        fecha_pago: "",
        monto: "",
        metodo_pago: "",
        estado: "",
        observaciones: ""
      });
      fetchPayments();
    } catch (err) {
      console.error("Error registrando pago:", err);
      toast.error("❌ Error registrando pago");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este pago?")) return;
    try {
      await api.delete(`/pagos/${id}`);
      toast.success("🗑️ Pago eliminado con éxito");
      fetchPayments();
    } catch (err) {
      console.error("Error eliminando pago:", err);
      toast.error("❌ Error eliminando pago");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>💰 Gestión de Pagos</h2>
        <button style={styles.addBtn} onClick={() => setShowForm(true)}>
          ➕ Registrar Pago
        </button>
      </div>

      {loading ? (
        <p>Cargando pagos...</p>
      ) : (
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Empleado</th>
              <th style={styles.th}>Periodo</th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Monto</th>
              <th style={styles.th}>Método</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Observaciones</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((p) => (
                <tr key={p.id}>
                  <td style={styles.td}>{p.id}</td>
                  <td style={styles.td}>{p.empleado_nombre}</td>
                  <td style={styles.td}>{p.periodo_id || "—"}</td>
                  <td style={styles.td}>{p.fecha_pago}</td>
                  <td style={styles.td}>
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP"
                    }).format(p.monto)}
                  </td>
                  <td style={styles.td}>{p.metodo_pago}</td>
                  <td style={styles.td}>{p.estado}</td>
                  <td style={styles.td}>{p.observaciones}</td>
                  <td style={styles.td}>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={styles.td}>No hay pagos registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>➕ Registrar Pago</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <select
                style={styles.input}
                value={form.empleado_id}
                onChange={(e) => setForm({ ...form, empleado_id: e.target.value })}
                required
              >
                <option value="">-- Seleccionar Empleado --</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre_empleado}
                  </option>
                ))}
              </select>

              <input
                style={styles.input}
                type="text"
                placeholder="Periodo ID"
                value={form.periodo_id}
                onChange={(e) => setForm({ ...form, periodo_id: e.target.value })}
              />

              <input
                style={styles.input}
                type="date"
                value={form.fecha_pago}
                onChange={(e) => setForm({ ...form, fecha_pago: e.target.value })}
                required
              />

              <input
                style={styles.input}
                type="number"
                placeholder="Monto"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                required
              />

              <select
                style={styles.input}
                value={form.metodo_pago}
                onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })}
                required
              >
                <option value="">-- Método de Pago --</option>
                <option value="transferencia">Transferencia</option>
                <option value="efectivo">Efectivo</option>
                <option value="cheque">Cheque</option>
              </select>

              <select
                style={styles.input}
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                required
              >
                <option value="">-- Estado --</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
              </select>

              <textarea
                style={styles.input}
                placeholder="Observaciones"
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              />

              <div style={styles.modalActions}>
                <button type="submit" style={styles.addBtn}>Guardar</button>
                <button type="button" style={styles.deleteBtn} onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "2rem", background: "#f4f6f9", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  title: { flex: 1, textAlign: "center", color: "#4b0082", margin: 0 },
  addBtn: { padding: "0.6rem 1rem", border: "none", borderRadius: "6px", background: "#4facfe", color: "white", cursor: "pointer", fontWeight: "bold" },
  table: { width: "100%", borderCollapse: "collapse", background: "white" },
  thead: { background: "#f5f6ff" },
  th: { textAlign: "center", padding: "0.8rem", color: "#333", fontWeight: 600 },
  td: { textAlign: "center", padding: "0.8rem", borderBottom: "1px solid #eee", color: "#333" },
  deleteBtn: { padding: "0.4rem 0.8rem", border: "none", borderRadius: "6px", background: "#f87171", color: "white", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" },
  modal: { background: "white", padding: "2rem", borderRadius: "12px", width: "400px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" },
  input: { padding: "0.8rem", border: "1px solid #ccc", borderRadius: "6px" },
  modalActions: { display: "flex", justifyContent: "space-between", marginTop: "1rem" },
};
