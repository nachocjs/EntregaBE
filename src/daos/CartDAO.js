import Cart from "../models/cart.model.js";

class CartDAO {
  createEmptyCart() {
    return new Cart({ products: [] }).save();
  }

  findById(id) {
    return Cart.findById(id);
  }

  findByIdWithProducts(id) {
    return Cart.findById(id).populate("products.product");
  }

  async save(cart) {
    return cart.save();
  }

  async deleteProductFromCart(cart, productId) {
    cart.products = cart.products.filter(p => p.product.toString() !== productId);
    return cart.save();
  }

  async clearCart(cart) {
    cart.products = [];
    return cart.save();
  }
}

export default CartDAO;