import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "miclavesecreta123";

// Middleware para autenticar JWT desde cookie
const authenticateJWT = async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id)
      .populate("cart")
      .select("-password")
      .lean();

    req.user = user || null;
    next();
  } catch (error) {
    console.error("❌ Error en authenticateJWT:", error.message);
    res.clearCookie("jwt");
    req.user = null;
    next();
  }
};

// Middleware para requerir usuario autenticado
const ensureAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ status: "error", message: "Usuario no autenticado" });
  next();
};

// Middleware para requerir rol admin
const ensureAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).render("error", {
      message: "Acceso denegado: Solo administradores",
      user: req.user || null,
    });
  }
  next();
};

// Middleware para impedir login si ya está autenticado
const preventLoginIfAuthenticated = (req, res, next) => {
  if (req.user) return res.status(400).json({ status: "error", message: "Ya estás autenticado" });
  next();
};

// Middleware global para manejar errores
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    status: "error",
    message: err.message || "Error interno del servidor",
  });
};

export {
  authenticateJWT,
  ensureAuthenticated,
  ensureAdmin,
  preventLoginIfAuthenticated,
  errorHandler,
};