import express from "express";
import { connection } from "../config/db.js";

const router = express.Router();

// ==============================
// ✅ Listar pagos (con nombre de empleado y periodo)
// ==============================
router.get("/", async (req, res) => {
  try {
    const [rows] = await connection.query(
      `SELECT
  p.id,
  p.empleado_id,
  COALESCE(p.nombre_empleado, e.nombre_empleado) AS empleado_nombre,
  p.periodo_id,
  pn.fecha_inicio AS periodo_inicio,
  pn.fecha_fin   AS periodo_fin,
  p.fecha_pago,
  p.monto,
  p.metodo_pago,
  p.estado,
  p.observaciones
FROM pagos p
LEFT JOIN empleados e      ON e.id = p.empleado_id
LEFT JOIN periodos_nomina pn ON pn.id = p.periodo_id
-- (WHERE p.id = ? en el GET /:id)
ORDER BY p.fecha_pago DESC, p.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error listando pagos:", err.message);
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
    console.error(" Error obteniendo pago:", err.message);
    res.status(500).json({ error: "Error al obtener pago" });
  }
});

// ==============================
// ✅ Crear un nuevo pago
// ==============================
router.post("/", async (req, res) => {
  try {
    const {
      empleado_id: bodyEmpleadoId,
      nombre_empleado: bodyNombre,
      periodo_id,
      fecha_pago,
      monto,
      metodo_pago,
      estado,
      observaciones,
    } = req.body || {};

    if (!fecha_pago) return res.status(400).json({ error: "fecha_pago es obligatorio" });
    if (monto == null || Number.isNaN(Number(monto)))
      return res.status(400).json({ error: "monto es obligatorio y numérico" });

    // Resolver empleado por id o por nombre
    let empleado_id = bodyEmpleadoId;
    let nombre_empleado = bodyNombre;

    if (empleado_id) {
      const [emp] = await connection.query(
        "SELECT id, nombre_empleado FROM empleados WHERE id = ?",
        [empleado_id]
      );
      if (emp.length === 0) return res.status(400).json({ error: "El empleado no existe" });
      nombre_empleado = emp[0].nombre_empleado;
    } else if (nombre_empleado) {
      const [emp] = await connection.query(
        "SELECT id, nombre_empleado FROM empleados WHERE nombre_empleado = ?",
        [nombre_empleado]
      );
      if (emp.length === 0) return res.status(400).json({ error: "El empleado no existe" });
      if (emp.length > 1)
        return res.status(409).json({ error: "Hay homónimos. Envía empleado_id." });
      empleado_id = emp[0].id;
      nombre_empleado = emp[0].nombre_empleado; // normaliza
    } else {
      return res.status(400).json({ error: "Debes enviar empleado_id o nombre_empleado" });
    }

    // Validar periodo (si viene)
    if (periodo_id) {
      const [per] = await connection.query(
        "SELECT id FROM periodos_nomina WHERE id = ?",
        [periodo_id]
      );
      if (per.length === 0) return res.status(400).json({ error: "El periodo de nómina no existe" });
    }

    // INSERT con 8 placeholders (incluye snapshot del nombre)
    const [result] = await connection.query(
      `INSERT INTO pagos
        (empleado_id, nombre_empleado, periodo_id, fecha_pago, monto, metodo_pago, estado, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empleado_id,
        nombre_empleado,
        periodo_id || null,
        fecha_pago,
        Number(monto),
        metodo_pago || "transferencia",
        estado || "pendiente",
        observaciones || null,
      ]
    );

    res.status(201).json({
      message: "Pago registrado exitosamente",
    
    });
  } catch (err) {
    console.error("Error creando pago:", err);
    res.status(500).json({ error: "Error al registrar pago" });
  }
});

// ==============================
// ✅ Actualizar pago
// ==============================
router.put("/:id", async (req, res) => {
  try {
    const {
      empleado_id: bodyEmpleadoId,
      nombre_empleado: bodyNombre,
      periodo_id,
      fecha_pago,
      monto,
      metodo_pago,
      estado,
      observaciones,
    } = req.body || {};

    let empleado_id = bodyEmpleadoId || null;
    let nombre_empleado = bodyNombre || null;

    if (empleado_id) {
      const [emp] = await connection.query(
        "SELECT id, nombre_empleado FROM empleados WHERE id = ?",
        [empleado_id]
      );
      if (emp.length === 0) return res.status(400).json({ error: "El empleado no existe" });
      nombre_empleado = emp[0].nombre_empleado;
    } else if (nombre_empleado) {
      const [emp] = await connection.query(
        "SELECT id, nombre_empleado FROM empleados WHERE nombre_empleado = ?",
        [nombre_empleado]
      );
      if (emp.length === 0) return res.status(400).json({ error: "El empleado no existe" });
      if (emp.length > 1)
        return res.status(409).json({ error: "Hay homónimos. Envía empleado_id." });
      empleado_id = emp[0].id;
      nombre_empleado = emp[0].nombre_empleado;
    }

    await connection.query(
      `UPDATE pagos
         SET empleado_id     = COALESCE(?, empleado_id),
             nombre_empleado = COALESCE(?, nombre_empleado),
             periodo_id      = ?,
             fecha_pago      = ?,
             monto           = ?,
             metodo_pago     = ?,
             estado          = ?,
             observaciones   = ?
       WHERE id = ?`,
      [
        empleado_id,
        nombre_empleado,
        periodo_id || null,
        fecha_pago,
        monto != null ? Number(monto) : null,
        metodo_pago || "transferencia",
        estado || "pendiente",
        observaciones || null,
        req.params.id,
      ]
    );

    res.json({ message: "Pago actualizado con éxito" });
  } catch (err) {
    console.error("Error actualizando pago:", err);
    res.status(500).json({ error: "Error al actualizar pago" });
  }
});
// ==============================
// ✅ Eliminar pago
// ==============================
router.delete("/:id", async (req, res) => {
  try {
    await connection.query("DELETE FROM pagos WHERE id = ?", [req.params.id]);
    res.json({ message: "Pago eliminado con éxito" });
  } catch (err) {
    console.error("Error eliminando pago:", err.message);
    res.status(500).json({ error: "Error al eliminar pago" });
  }
});

export default router;
