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

    const [empleado] = await connection.query("SELECT id FROM empleados WHERE id = ?", [empleado_id]);
    if (empleado.length === 0) {
      return res.status(400).json({ error: "El empleado no existe" });
    }

    if (periodo_id) {
      const [periodo] = await connection.query("SELECT id FROM periodos_nomina WHERE id = ?", [periodo_id]);
      if (periodo.length === 0) {
        return res.status(400).json({ error: "El periodo de nómina no existe" });
      }
    }

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

// ==============================
// ✅ Liquidar nómina (respuesta detallada)
// ==============================
router.post("/liquidar", async (req, res) => {
  try {
    const { nombre_empleado, periodo_id } = req.body;

    if (!nombre_empleado || !periodo_id) {
      return res
        .status(400)
        .json({ message: "Faltan datos: nombre_empleado y periodo_id" });
    }

    // 1) Empleado
    const [empRows] = await connection.query(
      `SELECT id, nombre_empleado, documento, email, salario_base
       FROM empleados WHERE nombre_empleado = ?`,
      [nombre_empleado]
    );
    if (empRows.length === 0)
      return res.status(404).json({ message: "Empleado no encontrado" });
    const empleado = empRows[0];

    // 2) Periodo
    const [perRows] = await connection.query(
      `SELECT id, fecha_inicio, fecha_fin
       FROM periodos_nomina WHERE id = ?`,
      [periodo_id]
    );
    if (perRows.length === 0)
      return res.status(404).json({ message: "Periodo de nómina no encontrado" });
    const periodo = perRows[0];

    // 3) Novedades aprobadas dentro del periodo
    const [novedades] = await connection.query(
      `SELECT id, tipo, descripcion, monto, fecha_inicio, fecha_fin
       FROM novedades
       WHERE empleado_id = ?
         AND estado = 'aprobada'
         AND fecha_inicio >= ?
         AND (fecha_fin IS NULL OR fecha_fin <= ?)`,
      [empleado.id, periodo.fecha_inicio, periodo.fecha_fin]
    );

    // 4) Desglose de devengos y deducciones
    const esDevengo = new Set(["bonificacion", "horas_extra"]);
    const esDeduccion = new Set(["descuento", "ausencia", "incapacidad"]);

    let totalDevengos = 0;
    let totalDeducciones = 0;

    const detalleNovedades = novedades.map((n) => {
      const monto = Number(n.monto || 0);
      if (esDevengo.has(n.tipo)) totalDevengos += monto;
      if (esDeduccion.has(n.tipo)) totalDeducciones += monto;
      return {
        id: n.id,
        tipo: n.tipo,
        descripcion: n.descripcion,
        monto,
        fecha_inicio: n.fecha_inicio,
        fecha_fin: n.fecha_fin,
        clasificacion: esDevengo.has(n.tipo)
          ? "devengo"
          : esDeduccion.has(n.tipo)
          ? "deduccion"
          : "otro",
      };
    });

    const salarioBase = Number(empleado.salario_base || 0);
    const subtotal = salarioBase + totalDevengos - totalDeducciones;

    // (Opcional) Retenciones del trabajador 4% + 4% sobre salario base
    // Colócalo en true si quieres aplicarlas:
    const APLICAR_RETENCIONES = false;
    const ret_salud = APLICAR_RETENCIONES ? +(salarioBase * 0.04).toFixed(2) : 0;
    const ret_pension = APLICAR_RETENCIONES ? +(salarioBase * 0.04).toFixed(2) : 0;
    const totalRetenciones = ret_salud + ret_pension;

    const totalNeto = +(subtotal - totalRetenciones).toFixed(2);

    // 5) Registrar el pago
    const [ins] = await connection.query(
      `INSERT INTO pagos (empleado_id, periodo_id, fecha_pago, monto, metodo_pago, estado, observaciones)
       VALUES (?,?,?,?,?,?,?)`,
      [
        empleado.id,
        periodo.id,
        new Date(),
        totalNeto,
        "transferencia",
        "pagado",
        "Liquidación automática",
      ]
    );

    // "Número de pago" legible (sin cambiar esquema)
    const numeroPago = `PG-${String(ins.insertId).padStart(6, "0")}`;

    // 6) Respuesta detallada
    res.json({
      message: "✅ Nómina liquidada con éxito",
      pago: {
        id: ins.insertId,
        numero: numeroPago,
        fecha_pago: new Date(),
        metodo_pago: "transferencia",
        estado: "pagado",
        total_neto: totalNeto,
      },
      empleado: {
        id: empleado.id,
        nombre: empleado.nombre_empleado,
        documento: empleado.documento,
        email: empleado.email,
      },
      periodo: {
        id: periodo.id,
        inicio: periodo.fecha_inicio,
        fin: periodo.fecha_fin,
      },
      desglose: {
        salario_base: salarioBase,
        devengos: {
          total: totalDevengos,
        },
        deducciones: {
          total: totalDeducciones,
        },
        retenciones: {
          salud_4: ret_salud,
          pension_4: ret_pension,
          total: totalRetenciones,
        },
        subtotal: subtotal,
        total_neto: totalNeto,
      },
      novedades: detalleNovedades,
    });
  } catch (err) {
    console.error("❌ Error liquidando nómina:", err);
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
});

export default router;
