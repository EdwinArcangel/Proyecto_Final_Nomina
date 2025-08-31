// routes/empleados.js
import express from "express";
import { connection } from "../config/db.js";

const router = express.Router();

/* =========================
   Crear empleado (cargo en texto)
   ========================= */
router.post("/", async (req, res) => {
  try {
    const {
      nombre_empleado,
      documento,
      email,
      telefono,
      direccion,
      fecha_ingreso,
      estado,
      cargo,
      salario_base,
      eps,
      pension,
      arl,
    } = req.body;

    if (!nombre_empleado || !documento || !cargo || !salario_base) {
      return res.status(400).json({
        message: "Faltan datos obligatorios (nombre_empleado, documento, cargo, salario_base)",
      });
    }

    // 1. Verificar si el cargo ya existe
    let [cargoRow] = await connection.query("SELECT id FROM cargos WHERE nombre = ?", [cargo]);
    let cargo_id;
    if (cargoRow.length > 0) {
      cargo_id = cargoRow[0].id;
    } else {
      // 2. Crear cargo automáticamente
      const [insertCargo] = await connection.query(
        "INSERT INTO cargos (nombre, departamento, salario_base) VALUES (?, ?, ?)",
        [cargo, "General", salario_base]
      );
      cargo_id = insertCargo.insertId;
    }

    // 3. Insertar empleado
    await connection.query(
      `INSERT INTO empleados 
        (nombre_empleado, documento, email, telefono, direccion, fecha_ingreso, estado, cargo_id, salario_base, eps, pension, arl)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        nombre_empleado,
        documento,
        email,
        telefono,
        direccion,
        fecha_ingreso,
        estado || "activo",
        cargo_id,
        salario_base,
        eps,
        pension,
        arl,
      ]
    );

    res.status(201).json({ message: "✅ Empleado creado con éxito" });
  } catch (err) {
    console.error("❌ Error creando empleado:", err.message);

    if (err.code === "ER_DUP_ENTRY") {
      if (err.message.includes("documento")) {
        return res.status(400).json({ message: "Documento ya registrado" });
      }
      if (err.message.includes("email")) {
        return res.status(400).json({ message: "Email ya registrado" });
      }
    }

    res.status(500).json({ message: "Error al crear empleado" });
  }
});

/* =========================
   Listar empleados (con nombre de cargo)
   ========================= */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT e.id, e.nombre_empleado, e.documento, e.email, e.telefono,
             e.direccion, e.fecha_ingreso, e.fecha_retiro, e.estado,
             c.nombre AS cargo,
             e.salario_base, e.eps, e.pension, e.arl,
             e.creado_en, e.actualizado_en
      FROM empleados e
      LEFT JOIN cargos c ON e.cargo_id = c.id
      ORDER BY e.id ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error listando empleados:", err.message);
    res.status(500).json({ message: "Error al obtener empleados" });
  }
});

/* =========================
   Obtener empleado por ID
   ========================= */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await connection.query(
      `SELECT e.id, e.nombre_empleado, e.documento, e.email, e.telefono,
              e.direccion, e.fecha_ingreso, e.fecha_retiro, e.estado,
              c.nombre AS cargo,
              e.salario_base, e.eps, e.pension, e.arl,
              e.creado_en, e.actualizado_en
       FROM empleados e
       LEFT JOIN cargos c ON e.cargo_id = c.id
       WHERE e.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Empleado no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error obteniendo empleado:", err.message);
    res.status(500).json({ message: "Error al obtener empleado" });
  }
});

/* =========================
   Actualizar empleado (cargo en texto)
   ========================= */
router.put("/:id", async (req, res) => {
  try {
    const {
      nombre_empleado,
      documento,
      email,
      telefono,
      direccion,
      fecha_ingreso,
      estado,
      cargo,
      salario_base,
      eps,
      pension,
      arl,
    } = req.body;

    if (!nombre_empleado || !documento || !cargo || !salario_base) {
      return res.status(400).json({
        message: "Faltan datos obligatorios (nombre_empleado, documento, cargo, salario_base)",
      });
    }

    // 1. Buscar cargo
    let [cargoRow] = await connection.query("SELECT id FROM cargos WHERE nombre = ?", [cargo]);
    let cargo_id;
    if (cargoRow.length > 0) {
      cargo_id = cargoRow[0].id;
    } else {
      const [insertCargo] = await connection.query(
        "INSERT INTO cargos (nombre, departamento, salario_base) VALUES (?, ?, ?)",
        [cargo, "General", salario_base]
      );
      cargo_id = insertCargo.insertId;
    }

    // 2. Actualizar empleado
    await connection.query(
      `UPDATE empleados
       SET nombre_empleado=?, documento=?, email=?, telefono=?, direccion=?, fecha_ingreso=?, estado=?, cargo_id=?, salario_base=?, eps=?, pension=?, arl=?
       WHERE id=?`,
      [
        nombre_empleado,
        documento,
        email,
        telefono,
        direccion,
        fecha_ingreso,
        estado || "activo",
        cargo_id,
        salario_base,
        eps,
        pension,
        arl,
        req.params.id,
      ]
    );

    res.json({ message: "✅ Empleado actualizado con éxito" });
  } catch (err) {
    console.error("❌ Error actualizando empleado:", err.message);
    res.status(500).json({ message: "Error al actualizar empleado" });
  }
});

/* =========================
   Eliminar empleado
   ========================= */
router.delete("/:id", async (req, res) => {
  try {
    await connection.query("DELETE FROM empleados WHERE id = ?", [req.params.id]);
    res.json({ message: "🗑️ Empleado eliminado con éxito" });
  } catch (err) {
    console.error("❌ Error eliminando empleado:", err.message);
    res.status(500).json({ message: "Error al eliminar empleado" });
  }
});

export default router;
