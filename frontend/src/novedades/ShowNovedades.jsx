// src/novedades/ShowNovedades.jsx
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import api, { API_PREFIX } from "../utils/api";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

const TIPOS = [
  { value: "incapacidad", label: "Incapacidad" },
  { value: "licencia", label: "Licencia" },
  { value: "vacaciones", label: "Vacaciones" },
  { value: "horas_extra", label: "Horas Extra" },
  { value: "ausencia", label: "Ausencia" },
  { value: "bonificacion", label: "Bonificación" },
  { value: "descuento", label: "Descuento" },
];

const ESTADOS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "aprobada", label: "Aprobada" },
  { value: "rechazada", label: "Rechazada" },
];

export default function ShowNovedades() {
  const [novedades, setNovedades] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // UI: búsqueda / filtros / orden / paginación
  const [q, setQ] = useState("");
  const [fTipo, setFTipo] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [sortBy, setSortBy] = useState("fecha_inicio");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const modalRef = useRef(null);

  const [form, setForm] = useState({
    nombre_empleado: "",
    tipo: "incapacidad",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "pendiente",
  });

  // Cargar datos
  const fetchNovedades = useCallback(async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const res = await api.get(`${API_PREFIX}/novedades`);
      setNovedades(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando novedades:", err?.response?.data || err.message);
      setErrMsg(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error cargando novedades"
      );
      toast.error("❌ Error cargando novedades");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmpleados = useCallback(async () => {
    try {
      const res = await api.get(`${API_PREFIX}/empleados`);
      setEmpleados(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando empleados:", err?.response?.data || err.message);
    }
  }, []);

  useEffect(() => {
    fetchNovedades();
    fetchEmpleados();
  }, [fetchNovedades, fetchEmpleados]);

  // Helpers
  const resetForm = () =>
    setForm({
      nombre_empleado: "",
      tipo: "incapacidad",
      descripcion: "",
      fecha_inicio: "",
      fecha_fin: "",
      estado: "pendiente",
    });

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  // Guardar
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre_empleado) {
      toast.warning("⚠️ Selecciona un empleado");
      return;
    }
    if (!form.fecha_inicio) {
      toast.warning("⚠️ La fecha de inicio es obligatoria");
      return;
    }
    if (form.fecha_fin && form.fecha_fin < form.fecha_inicio) {
      toast.warning("⚠️ La fecha fin no puede ser anterior a la fecha inicio");
      return;
    }

    // Intenta mapear nombre → id para enviar empleado_id si el backend lo espera
    const emp = empleados.find((e) => e.nombre_empleado === form.nombre_empleado);
    const payload = {
      ...form,
      ...(emp?.id ? { empleado_id: emp.id } : {}),
    };

    try {
      if (editingId) {
        await api.put(`${API_PREFIX}/novedades/${editingId}`, payload);
        toast.success("✏️ Novedad actualizada");
      } else {
        await api.post(`${API_PREFIX}/novedades`, payload);
        toast.success("✅ Novedad creada");
      }
      closeModal();
      fetchNovedades();
    } catch (err) {
      console.error("Error guardando novedad:", err?.response?.data || err.message);
      toast.error(
        `❌ ${
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error guardando novedad"
        }`
      );
    }
  };

  // Editar
  const handleEdit = (n) => {
    setForm({
      nombre_empleado: n.nombre_empleado ?? "",
      tipo: n.tipo ?? "incapacidad",
      descripcion: n.descripcion ?? "",
      fecha_inicio: n.fecha_inicio?.substring(0, 10) ?? "",
      fecha_fin: n.fecha_fin ? n.fecha_fin.substring(0, 10) : "",
      estado: n.estado ?? "pendiente",
    });
    setEditingId(n.id);
    setModalOpen(true);
  };

  // Eliminar
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta novedad?")) return;
    try {
      await api.delete(`${API_PREFIX}/novedades/${id}`);
      toast.success("🗑️ Novedad eliminada");
      fetchNovedades();
    } catch (err) {
      console.error("Error eliminando novedad:", err?.response?.data || err.message);
      toast.error(
        `❌ ${
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error eliminando novedad"
        }`
      );
    }
  };

  // Filtro + búsqueda + orden
  const filtered = useMemo(() => {
    let data = [...novedades];
    const term = q.trim().toLowerCase();

    if (term) {
      data = data.filter(
        (n) =>
          String(n.id).includes(term) ||
          (n.nombre_empleado || "").toLowerCase().includes(term) ||
          (n.tipo || "").toLowerCase().includes(term) ||
          (n.estado || "").toLowerCase().includes(term) ||
          (n.descripcion || "").toLowerCase().includes(term)
      );
    }
    if (fTipo) data = data.filter((n) => (n.tipo || "").toLowerCase() === fTipo);
    if (fEstado) data = data.filter((n) => (n.estado || "").toLowerCase() === fEstado);

    data.sort((a, b) => {
      let A = a[sortBy];
      let B = b[sortBy];
      if (sortBy === "fecha_inicio" || sortBy === "fecha_fin") {
        A = A ? new Date(A) : new Date(0);
        B = B ? new Date(B) : new Date(0);
      } else {
        A = (A || "").toString().toLowerCase();
        B = (B || "").toString().toLowerCase();
      }
      const comp = A > B ? 1 : A < B ? -1 : 0;
      return sortDir === "asc" ? comp : -comp;
    });
    return data;
  }, [novedades, q, fTipo, fEstado, sortBy, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    const start = (pageClamped - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageClamped]);

  useEffect(() => setPage(1), [q, fTipo, fEstado]);

  // Cerrar modal con Escape y click fuera
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
          <h2 className="title">📑 Gestión de Novedades</h2>
          <p className="subtitle">
            Registra, edita y consulta novedades.{" "}
            <span className="muted">
              ({novedades.length} total{novedades.length === 1 ? "" : "es"})
            </span>
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
          + Crear Novedad
        </button>
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        <input
          type="search"
          placeholder="Buscar por ID, empleado, tipo, estado o descripción…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input input-sm"
          aria-label="Buscar"
        />

        <select
          className="input input-sm"
          value={fTipo}
          onChange={(e) => setFTipo(e.target.value)}
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          className="input input-sm"
          value={fEstado}
          onChange={(e) => setFEstado(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>

        <div className="sorter">
          <label className="muted small-label">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input input-sm"
            aria-label="Ordenar por"
          >
            <option value="fecha_inicio">Fecha inicio</option>
            <option value="fecha_fin">Fecha fin</option>
            <option value="nombre_empleado">Empleado</option>
            <option value="tipo">Tipo</option>
            <option value="estado">Estado</option>
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
              <th>Empleado</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="center muted">Cargando novedades…</td>
              </tr>
            ) : errMsg ? (
              <tr>
                <td colSpan="8" className="center error">{errMsg}</td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan="8" className="center muted">No hay novedades registradas</td>
              </tr>
            ) : (
              pageData.map((n) => (
                <tr key={n.id}>
                  <td>{n.id}</td>
                  <td className="left">{n.nombre_empleado}</td>
                  <td><TipoBadge value={n.tipo} /></td>
                  <td className="observaciones">{n.descripcion || "—"}</td>
                  <td>{n.fecha_inicio?.substring(0, 10)}</td>
                  <td>{n.fecha_fin ? n.fecha_fin.substring(0, 10) : "—"}</td>
                  <td><EstadoBadge value={n.estado} /></td>
                  <td className="actions">
                    <button className="btn btn-warning" onClick={() => handleEdit(n)}>✏️ Editar</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(n.id)}>🗑️ Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" ref={modalRef} role="dialog" aria-modal="true">
          <div className="modal modal-lg" role="document">
            <h3 className="modal-title" style={{ textAlign: "center" }}>
              {editingId ? "✏️ Editar Novedad" : "➕ Crear Novedad"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label htmlFor="empleado">Empleado</label>
                  <select
                    id="empleado"
                    value={form.nombre_empleado}
                    onChange={(e) => setForm({ ...form, nombre_empleado: e.target.value })}
                    required
                  >
                    <option value="">Seleccione empleado</option>
                    {empleados.map((emp) => (
                      <option key={emp.id} value={emp.nombre_empleado}>
                        {emp.nombre_empleado}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tipo">Tipo</label>
                  <select
                    id="tipo"
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  >
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="fecha_inicio">Fecha Inicio</label>
                  <input
                    id="fecha_inicio"
                    type="date"
                    value={form.fecha_inicio}
                    max={new Date().toISOString().substring(0, 10)}
                    onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="fecha_fin">Fecha Fin</label>
                  <input
                    id="fecha_fin"
                    type="date"
                    value={form.fecha_fin}
                    onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    rows="3"
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Notas o detalles de la novedad…"
                    style={{ width: "100%", padding: ".6rem .8rem", borderRadius: ".6rem", border: "1px solid var(--border)" }}
                  />
                </div>

                <div>
                  <label htmlFor="estado">Estado</label>
                  <select
                    id="estado"
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
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

function EstadoBadge({ value }) {
  const v = (value || "").toLowerCase();
  const cls =
    v === "aprobada" ? "badge success" :
    v === "pendiente" ? "badge warn" :
    v === "rechazada" ? "badge danger" : "badge";
  const label =
    v === "aprobada" ? "Aprobada" :
    v === "pendiente" ? "Pendiente" :
    v === "rechazada" ? "Rechazada" : value;
  return <span className={cls}>{label}</span>;
}

function TipoBadge({ value }) {
  const v = (value || "").toLowerCase();
  const map = {
    incapacidad: "badge info",
    licencia: "badge method",
    vacaciones: "badge success",
    horas_extra: "badge warn",
    ausencia: "badge danger",
    bonificacion: "badge success",
    descuento: "badge danger",
  };
  const cls = map[v] || "badge";
  const label = TIPOS.find((t) => t.value === v)?.label || value;
  return <span className={cls}>{label}</span>;
}


/* === Estilos (alineados con las demás páginas) === */
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
  margin-right: .34rem;
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