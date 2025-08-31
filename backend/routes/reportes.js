// routes/reportes.js
import express from "express";
import { connection } from "../config/db.js";

const router = express.Router();

// 📑 Reporte de novedades (con filtros opcionales)
router.get("/novedades", async (req, res) => {
  try {
    const { empleado_id, estado, tipo, fecha_inicio, fecha_fin } = req.query;

    let sql = `
      SELECT n.id, e.nombre_empleado, n.tipo, n.descripcion, 
             n.fecha_inicio, n.fecha_fin, n.estado, n.fecha_registro
      FROM novedades n
      LEFT JOIN empleados e ON n.empleado_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (empleado_id) {
      sql += " AND n.empleado_id = ?";
      params.push(empleado_id);
    }
    if (estado) {
      sql += " AND n.estado = ?";
      params.push(estado);
    }
    if (tipo) {
      sql += " AND n.tipo = ?";
      params.push(tipo);
    }
    if (fecha_inicio && fecha_fin) {
      sql += " AND n.fecha_inicio BETWEEN ? AND ?";
      params.push(fecha_inicio, fecha_fin);
    }

    sql += " ORDER BY n.fecha_inicio DESC";

    const [rows] = await connection.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error generando reporte de novedades:", err.message);
    res.status(500).json({ error: "Error al generar reporte de novedades" });
  }
});

export default router;
