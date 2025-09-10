// src/payments/ShowPayments.jsx
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;
const ESTADOS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "pagado", label: "Pagado" },
  { value: "anulado", label: "Anulado" },
];

export default function ShowPayments() {
  const [pagos, setPagos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // UI: búsqueda / filtros / orden / paginación
  const [q, setQ] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [sortBy, setSortBy] = useState("fecha_pago"); // "fecha_pago" | "monto"
  const [sortDir, setSortDir] = useState("desc"); // "asc" | "desc"
  const [page, setPage] = useState(1);

  // Modal / edición
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingWasPagado, setEditingWasPagado] = useState(false); // ✅ nuevo
  const modalRef = useRef(null);

  const [form, setForm] = useState({
    empleado_id: "",
    periodo_id: "",
    fecha_pago: "",
    monto: "",
    metodo_pago: "transferencia",
    // estado no se edita en UI, pero lo enviamos en el PUT/POST:
    estado: "pendiente",
    observaciones: "",
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

  const fetchPagos = useCallback(async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const res = await api.get("/pagos");
      setPagos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setErrMsg("Error cargando pagos");
      toast.error("❌ Error cargando pagos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmpleados = useCallback(async () => {
    try {
      const res = await api.get("/empleados");
      setEmpleados(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("❌ Error cargando empleados");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchPagos();
    fetchEmpleados();
  }, [fetchPagos, fetchEmpleados]);

  // Helpers
  const resetForm = () =>
    setForm({
      empleado_id: "",
      periodo_id: "",
      fecha_pago: "",
      monto: "",
      metodo_pago: "transferencia",
      estado: "pendiente",
      observaciones: "",
    });

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setEditingWasPagado(false);
    resetForm();
  };

  // Acciones CRUD
  const handleSave = async () => {
    // Validaciones mínimas
    if (!form.empleado_id) {
      toast.warning("⚠️ Selecciona un empleado");
      return;
    }
    if (!form.fecha_pago) {
      toast.warning("⚠️ La fecha de pago es obligatoria");
      return;
    }
    const montoNumber = Number(form.monto);
    if (!montoNumber || montoNumber <= 0) {
      toast.warning("⚠️ El monto debe ser mayor a 0");
      return;
    }

    // Estado final:
    // - Nuevo -> "pendiente"
    // - Edición: si antes estaba "pagado", lo reabrimos a "pendiente" para habilitar "Pagar"
    //            si no, conservamos el estado actual del form
    const nextEstado = !editingId
      ? "pendiente"
      : editingWasPagado
      ? "pendiente"
      : form.estado;

    // Normalizamos tipos
    const payload = {
      ...form,
      empleado_id: Number(form.empleado_id),
      periodo_id: form.periodo_id ? Number(form.periodo_id) : null,
      monto: montoNumber,
      estado: nextEstado,
    };

    try {
      if (editingId) {
        await api.put(`/pagos/${editingId}`, payload);
        toast.success(
          editingWasPagado
            ? "✏️ Registro Actualizado"
            : "✏️ Pago actualizado"
        );
      } else {
        await api.post("/pagos", payload);
        toast.success("💰 Pago registrado");
      }
      closeModal();
      fetchPagos();
    } catch (err) {
      toast.error("❌ Error guardando pago");
      console.error(err);
    }
  };

  const handleEdit = (pago) => {
    setForm({
      empleado_id: pago.empleado_id ?? "",
      periodo_id: pago.periodo_id ?? "",
      fecha_pago: pago.fecha_pago?.substring(0, 10) ?? "",
      monto: pago.monto ?? "",
      metodo_pago: pago.metodo_pago ?? "transferencia",
      estado: pago.estado ?? "pendiente", // se conserva, no editable en UI
      observaciones: pago.observaciones ?? "",
    });
    setEditingId(pago.id);
    setEditingWasPagado((pago.estado || "").toLowerCase() === "pagado"); // ✅ nuevo
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro de eliminar este pago?")) return;
    try {
      await api.delete(`/pagos/${id}`);
      toast.success("🗑️ Pago eliminado");
      fetchPagos();
    } catch (err) {
      toast.error("❌ Error eliminando pago");
      console.error(err);
    }
  };

  const anularPago = async (pago) => {
    if (pago.estado === "anulado") {
      toast.info("Este pago ya está anulado.");
      return;
    }
    const motivo = window.prompt("Motivo de anulación:", "");
    if (motivo === null) return;

    try {
      await api.put(`/pagos/${pago.id}`, {
        empleado_id: pago.empleado_id,
        periodo_id: pago.periodo_id,
        fecha_pago:
          pago.fecha_pago?.substring(0, 10) ||
          new Date().toISOString().substring(0, 10),
        monto: pago.monto,
        metodo_pago: pago.metodo_pago,
        estado: "anulado",
        observaciones: (
          (pago.observaciones || "") +
          (motivo ? ` | Anulación: ${motivo}` : "")
        ).trim(),
      });
      toast.success("🚫 Pago anulado");
      fetchPagos();
    } catch (err) {
      toast.error("❌ No se pudo anular el pago");
      console.error(err);
    }
  };

  // Marcar como pagado
  const marcarPagado = async (pago) => {
    if (pago.estado === "pagado") {
      toast.info("Este pago ya está marcado como pagado.");
      return;
    }
    if (pago.estado === "anulado") {
      toast.warn("No puedes pagar un registro que está anulado.");
      return;
    }

    try {
      await api.put(`/pagos/${pago.id}`, {
        empleado_id: pago.empleado_id,
        periodo_id: pago.periodo_id,
        fecha_pago:
          pago.fecha_pago?.substring(0, 10) ||
          new Date().toISOString().substring(0, 10),
        monto: pago.monto,
        metodo_pago: pago.metodo_pago,
        estado: "pagado",
        observaciones: (pago.observaciones || "").trim(),
      });
      toast.success("✔ Pago exitoso");
      fetchPagos();
    } catch (err) {
      toast.error("❌ No se pudo marcar como pagado");
      console.error(err);
    }
  };

  // Filtro + búsqueda
  const filtered = useMemo(() => {
    let data = [...pagos];
    if (q.trim()) {
      const term = q.toLowerCase();
      data = data.filter(
        (p) =>
          String(p.id).includes(term) ||
          (p.empleado_nombre || "").toLowerCase().includes(term) ||
          (p.observaciones || "").toLowerCase().includes(term)
      );
    }
    if (fEstado) {
      data = data.filter((p) => (p.estado || "").toLowerCase() === fEstado);
    }
    // Orden
    data.sort((a, b) => {
      let A = a[sortBy];
      let B = b[sortBy];
      if (sortBy === "fecha_pago") {
        A = A ? new Date(A) : new Date(0);
        B = B ? new Date(B) : new Date(0);
      } else if (sortBy === "monto") {
        A = Number(A) || 0;
        B = Number(B) || 0;
      }
      const comp = A > B ? 1 : A < B ? -1 : 0;
      return sortDir === "asc" ? comp : -comp;
    });
    return data;
  }, [pagos, q, fEstado, sortBy, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    const start = (pageClamped - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageClamped]);

  useEffect(() => {
    // Reset de página si cambian filtros/búsqueda
    setPage(1);
  }, [q, fEstado]);

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
          <h2 className="title">💰 Gestión de Pagos</h2>
          <p className="subtitle">
            Registra, edita y consulta pagos a empleados.{" "}
            <span className="muted">
              ({pagos.length} total{pagos.length === 1 ? "" : "es"})
            </span>
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null);
            setEditingWasPagado(false);
            resetForm();
            setModalOpen(true);
          }}
        >
          + Registrar Pago
        </button>
      </header>

      {/* Controles */}
      <div className="toolbar">
        <input
          type="search"
          placeholder="Buscar por ID, empleado u observación…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input"
          aria-label="Buscar"
        />

        <select
          value={fEstado}
          onChange={(e) => setFEstado(e.target.value)}
          className="input"
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
          <label className="muted label-sm">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
            aria-label="Ordenar por"
          >
            <option value="fecha_pago">Fecha</option>
            <option value="monto">Monto</option>
          </select>
          <button
            className="btn btn-light"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            title={`Dirección: ${sortDir === "asc" ? "Ascendente" : "Descendente"}`}
          >
            {sortDir === "asc" ? "⬆️" : "⬇️"}
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-wrap">
        <table className="table custom-table">
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
            {loading ? (
              <tr>
                <td colSpan="9" className="center muted">
                  Cargando pagos…
                </td>
              </tr>
            ) : errMsg ? (
              <tr>
                <td colSpan="9" className="center error">
                  {errMsg}
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan="9" className="center muted">
                  No hay resultados que coincidan con el filtro/búsqueda.
                </td>
              </tr>
            ) : (
              pageData.map((pago) => (
                <tr key={pago.id}>
                  <td>{pago.id}</td>
                  <td className="left">{pago.empleado_nombre}</td>
                  <td>{pago.periodo_id ?? "—"}</td>
                  <td>{pago.fecha_pago?.substring(0, 10)}</td>
                  <td>{formatterCOP.format(pago.monto)}</td>

                  <td>
                    <MetodoBadge value={pago.metodo_pago} />
                  </td>
                  <td>
                    <EstadoBadge value={pago.estado} />
                  </td>

                  <td className="observaciones">{pago.observaciones || "—"}</td>
                  <td className="actions">
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEdit(pago)}
                    >
                      ✏️ Modificar
                    </button>

                    <button
                      className="btn btn-success"
                      onClick={() => marcarPagado(pago)}
                      disabled={pago.estado === "pagado" || pago.estado === "anulado"}
                      style={{ marginRight: ".3rem" }}
                    >
                      ✔ Pagar
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => anularPago(pago)}
                      disabled={pago.estado === "anulado"}
                      style={{ marginRight: ".3rem" }}
                    >
                      🚫 Anular
                    </button>

                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleDelete(pago.id)}
                    >
                      🗑 Eliminar
                    </button>
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

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" ref={modalRef} role="dialog" aria-modal="true">
          <div className="modal modal-lg" role="document">
            <h3 className="modal-title" style={{ textAlign: "center" }}>
              {editingId ? "✏️ Editar Pago" : "💰 Registrar Pago"}
            </h3>

            <div className="form-grid">
              <div>
                <label htmlFor="empleado_id">Empleado</label>
                <select
                  id="empleado_id"
                  value={form.empleado_id}
                  onChange={(e) =>
                    setForm({ ...form, empleado_id: e.target.value })
                  }
                >
                  <option value="">Seleccione empleado</option>
                  {empleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre_empleado}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="periodo_id">Periodo</label>
                <input
                  id="periodo_id"
                  inputMode="numeric"
                  type="number"
                  value={form.periodo_id ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, periodo_id: e.target.value })
                  }
                  placeholder="Ej: 202501"
                />
              </div>

              <div>
                <label htmlFor="fecha_pago">Fecha de Pago</label>
                <input
                  id="fecha_pago"
                  type="date"
                  value={form.fecha_pago}
                  max={new Date().toISOString().substring(0, 10)}
                  onChange={(e) =>
                    setForm({ ...form, fecha_pago: e.target.value })
                  }
                />
              </div>

              <div>
                <label htmlFor="monto">Monto</label>
                <input
                  id="monto"
                  type="number"
                  min="1"
                  step="1"
                  value={form.monto}
                  onChange={(e) =>
                    setForm({ ...form, monto: e.target.value })
                  }
                  onBlur={() => {
                    const n = Number(form.monto);
                    if (!n || n <= 0) setForm((f) => ({ ...f, monto: "" }));
                  }}
                />
              </div>

              <div>
                <label htmlFor="metodo_pago">Método de Pago</label>
                <select
                  id="metodo_pago"
                  value={form.metodo_pago}
                  onChange={(e) =>
                    setForm({ ...form, metodo_pago: e.target.value })
                  }
                >
                  <option value="transferencia">Transferencia</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {/* Estado NO editable en UI; se conserva/impone internamente */}
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label htmlFor="observaciones">Observaciones</label>
              <textarea
                id="observaciones"
                rows="3"
                value={form.observaciones}
                onChange={(e) =>
                  setForm({ ...form, observaciones: e.target.value })
                }
                style={{ width: "100%", padding: "0.8rem", borderRadius: "6px" }}
                placeholder="Notas internas, referencias, etc."
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-success" onClick={handleSave}>
                {editingId ? "Actualizar" : "Registrar"}
              </button>
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* estilos */}
      <style>{styles}</style>
    </div>
  );
}

