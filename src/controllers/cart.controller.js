import CartService from "../services/cart.service.js";

const cartService = new CartService();

const CartController = {
  createCart: async (req, res) => {
    try {
      const newCart = await cartService.createCart();
      res.status(201).json({ status: "success", cart: newCart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  getCart: async (req, res) => {
    try {
      const cart = await cartService.getCartById(req.params.cid, true);
      if (!cart) {
        return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
      }
      res.status(200).json({ status: "success", products: cart.products });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  addProduct: async (req, res) => {
    const { cid, pid } = req.params;
    const quantity = parseInt(req.body.quantity);

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ status: "error", message: "Cantidad inválida" });
    }

    try {
      const result = await cartService.addProductToCart(cid, pid, quantity);

      if (!result) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
      if (result === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({ status: "error", message: "Producto no encontrado" });
      }

      res.status(200).json({ status: "success", updatedCart: result });
    } catch (error) {
      console.error("Error al agregar producto:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  deleteProduct: async (req, res) => {
    const { cid, pid } = req.params;

    try {
      const result = await cartService.deleteProduct(cid, pid);

      if (!result) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
      if (result === "PRODUCT_NOT_IN_CART") {
        return res.status(404).json({ status: "error", message: "Producto no encontrado en el carrito" });
      }

      res.status(200).json({ status: "success", message: "Producto eliminado", updatedCart: result });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  clearCart: async (req, res) => {
    const { cid } = req.params;

    try {
      const result = await cartService.clearCart(cid);
      if (!result) {
        return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
      }

      res.status(200).json({ status: "success", message: "Carrito vaciado", updatedCart: result });
    } catch (error) {
      console.error("Error al vaciar carrito:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Rutas protegidas con ensureAuthenticated
  getMyCart: async (req, res) => {
    try {
      const user = req.user;
      if (!user?.cart) {
        return res.status(404).json({ status: "error", message: "Carrito no asignado al usuario" });
      }

      const cart = await cartService.getCartById(user.cart, true);
      if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

      res.status(200).json({ status: "success", cart });
    } catch (error) {
      console.error("Error al obtener carrito del usuario:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  addToMyCart: async (req, res) => {
    try {
      const user = req.user;
      if (!user?.cart) {
        return res.status(400).json({ status: "error", message: "Carrito no asignado al usuario" });
      }

      const productId = req.params.pid;
      const quantity = parseInt(req.body.quantity) || 1;

      const result = await cartService.addToUserCart(user, productId, quantity);

      if (result === "CART_NOT_FOUND") {
        return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
      }
      if (result === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({ status: "error", message: "Producto no encontrado" });
      }

      res.status(200).json({ status: "success", updatedCart: result });
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  },
};

export default CartController;