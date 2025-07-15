import { Router } from "express";
import Product from "../models/Product.model.js";
import Cart from "../models/cart.model.js";

const router = Router();

// Vista principal con filtros, ordenamiento y paginación
router.get("/", async (req, res) => {
  try {
    const { limit = 4, page = 1, sort, query, cid } = req.query;

    const filter = {};

    if (query) {
      if (query === "true" || query === "false") {
        filter.status = query === "true";
      } else {
        filter.$or = [
          { category: { $regex: query, $options: "i" } },
          { title: { $regex: query, $options: "i" } },
        ];
      }
    }

    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      lean: true,
    };

    if (sort === "asc") options.sort = { price: 1 };
    else if (sort === "desc") options.sort = { price: -1 };

    const result = await Product.paginate(filter, options);

    res.render("home", {
      cartId: cid || "", // Esto lo necesitás para agregar productos al carrito
      products: result.docs,
      totalPages: result.totalPages,
      page: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      nextPage: result.nextPage,
      prevPage: result.prevPage,
      query,
      sort,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error cargando productos desde la base de datos");
  }
});

// Vista de productos en tiempo real
router.get("/realTimeProducts", async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render("realTimeProducts", { products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error cargando productos en tiempo real");
  }
});

// Vista de detalle de un producto con botón para agregar al carrito
router.get("/products/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await Product.findById(pid).lean();

    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    const cartId = req.query.cid || ""; // Cart ID opcional como query

    res.render("productDetail", { product, cartId });
  } catch (error) {
    console.error("Error al cargar el producto:", error);
    res.status(500).send("Error al cargar el producto");
  }
});

// Vista para mostrar un carrito específico
router.get("/carts/:cid", async (req, res) => {
  const cartId = req.params.cid;

  try {
    const cart = await Cart.findById(cartId).populate("products.product").lean();

    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }

    res.render("cartDetail", { cartId, products: cart.products });
  } catch (error) {
    console.error("Error al cargar el carrito:", error.message);
    res.status(500).send("Error al cargar el carrito");
  }
});

export default router;