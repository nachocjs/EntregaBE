class CartRepository {
  constructor(cartDAO) {
    this.cartDAO = cartDAO;
  }

  async createCart() {
    return this.cartDAO.createEmptyCart();
  }

  async getCartById(id, populate = false) {
    return populate
      ? this.cartDAO.findByIdWithProducts(id)
      : this.cartDAO.findById(id);
  }

  async saveCart(cart) {
    return this.cartDAO.save(cart);
  }

  async deleteProduct(cart, productId) {
    return this.cartDAO.deleteProductFromCart(cart, productId);
  }

  async clearCart(cart) {
    return this.cartDAO.clearCart(cart);
  }
}

export default CartRepository;