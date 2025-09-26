import { Router } from "express";
import mongoose from "mongoose";

import CartController from "../controllers/cart.controller.js";
import { ensureAuthenticated } from "../middlewares/auth.js";

const router = Router();

// Validación de ObjectId
function validateObjectId(req, res, next) {
  const ids = Object.values(req.params);
  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "error", message: "ID inválido" });
    }
  }
  next();
}

// Rutas públicas
router.post("/", CartController.createCart);
router.get("/:cid", validateObjectId, CartController.getCart);
router.post("/:cid/products/:pid", validateObjectId, CartController.addProduct);
router.delete("/:cid/products/:pid", validateObjectId, CartController.deleteProduct);
router.delete("/:cid", validateObjectId, CartController.clearCart);

// Rutas protegidas (usuario logeado)
router.get("/my-cart", ensureAuthenticated, CartController.getMyCart);
router.post("/my-cart/add/:pid", ensureAuthenticated, CartController.addToMyCart);

export default router;