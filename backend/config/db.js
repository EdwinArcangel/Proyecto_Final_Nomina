// config/db.js
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

let pool = null;

/** Convierte flags de env a booleano */
const toBool = (v, def = false) =>
  String(v ?? def).trim().toLowerCase() === "true";

/**
 * Conecta a MySQL usando pool.
 * - Crea la BD y aplica migraciones en local (opcional por flags).
 * - En producción/Render, normalmente ya apuntas a una BD existente.
 */
export async function connectDB() {
  if (pool) return pool;

  const host = process.env.MYSQL_HOST || "localhost";
  const port = Number(process.env.MYSQL_PORT || 3306);
  const user = process.env.MYSQL_USER || "root";
  const password = process.env.MYSQL_PASSWORD || "admin";
  const database = process.env.MYSQL_DB || "nomina_db";
  const useSSL = toBool(process.env.MYSQL_SSL, false);

  // Por defecto, en local sí creamos BD y migramos; en producción no
  const createDbOnBoot = toBool(
    process.env.CREATE_DB_ON_BOOT,
    host === "localhost"
  );
  const migrateOnBoot = toBool(
    process.env.MIGRATE_ON_BOOT,
    host === "localhost"
  );
  const seedOnBoot = toBool(
    process.env.SEED_ON_BOOT,
    host === "localhost"
  );

  // 1) (Opcional) Crear BD si no existe (conexión temporal sin 'database')
  if (createDbOnBoot) {
    const admin = await mysql.createConnection({
      host,
      port,
      user,
      password,
      // multipleStatements no necesario aquí
      ssl: useSSL ? { rejectUnauthorized: true } : undefined,
    });
    await admin.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await admin.end();
    console.log(`📦 Base de datos '${database}' lista`);
  }

  // 2) Crear pool apuntando a la BD
  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Evitamos múltiples statements por compatibilidad con algunos proveedores
    multipleStatements: false,
    ssl: useSSL ? { rejectUnauthorized: true } : undefined,
  });

  // Verificación rápida
  const [ping] = await pool.query("SELECT 1 AS db_ok");
  console.log("✅ MySQL listo:", ping[0]);

  // 3) (Opcional) Migraciones (crear tablas)
  if (migrateOnBoot) {
    await runMigrations(pool);
    console.log("🗄️ Migraciones aplicadas (tablas creadas o ya existentes)");
  }

  // 4) (Opcional) Data inicial (admin, catálogos, etc.)
  if (seedOnBoot) {
    await runSeeds(pool);
  }

  return pool;
}

export function getPool() {
  if (!pool) throw new Error("DB pool no inicializado. Llama a connectDB() primero.");
  return pool;
}

// Alias para compatibilidad con tu código existente que importa { connection }
export const connection = new Proxy(
  {},
  {
    get(_t, prop) {
      const p = getPool();
      return p[prop].bind(p);
    },
  }
);

/* =========================
   MIGRACIONES (CREATE TABLE)
   ========================= */
async function runMigrations(pool) {
  // Ejecuta cada sentencia por separado para evitar multipleStatements
  const statements = [
    `CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre_usuario VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      rol ENUM('admin','empleado') DEFAULT 'empleado'
    )`,

    `CREATE TABLE IF NOT EXISTS departamentos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      descripcion VARCHAR(200)
    )`,

    `CREATE TABLE IF NOT EXISTS cargos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      salario_base DECIMAL(12,2) NOT NULL,
      departamento_id INT NULL,
      FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL
    )`,

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
    )`,

    `CREATE TABLE IF NOT EXISTS periodos_nomina (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fecha_inicio DATE NOT NULL,
      fecha_fin DATE NOT NULL,
      estado ENUM('abierto','cerrado') DEFAULT 'abierto'
    )`,

    `CREATE TABLE IF NOT EXISTS pagos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      empleado_id INT NOT NULL,
      periodo_id INT NULL,
      fecha_pago DATE NOT NULL,
      monto DECIMAL(12,2) NOT NULL,
      metodo_pago ENUM('transferencia','efectivo','cheque') DEFAULT 'transferencia',
      estado ENUM('pendiente','pagado','anulado') DEFAULT 'pendiente',
      observaciones TEXT NULL,
      FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
      FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id) ON DELETE SET NULL
    )`,

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
    )`,
  ];

  for (const sql of statements) {
    await pool.query(sql);
  }
}

/* =========================
   SEEDS (admin + datos demo)
   ========================= */
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
    console.log("Usuario administrador creado");
  }

  // Departamentos
  const [[{ total: depCount }]] = await pool.query(
    "SELECT COUNT(*) AS total FROM departamentos"
  );
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
    console.log("Departamentos de prueba insertados");
  }

  // Cargos
  const [[{ total: cargoCount }]] = await pool.query(
    "SELECT COUNT(*) AS total FROM cargos"
  );
  if (cargoCount === 0) {
    await pool.query(
      `INSERT INTO cargos (nombre, salario_base, departamento_id) VALUES 
        ('Desarrollador', 4500000, 1),
        ('Analista QA', 3800000, 1),
        ('Project Manager', 6000000, 1),
        ('Contador', 5000000, 3)`
    );
    console.log(" Cargos de prueba insertados");
  }

  // Empleados
  const [[{ total: empCount }]] = await pool.query(
    "SELECT COUNT(*) AS total FROM empleados"
  );
  if (empCount === 0) {
    await pool.query(
      `INSERT INTO empleados
        (nombre_empleado, documento, email, telefono, direccion, fecha_ingreso, estado, cargo_id, salario_base, eps, pension, arl)
       VALUES
        ('Ana Torres', 'CC123', 'ana@empresa.com', '3001234567', 'Calle 123', '2022-01-15', 'activo', 1, 4500000, 'Sura', 'Protección', 'Colmena'),
        ('Juan Pérez', 'CC124', 'juan@empresa.com', '3109876543', 'Carrera 45', '2023-02-20', 'activo', 2, 3800000, 'Sanitas', 'Porvenir', 'Positiva'),
        ('María Gómez', 'CC125', 'maria@empresa.com', '3204567890', 'Av. Siempre Viva', '2021-07-01', 'activo', 3, 6000000, 'Coomeva', 'Colpensiones', 'Bolívar')`
    );
    console.log("Empleados de prueba insertados");
  }

  // Periodo de nómina
  const [[{ total: perCount }]] = await pool.query(
    "SELECT COUNT(*) AS total FROM periodos_nomina"
  );
  if (perCount === 0) {
    await pool.query(
      "INSERT INTO periodos_nomina (fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?)",
      ["2025-08-01", "2025-08-31", "abierto"]
    );
    console.log("Periodo de nómina creado");
  }
}
