import { Router } from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Cart from "../models/cart.model.js";
import bcrypt from "bcrypt";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey123";

// Registro de usuario
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;

    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ status: "error", message: "El email ya está registrado" });
    }

    // Crear carrito vacío para el usuario
    const cart = new Cart({ products: [] });
    await cart.save();

    // Validar rol
    const allowedRoles = ["user", "admin"];
    const finalRole = allowedRoles.includes(role) ? role : "user";

    // Crear usuario con carrito asignado
    const user = new User({
      first_name,
      last_name,
      email,
      age,
      password,
      role: finalRole,
      cart: cart._id,
    });

    await user.save();

    res.status(201).json({ status: "success", message: "Usuario registrado", user });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ status: "error", message: "Error al registrar usuario" });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ status: "error", message: info?.message || "Login fallido" });
    }

    try {
      // Poblar carrito para devolverlo
      const userWithCart = await User.findById(user._id).populate("cart").lean();

      // Generar token JWT
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Enviar token en cookie httpOnly
      res
        .cookie("jwt", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 1000,
        })
        .status(200)
        .json({
          status: "success",
          message: "Login exitoso",
          user: userWithCart,
        });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ status: "error", message: "Error al obtener usuario" });
    }
  })(req, res, next);
});

// Info del usuario autenticado
router.get(
  "/current",
  passport.authenticate("current", { session: false }),
  async (req, res) => {
    try {
      const userWithCart = await User.findById(req.user._id).populate("cart").lean();
      res.status(200).json({
        status: "success",
        user: userWithCart,
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("jwt").redirect("/");
});

export default router;