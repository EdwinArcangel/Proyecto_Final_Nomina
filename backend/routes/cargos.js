// routes/empleados.js
import express from "express";
import { connection } from "../config/db.js";

const router = express.Router();

// Listar empleados (con JOIN a cargos)
router.get("/", async (_req, res) => {
  try {
    const [rows] = await connection.query(
      `SELECT e.id, e.nombre_empleado, e.documento, e.email, e.telefono, 
              e.direccion, e.fecha_ingreso, e.fecha_retiro, e.estado, 
              e.salario_base, e.eps, e.pension, e.arl, 
              c.nombre AS cargo_nombre
       FROM empleados e
       LEFT JOIN cargos c ON e.cargo_id = c.id
       ORDER BY e.id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error listando empleados:", err.message);
    res.status(500).json({ message: "Error al obtener empleados" });
  }
});

// Obtener un empleado por ID (con JOIN a cargos)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await connection.query(
      `SELECT e.id, e.nombre_empleado, e.documento, e.email, e.telefono, 
              e.direccion, e.fecha_ingreso, e.fecha_retiro, e.estado, 
              e.salario_base, e.eps, e.pension, e.arl, 
              c.nombre AS cargo_nombre
       FROM empleados e
       LEFT JOIN cargos c ON e.cargo_id = c.id
       WHERE e.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Empleado no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error obteniendo empleado:", err.message);
    res.status(500).json({ message: "Error al obtener empleado" });
  }
});

// Crear empleado
router.post("/", async (req, res) => {
  try {
    const { nombre_empleado, documento, email, telefono, direccion,
            fecha_ingreso, fecha_retiro, estado, cargo_id,
            salario_base, eps, pension, arl } = req.body;

    if (!nombre_empleado || !documento || !cargo_id || !salario_base) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    await connection.query(
      `INSERT INTO empleados 
       (nombre_empleado, documento, email, telefono, direccion, fecha_ingreso, fecha_retiro, estado, cargo_id, salario_base, eps, pension, arl) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre_empleado, documento, email, telefono, direccion, fecha_ingreso, fecha_retiro, estado, cargo_id, salario_base, eps, pension, arl]
    );

    res.json({ message: "✅ Empleado creado con éxito" });
  } catch (err) {
    console.error("❌ Error creando empleado:", err.message);
    res.status(500).json({ message: "Error al crear empleado" });
  }
});

// Actualizar empleado
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_empleado, documento, email, telefono, direccion,
            fecha_ingreso, fecha_retiro, estado, cargo_id,
            salario_base, eps, pension, arl } = req.body;

    await connection.query(
      `UPDATE empleados SET 
        nombre_empleado=?, documento=?, email=?, telefono=?, direccion=?, 
        fecha_ingreso=?, fecha_retiro=?, estado=?, cargo_id=?, 
        salario_base=?, eps=?, pension=?, arl=? 
       WHERE id = ?`,
      [nombre_empleado, documento, email, telefono, direccion, fecha_ingreso, fecha_retiro, estado, cargo_id, salario_base, eps, pension, arl, id]
    );

    res.json({ message: "✅ Empleado actualizado con éxito" });
  } catch (err) {
    console.error("❌ Error actualizando empleado:", err.message);
    res.status(500).json({ message: "Error al actualizar empleado" });
  }
});

// Eliminar empleado
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await connection.query("DELETE FROM empleados WHERE id = ?", [id]);
    res.json({ message: "🗑️ Empleado eliminado con éxito" });
  } catch (err) {
    console.error("❌ Error eliminando empleado:", err.message);
    res.status(500).json({ message: "Error al eliminar empleado" });
  }
});

export default router;
