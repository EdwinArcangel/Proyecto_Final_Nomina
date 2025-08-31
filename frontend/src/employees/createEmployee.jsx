import { useState } from "react";
import api from "../utils/api"; // 👈 para conectar con backend
import { toast } from "react-toastify";

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/empleados", formData);
      toast.success("✅ Empleado registrado con éxito");
      setFormData({
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
    } catch (err) {
      console.error("Error registrando empleado:", err);
      toast.error("❌ Error registrando empleado");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Registrar Empleado</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" name="nombre_empleado" placeholder="Nombre completo" value={formData.nombre_empleado} onChange={handleChange} required style={styles.input} />
        <input type="text" name="documento" placeholder="Documento" value={formData.documento} onChange={handleChange} required style={styles.input} />
        <input type="email" name="email" placeholder="Correo" value={formData.email} onChange={handleChange} required style={styles.input} />
        <input type="text" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} style={styles.input} />
        <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} style={styles.input} />
        <input type="date" name="fecha_ingreso" value={formData.fecha_ingreso} onChange={handleChange} required style={styles.input} />
        <input type="number" name="cargo_id" placeholder="ID Cargo" value={formData.cargo_id} onChange={handleChange} required style={styles.input} />
        <input type="number" name="salario_base" placeholder="Salario base" value={formData.salario_base} onChange={handleChange} required style={styles.input} />
        <input type="text" name="eps" placeholder="EPS" value={formData.eps} onChange={handleChange} style={styles.input} />
        <input type="text" name="pension" placeholder="Pensión" value={formData.pension} onChange={handleChange} style={styles.input} />
        <input type="text" name="arl" placeholder="ARL" value={formData.arl} onChange={handleChange} style={styles.input} />

        <button type="submit" style={styles.button}>Guardar</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "2rem",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  input: {
    padding: "0.8rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  button: {
    padding: "0.8rem",
    border: "none",
    borderRadius: "8px",
    background: "#4facfe",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
