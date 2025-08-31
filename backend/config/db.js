// config/db.js
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

let connection;

const connectDB = async () => {
  try {
    // Crear conexión
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",       // tu usuario
      password: "admin",  // tu contraseña
      multipleStatements: true,
    });

    console.log("✅ Conexión exitosa a MySQL");

    // Crear base de datos si no existe
    await connection.query("CREATE DATABASE IF NOT EXISTS nomina_db");
    console.log("📦 Base de datos 'nomina_db' lista");

    // Usar base de datos
    await connection.changeUser({ database: "nomina_db" });
    console.log("Usando base de datos 'nomina_db'");

    // =============================
    // Crear tablas en orden correcto
    // =============================
// =============================
// Crear tablas en orden correcto
// =============================
const sql = `
  CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'empleado') DEFAULT 'empleado'
  );

  CREATE TABLE IF NOT EXISTS departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
  );

  CREATE TABLE IF NOT EXISTS cargos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    salario_base DECIMAL(12,2) NOT NULL,
    departamento_id INT,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS empleados (
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
  );

  CREATE TABLE IF NOT EXISTS periodos_nomina (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado ENUM('abierto','cerrado') DEFAULT 'abierto'
  );

  CREATE TABLE IF NOT EXISTS pagos (
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
  );

  CREATE TABLE IF NOT EXISTS novedades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT,
    tipo ENUM(
      'incapacidad','licencia','vacaciones',
      'horas_extra','ausencia','bonificacion','descuento'
    ) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    monto DECIMAL(10,2) DEFAULT 0,
    estado ENUM('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
    aprobado_por INT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL
  );
`;

    await connection.query(sql);
    console.log("🗄️ Tablas creadas o ya existentes");

    // =============================
    // Usuario admin por defecto
    // =============================
    const [results] = await connection.query(
      "SELECT * FROM usuarios WHERE email = ?",
      ["admin@nomina.com"]
    );

    if (results.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await connection.query(
        "INSERT INTO usuarios (nombre_usuario, email, password, rol) VALUES (?, ?, ?, ?)",
        ["Administrador", "admin@nomina.com", hashedPassword, "admin"]
      );

      console.log("✅ Usuario administrador creado: admin@nomina.com / admin123");
    } else {
      console.log("⚡ Usuario administrador ya existe, no se creó otro.");
    }

    // =============================
    // Datos de prueba (cargos + empleados + pagos)
    // =============================
const [cargosExist] = await connection.query("SELECT COUNT(*) AS total FROM cargos");
if (cargosExist[0].total === 0) {
  await connection.query(
    "INSERT INTO cargos (nombre, salario_base, departamento_id) VALUES ?",
    [[
      ["Desarrollador", 4500000, 1],    
      ["Analista QA", 3800000, 1],      
      ["Project Manager", 6000000, 1],  
      ["Contador", 5000000, 3]          
    ]]
  );
  console.log("✅ Cargos de prueba insertados");
}

    const [empleadosExist] = await connection.query("SELECT COUNT(*) AS total FROM empleados");
    if (empleadosExist[0].total === 0) {
      await connection.query(
        "INSERT INTO empleados (nombre_empleado, documento, email, telefono, direccion, fecha_ingreso, estado, cargo_id, salario_base, eps, pension, arl) VALUES ?",
        [[
          ["Ana Torres", "CC123", "ana@empresa.com", "3001234567", "Calle 123", "2022-01-15", "activo", 1, 4500000, "Sura", "Protección", "Colmena"],
          ["Juan Pérez", "CC124", "juan@empresa.com", "3109876543", "Carrera 45", "2023-02-20", "activo", 2, 3800000, "Sanitas", "Porvenir", "Positiva"],
          ["María Gómez", "CC125", "maria@empresa.com", "3204567890", "Av. Siempre Viva", "2021-07-01", "activo", 3, 6000000, "Coomeva", "Colpensiones", "Bolívar"]
        ]]
      );
      console.log("✅ Empleados de prueba insertados");
    }

    const [periodos] = await connection.query("SELECT COUNT(*) AS total FROM periodos_nomina");
    if (periodos[0].total === 0) {
      await connection.query(
        "INSERT INTO periodos_nomina (fecha_inicio, fecha_fin, estado) VALUES (?,?,?)",
        ["2025-08-01", "2025-08-31", "abierto"]
      );
      console.log("✅ Periodo de nómina de prueba creado (Agosto 2025)");
    }


//  Departamentos
const [depts] = await connection.query("SELECT COUNT(*) AS total FROM departamentos");
if (depts[0].total === 0) {
  await connection.query(
    "INSERT INTO departamentos (nombre, descripcion) VALUES ?",
    [[
      ["TI", "Tecnología e innovación"],
      ["Recursos Humanos", "Gestión de personal"],
      ["Finanzas", "Administración financiera"]
    ]]
  );
  console.log("✅ Departamentos de prueba insertados");
}

  } catch (err) {
    console.error("❌ Error conectando a MySQL:", err.message);
    process.exit(1);
  }
};

export { connection, connectDB };
