import { Router } from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/Product.model.js";

const router = Router();

// Crear un nuevo carrito vacío
router.post("/", async (req, res) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    res.status(201).json({ status: "success", cart: newCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Obtener productos de un carrito por ID
router.get("/:cid", async (req, res) => {
  const cartId = req.params.cid;

  if (!mongoose.Types.ObjectId.isValid(cartId)) {
    return res.status(400).json({ status: "error", message: "ID de carrito inválido" });
  }

  try {
    const cart = await Cart.findById(cartId).populate("products.product");
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }
    res.status(200).json({ status: "success", products: cart.products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Agregar producto a un carrito
router.post("/:cid/products/:pid", async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = parseInt(req.body.quantity);

  if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ status: "error", message: "ID inválido" });
  }

  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ status: "error", message: "Cantidad inválida" });
  }

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(200).json({ status: "success", updatedCart: cart });
  } catch (error) {
    console.error("Error al agregar el producto al carrito:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Eliminar un producto específico del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
    return res.status(400).json({ status: "error", message: "ID inválido" });
  }

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    const initialLength = cart.products.length;
    cart.products = cart.products.filter(p => p.product.toString() !== pid);

    if (cart.products.length === initialLength) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado en el carrito" });
    }

    await cart.save();

    res.status(200).json({ status: "success", message: "Producto eliminado del carrito", updatedCart: cart });
  } catch (error) {
    console.error("Error al eliminar producto del carrito:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Vaciar completamente el carrito
router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cid)) {
    return res.status(400).json({ status: "error", message: "ID de carrito inválido" });
  }

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    cart.products = [];
    await cart.save();

    res.status(200).json({ status: "success", message: "Carrito vaciado correctamente", updatedCart: cart });
  } catch (error) {
    console.error("Error al vaciar el carrito:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;