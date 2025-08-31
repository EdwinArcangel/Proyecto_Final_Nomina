import axios from "axios";

const api = axios.create({
  baseURL: "/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

export const AUTH_PATH = "/auth"; 

export default api;