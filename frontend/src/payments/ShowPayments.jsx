ç// src/payments/ShowPayments.jsx
import { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

export default function ShowPayments() {
  const [pagos, setPagos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    empleado_id: "",
    periodo_id: "",
    fecha_pago: "",
    monto: "",
    metodo_pago: "transferencia",
    estado: "pendiente",
    observaciones: "",
  });

  // Cargar pagos
  const fetchPagos = async () => {
    try {
      const res = await api.get("/pagos");
      setPagos(res.data);
    } catch (err) {
      toast.error("❌ Error cargando pagos");
    }
  };

  // Cargar empleados
  const fetchEmpleados = async () => {
    try {
      const res = await api.get("/empleados");
      setEmpleados(res.data);
    } catch (err) {
      toast.error("❌ Error cargando empleados");
    }
  };

  useEffect(() => {
    fetchPagos();
    fetchEmpleados();
  }, []);

  // Guardar (crear o actualizar)
  const handleSave = async () => {
    try {
      if (!form.empleado_id || !form.fecha_pago || !form.monto) {
        toast.warning("⚠️ Completa los campos obligatorios");
        return;
      }

      if (editing) {
        await api.put(`/pagos/${editing}`, form);
        toast.success("✏️ Pago actualizado");
      } else {
        await api.post("/pagos", form);
        toast.success("💰 Pago registrado");
      }

      setModalOpen(false);
      setForm({
        empleado_id: "",
        periodo_id: "",
        fecha_pago: "",
        monto: "",
        metodo_pago: "transferencia",
        estado: "pendiente",
        observaciones: "",
      });
      setEditing(null);
      fetchPagos();
    } catch (err) {
      toast.error("❌ Error guardando pago");
      console.error(err);
    }
  };

  // Editar
  const handleEdit = (p) => {
    setForm({
      empleado_id: p.empleado_id ?? "",
      periodo_id: p.periodo_id ?? "",
      fecha_pago: (p.fecha_pago || "").substring(0, 10),
      monto: p.monto ?? "",
      metodo_pago: p.metodo_pago ?? "transferencia",
      estado: p.estado ?? "pendiente",
      observaciones: p.observaciones ?? "",
    });
    setEditing(p.id);
    setModalOpen(true);
  };

  // Eliminar
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro de eliminar este pago?")) return;
    try {
      await api.delete(`/pagos/${id}`);
      toast.success("🗑️ Pago eliminado");
      fetchPagos();
    } catch (err) {
      toast.error("❌ Error eliminando pago");
    }
  };

  return (
    <div className="pay-root">
      <h2 className="title">💰 Gestión de Pagos</h2>

      <button
        className="btn btn-primary"
        onClick={() => {
          setEditing(null);
          setForm({
            empleado_id: "",
            periodo_id: "",
            fecha_pago: "",
            monto: "",
            metodo_pago: "transferencia",
            estado: "pendiente",
            observaciones: "",
          });
          setModalOpen(true);
        }}
      >
        + Registrar Pago
      </button>

      <div className="table-responsive">
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
            {pagos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.empleado_nombre}</td>
                <td>{p.periodo_id ?? "—"}</td>
                <td>{p.fecha_pago?.substring(0, 10)}</td>
                <td>
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                  }).format(Number(p.monto || 0))}
                </td>
                <td>{p.metodo_pago}</td>
                <td>{p.estado}</td>
                <td className="observaciones">{p.observaciones}</td>
                <td>
                  <button className="btn btn-warning" onClick={() => handleEdit(p)}>
                    ✏️ Editar
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <h3 style={{ marginBottom: "1rem", textAlign: "center" }}>
              {editing ? "✏️ Editar Pago" : "💰 Registrar Pago"}
            </h3>

            <div className="form-grid">
              <div>
                <label>Empleado</label>
                <select
                  value={form.empleado_id}
                  onChange={(e) => setForm({ ...form, empleado_id: e.target.value })}
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
                <label>Periodo</label>
                <input
                  type="number"
                  value={form.periodo_id}
                  onChange={(e) => setForm({ ...form, periodo_id: e.target.value })}
                />
              </div>

              <div>
                <label>Fecha de Pago</label>
                <input
                  type="date"
                  value={form.fecha_pago}
                  onChange={(e) => setForm({ ...form, fecha_pago: e.target.value })}
                />
              </div>

              <div>
                <label>Monto</label>
                <input
                  type="number"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                />
              </div>

              <div>
                <label>Método de Pago</label>
                <select
                  value={form.metodo_pago}
                  onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })}
                >
                  <option value="transferencia">Transferencia</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label>Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                  <option value="anulado">Anulado</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label>Observaciones</label>
              <textarea
                rows="3"
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                style={{ width: "100%", padding: "0.8rem", borderRadius: "6px" }}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-success" onClick={handleSave}>
                {editing ? "Actualizar" : "Registrar"}
              </button>
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* === Estilos locales: fuerzan texto oscuro/fondo blanco en la tabla y modal === */
const css = `
.pay-root {
  padding: 2rem;
  background: #f4f6f9;
  min-height: 100vh;
  color: #1f2937; /* texto base */
}

.pay-root .title {
  margin-bottom: 1rem;
}

.pay-root .table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.pay-root .table th,
.pay-root .table td {
  border: 1px solid #e5e7eb;
  padding: 0.8rem;
  text-align: center;
  vertical-align: middle;
  min-width: 100px;
  color: #1f2937 !important;      /* evita texto blanco heredado */
  background: #ffffff !important; /* fondo legible */
}
.pay-root .table thead th {
  background: #f5f6ff !important;
  color: #374151 !important;
  font-weight: 600;
}
.pay-root .table .observaciones {
  max-width: 260px;
  white-space: normal;
  word-wrap: break-word;
}
.pay-root .table tbody tr:hover {
  background: #f9fbff !important;
}

/* Botones (paleta Novedades) */
.pay-root .btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
}
.pay-root .btn-primary { background: #4facfe; color: #fff; margin-bottom: 1rem; }
.pay-root .btn-warning { background: #facc15; color: #1f2937; margin-right: .5rem; }
.pay-root .btn-danger  { background: #ef4444; color: #fff; }
.pay-root .btn-success { background: #22c55e; color: #fff; }
.pay-root .btn-secondary { background: #9ca3af; color: #fff; }

/* Modal */
.pay-root .modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.pay-root .modal {
  background: #fff;
  padding: 2rem;
  border-radius: 14px;
  width: 560px;
  max-width: 96%;
  box-shadow: 0 10px 30px rgba(0,0,0,.12);
}
.pay-root .modal-lg { width: 760px; }
.pay-root .form-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
}
.pay-root label { font-weight: 600; color: #374151; display: block; margin-bottom: .35rem; }
.pay-root input, .pay-root select, .pay-root textarea {
  width: 100%; padding: .75rem; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #111827;
}
.pay-root input::placeholder, .pay-root textarea::placeholder { color: #9ca3af; }
.pay-root .modal-actions {
  margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 1rem;
}
`;

// Inyectar CSS si no usas archivo separado (con guard para no duplicar)
if (typeof document !== "undefined") {
  const styleId = "payments-local-css";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = css;
    document.head.appendChild(style);
  }
}
