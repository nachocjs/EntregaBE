import { Router } from "express";
import ProductManager from "../ProductManager.js";
import path from "path";

const router = Router();
const productManager = new ProductManager(path.resolve("src/products.json"));

router.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("home", { products });
  } catch (error) {
    res.status(500).send("Error cargando productos");
  }
});

router.get("/home", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("home", { products });
  } catch (error) {
    res.status(500).send("Error cargando productos");
  }
});

router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("realTimeProducts", { products });
  } catch (error) {
    res.status(500).send("Error cargando productos");
  }
});

export default router;