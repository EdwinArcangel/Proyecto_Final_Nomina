import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { AUTH_PATH } from "./utils/api";
import logo from "./assets/logo_nomina.jpg";

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
        // Guardamos token y usuario en localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.usuario));

        // Pasamos el usuario completo al App
        onLoginSuccess(response.data.token, response.data.usuario);

        // Redirigimos al home
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
        <h2 style={styles.title}>E- Nómina</h2>
        <p style={styles.subtitle}>Ingresa con tu cuenta</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
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
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  logo: {
    width: "80px",
    marginBottom: "1rem",
  },
  title: {
    marginBottom: "0.5rem",
    color: "#333",
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
  input: {
    padding: "0.8rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
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
  },
  message: {
    marginTop: "1rem",
    fontWeight: "bold",
    color: "#333",
  },
};

export default Login;
