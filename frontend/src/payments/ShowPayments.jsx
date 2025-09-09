// src/payments/ShowPayments.jsx
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
        toast.warning("⚠️ Todos los campos obligatorios");
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
  const handleEdit = (pago) => {
    setForm(pago);
    setEditing(pago.id);
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
    <div className="container">
      <h2 style={{ marginBottom: "1rem" }}>💰 Gestión de Pagos</h2>

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
            {pagos.map((pago) => (
              <tr key={pago.id}>
                <td>{pago.id}</td>
                <td>{pago.empleado_nombre}</td>
                <td>{pago.periodo_id}</td>
                <td>{pago.fecha_pago?.substring(0, 10)}</td>
                <td>
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                  }).format(pago.monto)}
                </td>
                <td>{pago.metodo_pago}</td>
                <td>{pago.estado}</td>
                <td className="observaciones">{pago.observaciones}</td>
                <td>
                  <button
                    className="btn btn-warning"
                    onClick={() => handleEdit(pago)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(pago.id)}
                  >
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
                <label>Periodo</label>
                <input
                  type="number"
                  value={form.periodo_id}
                  onChange={(e) =>
                    setForm({ ...form, periodo_id: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Fecha de Pago</label>
                <input
                  type="date"
                  value={form.fecha_pago}
                  onChange={(e) =>
                    setForm({ ...form, fecha_pago: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Monto</label>
                <input
                  type="number"
                  value={form.monto}
                  onChange={(e) =>
                    setForm({ ...form, monto: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Método de Pago</label>
                <select
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

              <div>
                <label>Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) =>
                    setForm({ ...form, estado: e.target.value })
                  }
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
                onChange={(e) =>
                  setForm({ ...form, observaciones: e.target.value })
                }
                style={{ width: "100%", padding: "0.8rem", borderRadius: "6px" }}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-success" onClick={handleSave}>
                {editing ? "Actualizar" : "Registrar"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* === Estilos CSS (ajustados) === */
const css = `
.container {
  padding: 2rem;
  background: #f4f6f9;
  min-height: 100vh;
}
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.table th, .table td {
  border: 1px solid #ddd;
  padding: 0.8rem;
  text-align: center;
  vertical-align: middle;
  min-width: 100px;
}
.table th {
  background: #f0f0f0;
}
.table .observaciones {
  max-width: 200px;
  white-space: normal;
  word-wrap: break-word;
}
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.btn-primary {
  background: #4facfe;
  color: white;
  margin-bottom: 1rem;
}
.btn-warning {
  background: #fbc02d;
  color: white;
  margin-right: 0.5rem;
}
.btn-danger {
  background: #e53935;
  color: white;
}
.btn-success {
  background: #43a047;
  color: white;
}
.btn-secondary {
  background: #9e9e9e;
  color: white;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 500px;
  max-width: 95%;
}
.modal-lg {
  width: 700px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
`;

// Inyectar CSS si no usas archivo separado
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);
}