function EstadoBadge({ value }) {
  const val = (value || "").toLowerCase();
  const map = {
    pagado: "badge success",
    pendiente: "badge warn",
    anulado: "badge danger",
  };
  const cls = map[val] || "badge";
  const label =
    val === "pagado"
      ? "Pagado"
      : val === "pendiente"
      ? "Pendiente"
      : val === "anulado"
      ? "Anulado"
      : value;
  return <span className={cls}>{label}</span>;
}

function MetodoBadge({ value }) {
  const val = (value || "").toLowerCase();
  const label =
    val === "transferencia"
      ? "transferencia"
      : val === "efectivo"
      ? "efectivo"
      : val === "cheque"
      ? "cheque"
      : value || "—";
  // Mismo look & feel que Estado (versión suave)
  return <span className="badge method">{label}</span>;
}

/* === Estilos CSS coherentes === */
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

.header{
  display:flex; align-items:center; justify-content:space-between; gap:1rem;
}
.title{ margin:0; }
.subtitle{ margin:.25rem 0 0; color:var(--muted); }
.muted{ color: var(--muted); }

.toolbar{
  display:flex; gap:.75rem; flex-wrap:wrap; margin-top:1rem;
  position: relative; z-index: 10;
}
.input{
  padding:.6rem .8rem; border:1px solid var(--border); border-radius:.6rem; background:#fff;
  color: var(--text);
}
.sorter{ display:flex; gap:.5rem; align-items:center; }
.label-sm{ font-size:.9rem; }

