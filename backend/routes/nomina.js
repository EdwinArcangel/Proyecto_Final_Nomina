// routes/nomina.js
import express from "express";
import { connection } from "../config/db.js";

const router = express.Router();

/**
 * 🔹 GET /nomina/liquidar/:periodo_id
 * Liquida la nómina de todos los empleados activos para un periodo
 */
router.get("/liquidar/:periodo_id", async (req, res) => {
  const { periodo_id } = req.params;

  try {
    // 1) Traer parámetros de nómina
    const [params] = await connection.query("SELECT * FROM parametros_nomina");
    const paramMap = {};
    params.forEach((p) => (paramMap[p.nombre] = Number(p.valor)));

    const saludPorc = paramMap["SALUD_PORC"] || 4.0;
    const pensionPorc = paramMap["PENSION_PORC"] || 4.0;
    const arlPorc = paramMap["ARL_PORC"] || 0.5;
    const auxTransporte = paramMap["AUX_TRANSPORTE"] || 140606;

    // 2) Traer empleados activos
    const [empleados] = await connection.query(
      `SELECT id, nombre_empleado, salario_base 
       FROM empleados 
       WHERE estado = 'activo'`
    );

    if (empleados.length === 0) {
      return res.status(404).json({ message: "No hay empleados activos" });
    }

    const resultados = [];

    for (const emp of empleados) {
      const salarioBase = Number(emp.salario_base);

      // Devengados
      const aux = salarioBase <= 2 * 1300000 ? auxTransporte : 0; // Ejemplo: aux. hasta 2 SMMLV
      const totalDevengado = salarioBase + aux;

      // Deducciones
      const salud = (salarioBase * saludPorc) / 100;
      const pension = (salarioBase * pensionPorc) / 100;
      const arl = (salarioBase * arlPorc) / 100;
      const totalDeducciones = salud + pension + arl;

      // Neto
      const netoPagar = totalDevengado - totalDeducciones;

      // 3) Insertar en tabla pagos
      const [pagoResult] = await connection.query(
        `INSERT INTO pagos 
          (empleado_id, periodo_id, fecha_pago, monto, estado) 
         VALUES (?,?,?,?,?)`,
        [emp.id, periodo_id, new Date(), netoPagar, "pendiente"]
      );

      const pagoId = pagoResult.insertId;

      // 4) Insertar detalle del pago
      await connection.query(
        `INSERT INTO pago_detalle (pago_id, concepto, valor, tipo) VALUES ?`,
        [
          [
            [pagoId, "Salario Básico", salarioBase, "devengado"],
            [pagoId, "Auxilio Transporte", aux, "devengado"],
            [pagoId, "Salud", salud, "deduccion"],
            [pagoId, "Pensión", pension, "deduccion"],
            [pagoId, "ARL", arl, "deduccion"],
          ],
        ]
      );

      resultados.push({
        empleado: emp.nombre_empleado,
        salarioBase,
        auxTransporte: aux,
        salud,
        pension,
        arl,
        netoPagar,
      });
    }

    res.json({
      message: "✅ Nómina liquidada con éxito",
      periodo_id,
      empleados: resultados,
    });
  } catch (err) {
    console.error("❌ Error liquidando nómina:", err);
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
});

/**
 * 🔹 GET /nomina/pagos/:periodo_id
 * Consulta los pagos generados en un periodo
 */
router.get("/pagos/:periodo_id", async (req, res) => {
  const { periodo_id } = req.params;

  try {
    const [pagos] = await connection.query(
      `SELECT p.id, e.nombre_empleado, p.fecha_pago, p.monto, p.estado
       FROM pagos p
       INNER JOIN empleados e ON e.id = p.empleado_id
       WHERE p.periodo_id = ?`,
      [periodo_id]
    );

    res.json(pagos);
  } catch (err) {
    console.error("❌ Error consultando pagos:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
