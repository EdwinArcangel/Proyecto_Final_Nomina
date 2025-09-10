// routes/pagos.js
import express from "express";
import { connection } from "../config/db.js";

const router = express.Router();

/* ==============================
   ✅ Listar pagos
============================== */
router.get("/", async (_req, res) => {
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
       ORDER BY p.fecha_pago DESC, p.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error listando pagos:", err.message);
    res.status(500).json({ error: "Error al listar pagos" });
  }
});

/* ==============================
   ✅ Obtener pago por ID
============================== */
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

/* ==============================
   ✅ Crear pago manual
============================== */
router.post("/", async (req, res) => {
  try {
    const {
      empleado_id,
      periodo_id,
      fecha_pago,
      monto,
      metodo_pago,
      estado,
      observaciones,
    } = req.body;

    const [empleado] = await connection.query(
      "SELECT id FROM empleados WHERE id = ?",
      [empleado_id]
    );
    if (empleado.length === 0) {
      return res.status(400).json({ error: "El empleado no existe" });
    }

    if (periodo_id) {
      const [periodo] = await connection.query(
        "SELECT id FROM periodos_nomina WHERE id = ?",
        [periodo_id]
      );
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
      data: {
        empleado_id,
        periodo_id,
        fecha_pago,
        monto,
        metodo_pago,
        estado,
        observaciones,
      },
    });
  } catch (err) {
    console.error("❌ Error creando pago:", err.message);
    res.status(500).json({ error: "Error al registrar pago" });
  }
});

/* ==============================
   ✅ Actualizar pago
============================== */
router.put("/:id", async (req, res) => {
  try {
    const {
      empleado_id,
      periodo_id,
      fecha_pago,
      monto,
      metodo_pago,
      estado,
      observaciones,
    } = req.body;

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
      [
        empleado_id,
        periodo_id || null,
        fecha_pago,
        monto,
        metodo_pago,
        estado,
        observaciones,
        req.params.id,
      ]
    );

    res.json({ message: "✏️ Pago actualizado con éxito" });
  } catch (err) {
    console.error("❌ Error actualizando pago:", err.message);
    res.status(500).json({ error: "Error al actualizar pago" });
  }
});

/* ==============================
   ✅ Eliminar pago
============================== */
router.delete("/:id", async (req, res) => {
  try {
    await connection.query("DELETE FROM pagos WHERE id = ?", [req.params.id]);
    res.json({ message: "🗑️ Pago eliminado con éxito" });
  } catch (err) {
    console.error("❌ Error eliminando pago:", err.message);
    res.status(500).json({ error: "Error al eliminar pago" });
  }
});

