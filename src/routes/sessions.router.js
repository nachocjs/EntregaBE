import { Router } from "express";
import passport from "../config/passport.js";
import userService from "../services/user.service.js";
import { preventLoginIfAuthenticated, authenticateJWT, ensureAuthenticated } from "../middlewares/auth.js";
import jwt from "jsonwebtoken";

const router = Router();

// --------------------
// Registro
// --------------------
router.post("/register", async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({ status: "success", message: "Usuario registrado", user });
  } catch (error) {
    res.status(409).json({ status: "error", message: error.message });
  }
});

// --------------------
// Login
// --------------------
router.post("/login", preventLoginIfAuthenticated, (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ status: "error", message: info?.message });

    try {
      const { token, user: userWithCart } = await userService.loginUser(user);
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      }).status(200).json({ status: "success", message: "Login exitoso", user: userWithCart });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Error al obtener usuario" });
    }
  })(req, res, next);
});

// --------------------
// Logout
// --------------------
router.post("/logout", (req, res) => {
  res.clearCookie("jwt").redirect("/login");
});

// --------------------
// Usuario actual
// --------------------
router.get("/current", authenticateJWT, ensureAuthenticated, async (req, res) => {
  try {
    res.status(200).json({ status: "success", user: req.user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// --------------------
// Recuperación de contraseña
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    await userService.sendResetEmail(email);

    // Retorna JSON para el modal
    return res.status(200).json({
      status: "success",
      message: "Correo de recuperación enviado. Revisa tu bandeja de entrada."
    });
  } catch (err) {
    console.error("Error interno al enviar correo de recuperación:", err);
    return res.status(500).json({
      status: "error",
      message: "No se pudo enviar el correo. Intenta nuevamente."
    });
  }
});

// --------------------
// Reset de contraseña
// --------------------
router.post("/reset-password", async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  // Validación básica de contraseñas
  if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
    return res.render("resetPassword", {
      token,
      message: "Las contraseñas no coinciden o están vacías",
      messageType: "danger",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await userService.updatePassword(decoded.email, newPassword);

    // Mostrar mensaje de éxito y redirigir automáticamente al login
    return res.render("resetPassword", {
      token: "",
      message: "Contraseña actualizada correctamente. Redirigiendo al login...",
      messageType: "success",
    });
  } catch (err) {
    console.error("Error al restablecer contraseña:", err);
    return res.render("resetPassword", {
      token,
      message: "Token inválido o expirado",
      messageType: "danger",
    });
  }
});

export default router;