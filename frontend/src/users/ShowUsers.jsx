// src/users/ShowUsers.jsx
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import api, { API_PREFIX } from "../utils/api"; // ⬅️ usa API_PREFIX
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

export default function ShowUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // UI
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("nombre_usuario");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const modalRef = useRef(null);

  const [form, setForm] = useState({
    nombre_usuario: "",
    email: "",
    password: "",
    rol: "empleado",
  });

  // Cargar usuarios
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const res = await api.get(`${API_PREFIX}/usuarios`); // ⬅️ /api
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando usuarios:", err?.response?.data || err.message);
      setErrMsg(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error cargando usuarios"
      );
      toast.error("❌ Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Helpers
  const resetForm = () =>
    setForm({
      nombre_usuario: "",
      email: "",
      password: "",
      rol: "empleado",
    });

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  // Guardar / actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre_usuario.trim()) {
      toast.warning("⚠️ El nombre es obligatorio");
      return;
    }
    if (!form.email.trim()) {
      toast.warning("⚠️ El email es obligatorio");
      return;
    }
    if (!editingId && !form.password.trim()) {
      toast.warning("⚠️ La contraseña es obligatoria para crear");
      return;
    }

    const payload = {
      nombre_usuario: form.nombre_usuario.trim(),
      email: form.email.trim(),
      rol: form.rol,
      ...(form.password.trim() ? { password: form.password } : {}),
    };

    try {
      if (editingId) {
        await api.put(`${API_PREFIX}/usuarios/${editingId}`, payload); // ⬅️ /api
        toast.success("✏️ Usuario actualizado con éxito");
      } else {
        await api.post(`${API_PREFIX}/usuarios`, payload); // ⬅️ /api
        toast.success("✅ Usuario creado con éxito");
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error("❌ Error guardando usuario:", err?.response?.data || err.message);
      toast.error(
        `❌ ${
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error guardando usuario"
        }`
      );
    }
  };

  // Editar
  const handleEdit = (u) => {
    setForm({
      nombre_usuario: u.nombre_usuario ?? "",
      email: u.email ?? "",
      password: "",
      rol: u.rol ?? "empleado",
    });
    setEditingId(u.id);
    setModalOpen(true);
  };

  // Eliminar
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await api.delete(`${API_PREFIX}/usuarios/${id}`); // ⬅️ /api
      toast.success("🗑️ Usuario eliminado con éxito");
      fetchUsers();
    } catch (err) {
      console.error("❌ Error eliminando usuario:", err?.response?.data || err.message);
      toast.error(
        `❌ ${
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error eliminando usuario"
        }`
      );
    }
  };

  // Filtro + orden
  const filtered = useMemo(() => {
    let data = [...users];
    if (q.trim()) {
      const t = q.toLowerCase();
      data = data.filter(
        (u) =>
          String(u.id).includes(t) ||
          (u.nombre_usuario || "").toLowerCase().includes(t) ||
          (u.email || "").toLowerCase().includes(t) ||
          (u.rol || "").toLowerCase().includes(t)
      );
    }
    data.sort((a, b) => {
      let A = a[sortBy];
      let B = b[sortBy];
      if (sortBy === "id") {
        A = Number(A) || 0;
        B = Number(B) || 0;
      } else {
        A = (A || "").toString().toLowerCase();
        B = (B || "").toString().toLowerCase();
      }
      const comp = A > B ? 1 : A < B ? -1 : 0;
      return sortDir === "asc" ? comp : -comp;
    });
    return data;
  }, [users, q, sortBy, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    const start = (pageClamped - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageClamped]);

  useEffect(() => setPage(1), [q]);

  // Cerrar modal con Escape y clic fuera
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    const onClick = (e) => {
      if (modalRef.current && e.target === modalRef.current) closeModal();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [modalOpen]);

  return (
    <div className="container">
      <header className="header">
        <div>
          <h2 className="title">🧑‍💻 Gestión de Usuarios</h2>
          <p className="subtitle">
            Crea, edita y administra usuarios{" "}
            <span className="muted">({users.length} total{users.length === 1 ? "" : "es"})</span>
          </p>
        </div>
        <button
          className="btn btn-primary btn-cta"
          onClick={() => {
            setEditingId(null);
            resetForm();
            setModalOpen(true);
          }}
        >
          + Crear Usuario
        </button>
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        <input
          type="search"
          placeholder="Buscar por ID, nombre, email o rol…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input input-sm"
          aria-label="Buscar"
        />

        <div className="sorter">
          <label className="muted small-label">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input input-sm"
            aria-label="Ordenar por"
          >
            <option value="nombre_usuario">Nombre</option>
            <option value="email">Email</option>
            <option value="rol">Rol</option>
            <option value="id">ID</option>
          </select>
          <button
            className="btn btn-light btn-sm"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            title={`Dirección: ${sortDir === "asc" ? "Ascendente" : "Descendente"}`}
          >
            {sortDir === "asc" ? "⬆️" : "⬇️"}
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="center muted">Cargando usuarios…</td>
              </tr>
            ) : errMsg ? (
              <tr>
                <td colSpan="5" className="center error">{errMsg}</td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan="5" className="center muted">No hay usuarios registrados</td>
              </tr>
            ) : (
              pageData.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td className="left">{u.nombre_usuario}</td>
                  <td className="email-cell">
                    <a href={`mailto:${u.email}`} className="email-link">
                      {u.email || "—"}
                    </a>
                  </td>
                  <td>
                    <span className={`badge ${String(u.rol).toLowerCase() === "admin" ? "warn" : ""}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn btn-warning" onClick={() => handleEdit(u)}>✏️ Editar</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(u.id)}>🗑️ Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar */}
      {modalOpen && (
        <div className="modal-overlay" ref={modalRef} role="dialog" aria-modal="true">
          <div className="modal" role="document">
            <h3 className="modal-title" style={{ textAlign: "center" }}>
              {editingId ? "✏️ Editar Usuario" : "➕ Crear Usuario"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label htmlFor="nombre_usuario">Nombre</label>
                  <input
                    id="nombre_usuario"
                    type="text"
                    value={form.nombre_usuario}
                    onChange={(e) => setForm({ ...form, nombre_usuario: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password">
                    Contraseña {editingId ? <span className="muted">(opcional al editar)</span> : ""}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingId ? "Dejar en blanco para no cambiar" : ""}
                    {...(editingId ? {} : { required: true })}
                  />
                </div>

                <div>
                  <label htmlFor="rol">Rol</label>
                  <select
                    id="rol"
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  >
                    <option value="empleado">Empleado</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-success">
                  {editingId ? "Actualizar" : "Guardar"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}
/* === Estilos (alineados con Pagos/Empleados) === */
const styles = `
:root{
  --bg:#f6f8fb;
  --card:#ffffff;
  --border:#e6e8ef;
  --muted:#6b7280;
  --text:#0f172a;
  --primary:#4f46e5;
  --primary-600:#5048f0;
  --warn:#f59e0b;
  --danger:#ef4444;
  --success:#16a34a;
}

*{box-sizing:border-box}
.container {
  padding: 1.5rem 2rem;
  background: var(--bg);
  min-height: 100vh;
  color: var(--text);
}
.header{display:flex;align-items:center;justify-content:space-between;gap:1rem;}
.title{margin:0;}
.subtitle{margin:.25rem 0 0;color:var(--muted);}
.muted{color:var(--muted);}

/* Toolbar */
.toolbar{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem;position:relative;z-index:10;}
.input{padding:.6rem .8rem;border:1px solid var(--border);border-radius:.6rem;background:#fff;color:var(--text);}
.input-sm{padding:.45rem .65rem; font-size:.9rem;}   /* inputs más compactos */
.btn-sm{padding:.35rem .6rem; font-size:.85rem;}
.input::placeholder{font-size:.9rem; color:var(--muted);}
select.input option{color:var(--text);background:#fff;}
.sorter{display:flex;gap:.5rem;align-items:center;}
.small-label{font-size:.9rem;}

/* Tabla */
.table-wrap{background:var(--card);border:1px solid var(--border);border-radius:1rem;margin-top:1rem;overflow:auto;box-shadow:0 6px 20px rgba(15,23,42,.06);position:relative;z-index:1;}
.table{width:100%;border-collapse:separate;border-spacing:0;}
.table thead th{position:sticky;top:0;background:#f9fafb;z-index:1;text-align:center;padding:.8rem;border-bottom:1px solid var(--border);}
.table td{padding:.8rem;text-align:center;border-bottom:1px solid var(--border);vertical-align:middle;}
.table tr:hover td{background:#fafafa;}
.table .left{text-align:left;}
.actions{white-space:nowrap;}

/* Botones de acciones en tabla: compactos y consistentes */
.table .actions .btn {
  padding: .55rem .85rem;
  font-size: .9rem;
  border-radius: .5rem;
  box-shadow: none;
  margin-right: .3rem;
}
.table .actions .btn:last-child {
  margin-right: 0;
}

/* Email en celda */
.table td.email-cell{ text-align:center; white-space:normal; }
.email-link{
  display:block;
  text-decoration:none;
  color:inherit;
  word-break:break-word;
  line-height:1.2;
}

/* Paginación */
.pagination{display:flex;align-items:center;gap:1rem;justify-content:flex-end;margin-top:1rem;}

/* Botones generales */
.btn{
  padding:.95rem 1.35rem;
  font-size:1.05rem;
  border-radius:.8rem;
  box-shadow:0 8px 20px rgba(79,70,229,.22);
}
.btn:disabled{opacity:.6;cursor:not-allowed;}
.btn:active{transform:translateY(1px);}
.btn-primary{background:var(--primary);color:#fff;}
.btn-primary:hover{background:var(--primary-600);}
.btn-warning{background:#f59e0b;color:#fff;}
.btn-danger{background:var(--danger);color:#fff;}
.btn-success{background:var(--success);color:#fff;}
.btn-secondary{background:#9ca3af;color:#fff;}
.btn-light{background:#eef0f5;}

/* Botones CTA (crear/registrar) */
.btn-cta{
  padding:.95rem 1.35rem;
  font-size:1.05rem;
  border-radius:.8rem;
  box-shadow:0 8px 20px rgba(79,70,229,.22);
}
.btn-cta:hover{transform:translateY(-1px);}
.btn-cta:active{transform:translateY(0);}

/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(2,6,23,.6);display:flex;justify-content:center;align-items:center;z-index:1000;padding:1rem;}
.modal{background:var(--card);padding:1.25rem 1.25rem 1rem;border-radius:16px;width:520px;max-width:95%;border:1px solid var(--border);box-shadow:0 30px 80px rgba(2,6,23,.25);}
.modal-lg{width:720px;}
.modal-title{margin:0 0 1rem;}
.modal-actions{margin-top:1.2rem;display:flex;justify-content:flex-end;gap:.7rem;}

/* Form */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.form-grid label,.modal label{display:block;margin-bottom:.35rem;font-weight:600;color:var(--text);}
.form-grid input,.form-grid select,textarea{width:100%;padding:.6rem .8rem;border:1px solid var(--border);border-radius:.6rem;background:#fff;outline:none;color:var(--text);}
.form-grid input:focus,.form-grid select:focus,textarea:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(79,70,229,.15);}
.form-grid input::placeholder,textarea::placeholder{color:var(--muted);opacity:1;}
.form-grid select option{color:var(--text);background:#fff;}
.form-grid input:-webkit-autofill,.form-grid select:-webkit-autofill,textarea:-webkit-autofill{-webkit-text-fill-color:var(--text);box-shadow:0 0 0px 1000px #fff inset;transition:background-color 9999s ease-in-out 0s;}
`;