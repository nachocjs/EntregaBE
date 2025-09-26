import ProductService from "../services/ProductService.js";

const productService = new ProductService();

export const getAllProducts = async (req, res) => {
  try {
    const { limit = 5, page = 1 } = req.query;
    const data = await productService.getProducts(parseInt(limit), parseInt(page));

    const products = data.docs;
    delete data.docs;

    res.status(200).json({ status: "success", payload: products, ...data });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al recuperar los productos" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.pid);

    if (!product) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al obtener el producto" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ status: "success", payload: product });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al añadir un nuevo producto" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await productService.updateProduct(req.params.pid, req.body);

    if (!updatedProduct) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    res.status(200).json({ status: "success", payload: updatedProduct });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al editar un producto" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await productService.deleteProduct(req.params.pid);

    if (!deletedProduct) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    res.status(200).json({ status: "success", payload: deletedProduct });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al borrar un producto" });
  }
};