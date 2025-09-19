// src/utils/api.js
import axios from "axios";

// Acepta ambos nombres por compatibilidad y elimina "/" al final
const fromEnv =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL || // legacy
  "https://proyecto-final-nomina.onrender.com";

const baseURL = fromEnv.replace(/\/+$/, "");

console.log("[API] baseURL:", baseURL);

const api = axios.create({
  baseURL,              
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

export default api;

// Rutas base (útiles para componer endpoints)
export const API_PREFIX = "/api";
export const AUTH_PATH = "/auth";
