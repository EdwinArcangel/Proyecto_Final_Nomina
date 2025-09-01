// server.js
import "dotenv/config"; // En local carga variables de .env (en Render se inyectan)
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

try {
  // Conectar DB antes de levantar el servidor
  await connectDB();

  app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en ${HOST}:${PORT}`);
  });
} catch (error) {
  console.error("Error al iniciar el servidor:", error?.message || error);
  process.exit(1);
}

// (Opcional) Manejo global de errores
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, p) => {
  console.error("unhandledRejection:", reason, "en", p);
  process.exit(1);
});
