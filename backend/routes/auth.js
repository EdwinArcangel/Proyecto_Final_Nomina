import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { connection } from "../config/db.js"; 

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

    // Comparar contraseña con bcrypt
    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Crear token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      "mi_secreto", // 
      { expiresIn: "1h" }
    );

    // Respuesta exitosa
    res.json({
      message: "Login exitoso",
      token,
    });

  } catch (error) {
    console.error("❌ Error en el servidor:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
