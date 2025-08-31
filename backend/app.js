// app.js
import express from "express";

// Importar rutas
import empleadosRoutes from "./routes/empleados.js";
import usuariosRoutes from "./routes/usuarios.js";
import pagosRoutes from "./routes/pagos.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import novedadesRoutes from "./routes/novedades.js";
import cargosRoutes from "./routes/cargos.js";
import reportesRoutes from "./routes/cargos.js";



const app = express();

/* Middleware de log para debug */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/* Configuración CORS */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

/* Rutas */
app.use("/api/auth", authRoutes);
app.use("/api/empleados", empleadosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/novedades", novedadesRoutes);
app.use("/api/cargos", cargosRoutes);
app.use("/api/reportes", cargosRoutes);


/* Ruta raíz para verificar */
app.get("/", (req, res) => {
  res.send("✅ Servidor de Nómina funcionando");
});

export default app;
