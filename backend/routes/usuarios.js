// routes/usuarios.js
import express from "express";
import bcrypt from "bcrypt";
import { connection } from "../config/db.js";

const router = express.Router();

// ==============================
// Obtener todos los usuarios
// ==============================
router.get("/", async (req, res) => {
  try {
    const [rows] = await connection.query(
      "SELECT id, nombre_usuario, email, rol FROM usuarios"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error listando usuarios:", err.message);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

// ==============================
// Crear un nuevo usuario
// ==============================
router.post("/", async (req, res) => {
  try {
    const { nombre_usuario, email, password, rol } = req.body;

    if (!nombre_usuario || !email || !password || !rol) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    if (!["admin", "empleado"].includes(rol)) {
      return res
        .status(400)
        .json({ message: "Rol inválido (solo admin o empleado)" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.query(
      "INSERT INTO usuarios (nombre_usuario, email, password, rol) VALUES (?, ?, ?, ?)",
      [nombre_usuario, email, hashedPassword, rol]
    );

    // 👉 Si el rol es empleado, lo insertamos también en empleados
    if (rol === "empleado") {
      const [empleadoRows] = await connection.query(
        "SELECT id FROM empleados WHERE email = ?",
        [email]
      );

      if (empleadoRows.length === 0) {
        await connection.query(
          `INSERT INTO empleados 
            (nombre_empleado, documento, email, fecha_ingreso, estado, cargo_id, salario_base, eps, pension, arl)
           VALUES (?, ?, ?, CURDATE(), 'activo', 1, 0, NULL, NULL, NULL)`,
          [nombre_usuario, "TEMP-" + Date.now(), email]
        );
        console.log("👥 Empleado creado automáticamente para usuario:", email);
      }
    }

    res.json({ message: "✅ Usuario creado con éxito" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "El email ya está registrado" });
    }
    console.error("❌ Error creando usuario:", err.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ==============================
// Actualizar un usuario
// ==============================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_usuario, email, password, rol } = req.body;

    if (!["admin", "empleado"].includes(rol)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    let query =
      "UPDATE usuarios SET nombre_usuario = ?, email = ?, rol = ? WHERE id = ?";
    let params = [nombre_usuario, email, rol, id];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query =
        "UPDATE usuarios SET nombre_usuario = ?, email = ?, password = ?, rol = ? WHERE id = ?";
      params = [nombre_usuario, email, hashedPassword, rol, id];
    }

    await connection.query(query, params);

    // 👉 Si el rol es "empleado", aseguramos que esté en la tabla empleados
    if (rol === "empleado") {
      const [empleadoRows] = await connection.query(
        "SELECT id FROM empleados WHERE email = ?",
        [email]
      );

      if (empleadoRows.length === 0) {
        await connection.query(
          `INSERT INTO empleados 
            (nombre_empleado, documento, email, fecha_ingreso, estado, cargo_id, salario_base, eps, pension, arl)
           VALUES (?, ?, ?, CURDATE(), 'activo', 1, 0, NULL, NULL, NULL)`,
          [nombre_usuario, "TEMP-" + id, email]
        );
        console.log("👥 Empleado creado automáticamente para usuario:", email);
      }
    }

    res.json({ message: "✅ Usuario actualizado con éxito" });
  } catch (err) {
    console.error("❌ Error actualizando usuario:", err.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ==============================
// Eliminar un usuario
// ==============================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await connection.query("DELETE FROM usuarios WHERE id = ?", [id]);
    res.json({ message: "🗑️ Usuario eliminado con éxito" });
  } catch (err) {
    console.error("❌ Error eliminando usuario:", err.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
