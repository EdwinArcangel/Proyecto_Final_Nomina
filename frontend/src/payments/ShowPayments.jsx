import { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

export default function ShowPayments() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPago, setEditingPago] = useState(null);
  const [form, setForm] = useState({
    empleado_id: "",
    periodo_id: "",
    fecha_pago: "",
    monto: "",
    metodo_pago: "transferencia",
    estado: "pendiente",
    observaciones: "",
  });

  // ✅ Obtener pagos
  const fetchPagos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/pagos");
      setPagos(res.data);
    } catch (err) {
      toast.error("❌ Error cargando pagos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  // ✅ Abrir modal para editar
  const handleEdit = (pago) => {
    setEditingPago(pago);
    setForm({
      empleado_id: pago.empleado_id,
      periodo_id: pago.periodo_id,
      fecha_pago: pago.fecha_pago?.split("T")[0] || "",
      monto: pago.monto,
      metodo_pago: pago.metodo_pago,
      estado: pago.estado,
      observaciones: pago.observaciones || "",
    });
    setShowModal(true);
  };

  // ✅ Guardar edición
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/pagos/${editingPago.id}`, form);
      toast.success("✏️ Pago actualizado");
      setShowModal(false);
      setEditingPago(null);
      fetchPagos();
    } catch (err) {
      toast.error("❌ Error actualizando pago");
    }
  };

  // ✅ Eliminar pago
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este pago?")) return;
    try {
      await api.delete(`/pagos/${id}`);
      toast.success("🗑️ Pago eliminado");
      fetchPagos();
    } catch (err) {
      toast.error("❌ Error eliminando pago");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💰 Gestión de Pagos</h2>

      {loading ? (
        <p>Cargando pagos...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Empleado</th>
              <th>Periodo</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Estado</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length > 0 ? (
              pagos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.empleado_nombre}</td>
                  <td>{p.periodo_id}</td>
                  <td>{p.fecha_pago?.split("T")[0]}</td>
                  <td>
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                    }).format(p.monto)}
                  </td>
                  <td>{p.metodo_pago}</td>
                  <td>{p.estado}</td>
                  <td>{p.observaciones || "—"}</td>
                  <td>
                    <button
                      style={styles.editBtn}
                      onClick={() => handleEdit(p)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(p.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No hay pagos registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* ✅ Modal de edición */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>✏️ Editar Pago</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="date"
                value={form.fecha_pago}
                onChange={(e) =>
                  setForm({ ...form, fecha_pago: e.target.value })
                }
                style={styles.input}
                required
              />
              <input
                type="number"
                placeholder="Monto"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                style={styles.input}
                required
              />
              <select
                value={form.metodo_pago}
                onChange={(e) =>
                  setForm({ ...form, metodo_pago: e.target.value })
                }
                style={styles.input}
              >
                <option value="transferencia">Transferencia</option>
                <option value="efectivo">Efectivo</option>
                <option value="cheque">Cheque</option>
              </select>
              <select
                value={form.estado}
                onChange={(e) =>
                  setForm({ ...form, estado: e.target.value })
                }
                style={styles.input}
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="anulado">Anulado</option>
              </select>
              <textarea
                placeholder="Observaciones"
                value={form.observaciones}
                onChange={(e) =>
                  setForm({ ...form, observaciones: e.target.value })
                }
                style={styles.input}
              />

              <div style={styles.actions}>
                <button type="submit" style={styles.saveBtn}>
                  Guardar
                </button>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
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
  title: { textAlign: "center", color: "#4b0082", marginBottom: "1rem" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "8px",
    overflow: "hidden",
  },
  editBtn: {
    marginRight: "0.5rem",
    padding: "0.4rem 0.8rem",
    border: "none",
    borderRadius: "6px",
    background: "#4caf50",
    color: "white",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "0.4rem 0.8rem",
    border: "none",
    borderRadius: "6px",
    background: "#f44336",
    color: "white",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "white",
    padding: "2rem",
    borderRadius: "12px",
    width: "400px",
    textAlign: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  input: { padding: "0.8rem", border: "1px solid #ccc", borderRadius: "6px" },
  actions: { display: "flex", justifyContent: "space-between" },
  saveBtn: {
    padding: "0.6rem 1.2rem",
    background: "#4caf50",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "0.6rem 1.2rem",
    background: "#ccc",
    border: "none",
    borderRadius: "8px",
    color: "#333",
    cursor: "pointer",
  },
};
