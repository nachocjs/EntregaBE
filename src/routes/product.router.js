import { Router } from "express";
import ProductManager from "../ProductManager.js";

const router = Router();
const productManager = new ProductManager("./src/products.json");

// Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.status(200).json({ status: "success", products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Obtener un producto por ID
router.get("/:pid", async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = await productManager.getProductById(productId);
    res.status(200).json({ status: "success", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Crear un nuevo producto
router.post("/", async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: "Todos los campos son obligatorios excepto thumbnails" });
    }

    const newProduct = await productManager.addProduct({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
    });

    res.status(201).json({ status: "success", newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Actualizar un producto
router.put("/:pid", async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const updatedData = req.body;

    const updatedProduct = await productManager.updateProductById(productId, updatedData);
    res.status(200).json({ status: "success", updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Eliminar un producto
router.delete("/:pid", async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const result = await productManager.deleteProductById(productId);
    res.status(200).json({ status: "success", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;