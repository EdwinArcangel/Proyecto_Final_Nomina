import express from "express";
import { connection } from "../config/db.js";

const router = express.Router();

// ==============================
// Listar todas las novedades (con nombre_empleado vía JOIN)
// ==============================
router.get("/", async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT 
        n.id,
        n.empleado_id,
        e.nombre_empleado,
        n.tipo,
        n.descripcion,
        n.fecha_inicio,
        n.fecha_fin,
        n.monto,
        n.estado,
        n.aprobado_por,
        n.fecha_registro
      FROM novedades n
      INNER JOIN empleados e ON n.empleado_id = e.id
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error listando novedades:", err.message);
    res.status(500).json({ message: "Error al obtener novedades" });
  }
});

// ==============================
// Crear una novedad (buscando empleado por nombre)
// ==============================
router.post("/", async (req, res) => {
  try {
    console.log("📩 Body recibido:", req.body);

    const {
      nombre_empleado,
      tipo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      monto,
      estado,
      aprobado_por,
    } = req.body;

    if (!nombre_empleado || !tipo || !fecha_inicio) {
      return res.status(400).json({
        message: "Faltan datos obligatorios",
        recibido: req.body,
      });
    }

    // Buscar el ID del empleado por nombre
    const [empleado] = await connection.query(
      "SELECT id FROM empleados WHERE nombre_empleado = ?",
      [nombre_empleado]
    );

    if (empleado.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const empleado_id = empleado[0].id;

    // Insertar novedad
    await connection.query(
      `INSERT INTO novedades 
        (empleado_id, tipo, descripcion, fecha_inicio, fecha_fin, monto, estado, aprobado_por) 
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        empleado_id,
        tipo,
        descripcion,
        fecha_inicio,
        fecha_fin || null,
        monto || 0,
        estado || "pendiente",
        aprobado_por || null,
      ]
    );

    res.json({ message: "✅ Novedad registrada con éxito" });
  } catch (err) {
    console.error("❌ Error creando novedad:", err.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ==============================
// Actualizar novedad (buscando empleado por nombre)
// ==============================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre_empleado,
      tipo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      monto,
      estado,
      aprobado_por,
    } = req.body;

    if (!nombre_empleado || !tipo || !fecha_inicio) {
      return res.status(400).json({
        message: "Faltan datos obligatorios",
        recibido: req.body,
      });
    }

    // Buscar ID del empleado por nombre
    const [empleado] = await connection.query(
      "SELECT id FROM empleados WHERE nombre_empleado = ?",
      [nombre_empleado]
    );

    if (empleado.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const empleado_id = empleado[0].id;

    // Actualizar novedad
    await connection.query(
      `UPDATE novedades 
       SET empleado_id=?, tipo=?, descripcion=?, fecha_inicio=?, fecha_fin=?, monto=?, estado=?, aprobado_por=? 
       WHERE id=?`,
      [
        empleado_id,
        tipo,
        descripcion,
        fecha_inicio,
        fecha_fin || null,
        monto || 0,
        estado,
        aprobado_por || null,
        id,
      ]
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
