import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { AUTH_PATH } from "./utils/api";
import logo from "./assets/logo_nomina.jpg"; 
import { FaUser, FaLock } from "react-icons/fa";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
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
        navigate("/home");
      }
    } catch (error) {
      setMessage(
        error.response
          ? "❌ " + error.response.data.message
          : "⚠️ Error de conexión con el servidor"
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={logo} alt="Logo empresa" style={styles.logo} />
        <p style={styles.subtitle}>Ingresa con tu cuenta</p>

        <form onSubmit={handleLogin} style={styles.form}>
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

        {message && <p style={styles.message}>{message}</p>}
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
    borderRadius: "12px",
    boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  logo: {
    width: "100px",
    marginBottom: "1rem",
  },
  title: {
    marginBottom: "0.5rem",
    color: "#333",
    fontWeight: "bold",
  },
  subtitle: {
    marginBottom: "1.5rem",
    color: "#666",
    fontSize: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "0.6rem",
    background: "#f9f9f9",
  },
  icon: {
    marginRight: "0.5rem",
    color: "#4facfe",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "1rem",
    color: "#333",
  },
  button: {
    padding: "0.8rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4facfe",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "0.3s",
    fontWeight: "bold",
  },
  message: {
    marginTop: "1rem",
    fontWeight: "bold",
    color: "#e74c3c",
  },
};

export default Login;
