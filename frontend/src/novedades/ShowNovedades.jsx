import { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

export default function ShowNovedades() {
  const [novedades, setNovedades] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    empleado_id: "",
    tipo: "incapacidad",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "pendiente",
  });

  // 🔹 Obtener novedades
  const fetchNovedades = async () => {
    try {
      setLoading(true);
      const res = await api.get("/novedades");
      setNovedades(res.data);
    } catch (err) {
      console.error("Error cargando novedades:", err);
      toast.error("❌ Error cargando novedades");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Obtener empleados para mostrar nombres en select
  const fetchEmpleados = async () => {
    try {
      const res = await api.get("/empleados");
      setEmpleados(res.data);
    } catch (err) {
      console.error("Error cargando empleados:", err);
    }
  };

  useEffect(() => {
    fetchNovedades();
    fetchEmpleados();
  }, []);

  // 🔹 Guardar novedad
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/novedades/${editing.id}`, form);
        toast.success("✏️ Novedad actualizada");
      } else {
        await api.post("/novedades", form);
        toast.success("✅ Novedad creada");
      }
      setShowForm(false);
      setEditing(null);
      setForm({
        empleado_id: "",
        tipo: "incapacidad",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
        estado: "pendiente",
      });
      fetchNovedades();
    } catch (err) {
      console.error("Error guardando novedad:", err);
      toast.error("❌ Error guardando novedad");
    }
  };

  // 🔹 Eliminar novedad
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta novedad?")) return;
    try {
      await api.delete(`/novedades/${id}`);
      toast.success("🗑️ Novedad eliminada");
      fetchNovedades();
    } catch (err) {
      console.error("Error eliminando novedad:", err);
      toast.error("❌ Error eliminando novedad");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📑 Gestión de Novedades</h2>
        <button
          style={styles.addBtn}
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
        >
          ➕ Crear Novedad
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <p>Cargando novedades...</p>
      ) : (
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Empleado</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Descripción</th>
              <th style={styles.th}>Fecha Inicio</th>
              <th style={styles.th}>Fecha Fin</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {novedades.length > 0 ? (
              novedades.map((n) => (
                <tr key={n.id}>
                  <td style={styles.td}>{n.id}</td>
                  <td style={styles.td}>{n.empleado}</td>
                  <td style={styles.td}>{n.tipo}</td>
                  <td style={styles.td}>{n.descripcion}</td>
                  <td style={styles.td}>{n.fecha_inicio}</td>
                  <td style={styles.td}>{n.fecha_fin || "—"}</td>
                  <td style={styles.td}>{n.estado}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.editBtn}
                      onClick={() => {
                        setEditing(n);
                        setForm({
                          empleado_id: n.empleado_id,
                          tipo: n.tipo,
                          descripcion: n.descripcion,
                          fecha_inicio: n.fecha_inicio,
                          fecha_fin: n.fecha_fin,
                          estado: n.estado,
                        });
                        setShowForm(true);
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(n.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={styles.td}>
                  No hay novedades registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ color: "#000" }}>
              {editing ? "✏️ Editar Novedad" : "➕ Crear Novedad"}
            </h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <select
                style={styles.input}
                value={form.empleado_id}
                onChange={(e) => setForm({ ...form, empleado_id: e.target.value })}
                required
              >
                <option value="">Seleccione Empleado</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre_empleado}
                  </option>
                ))}
              </select>

              <select
                style={styles.input}
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              >
                <option value="incapacidad">Incapacidad</option>
                <option value="licencia">Licencia</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="horas_extra">Horas Extra</option>
                <option value="ausencia">Ausencia</option>
                <option value="bonificacion">Bonificación</option>
                <option value="descuento">Descuento</option>
              </select>

              <textarea
                style={styles.input}
                placeholder="Descripción"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />

              <input
                style={styles.input}
                type="date"
                value={form.fecha_inicio}
                onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                required
              />

              <input
                style={styles.input}
                type="date"
                value={form.fecha_fin}
                onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
              />

              <select
                style={styles.input}
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
              >
                <option value="pendiente">Pendiente</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
              </select>

              <div style={styles.modalActions}>
                <button type="submit" style={styles.addBtn}>
                  {editing ? "Actualizar" : "Guardar"}
                </button>
                <button
                  type="button"
                  style={styles.deleteBtn}
                  onClick={() => setShowForm(false)}
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
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  title: { flex: 1, textAlign: "center", color: "#4b0082", margin: 0 },
  addBtn: { padding: "0.6rem 1rem", border: "none", borderRadius: "6px", background: "#4facfe", color: "white", cursor: "pointer", fontWeight: "bold" },
  table: { width: "100%", borderCollapse: "collapse", background: "white" },
  thead: { background: "#f5f6ff" },
  th: { textAlign: "center", padding: "0.8rem", color: "#333", fontWeight: 600 },
  td: { textAlign: "center", padding: "0.8rem", borderBottom: "1px solid #eee", color: "#333" },
  editBtn: { marginRight: "0.5rem", padding: "0.4rem 0.8rem", border: "none", borderRadius: "6px", background: "#facc15", cursor: "pointer" },
  deleteBtn: { padding: "0.4rem 0.8rem", border: "none", borderRadius: "6px", background: "#f87171", color: "white", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" },
  modal: { background: "white", padding: "2rem", borderRadius: "12px", width: "400px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" },
  input: { padding: "0.8rem", border: "1px solid #ccc", borderRadius: "6px" },
  modalActions: { display: "flex", justifyContent: "space-between", marginTop: "1rem" },
};
