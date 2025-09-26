class ProductRepository {
  constructor(productDAO) {
    this.productDAO = productDAO;
  }

  getProducts(limit, page) {
    return this.productDAO.getProducts(limit, page);
  }

  findById(id) {
    return this.productDAO.findById(id);
  }

  create(data) {
    return this.productDAO.create(data);
  }

  update(id, updateData) {
    return this.productDAO.update(id, updateData);
  }

  delete(id) {
    return this.productDAO.delete(id);
  }
}

export default ProductRepository;