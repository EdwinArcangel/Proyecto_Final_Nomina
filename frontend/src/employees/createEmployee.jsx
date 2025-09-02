import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

/* ========= Helpers para restringir a dígitos (teclado y pegado) ======== */
const digitKeys = new Set(["0","1","2","3","4","5","6","7","8","9"]);
const controlKeys = new Set(["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End"]);

function digitsOnlyKeyDown(e) {
  if (e.ctrlKey || e.metaKey) return; // permite Ctrl/⌘ + C/V/A/Z/Y
  if (controlKeys.has(e.key)) return; // permite teclas de control
  if (!digitKeys.has(e.key)) e.preventDefault(); // bloquea todo lo que no sea dígito
}

function digitsOnlyPaste(setter, field) {
  return (e) => {
    const raw = (e.clipboardData || window.clipboardData).getData("text") || "";
    const digits = raw.replace(/\D/g, "");
    e.preventDefault();
    setter(prev => ({ ...prev, [field]: (prev[field] || "") + digits }));
  };
}

export default function CreateEmployee() {
  const [formData, setFormData] = useState({
    nombre_empleado: "",
    documento: "",
    email: "",
    telefono: "",
    direccion: "",
    fecha_ingreso: "",
    cargo_id: "",
    salario_base: "",
    eps: "",
    pension: "",
    arl: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cargos, setCargos] = useState([]);
  const [loadingCargos, setLoadingCargos] = useState(true);

  // hoy (YYYY-MM-DD) para prefijar fecha y poner max
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  useEffect(() => {
    setFormData((f) => ({ ...f, fecha_ingreso: today }));
  }, [today]);

  // Traer cargos para mostrar como <select> (ajusta la ruta si tu API es distinta)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/cargos");
        setCargos(Array.isArray(data) ? data : []);
      } catch {
        // si falla, el formulario seguirá mostrando input de ID de cargo
      } finally {
        setLoadingCargos(false);
      }
    })();
  }, []);

  // Normaliza campos numéricos (teléfono/documento solo dígitos) y limpia errores al escribir
  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitized = ["telefono","documento"].includes(name)
      ? value.replace(/\D/g, "")
      : value;
    setFormData(prev => ({ ...prev, [name]: sanitized }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // Validaciones básicas
  const validate = () => {
    const errs = {};
    if (!formData.nombre_empleado.trim()) errs.nombre_empleado = "Requerido";
    if (!formData.documento.trim()) errs.documento = "Requerido";
    if (!formData.email.trim()) errs.email = "Requerido";
    if (!formData.fecha_ingreso) errs.fecha_ingreso = "Requerido";
    if (!formData.cargo_id) errs.cargo_id = "Selecciona un cargo";
    if (!formData.salario_base || Number(formData.salario_base) <= 0)
      errs.salario_base = "Debe ser mayor a 0";

    // Teléfono requerido y 10 dígitos
    if (!formData.telefono) {
      errs.telefono = "Requerido";
    } else if (!/^\d{10}$/.test(formData.telefono)) {
      errs.telefono = "Debe tener 10 dígitos";
    }

    // fecha futura no permitida
    if (formData.fecha_ingreso && formData.fecha_ingreso > today)
      errs.fecha_ingreso = "No puede ser futura";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        cargo_id: Number(formData.cargo_id),
        salario_base: Number(formData.salario_base),
      };

      await api.post("/empleados", payload);

      toast.success("✅ Empleado registrado con éxito", {
        style: { fontSize: "18px", padding: "16px 20px", minWidth: "380px" },
      });

      setFormData({
        nombre_empleado: "",
        documento: "",
        email: "",
        telefono: "",
        direccion: "",
        fecha_ingreso: today,
        cargo_id: "",
        salario_base: "",
        eps: "",
        pension: "",
        arl: "",
      });
      setErrors({});
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Intenta de nuevo.";
      toast.error(`❌ Error registrando empleado: ${msg}`, {
        style: { fontSize: "18px", padding: "16px 20px", minWidth: "380px" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* estilos mínimos (grid y spinner) */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 780px) {
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        }
        .req::after{content:" *"; color:#e11d48;}
      `}</style>

      <div style={styles.container}>
        <h2 style={{ marginTop: 0 }}>Registrar Empleado</h2>

        <form onSubmit={handleSubmit} style={{ ...styles.form, gap: "1rem" }} noValidate>
          <div className="grid-2">
            <Field
              label="Nombre completo"
              name="nombre_empleado"
              value={formData.nombre_empleado}
              onChange={handleChange}
              error={errors.nombre_empleado}
              required
              autoComplete="name"
            />
            <Field
              label="Documento"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              error={errors.documento}
              required
              inputMode="numeric"
              pattern="\\d*"
              maxLength={20}
              onKeyDown={digitsOnlyKeyDown}
              onPaste={digitsOnlyPaste(setFormData, "documento")}
              placeholder="Solo números"
            />
          </div>

          <div className="grid-2">
            <Field
              type="email"
              label="Correo"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
            />
            <Field
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              error={errors.telefono}
              required
              inputMode="numeric"
              pattern="\\d*"
              maxLength={10}
              onKeyDown={digitsOnlyKeyDown}
              onPaste={digitsOnlyPaste(setFormData, "telefono")}
              placeholder="3001234567"
            />
          </div>

          <div className="grid-2">
            <Field
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              autoComplete="street-address"
            />
            <Field
              type="date"
              label="Fecha ingreso"
              name="fecha_ingreso"
              value={formData.fecha_ingreso}
              onChange={handleChange}
              error={errors.fecha_ingreso}
              required
              min="1970-01-01"
              max={today}
            />
          </div>

          <div className="grid-2">
            {/* Select de cargo si hay datos; si no, input numérico */}
            {cargos.length > 0 ? (
              <div style={styles.field}>
                <label htmlFor="cargo_id" className="req" style={styles.label}>Cargo</label>
                <select
                  id="cargo_id"
                  name="cargo_id"
                  value={formData.cargo_id}
                  onChange={handleChange}
                  disabled={loading || loadingCargos}
                  style={styles.select}
                  aria-invalid={!!errors.cargo_id}
                >
                  <option value="">Selecciona un cargo…</option>
                  {cargos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} — ${Number(c.salario_base || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
                {errors.cargo_id && <div style={styles.error}>{errors.cargo_id}</div>}
              </div>
            ) : (
              <Field
                type="number"
                label="ID Cargo"
                name="cargo_id"
                value={formData.cargo_id}
                onChange={handleChange}
                error={errors.cargo_id}
                required
                placeholder={loadingCargos ? "Cargando cargos…" : "Ej: 1"}
              />
            )}

            <Field
              type="number"
              label="Salario base (COP)"
              name="salario_base"
              value={formData.salario_base}
              onChange={handleChange}
              error={errors.salario_base}
              required
              min="0"
              step="50000"
              placeholder="Ej: 4500000"
              help="Valor mensual en pesos colombianos"
            />
          </div>

          <div className="grid-2">
            <Field label="EPS" name="eps" value={formData.eps} onChange={handleChange} />
            <Field label="Pensión" name="pension" value={formData.pension} onChange={handleChange} />
          </div>

          <div className="grid-2">
            <Field label="ARL" name="arl" value={formData.arl} onChange={handleChange} />
            <div /> {/* hueco para mantener el grid */}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
          >
            {loading ? (
              <span style={styles.btnContent}>
                <span style={styles.spinner} aria-hidden="true" /> Guardando…
              </span>
            ) : (
              "Guardar"
            )}
          </button>
        </form>
      </div>
    </>
  );
}

/* ----- Subcomponente de campo con label + error/ayuda ----- */
function Field({
  label,
  name,
  value,
  onChange,
  error,
  help,
  required,
  type = "text",
  ...rest
}) {
  const id = `f_${name}`;
  return (
    <div style={styles.field}>
      <label htmlFor={id} className={required ? "req" : undefined} style={styles.label}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}_err` : help ? `${id}_help` : undefined}
        style={{
          ...styles.input,
          ...(error ? { borderColor: "#e11d48", boxShadow: "0 0 0 3px rgba(225,29,72,0.08)" } : {}),
        }}
        {...rest}
      />
      {help && !error && (
        <div id={`${id}_help`} style={styles.help}>
          {help}
        </div>
      )}
      {error && (
        <div id={`${id}_err`} style={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
}

/* ---------------------- Estilos inline ---------------------- */
const styles = {
  container: {
    maxWidth: "900px",
    margin: "2rem auto",
    padding: "2rem",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  form: { display: "flex", flexDirection: "column" },
  field: { display: "flex", flexDirection: "column" },
  label: { fontWeight: 600, marginBottom: "6px" },
  input: {
    padding: "0.85rem",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color .15s, box-shadow .15s",
  },
  select: {
    padding: "0.85rem",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    outline: "none",
  },
  help: { fontSize: "0.85rem", color: "#64748b", marginTop: "6px" },
  error: { fontSize: "0.85rem", color: "#e11d48", marginTop: "6px" },
  button: {
    marginTop: "0.5rem",
    padding: "0.95rem",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(90deg,#4facfe,#00f2fe)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity .2s ease",
  },
  buttonDisabled: { opacity: 0.7, cursor: "not-allowed" },
  btnContent: { display: "inline-flex", alignItems: "center", gap: "10px" },
  spinner: {
    width: "18px",
    height: "18px",
    border: "3px solid rgba(255,255,255,0.5)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
