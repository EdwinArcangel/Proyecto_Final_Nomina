// server.js
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = 3000;

try {
  await connectDB(); // conectar DB primero
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Error al iniciar el servidor:", error?.message || error);
  process.exit(1);
}

// (Opcional) Manejo global de errores:
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, p) => {
  console.error("unhandledRejection:", reason, "en", p);
  process.exit(1);
});
