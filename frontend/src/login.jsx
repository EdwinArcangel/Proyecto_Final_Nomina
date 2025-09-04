import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { AUTH_PATH } from "./utils/api";
import logo from "./assets/logo_nomina.jpg";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`${AUTH_PATH}/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.usuario));

        onLoginSuccess(response.data.token, response.data.usuario);

        toast.success("✅ Inicio de sesión exitoso");
        navigate("/home");
      }
    } catch (error) {
      toast.error(
        error.response
          ? "❌ " + error.response.data.message
          : "⚠️ Error de conexión con el servidor"
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoWrapper}>
          <img src={logo} alt="Logo empresa" style={styles.logo} />
        </div>
        <h2 style={styles.title}>E - Nómina</h2>
        <p style={styles.subtitle}>Ingresa con tu cuenta</p>

        <form onSubmit={handleLogin} style={styles.form}>
          {/* Input de correo */}
          <div style={styles.inputGroup}>
            <FaUser style={styles.icon} />
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* Input de contraseña */}
          <div style={styles.inputGroup}>
            <FaLock style={styles.icon} />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  card: {
    backgroundColor: "white",
    padding: "2.5rem",
    borderRadius: "16px",
    boxShadow: "0px 6px 25px rgba(0,0,0,0.15)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  logoWrapper: {
    width: "110px",
    height: "110px",
    margin: "0 auto 1rem auto",
    borderRadius: "50%",
    background: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
  },
  logo: { width: "80px", borderRadius: "50%" },
  title: { marginBottom: "0.3rem", color: "#333" },
  subtitle: { marginBottom: "1.5rem", color: "#666", fontSize: "1rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "0.7rem",
    backgroundColor: "#f9f9f9",
  },
  icon: { marginRight: "10px", color: "#4facfe", fontSize: "1.1rem" },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "1rem",
    color: "#333",
  },
  button: {
    padding: "0.9rem",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #4facfe, #00f2fe)",
    color: "white",
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};

export default Login;
