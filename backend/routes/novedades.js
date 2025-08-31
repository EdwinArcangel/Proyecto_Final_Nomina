// routes/novedades.js
import express from "express";
import { connection } from "../config/db.js";

const router = express.Router();

// ==============================
// Listar todas las novedades (con nombre_empleado)
// ==============================
router.get("/", async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT 
        n.id,
        e.nombre_empleado,
        n.tipo,
        n.descripcion,
        n.fecha_inicio,
        n.fecha_fin,
        n.estado,
        n.fecha_registro
      FROM novedades n
      JOIN empleados e ON n.empleado_id = e.id
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error listando novedades:", err.message);
    res.status(500).json({ message: "Error al obtener novedades" });
  }
});

// ==============================
// Crear una novedad
// ==============================
router.post("/", async (req, res) => {
  try {
    const { empleado_id, tipo, descripcion, fecha_inicio, fecha_fin, monto, estado, aprobado_por } = req.body;

    if (!empleado_id || !tipo || !fecha_inicio) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    await connection.query(
      `INSERT INTO novedades 
        (empleado_id, tipo, descripcion, fecha_inicio, fecha_fin, monto, estado, aprobado_por) 
       VALUES (?,?,?,?,?,?,?,?)`,
      [empleado_id, tipo, descripcion, fecha_inicio, fecha_fin || null, monto || 0, estado || "pendiente", aprobado_por || null]
    );

    res.json({ message: "✅ Novedad registrada con éxito" });
  } catch (err) {
    console.error("❌ Error creando novedad:", err.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ==============================
// Actualizar novedad
// ==============================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, descripcion, fecha_inicio, fecha_fin, monto, estado, aprobado_por } = req.body;

    await connection.query(
      `UPDATE novedades 
       SET tipo=?, descripcion=?, fecha_inicio=?, fecha_fin=?, monto=?, estado=?, aprobado_por=? 
       WHERE id=?`,
      [tipo, descripcion, fecha_inicio, fecha_fin || null, monto || 0, estado, aprobado_por || null, id]
    );

    res.json({ message: "✏️ Novedad actualizada con éxito" });
  } catch (err) {
    console.error("❌ Error actualizando novedad:", err.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ==============================
// Eliminar novedad
// ==============================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await connection.query("DELETE FROM novedades WHERE id=?", [id]);
    res.json({ message: "🗑️ Novedad eliminada con éxito" });
  } catch (err) {
    console.error("❌ Error eliminando novedad:", err.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
