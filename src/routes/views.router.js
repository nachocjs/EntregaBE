import { Router } from "express";
import Product from "../models/Product.model.js";
import Cart from "../models/cart.model.js";
import { ensureAuthenticated, ensureAdmin } from "../middlewares/auth.js";

const router = Router();

// Home - abierta para todos, user opcional
router.get("/", async (req, res) => {
  try {
    const { limit = 4, page = 1, sort, query, cid } = req.query;

    const filter = {};
    if (query) {
      if (query === "true" || query === "false") filter.status = query === "true";
      else filter.$or = [
        { category: { $regex: query, $options: "i" } },
        { title: { $regex: query, $options: "i" } }
      ];
    }

    const options = { limit: parseInt(limit), page: parseInt(page), lean: true };
    if (sort === "asc") options.sort = { price: 1 };
    else if (sort === "desc") options.sort = { price: -1 };

    const result = await Product.paginate(filter, options);

    res.render("home", {
      cartId: cid || "",
      products: result.docs,
      totalPages: result.totalPages,
      page: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      nextPage: result.nextPage,
      prevPage: result.prevPage,
      query,
      sort,
      limit
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error cargando productos desde la base de datos");
  }
});

// Real time products (solo admin)
router.get("/realTimeProducts", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render("realTimeProducts", { products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error cargando productos en tiempo real");
  }
});

// Carrito
router.get("/carts/:cid", ensureAuthenticated, async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await Cart.findById(cartId).populate("products.product").lean();
    if (!cart) return res.status(404).send("Carrito no encontrado");

    res.render("cartDetail", { cartId, products: cart.products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar el carrito");
  }
});

// Login y registro
router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

// Datos del usuario
router.get("/current", ensureAuthenticated, (req, res) => {
  res.render("currentUser");
});

export default router;