/* ==============================
   ✅ Liquidar (con parámetros + novedades + detalle)
   POST /api/pagos/liquidar
   Body:
   {
     "periodo_id": 1,                // requerido
     "empleado_id": 1,               // uno de los dos
     "nombre_empleado": "Ana Torres",// uno de los dos
     "fecha_pago": "YYYY-MM-DD",     // opcional (por defecto hoy)
     "metodo_pago": "transferencia", // opcional
     "sobrescribir": false           // opcional (reemplaza si ya existe pago)
   }
============================== */
router.post("/liquidar", async (req, res) => {
  const {
    periodo_id,
    empleado_id,
    nombre_empleado,
    fecha_pago,
    metodo_pago = "transferencia",
    sobrescribir = false,
  } = req.body || {};

  if (!periodo_id) {
    return res.status(400).json({ message: "periodo_id es requerido" });
  }
  if (!empleado_id && !nombre_empleado) {
    return res
      .status(400)
      .json({ message: "Debe enviar empleado_id o nombre_empleado" });
  }

  try {
    // 1) Periodo
    const [[periodo]] = await connection.query(
      "SELECT id, fecha_inicio, fecha_fin, estado FROM periodos_nomina WHERE id = ?",
      [periodo_id]
    );
    if (!periodo) return res.status(404).json({ message: "Periodo no encontrado" });
    const inicio = new Date(periodo.fecha_inicio);
    const fin = new Date(periodo.fecha_fin);

    // 2) Empleado (por id o por nombre)
    const empWhere = empleado_id ? "id = ?" : "LOWER(nombre_empleado) = LOWER(?)";
    const empParam = empleado_id ? empleado_id : nombre_empleado;
    const [[emp]] = await connection.query(
      `SELECT id, nombre_empleado, documento, email, estado, salario_base
       FROM empleados WHERE ${empWhere}`,
      [empParam]
    );
    if (!emp) return res.status(404).json({ message: "Empleado no encontrado" });
    if (emp.estado !== "activo")
      return res.status(400).json({ message: "Empleado inactivo" });

    // 3) Evitar duplicado
    const [[pagoExistente]] = await connection.query(
      "SELECT id FROM pagos WHERE empleado_id = ? AND periodo_id = ?",
      [emp.id, periodo_id]
    );
    if (pagoExistente && !sobrescribir) {
      return res.status(409).json({
        message:
          "Ya existe un pago para este empleado en el periodo. Envíe sobrescribir=true para reemplazar.",
        pago_id: pagoExistente.id,
      });
    }

    // 4) Parámetros de nómina
    const [params] = await connection.query(
      "SELECT nombre, valor FROM parametros_nomina"
    );
    const getParam = (k, def) => {
      const p = params.find((x) => x.nombre === k);
      return p ? Number(p.valor) : def;
    };
    const SALUD_PORC = getParam("SALUD_PORC", 4.0);
    const PENSION_PORC = getParam("PENSION_PORC", 4.0);
    const ARL_PORC = getParam("ARL_PORC", 0.5);
    const AUX_TRANSPORTE = getParam("AUX_TRANSPORTE", 140606);
    const SMMLV = getParam("SMMLV", 1300000);

    // 5) Novedades aprobadas que SE SOLAPEN con el periodo
    const [novs] = await connection.query(
      `SELECT tipo, COALESCE(SUM(monto),0) AS total
         FROM novedades
        WHERE empleado_id = ?
          AND estado = 'aprobada'
          AND (
            (fecha_inicio <= ? AND (fecha_fin IS NULL OR fecha_fin >= ?)) OR
            (fecha_inicio BETWEEN ? AND ?) OR
            (fecha_fin BETWEEN ? AND ?)
          )
        GROUP BY tipo`,
      [emp.id, fin, inicio, inicio, fin, inicio, fin]
    );
    const nov = Object.fromEntries(novs.map((n) => [n.tipo, Number(n.total)]));

    // 6) Cálculos
    const salarioBase = Number(emp.salario_base) || 0;
    const auxTransporte = salarioBase <= 2 * SMMLV ? AUX_TRANSPORTE : 0;

    const devengos = {
      salarioDias: salarioBase,                     // salario del periodo (simple)
      horasExtra: nov.horas_extra || 0,
      bonificaciones: nov.bonificacion || 0,
      vacaciones: nov.vacaciones || 0,
      licencias: nov.licencia || 0,
      incapacidad: nov.incapacidad || 0,           // tratada como devengo
      auxTransporte,
    };
    const totalDevengado = Object.values(devengos).reduce((a, b) => a + b, 0);

    const deducciones = {
      salud: (salarioBase * SALUD_PORC) / 100,
      pension: (salarioBase * PENSION_PORC) / 100,
      arl: (salarioBase * ARL_PORC) / 100,
      descuentos: (nov.descuento || 0) + (nov.ausencia || 0),
    };
    const totalDeducciones = Object.values(deducciones).reduce(
      (a, b) => a + b,
      0
    );

    const netoPagar = totalDevengado - totalDeducciones;

    // 7) Insertar/actualizar pago
    const fechaPago = fecha_pago || new Date().toISOString().substring(0, 10);
    let pagoId;
    if (pagoExistente && sobrescribir) {
      await connection.query(
        `UPDATE pagos
           SET fecha_pago = ?, monto = ?, metodo_pago = ?, estado = 'pendiente', observaciones = 'Liquidación automática (reemplazo)'
         WHERE id = ?`,
        [fechaPago, netoPagar, metodo_pago, pagoExistente.id]
      );
      await connection.query("DELETE FROM pago_detalle WHERE pago_id = ?", [
        pagoExistente.id,
      ]);
      pagoId = pagoExistente.id;
    } else {
      const [ins] = await connection.query(
        `INSERT INTO pagos (empleado_id, periodo_id, fecha_pago, monto, metodo_pago, estado, observaciones)
         VALUES (?,?,?,?,?,'pendiente','Liquidación automática')`,
        [emp.id, periodo_id, fechaPago, netoPagar, metodo_pago]
      );
      pagoId = ins.insertId;
    }

    // 8) Detalle de conceptos
    const conceptos = [
      ["Salario Básico (periodo)", devengos.salarioDias, "devengado"],
      ["Horas extra", devengos.horasExtra, "devengado"],
      ["Bonificaciones", devengos.bonificaciones, "devengado"],
      ["Vacaciones", devengos.vacaciones, "devengado"],
      ["Licencias", devengos.licencias, "devengado"],
      ["Incapacidad", devengos.incapacidad, "devengado"],
      ["Auxilio de transporte", devengos.auxTransporte, "devengado"],
      [`Salud (${SALUD_PORC}%)`, deducciones.salud, "deduccion"],
      [`Pensión (${PENSION_PORC}%)`, deducciones.pension, "deduccion"],
      [`ARL (${ARL_PORC}%)`, deducciones.arl, "deduccion"],
      ["Descuentos/ausencias", deducciones.descuentos, "deduccion"],
    ].filter(([, v]) => Number(v) !== 0);

    if (conceptos.length) {
      await connection.query(
        `INSERT INTO pago_detalle (pago_id, concepto, valor, tipo) VALUES ?`,
        [conceptos.map((c) => [pagoId, ...c])]
      );
    }

    // 9) Respuesta
    return res.json({
      message: "✅ Nómina liquidada con éxito",
      pago: {
        id: pagoId,
        fecha_pago: fechaPago,
        metodo_pago,
        estado: "pendiente",
        total_neto: netoPagar,
      },
      empleado: {
        id: emp.id,
        nombre: emp.nombre_empleado,
        documento: emp.documento,
        email: emp.email,
      },
      periodo: {
        id: periodo.id,
        inicio: periodo.fecha_inicio,
        fin: periodo.fecha_fin,
        estado: periodo.estado,
      },
      desglose: {
        salario_base: salarioBase,
        devengos: { ...devengos, total: totalDevengado },
        deducciones: { ...deducciones, total: totalDeducciones },
        subtotal: totalDevengado,
        total_neto: netoPagar,
      },
      novedades: novs, // crudo por tipo (totales)
    });
  } catch (err) {
    console.error("❌ Error liquidando nómina:", err);
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
});

export default router;
