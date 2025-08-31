import express from "express";
import { connection } from "../config/db.js";

const router = express.Router();

// ==============================
// ✅ Listar pagos (con nombre de empleado y periodo)
// ==============================
router.get("/", async (req, res) => {
  try {
    const [rows] = await connection.query(
      `SELECT p.id, 
              p.empleado_id, 
              e.nombre_empleado AS empleado_nombre,
              p.periodo_id,
              pn.fecha_inicio AS periodo_inicio,
              pn.fecha_fin AS periodo_fin,
              p.fecha_pago, 
              p.monto, 
              p.metodo_pago, 
              p.estado, 
              p.observaciones
       FROM pagos p
       LEFT JOIN empleados e ON p.empleado_id = e.id
       LEFT JOIN periodos_nomina pn ON p.periodo_id = pn.id
       ORDER BY p.fecha_pago DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error listando pagos:", err.message);
    res.status(500).json({ error: "Error al listar pagos" });
  }
});

// ==============================
// ✅ Obtener pago por ID
// ==============================
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await connection.query(
      `SELECT p.id, 
              p.empleado_id, 
              e.nombre_empleado AS empleado_nombre,
              p.periodo_id,
              pn.fecha_inicio AS periodo_inicio,
              pn.fecha_fin AS periodo_fin,
              p.fecha_pago, 
              p.monto, 
              p.metodo_pago, 
              p.estado, 
              p.observaciones
       FROM pagos p
       LEFT JOIN empleados e ON p.empleado_id = e.id
       LEFT JOIN periodos_nomina pn ON p.periodo_id = pn.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error obteniendo pago:", err.message);
    res.status(500).json({ error: "Error al obtener pago" });
  }
});

// ==============================
// ✅ Crear un nuevo pago
// ==============================
router.post("/", async (req, res) => {
  try {
    const { empleado_id, periodo_id, fecha_pago, monto, metodo_pago, estado, observaciones } = req.body;

    // Validar que el empleado exista
    const [empleado] = await connection.query(
      "SELECT id FROM empleados WHERE id = ?",
      [empleado_id]
    );

    if (empleado.length === 0) {
      return res.status(400).json({ error: "El empleado no existe" });
    }

    // (Opcional) Validar que el periodo exista si viene en el body
    if (periodo_id) {
      const [periodo] = await connection.query(
        "SELECT id FROM periodos_nomina WHERE id = ?",
        [periodo_id]
      );
      if (periodo.length === 0) {
        return res.status(400).json({ error: "El periodo de nómina no existe" });
      }
    }

    // Insertar pago si pasa las validaciones
    const [result] = await connection.query(
      `INSERT INTO pagos (empleado_id, periodo_id, fecha_pago, monto, metodo_pago, estado, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        empleado_id,
        periodo_id || null,
        fecha_pago,
        monto,
        metodo_pago || "transferencia",
        estado || "pendiente",
        observaciones || null,
      ]
    );

    res.status(201).json({
      message: "✅ Pago registrado exitosamente",
      id: result.insertId,
      data: { empleado_id, periodo_id, fecha_pago, monto, metodo_pago, estado, observaciones },
    });
  } catch (err) {
    console.error("❌ Error creando pago:", err.message);
    res.status(500).json({ error: "Error al registrar pago" });
  }
});

// ==============================
// ✅ Actualizar pago
// ==============================
router.put("/:id", async (req, res) => {
  try {
    const { empleado_id, periodo_id, fecha_pago, monto, metodo_pago, estado, observaciones } = req.body;

    await connection.query(
      `UPDATE pagos 
       SET empleado_id = ?, 
           periodo_id = ?, 
           fecha_pago = ?, 
           monto = ?, 
           metodo_pago = ?, 
           estado = ?, 
           observaciones = ?
       WHERE id = ?`,
      [empleado_id, periodo_id || null, fecha_pago, monto, metodo_pago, estado, observaciones, req.params.id]
    );

    res.json({ message: "✏️ Pago actualizado con éxito" });
  } catch (err) {
    console.error("❌ Error actualizando pago:", err.message);
    res.status(500).json({ error: "Error al actualizar pago" });
  }
});

// ==============================
// ✅ Eliminar pago
// ==============================
router.delete("/:id", async (req, res) => {
  try {
    await connection.query("DELETE FROM pagos WHERE id = ?", [req.params.id]);
    res.json({ message: "🗑️ Pago eliminado con éxito" });
  } catch (err) {
    console.error("❌ Error eliminando pago:", err.message);
    res.status(500).json({ error: "Error al eliminar pago" });
  }
});

export default router;
