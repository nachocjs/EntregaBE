import { Router } from "express";
import passport from "../config/passport.js";
import userService from "../services/user.service.js";
import { preventLoginIfAuthenticated, authenticateJWT, ensureAuthenticated } from "../middlewares/auth.js";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({ status: "success", message: "Usuario registrado", user });
  } catch (error) {
    res.status(409).json({ status: "error", message: error.message });
  }
});

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

// Ruta /current protegida solo con middleware JWT
router.get("/current", authenticateJWT, ensureAuthenticated, async (req, res) => {
  try {
    res.status(200).json({ status: "success", user: req.user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("jwt").redirect("/");
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    await userService.sendResetEmail(email);
    res.status(200).json({ status: "success", message: "Correo de recuperación enviado" });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await userService.updatePassword(decoded.email, newPassword);
    res.status(200).json({ status: "success", message: "Contraseña actualizada correctamente" });
  } catch (err) {
    res.status(400).json({ status: "error", message: "Token inválido o expirado" });
  }
});

export default router;