.table-wrap{
  background:var(--card); border:1px solid var(--border); border-radius:1rem; margin-top:1rem; overflow:auto;
  box-shadow: 0 6px 20px rgba(15,23,42,.06);
  position: relative; z-index: 1;
}
.table{ width:100%; border-collapse: separate; border-spacing:0; }
.table thead th{
  position: sticky; top: 0; background:#f9fafb; z-index:1;
  text-align:center; padding:.8rem; border-bottom:1px solid var(--border);
}
.table td{
  padding:.8rem; text-align:center; border-bottom:1px solid var(--border);
  vertical-align: middle;
}
.table tr:hover td{ background:#fafafa; }
.table .observaciones {
  max-width: 260px;
  white-space: normal;
  word-wrap: break-word;
  text-align: left;
}
.table .left{ text-align:left; }

.actions{ white-space: nowrap; }

.center{ text-align:center; }
.error{ color: var(--danger); }

.btn{
  padding:.35rem .65rem;   /* compacto */
  font-size: .85rem;
  border:none;
  border-radius:.5rem;
  cursor:pointer;
  font-weight:600;
  transition: transform .05s ease, box-shadow .2s ease, background .2s ease, opacity .2s ease;
  box-shadow: 0 2px 0 rgba(0,0,0,.03);
}
.btn:disabled{ opacity:.6; cursor:not-allowed; }
.btn:active{ transform: translateY(1px); }

.btn-primary{ background: var(--primary); color:#fff; }
.btn-primary:hover{ background: var(--primary-600); }
.btn-warning{ background:#f59e0b; color:#fff; margin-right:.3rem; }
.btn-danger{ background: var(--danger); color:#fff; }
.btn-success{ background: var(--success); color:#fff; }
.btn-secondary{ background:#9ca3af; color:#fff; }
.btn-light{ background:#eef0f5; }

/* Outline para eliminar (rojo sin relleno) */
.btn-outline-danger{
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
}
.btn-outline-danger:hover{
  background: rgba(239,68,68,.08);
}

.badge{
  display:inline-block; padding:.25rem .6rem; border-radius:999px; font-weight:600; font-size:.85rem;
  background:#e5e7eb;
  border: 1px solid rgba(0,0,0,.04);
}
.badge.success{ background: rgba(22,163,74,.12); color: var(--success); border-color: rgba(22,163,74,.25); }
.badge.warn{ background: rgba(245,158,11,.14); color: var(--warn); border-color: rgba(245,158,11,.25); }
.badge.danger{ background: rgba(239,68,68,.14); color: var(--danger); border-color: rgba(239,68,68,.25); }
.badge.method{ background:#eef2ff; color:#4338ca; border-color: #c7d2fe; }

.pagination{
  display:flex; align-items:center; gap:1rem; justify-content:flex-end; margin-top:1rem;
}

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(2, 6, 23, 0.6);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
  padding: 1rem;
}
.modal {
  background: var(--card);
  padding: 1.25rem 1.25rem 1rem;
  border-radius: 16px; width: 520px; max-width: 95%;
  border:1px solid var(--border);
  box-shadow: 0 30px 80px rgba(2,6,23,.25);
}
.modal-lg { width: 720px; }
.modal-title{ margin: 0 0 1rem; }

.form-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
}
.form-grid label, 
.modal label {
  display:block; 
  margin-bottom:.35rem; 
  font-weight:600; 
  color: var(--text);
}

.form-grid input, .form-grid select, textarea{
  width: 100%; padding:.6rem .8rem; border:1px solid var(--border); border-radius:.6rem; background:#fff;
  outline:none; color: var(--text);
}
.form-grid input:focus, .form-grid select:focus, textarea:focus{
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79,70,229,.15);
}

.modal-actions {
  margin-top: 1.2rem;
  display: flex; justify-content: flex-end; gap: .7rem;
}
`;
