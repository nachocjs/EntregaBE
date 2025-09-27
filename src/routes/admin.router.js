import { Router } from "express";
import { authenticateJWT, ensureAuthenticated, ensureAdmin } from "../middlewares/auth.js";
import userService from "../services/user.service.js";

const router = Router();

// GET: Vista para listar todos los usuarios
router.get("/users", authenticateJWT, ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.render("adminUsers", { user: req.user, isAdmin: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener usuarios");
  }
});

// PUT: Modificar rol de un usuario
router.put("/users/:id/role", authenticateJWT, ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ status: "error", message: "Rol inválido" });
    }

    const updatedUser = await userService.updateUserRole(id, role);
    res.status(200).json({ status: "success", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Error al actualizar rol" });
  }
});

export default router;