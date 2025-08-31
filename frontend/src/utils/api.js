import axios from "axios";

const api = axios.create({
  baseURL: "/api", // gracias al proxy de Vite esto se envía al backend
  headers: {
    "Content-Type": "application/json",
  },
});

export const AUTH_PATH = "/auth"; // ruta base de autenticación

export default api;