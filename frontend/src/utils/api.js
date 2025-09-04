import axios from "axios";

// Si no hay VITE_API_URL, usa directamente el backend local
const baseURL =
  import.meta.env.VITE_API_URL || "https://e-nomina.vercel.app/api/auth/login";

console.log("API URL en uso:", baseURL);

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
export const AUTH_PATH = "/auth";
