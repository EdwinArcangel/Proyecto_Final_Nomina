// src/employees/ShowEmployees.jsx
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

export default function ShowEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // Filtros / búsqueda / orden / paginación
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("fecha_ingreso"); // "fecha_ingreso" | "nombre_empleado" | "salario_base" | "cargo"
  const [sortDir, setSortDir] = useState("desc"); // "asc" | "desc"
  const [page, setPage] = useState(1);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const modalRef = useRef(null);

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
    arl: "",
  });

  const formatterCOP = useMemo(
    () =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }),
    []
  );

  // Cargar empleados
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const res = await api.get("/empleados");
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setErrMsg("Error cargando empleados");
      toast.error("❌ Error cargando empleados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Helpers
  const resetForm = () =>
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
      arl: "",
    });

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  // Guardar
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre_empleado.trim()) {
      toast.warning("⚠️ El nombre es obligatorio");
      return;
    }
    if (!form.documento.trim()) {
      toast.warning("⚠️ El documento es obligatorio");
      return;
    }
    if (!form.cargo.trim()) {
      toast.warning("⚠️ El cargo es obligatorio");
      return;
    }
    const salarioNumber = Number(form.salario_base);
    if (!salarioNumber || salarioNumber <= 0) {
      toast.warning("⚠️ El salario base debe ser mayor a 0");
      return;
    }

    const payload = { ...form, salario_base: salarioNumber };

    try {
      if (editingId) {
        await api.put(`/empleados/${editingId}`, payload);
        toast.success("✏️ Empleado actualizado");
      } else {
        await api.post("/empleados", payload);
        toast.success("✅ Empleado creado");
      }
      closeModal();
      fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error("❌ Error guardando empleado");
    }
  };

  // Editar
  const handleEdit = (emp) => {
    setForm({
      nombre_empleado: emp.nombre_empleado ?? "",
      documento: emp.documento ?? "",
      email: emp.email ?? "",
      telefono: emp.telefono ?? "",
      direccion: emp.direccion ?? "",
      fecha_ingreso: emp.fecha_ingreso?.substring(0, 10) ?? "",
      cargo: emp.cargo ?? "",
      salario_base: emp.salario_base ?? "",
      eps: emp.eps ?? "",
      pension: emp.pension ?? "",
      arl: emp.arl ?? "",
    });
    setEditingId(emp.id);
    setModalOpen(true);
  };

  // Eliminar
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este empleado?")) return;
    try {
      await api.delete(`/empleados/${id}`);
      toast.success("🗑️ Empleado eliminado");
      fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error("❌ Error eliminando empleado");
    }
  };

  // Filtrado / orden
  const filtered = useMemo(() => {
    let data = [...employees];
    if (q.trim()) {
      const t = q.toLowerCase();
      data = data.filter(
        (e) =>
          String(e.id).includes(t) ||
          (e.nombre_empleado || "").toLowerCase().includes(t) ||
          (e.documento || "").toLowerCase().includes(t) ||
          (e.email || "").toLowerCase().includes(t) ||
          (e.cargo || "").toLowerCase().includes(t)
      );
    }
    data.sort((a, b) => {
      let A = a[sortBy];
      let B = b[sortBy];
      if (sortBy === "fecha_ingreso") {
        A = A ? new Date(A) : new Date(0);
        B = B ? new Date(B) : new Date(0);
      } else if (sortBy === "salario_base") {
        A = Number(A) || 0;
        B = Number(B) || 0;
      } else if (sortBy === "nombre_empleado" || sortBy === "cargo") {
        A = (A || "").toLowerCase();
        B = (B || "").toLowerCase();
      }
      const comp = A > B ? 1 : A < B ? -1 : 0;
      return sortDir === "asc" ? comp : -comp;
    });
    return data;
  }, [employees, q, sortBy, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    const start = (pageClamped - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageClamped]);

  useEffect(() => {
    setPage(1);
  }, [q]);

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
          <h2 className="title">👥 Gestión de Empleados</h2>
          <p className="subtitle">
            Registra, edita y consulta empleados.{" "}
            <span className="muted">
              ({employees.length} total{employees.length === 1 ? "" : "es"})
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
          + Crear Empleado
        </button>
      </header>

      {/* Filtros / búsqueda / orden */}
      <div className="toolbar">
        <input
          type="search"
          placeholder="Buscar por ID, nombre, documento, email o cargo…"
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
            <option value="fecha_ingreso">Fecha ingreso</option>
            <option value="nombre_empleado">Nombre</option>
            <option value="salario_base">Salario</option>
            <option value="cargo">Cargo</option>
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
              <th>Documento</th>
              <th>Email</th>
              <th>Cargo</th>
              <th>Salario Base</th>
              <th>Fecha Ingreso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="center muted">Cargando empleados…</td>
              </tr>
            ) : errMsg ? (
              <tr>
                <td colSpan="8" className="center error">{errMsg}</td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan="8" className="center muted">No hay empleados</td>
              </tr>
            ) : (
              pageData.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td className="left">{emp.nombre_empleado}</td>
                  <td>{emp.documento}</td>
                  <td className="email-cell">
                    <a href={`mailto:${emp.email}`} className="email-link">
                      {emp.email || "—"}
                    </a>
                  </td>
                  <td>{emp.cargo}</td>
                  <td>{formatterCOP.format(emp.salario_base)}</td>
                  <td>{emp.fecha_ingreso?.substring(0, 10)}</td>
                  <td className="actions">
                    <button className="btn btn-warning" onClick={() => handleEdit(emp)}>✏️ Editar</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(emp.id)}>🗑️ Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {!loading && filtered.length > 0 && (
        <div className="pagination">
          <button
            className="btn btn-light"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pageClamped === 1}
          >
            ◀ Anterior
          </button>
          <span className="muted">
            Página {pageClamped} de {totalPages}
          </span>
          <button
            className="btn btn-light"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={pageClamped === totalPages}
          >
            Siguiente ▶
          </button>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {modalOpen && (
        <div className="modal-overlay" ref={modalRef} role="dialog" aria-modal="true">
          <div className="modal modal-lg" role="document">
            <h3 className="modal-title" style={{ textAlign: "center" }}>
              {editingId ? "✏️ Editar Empleado" : "➕ Crear Empleado"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label htmlFor="nombre_empleado">Nombre</label>
                  <input
                    id="nombre_empleado"
                    type="text"
                    value={form.nombre_empleado}
                    onChange={(e) => setForm({ ...form, nombre_empleado: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="documento">Documento</label>
                  <input
                    id="documento"
                    type="text"
                    value={form.documento}
                    onChange={(e) => setForm({ ...form, documento: e.target.value })}
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
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    id="telefono"
                    type="text"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="direccion">Dirección</label>
                  <input
                    id="direccion"
                    type="text"
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="fecha_ingreso">Fecha Ingreso</label>
                  <input
                    id="fecha_ingreso"
                    type="date"
                    value={form.fecha_ingreso}
                    max={new Date().toISOString().substring(0, 10)}
                    onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cargo">Cargo</label>
                  <input
                    id="cargo"
                    type="text"
                    value={form.cargo}
                    onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="salario_base">Salario Base</label>
                  <input
                    id="salario_base"
                    type="number"
                    min="1"
                    step="1"
                    value={form.salario_base}
                    onChange={(e) => setForm({ ...form, salario_base: e.target.value })}
                    onBlur={() => {
                      const n = Number(form.salario_base);
                      if (!n || n <= 0) setForm((f) => ({ ...f, salario_base: "" }));
                    }}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="eps">EPS</label>
                  <input
                    id="eps"
                    type="text"
                    value={form.eps}
                    onChange={(e) => setForm({ ...form, eps: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="pension">Pensión</label>
                  <input
                    id="pension"
                    type="text"
                    value={form.pension}
                    onChange={(e) => setForm({ ...form, pension: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="arl">ARL</label>
                  <input
                    id="arl"
                    type="text"
                    value={form.arl}
                    onChange={(e) => setForm({ ...form, arl: e.target.value })}
                  />
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

/* === Estilos === */
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
/* placeholder más pequeño */
.input::placeholder{font-size:.9rem; color:var(--muted);}
select.input option{color:var(--text);background:#fff;}
.sorter{display:flex;gap:.5rem;align-items:center;}
.small-label{font-size:.9rem;} /* 'Ordenar por:' más pequeño */

/* Tabla */
.table-wrap{background:var(--card);border:1px solid var(--border);border-radius:1rem;margin-top:1rem;overflow:auto;box-shadow:0 6px 20px rgba(15,23,42,.06);position:relative;z-index:1;}
.table{width:100%;border-collapse:separate;border-spacing:0;}
.table thead th{position:sticky;top:0;background:#f9fafb;z-index:1;text-align:center;padding:.8rem;border-bottom:1px solid var(--border);}
.table td{padding:.8rem;text-align:center;border-bottom:1px solid var(--border);vertical-align:middle;}
.table tr:hover td{background:#fafafa;}
.table .left{text-align:left;}
.actions{white-space:nowrap;}

/* Email centrado y con corte limpio */
.table td.email-cell{ text-align:center; white-space:normal; }
.email-link{
  display:block;                /* en su propia línea */
  text-decoration:none;
  color:inherit;
  word-break:break-word;        /* corta correos largos */
  line-height:1.2;
}

/* Paginación */
.pagination{display:flex;align-items:center;gap:1rem;justify-content:flex-end;margin-top:1rem;}

/* Botones */
.btn{
  padding:.35rem .65rem;font-size:.85rem;border:none;border-radius:.5rem;cursor:pointer;font-weight:600;
  transition:transform .05s ease,box-shadow .2s ease,background .2s ease,opacity .2s ease;
  box-shadow:0 2px 0 rgba(0,0,0,.03);
}
.btn:disabled{opacity:.6;cursor:not-allowed;}
.btn:active{transform:translateY(1px);}
.btn-primary{background:var(--primary);color:#fff;}
.btn-primary:hover{background:var(--primary-600);}
.btn-warning{background:#f59e0b;color:#fff;margin-right:.3rem;}
.btn-danger{background:var(--danger);color:#fff;}
.btn-success{background:var(--success);color:#fff;}
.btn-secondary{background:#9ca3af;color:#fff;}
.btn-light{background:#eef0f5;}

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
