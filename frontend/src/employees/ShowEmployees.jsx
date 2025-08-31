import { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

export default function ShowEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nombre_empleado: "",
    documento: "",
    email: "",
    telefono: "",
    direccion: "",
    fecha_ingreso: "",
    cargo: "",
    salario_base: "",
    eps: "",
    pension: "",
    arl: ""
  });

  // 🔹 Cargar empleados
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/empleados");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error cargando empleados:", err);
      toast.error("❌ Error cargando empleados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 🔹 Guardar empleado
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/empleados/${editing.id}`, form);
        toast.success("✏️ Empleado actualizado exitosamente");
      } else {
        await api.post("/empleados", form);
        toast.success("✅ Empleado creado exitosamente");
      }
      setShowForm(false);
      setForm({
        nombre_empleado: "",
        documento: "",
        email: "",
        telefono: "",
        direccion: "",
        fecha_ingreso: "",
        cargo: "",
        salario_base: "",
        eps: "",
        pension: "",
        arl: ""
      });
      setEditing(null);
      fetchEmployees();
    } catch (err) {
      console.error("Error guardando empleado:", err);
      toast.error("❌ Error guardando empleado: " + (err.response?.data?.message || err.message));
    }
  };

  // 🔹 Eliminar empleado
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este empleado?")) return;
    try {
      await api.delete(`/empleados/${id}`);
      toast.success("🗑️ Empleado eliminado con éxito");
      fetchEmployees();
    } catch (err) {
      console.error("Error eliminando empleado:", err);
      toast.error("❌ Error eliminando empleado");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>👥 Gestión de Empleados</h2>
        <button style={styles.addBtn} onClick={() => { setShowForm(true); setEditing(null); }}>
          ➕ Crear Empleado
        </button>
      </div>

      {loading ? (
        <p>Cargando empleados...</p>
      ) : (
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Documento</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Cargo</th>
              <th style={styles.th}>Salario Base</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id}>
                  <td style={styles.td}>{emp.id}</td>
                  <td style={styles.td}>{emp.nombre_empleado}</td>
                  <td style={styles.td}>{emp.documento}</td>
                  <td style={styles.td}>{emp.email}</td>
                  <td style={styles.td}>{emp.cargo}</td>
                  <td style={styles.td}>
                    {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(emp.salario_base)}
                  </td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => { setEditing(emp); setForm(emp); setShowForm(true); }}>✏️ Editar</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(emp.id)}>🗑️ Eliminar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={styles.td}>No hay empleados registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal Crear/Editar */}
      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ color: "#000", marginBottom: "1rem" }}>
            { editing ? "✏️ Editar Empleado" : "➕ Crear Empleado"}</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.label}>Nombre</label>
              <input style={styles.input} type="text" value={form.nombre_empleado} onChange={(e) => setForm({ ...form, nombre_empleado: e.target.value })} required />

              <label style={styles.label}>Documento</label>
              <input style={styles.input} type="text" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} required />

              <label style={styles.label}>Email</label>
              <input style={styles.input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />

              <label style={styles.label}>Teléfono</label>
              <input style={styles.input} type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />

              <label style={styles.label}>Dirección</label>
              <input style={styles.input} type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />

              <label style={styles.label}>Fecha Ingreso</label>
              <input style={styles.input} type="date" value={form.fecha_ingreso} onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })} required />

              <label style={styles.label}>Cargo</label>
              <input style={styles.input} type="text" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} required />

              <label style={styles.label}>Salario Base</label>
              <input style={styles.input} type="number" value={form.salario_base} onChange={(e) => setForm({ ...form, salario_base: e.target.value })} required />

              <label style={styles.label}>EPS</label>
              <input style={styles.input} type="text" value={form.eps} onChange={(e) => setForm({ ...form, eps: e.target.value })} />

              <label style={styles.label}>Pensión</label>
              <input style={styles.input} type="text" value={form.pension} onChange={(e) => setForm({ ...form, pension: e.target.value })} />

              <label style={styles.label}>ARL</label>
              <input style={styles.input} type="text" value={form.arl} onChange={(e) => setForm({ ...form, arl: e.target.value })} />

              <div style={styles.modalActions}>
                <button type="submit" style={styles.addBtn}>{editing ? "Actualizar" : "Guardar"}</button>
                <button type="button" style={styles.deleteBtn} onClick={() => setShowForm(false)}>Cancelar</button>
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
  form: { display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1rem" },
  input: { padding: "0.6rem", border: "1px solid #ccc", borderRadius: "6px" },
  label: { textAlign: "left", fontWeight: "bold", color: "#333" },
  modalActions: { display: "flex", justifyContent: "space-between", marginTop: "1rem" },
};
