// config/db.js

import 'dotenv/config';
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
/**
 * @file Configuración y conexión a la base de datos MySQL
 * Incluye migraciones y seeds automáticos.
 */


let pool = null;



/**
 * Convierte un valor a booleano
 */
const toBool = (v, def = false) =>
  String(v ?? def).trim().toLowerCase() === "true";


/**
 * Verifica si el host es localhost
 */
const isLocalHost = (h) =>
  ["localhost", "127.0.0.1"].includes(String(h || "").toLowerCase());


/**
 * Construye opciones SSL en base a variables de entorno
 */
function buildSslOptions(useSSL) {
  if (!useSSL) return undefined;
  const caB64 = process.env.DB_CA || process.env.MYSQL_CA || "";
  const insecure = toBool(process.env.DB_INSECURE_SSL || process.env.MYSQL_INSECURE_SSL, false);
  if (caB64 && !insecure) {
    return {
      ca: Buffer.from(caB64, "base64").toString("utf-8"),
      minVersion: "TLSv1.2",
    };
  }
  if (insecure) {
    return { rejectUnauthorized: false, minVersion: "TLSv1.2" };
  }
  return { rejectUnauthorized: true, minVersion: "TLSv1.2" };
}


/**
 * Inicializa la conexión a la base de datos y ejecuta migraciones/seeds si corresponde
 * @returns {Promise<mysql.Pool>} pool de conexiones
 */
export async function connectDB() {
  if (pool) return pool;

  // Validación de variables de entorno
  const host = process.env.DB_HOST || process.env.MYSQL_HOST || "";
  const port = Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306);
  const user = process.env.DB_USER || process.env.MYSQL_USER || "";
  const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "";
  const database = process.env.DB_NAME || process.env.MYSQL_DB || "";
  if (!host || !user || !password || !database) {
    throw new Error("Faltan variables de entorno críticas para la conexión a la base de datos");
  }

  const useSSL = toBool(process.env.DB_SSL || process.env.MYSQL_SSL, !isLocalHost(host));
  const ssl = buildSslOptions(useSSL);

  // Permitir configuración dinámica del pool
  const connectionLimit = Number(process.env.DB_POOL_LIMIT || 10);
  const queueLimit = Number(process.env.DB_QUEUE_LIMIT || 0);

  const defaultBoot = isLocalHost(host);
  const createDbOnBoot = toBool(process.env.CREATE_DB_ON_BOOT, defaultBoot);
  const migrateOnBoot  = toBool(process.env.MIGRATE_ON_BOOT,  defaultBoot);
  // Seeds solo en desarrollo
  const seedOnBoot     = toBool(process.env.SEED_ON_BOOT,     defaultBoot) && process.env.NODE_ENV !== 'production';

  console.log(`🔌 Conectando a MySQL ${user}@${host}:${port} db=${database} ssl=${useSSL}`);

  // 1) Crear BD si no existe
  if (createDbOnBoot) {
    let admin;
    try {
      admin = await mysql.createConnection({ host, port, user, password, ssl });
      await admin.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
      console.log(`📦 Base de datos '${database}' lista`);
    } catch (e) {
      console.error(`⚠️ Error creando la BD '${database}':`, e);
      throw e;
    } finally {
      if (admin) await admin.end();
    }
  }

  pool = mysql.createPool({
    host, port, user, password, database,
    waitForConnections: true,
    connectionLimit,
    queueLimit,
    multipleStatements: false,
    ssl,
  });

  try {
    const [ping] = await pool.query("SELECT 1 AS db_ok");
    console.log("✅ MySQL listo:", ping[0]);
  } catch (e) {
    console.error("❌ Error al conectar con MySQL:", e);
    throw e;
  }

  if (migrateOnBoot) {
    try {
      await runMigrations(pool);
      console.log("🗄️ Migraciones aplicadas (tablas creadas o ya existentes)");
    } catch (e) {
      console.error("❌ Error en migraciones:", e);
      throw e;
    }
  }

  if (seedOnBoot) {
    try {
      await runSeeds(pool);
    } catch (e) {
      console.error("❌ Error en seeds:", e);
      throw e;
    }
  }

  return pool;
}


