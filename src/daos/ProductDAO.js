import Product from "../models/Product.model.js";

class ProductDAO {
  async getProducts(limit = 5, page = 1) {
    return Product.paginate({}, { limit, page });
  }

  async findById(id) {
    return Product.findById(id).lean();
  }

  async create(data) {
    const product = new Product(data);
    return product.save();
  }

  async update(id, updateData) {
    return Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return Product.findByIdAndDelete(id);
  }
}

export default ProductDAO;