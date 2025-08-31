import { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

export default function ShowUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nuevo, setNuevo] = useState({
    nombre_usuario: "",
    email: "",
    password: "",
    rol: "empleado",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/usuarios");
      setUsers(res.data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      toast.error("❌ Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setNuevo({ ...nuevo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/usuarios/${editing.id}`, nuevo);
        toast.success("✏️ Usuario actualizado con éxito");
      } else {
        await api.post("/usuarios", nuevo);
        toast.success("✅ Usuario creado con éxito");
      }

      setNuevo({ nombre_usuario: "", email: "", password: "", rol: "empleado" });
      setShowForm(false);
      setEditing(null);
      fetchUsers();
    } catch (err) {
      console.error("❌ Error guardando usuario:", err);
      toast.error("❌ Error guardando usuario");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success("🗑️ Usuario eliminado con éxito");
      fetchUsers();
    } catch (err) {
      console.error("❌ Error eliminando usuario:", err);
      toast.error("❌ Error eliminando usuario");
    }
  };

  return (
    <div style={styles.container}>
      {/* Encabezado */}
      <div style={styles.header}>
        <h2 style={styles.title}>🧑‍💻 Gestión de Usuarios</h2>
        <button
          style={styles.addBtn}
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setNuevo({ nombre_usuario: "", email: "", password: "", rol: "empleado" });
          }}
        >
          ➕ Crear Usuario
        </button>
      </div>

      {/* Formulario Crear/Editar */}
      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="nombre_usuario"
            placeholder="Nombre"
            value={nuevo.nombre_usuario}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Correo"
            value={nuevo.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={nuevo.password}
            onChange={handleChange}
            style={styles.input}
          />
          <select name="rol" value={nuevo.rol} onChange={handleChange} style={styles.input}>
            <option value="empleado">Empleado</option>
            <option value="admin">Admin</option>
          </select>
          <div>
            <button type="submit" style={styles.saveBtn}>
              {editing ? "Actualizar" : "Guardar"}
            </button>
            <button type="button" style={styles.deleteBtn} onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Tabla */}
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Rol</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.id}</td>
                  <td style={styles.td}>{u.nombre_usuario}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.rol}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.editBtn}
                      onClick={() => {
                        setEditing(u);
                        setNuevo({ ...u, password: "" }); // 👈 no mostramos hash
                        setShowForm(true);
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(u.id)}>
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={styles.td} colSpan="5">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
  payBtn: { marginLeft: "0.5rem", padding: "0.4rem 0.8rem", border: "none", borderRadius: "6px", background: "#22c55e", color: "white", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" },
  modal: { background: "white", padding: "2rem", borderRadius: "12px", width: "400px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" },
  input: { padding: "0.8rem", border: "1px solid #ccc", borderRadius: "6px" },
  modalActions: { display: "flex", justifyContent: "space-between", marginTop: "1rem" },
};
