// routes/dashboard.js
import express from "express";
import { connection } from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Total empleados
    const [empleados] = await connection.query("SELECT COUNT(*) AS total FROM empleados");

    // Total usuarios con rol empleado
    const [usuarios] = await connection.query(
      "SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'empleado'"
    );

    // Total administradores
    const [admins] = await connection.query(
      "SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'admin'"
    );

    // Total de pagos del mes actual
    const [pagosMes] = await connection.query(`
      SELECT SUM(monto) AS total 
      FROM pagos 
      WHERE MONTH(fecha_pago) = MONTH(CURRENT_DATE()) 
        AND YEAR(fecha_pago) = YEAR(CURRENT_DATE())
    `);

    // Último pago registrado
    const [ultimoPago] = await connection.query(`
      SELECT fecha_pago 
      FROM pagos 
      ORDER BY fecha_pago DESC 
      LIMIT 1
    `);

    // Novedades pendientes
    const [novedadesPendientes] = await connection.query(
      "SELECT COUNT(*) AS total FROM novedades WHERE estado = 'pendiente'"
    );

    // Novedades aprobadas
    const [novedadesAprobadas] = await connection.query(
      "SELECT COUNT(*) AS total FROM novedades WHERE estado = 'aprobada'"
    );

    res.json({
      empleados: empleados[0].total,
      usuarios: usuarios[0].total, 
      admins: admins[0].total, 
      pagosMes: pagosMes[0].total || 0,
      ultimoPago: ultimoPago[0]?.fecha_pago || null,
      novedadesPendientes: novedadesPendientes[0].total,
      novedadesAprobadas: novedadesAprobadas[0].total,
    });
  } catch (err) {
    console.error("❌ Error cargando dashboard:", err.message);
    res.status(500).json({ error: "Error al cargar dashboard" });
  }

  router.get("/pagos-mensuales", async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT 
        MONTH(fecha_pago) AS mes_num,
        DATE_FORMAT(fecha_pago, '%b') AS mes,
        SUM(monto) AS total
      FROM pagos
      WHERE fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY mes_num, mes
      ORDER BY MIN(fecha_pago) ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error cargando pagos mensuales:", err.message);
    res.status(500).json({ error: "Error al cargar pagos mensuales" });
  }
});
});

export default router;
