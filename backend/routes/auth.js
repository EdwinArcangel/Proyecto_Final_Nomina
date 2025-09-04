import express from "express";
import { connection } from "../config/db.js"; // ✅ corregido
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario por email
    const [rows] = await connection.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const usuario = rows[0];

    // Validar contraseña
    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Crear token
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || "mi_secreto",
      { expiresIn: "1h" }
    );

    // ✅ Devolver token + datos de usuario
    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
