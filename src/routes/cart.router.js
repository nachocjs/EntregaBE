import { Router } from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/Product.model.js";
import passport from "../config/passport.js";

const router = Router();

// Middleware para validar ObjectId de MongoDB
function validateObjectId(req, res, next) {
  const ids = Object.values(req.params);
  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "error", message: "ID inválido" });
    }
  }
  next();
}

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
router.get("/:cid", validateObjectId, async (req, res) => {
  const cartId = req.params.cid;

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

// Agregar producto a un carrito por ID
router.post("/:cid/products/:pid", validateObjectId, async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = parseInt(req.body.quantity);

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
router.delete("/:cid/products/:pid", validateObjectId, async (req, res) => {
  const { cid, pid } = req.params;

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
router.delete("/:cid", validateObjectId, async (req, res) => {
  const { cid } = req.params;

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


// Obtener carrito del usuario autenticado
router.get(
  "/my-cart",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = req.user;

      if (!user || !user.cart) {
        return res.status(404).json({ status: "error", message: "Carrito no asignado al usuario" });
      }

      const cart = await Cart.findById(user.cart).populate("products.product");
      if (!cart) {
        return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
      }

      res.status(200).json({ status: "success", cart });
    } catch (error) {
      console.error("Error al obtener carrito del usuario:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// Agregar producto al carrito del usuario autenticado
router.post(
  "/my-cart/add/:pid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const productId = req.params.pid;
      const quantity = parseInt(req.body.quantity) || 1;

      if (!user || !user.cart) {
        return res.status(400).json({ status: "error", message: "Carrito no asignado al usuario" });
      }

      const cart = await Cart.findById(user.cart);
      if (!cart) {
        return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
      }

      const productExists = await Product.findById(productId);
      if (!productExists) {
        return res.status(404).json({ status: "error", message: "Producto no encontrado" });
      }

      const index = cart.products.findIndex(p => p.product.toString() === productId);

      if (index !== -1) {
        cart.products[index].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

      await cart.save();
      res.status(200).json({ status: "success", updatedCart: cart });
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

export default router;