import { Router } from "express";
import CartManager from "../CartManager.js";

const router = Router();
const cartManager = new CartManager("./src/carts.json");

// Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.newCart();
    res.status(201).json({ status: "success", cart: newCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Obtener productos de un carrito por ID
router.get("/:cid", async (req, res) => {
  try {
    const cartId = parseInt(req.params.cid);
    const products = await cartManager.getCartProductsById(cartId);
    res.status(200).json({ status: "success", products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Agregar producto a un carrito
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ status: "error", message: "Debe ingresar un número válido" });
    }

    const updatedCart = await cartManager.addProductInCart(cartId, productId, quantity);
    res.status(200).json({ status: "success", updatedCart });
  } catch (error) {
    console.error("Error al agregar el producto al carrito:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;