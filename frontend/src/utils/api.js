import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "https://proyecto-final-nomina.onrender.com/api";

console.log("API URL en uso:", baseURL);

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
export const AUTH_PATH = "/auth";