/**
 * Retorna el pool de conexiones actual
 */
export function getPool() {
  if (!pool) throw new Error("DB pool no inicializado. Llama a connectDB() primero.");
  return pool;
}

export const connection = new Proxy({}, {
  get(_t, prop) {
    const p = getPool();
    return p[prop].bind(p);
  },
});

/* =========================
   MIGRACIONES (CREATE TABLE)
   ========================= */
/**
 * Ejecuta las migraciones de la base de datos
 * @param {mysql.Pool} pool
 */
async function runMigrations(pool) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre_usuario VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      rol ENUM('admin','empleado') DEFAULT 'empleado'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS departamentos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      descripcion VARCHAR(200)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS cargos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      salario_base DECIMAL(12,2) NOT NULL,
      departamento_id INT NULL,
      FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS empleados (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre_empleado VARCHAR(150) NOT NULL,
      documento VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(120) UNIQUE,
      telefono VARCHAR(20),
      direccion VARCHAR(200),
      fecha_ingreso DATE NOT NULL,
      fecha_retiro DATE NULL,
      estado ENUM('activo','inactivo') DEFAULT 'activo',
      cargo_id INT NOT NULL,
      salario_base DECIMAL(12,2) NOT NULL,
      eps VARCHAR(100),
      pension VARCHAR(100),
      arl VARCHAR(100),
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS periodos_nomina (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fecha_inicio DATE NOT NULL,
      fecha_fin DATE NOT NULL,
      estado ENUM('abierto','cerrado') DEFAULT 'abierto'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    /* Pagos con snapshot de nombre_empleado + FK a empleados */
    `CREATE TABLE IF NOT EXISTS pagos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      empleado_id INT NULL,
      nombre_empleado VARCHAR(100) NULL,
      periodo_id INT NULL,
      fecha_pago DATE NOT NULL,
      monto DECIMAL(12,2) NOT NULL,
      metodo_pago ENUM('transferencia','efectivo','cheque') DEFAULT 'transferencia',
      estado ENUM('pendiente','pagado','anulado') DEFAULT 'pendiente',
      observaciones TEXT NULL,
      FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
      FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id) ON DELETE SET NULL,
      INDEX idx_pagos_fecha (fecha_pago),
      INDEX idx_pagos_estado (estado)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS novedades (
      id INT AUTO_INCREMENT PRIMARY KEY,
      empleado_id INT,
      tipo ENUM('incapacidad','licencia','vacaciones','horas_extra','ausencia','bonificacion','descuento') NOT NULL,
      descripcion TEXT,
      fecha_inicio DATE NOT NULL,
      fecha_fin DATE,
      monto DECIMAL(10,2) DEFAULT 0,
      estado ENUM('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
      aprobado_por INT NULL,
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
      FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS parametros_nomina (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      valor DECIMAL(10,2) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS pago_detalle (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pago_id INT NOT NULL,
      concepto VARCHAR(100) NOT NULL,
      valor DECIMAL(12,2) NOT NULL,
      tipo ENUM('devengado','deduccion','aporte') NOT NULL,
      FOREIGN KEY (pago_id) REFERENCES pagos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];

  for (const sql of statements) {
    await pool.query(sql);
  }

  // Mejor práctica: verificar si la columna existe antes de agregarla
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM pagos LIKE 'nombre_empleado'");
    if (!cols.length) {
      await pool.query(`ALTER TABLE pagos ADD COLUMN nombre_empleado VARCHAR(100) NULL`);
      console.log("🧱 Columna pagos.nombre_empleado agregada");
    }
  } catch (e) {
    if (e?.errno !== 1060) throw e; // 1060 = duplicate column
  }
}

/* =========================
   SEEDS (admin + datos demo)
   ========================= */
/**
 * Inserta datos de prueba (solo en desarrollo)
 * @param {mysql.Pool} pool
 */
async function runSeeds(pool) {
  // Admin
  const [users] = await pool.query(
    "SELECT id FROM usuarios WHERE email = ?",
    ["admin@nomina.com"]
  );
  if (users.length === 0) {
    const hashed = await bcrypt.hash("admin123", 10);
    await pool.query(
      "INSERT INTO usuarios (nombre_usuario, email, password, rol) VALUES (?, ?, ?, ?)",
      ["Administrador", "admin@nomina.com", hashed, "admin"]
    );
    console.log("👑 Usuario administrador creado");
  }

  // Departamentos
  const [[{ total: depCount }]] = await pool.query("SELECT COUNT(*) AS total FROM departamentos");
  if (depCount === 0) {
    await pool.query(
      `INSERT INTO departamentos (nombre, descripcion) VALUES
        ('TI', 'Tecnología e innovación'),
        ('Recursos Humanos', 'Gestión de personal'),
        ('Finanzas', 'Administración financiera'),
        ('Administración', 'Gestión administrativa y soporte'),
        ('Comercial', 'Fuerza de ventas y atención a clientes'),
        ('Marketing', 'Publicidad y posicionamiento de marca'),
        ('Operaciones', 'Producción y prestación de servicios'),
        ('Logística', 'Compras, transporte e inventarios'),
        ('Legal', 'Asuntos jurídicos y normativos'),
        ('Calidad', 'Control y mejora continua'),
        ('Mantenimiento', 'Infraestructura y soporte técnico'),
        ('Innovación', 'Investigación y desarrollo')`
    );
    console.log("🏷️ Departamentos de prueba insertados");
  }

  // Cargos
  const [[{ total: cargoCount }]] = await pool.query("SELECT COUNT(*) AS total FROM cargos");
  if (cargoCount === 0) {
    await pool.query(
      `INSERT INTO cargos (nombre, salario_base, departamento_id) VALUES 
        ('Desarrollador', 4500000, 1),
        ('Analista QA', 3800000, 1),
        ('Project Manager', 6000000, 1),
        ('Contador', 5000000, 3)`
    );
    console.log("💼 Cargos de prueba insertados");
  }

  // Empleados
  const [[{ total: empCount }]] = await pool.query("SELECT COUNT(*) AS total FROM empleados");
  if (empCount === 0) {
    await pool.query(
      `INSERT INTO empleados
        (nombre_empleado, documento, email, telefono, direccion, fecha_ingreso, estado, cargo_id, salario_base, eps, pension, arl)
       VALUES
        ('Ana Torres', 'CC123', 'ana@empresa.com', '3001234567', 'Calle 123', '2022-01-15', 'activo', 1, 4500000, 'Sura', 'Protección', 'Colmena'),
        ('Juan Pérez', 'CC124', 'juan@empresa.com', '3109876543', 'Carrera 45', '2023-02-20', 'activo', 2, 3800000, 'Sanitas', 'Porvenir', 'Positiva'),
        ('María Gómez', 'CC125', 'maria@empresa.com', '3204567890', 'Av. Siempre Viva', '2021-07-01', 'activo', 3, 6000000, 'Coomeva', 'Colpensiones', 'Bolívar')`
    );
    console.log("🧑‍💼 Empleados de prueba insertados");
  }

  // Periodo de nómina
  const [[{ total: perCount }]] = await pool.query("SELECT COUNT(*) AS total FROM periodos_nomina");
  if (perCount === 0) {
    await pool.query(
      "INSERT INTO periodos_nomina (fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?)",
      ["2025-08-01", "2025-08-31", "abierto"]
    );
    console.log("🗓️ Periodo de nómina creado");
  }

  // Parámetros de nómina
  const [[{ total: paramCount }]] = await pool.query("SELECT COUNT(*) AS total FROM parametros_nomina");
  if (paramCount === 0) {
    await pool.query(
      `INSERT INTO parametros_nomina (nombre, valor) VALUES
        ('SALUD_PORC', 4.0),
        ('PENSION_PORC', 4.0),
        ('ARL_PORC', 0.5),
        ('AUX_TRANSPORTE', 140606)`
    );
    console.log("⚙️ Parámetros de nómina insertados");
  }
}
