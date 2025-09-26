import ProductRepository from "../repositories/ProductRepository.js";
import ProductDAO from "../daos/ProductDAO.js";

class ProductService {
  constructor() {
    this.productRepository = new ProductRepository(new ProductDAO());
  }

  async getProducts(limit, page) {
    return this.productRepository.getProducts(limit, page);
  }

  async getProductById(id) {
    return this.productRepository.findById(id);
  }

  async createProduct(data) {
    // Podés agregar validaciones aquí
    return this.productRepository.create(data);
  }

  async updateProduct(id, updateData) {
    return this.productRepository.update(id, updateData);
  }

  async deleteProduct(id) {
    return this.productRepository.delete(id);
  }
}

export default ProductService;