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
  const [editingWasPagado, setEditingWasPagado] = useState(false);
  const modalRef = useRef(null);

  // ====== NUEVO: campos del formulario ampliado ======
  const [form, setForm] = useState({
    // Info básica
    empleado_id: "",
    numero_identificacion: "",
    cargo: "",
    periodo_pago: "mensual",          // "quincenal" | "mensual"
    fecha_emision: new Date().toISOString().substring(0, 10),

    // Relación con tu esquema actual (opcional si tu backend lo usa):
    periodo_id: "",

    // Fechas y método
    fecha_pago: "",
    metodo_pago: "transferencia",

    // Devengados (percepciones)
    salario_base: "",
    auxilio_transporte: "",
    horas_extras: "",
    comisiones: "",
    bonificaciones_no_salariales: "",
    otros_conceptos: "",
    otros_detalle: "",

    // Estado/otros
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

  const num = (v) => {
    const n = Number(String(v).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : 0;
  };

  // Total devengados (se usará como "monto" al guardar)
  const totalDevengados = useMemo(() => {
    return (
      num(form.salario_base) +
      num(form.auxilio_transporte) +
      num(form.horas_extras) +
      num(form.comisiones) +
      num(form.bonificaciones_no_salariales) +
      num(form.otros_conceptos)
    );
  }, [
    form.salario_base,
    form.auxilio_transporte,
    form.horas_extras,
    form.comisiones,
    form.bonificaciones_no_salariales,
    form.otros_conceptos,
  ]);

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
      numero_identificacion: "",
      cargo: "",
      periodo_pago: "mensual",
      fecha_emision: new Date().toISOString().substring(0, 10),

      periodo_id: "",

      fecha_pago: "",
      metodo_pago: "transferencia",

      salario_base: "",
      auxilio_transporte: "",
      horas_extras: "",
      comisiones: "",
      bonificaciones_no_salariales: "",
      otros_conceptos: "",
      otros_detalle: "",

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
    if (!form.empleado_id) {
      toast.warning("⚠️ Selecciona un empleado");
      return;
    }
    if (!form.fecha_pago) {
      toast.warning("⚠️ La fecha de pago es obligatoria");
      return;
    }
    if (!form.fecha_emision) {
      toast.warning("⚠️ La fecha de emisión es obligatoria");
      return;
    }
    if (totalDevengados <= 0) {
      toast.warning("⚠️ El total de devengados debe ser mayor a 0");
      return;
    }

    // Si estaba pagado y se modifica, reabrimos a pendiente
    const nextEstado = !editingId
      ? "pendiente"
      : editingWasPagado
      ? "pendiente"
      : form.estado;

    // Payload: mantenemos compat con tu API (monto = totalDevengados)
    const payload = {
      empleado_id: Number(form.empleado_id),
      periodo_id: form.periodo_id ? Number(form.periodo_id) : null,

      // Nuevos campos informativos
      numero_identificacion: form.numero_identificacion || null,
      cargo: form.cargo || null,
      periodo_pago: form.periodo_pago,
      fecha_emision: form.fecha_emision,

      // Fechas, método y estado
      fecha_pago: form.fecha_pago,
      metodo_pago: form.metodo_pago,
      estado: nextEstado,

      // Total a pagar
      monto: totalDevengados,

      // Detalle de devengados (en plano por si tu API los acepta)
      salario_base: num(form.salario_base),
      auxilio_transporte: num(form.auxilio_transporte),
      horas_extras: num(form.horas_extras),
      comisiones: num(form.comisiones),
      bonificaciones_no_salariales: num(form.bonificaciones_no_salariales),
      otros_conceptos: num(form.otros_conceptos),
      otros_detalle: form.otros_detalle || "",

      observaciones: form.observaciones,
    };

    try {
      if (editingId) {
        await api.put(`/pagos/${editingId}`, payload);
        toast.success(
          editingWasPagado
            ? "✏️ Pago actualizado y reabierto (pendiente)"
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
      // intentamos mapear si vienen en el API; si no, quedan vacíos editables
      numero_identificacion:
        pago.numero_identificacion ??
        pago.documento ??
        pago.cc ??
        pago.nit ??
        pago.numero_documento ??
        "",
      cargo: pago.cargo ?? pago.rol ?? "",
      periodo_pago: pago.periodo_pago ?? "mensual",
      fecha_emision: pago.fecha_emision?.substring(0, 10) ??
        new Date().toISOString().substring(0, 10),

      periodo_id: pago.periodo_id ?? "",

      fecha_pago: pago.fecha_pago?.substring(0, 10) ?? "",
      metodo_pago: pago.metodo_pago ?? "transferencia",

      // Si no tienes los desgloses guardados, prellenamos con monto como salario_base
      salario_base: pago.salario_base ?? pago.monto ?? "",
      auxilio_transporte: pago.auxilio_transporte ?? "",
      horas_extras: pago.horas_extras ?? "",
      comisiones: pago.comisiones ?? "",
      bonificaciones_no_salariales: pago.bonificaciones_no_salariales ?? "",
      otros_conceptos: pago.otros_conceptos ?? "",
      otros_detalle: pago.otros_detalle ?? "",

      estado: pago.estado ?? "pendiente",
      observaciones: pago.observaciones ?? "",
    });
    setEditingId(pago.id);
    setEditingWasPagado((pago.estado || "").toLowerCase() === "pagado");
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
      toast.success("✔ Pago Exitoso");
      fetchPagos();
    } catch (err) {
      toast.error("❌ No se pudo marcar como pagado");
      console.error(err);
    }
  };

  // Autorrelleno al escoger empleado (intenta mapear doc/cargo si existen)
const onChangeEmpleado = (empleadoId) => {
  const found = empleados.find((e) => Number(e.id) === Number(empleadoId));

  const doc =
    found?.numero_identificacion ??
    found?.documento ??
    found?.cc ??
    found?.nit ??
    found?.numero_documento ??
    "";
  const rol = found?.cargo ?? found?.rol ?? "";
  const salario = found?.salario_base ?? "";

  setForm((f) => ({
    ...f,
    empleado_id: empleadoId,
    numero_identificacion: doc, 
    cargo: rol,                  
    salario_base: salario,      
  }));
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
    setPage(1);
  }, [q, fEstado]);

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

     
      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" ref={modalRef} role="dialog" aria-modal="true">
          <div className="modal modal-lg" role="document">
            <h3 className="modal-title" style={{ textAlign: "center" }}>
              {editingId ? "✏️ Editar Pago" : "💰 Registrar Pago"}
            </h3>

            {/* ====== Información del Empleado y Periodo ====== */}
            <h4 className="section-title">Información del Empleado y Periodo</h4>
            <div className="form-grid">
              <div>
                <label htmlFor="empleado_id">Nombre del Empleado</label>
                <select
                  id="empleado_id"
                  value={form.empleado_id}
                  onChange={(e) => onChangeEmpleado(e.target.value)}
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
                <label htmlFor="numero_identificacion">Número de Identificación (CC/NIT)</label>
                <input
                  id="numero_identificacion"
                  value={form.numero_identificacion}
                  onChange={(e) =>
                    setForm({ ...form, numero_identificacion: e.target.value })
                  }
                />
              </div>

              <div>
                <label htmlFor="cargo">Cargo</label>
                <input
                  id="cargo"
                  value={form.cargo}
                  onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="periodo_pago">Período de Pago</label>
                <select
                  id="periodo_pago"
                  value={form.periodo_pago}
                  onChange={(e) => setForm({ ...form, periodo_pago: e.target.value })}
                >
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>

              <div>
                <label htmlFor="fecha_emision">Fecha de Emisión</label>
                <input
                  id="fecha_emision"
                  type="date"
                  value={form.fecha_emision}
                  max={new Date().toISOString().substring(0, 10)}
                  onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })}
                />
              </div>

              {/* Si tu backend usa un ID de periodo */}
              <div>
                <label htmlFor="periodo_id">ID de Periodo (opcional)</label>
                <input
                  id="periodo_id"
                  inputMode="numeric"
                  type="number"
                  value={form.periodo_id ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, periodo_id: e.target.value })
                  }
                />
              </div>
            </div>

            {/* ====== Detalles de Percepciones (Devengados) ====== */}
            <div className="form-grid">
              <div>
                <label htmlFor="salario_base">Salario Base</label>
                <input
                  id="salario_base"
                  type="number"
                  min="0"
                  step="1"
                  value={form.salario_base}
                  onChange={(e) => setForm({ ...form, salario_base: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="auxilio_transporte">Auxilio de Transporte (si aplica)</label>
                <input
                  id="auxilio_transporte"
                  type="number"
                  min="0"
                  step="1"
                  value={form.auxilio_transporte}
                  onChange={(e) =>
                    setForm({ ...form, auxilio_transporte: e.target.value })
                  }
                />
              </div>

              <div>
                <label htmlFor="horas_extras">Horas Extras</label>
                <input
                  id="horas_extras"
                  type="number"
                  min="0"
                  step="1"
                  value={form.horas_extras}
                  onChange={(e) =>
                    setForm({ ...form, horas_extras: e.target.value })
                  }
                />
              </div>

              <div>
                <label htmlFor="comisiones">Comisiones</label>
                <input
                  id="comisiones"
                  type="number"
                  min="0"
                  step="1"
                  value={form.comisiones}
                  onChange={(e) =>
                    setForm({ ...form, comisiones: e.target.value })
                  }
                />
              </div>

              <div>
                <label htmlFor="bonificaciones_no_salariales">Bonificaciones</label>
                <input
                  id="bonificaciones_no_salariales"
                  type="number"
                  min="0"
                  step="1"
                  value={form.bonificaciones_no_salariales}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bonificaciones_no_salariales: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label htmlFor="otros_conceptos">Otros conceptos</label>
                <input
                  id="otros_conceptos"
                  type="number"
                  min="0"
                  step="1"
                  value={form.otros_conceptos}
                  onChange={(e) =>
                    setForm({ ...form, otros_conceptos: e.target.value })
                  }
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="otros_detalle">Detalle de “Otros conceptos”</label>
                <input
                  id="otros_detalle"
                  value={form.otros_detalle}
                  onChange={(e) => setForm({ ...form, otros_detalle: e.target.value })}
                />
              </div>
            </div>

            {/* ====== Totales / Pago ====== */}
            <div className="totales-card">
              <div className="tot-line">
      
                <strong>{formatterCOP.format(totalDevengados)}</strong>
              </div>
              <div className="tot-grid">
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
              </div>
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