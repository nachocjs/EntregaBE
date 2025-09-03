import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey123";

// Middleware para autenticar JWT
const authenticateJWT = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(payload.id).select("-password").populate("cart").lean();

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    res.clearCookie("jwt");
    req.user = null;
    next();
  }
};

// Middleware para requerir que esté autenticado
const ensureAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
};

// Middleware para requerir rol admin
const ensureAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).render("error", {
      message: "Acceso denegado: Solo administradores",
      user: req.user,
    });
  }
  next();
};

// Middleware para impedir login si ya está autenticado
const preventLoginIfAuthenticated = (req, res, next) => {
  if (req.user) {
    return res.status(400).json({ status: "error", message: "Ya estás autenticado" });
  }
  next();
};

// Middleware global para manejar errores
const errorHandler = (err, req, res, next) => {
  res.status(500).json({
    status: "error",
    message: err.message || "Error interno del servidor",
  });
};

export {
  authenticateJWT,
  ensureAuthenticated,
  ensureAdmin,
  errorHandler,
  preventLoginIfAuthenticated,
};