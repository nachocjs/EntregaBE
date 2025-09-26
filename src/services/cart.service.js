import CartDAO from "../daos/CartDAO.js";
import CartRepository from "../repositories/CartRepository.js";
import Product from "../models/Product.model.js";

class CartService {
  constructor() {
    this.cartRepository = new CartRepository(new CartDAO());
  }

  async createCart() {
    return this.cartRepository.createCart();
  }

  async getCartById(cartId, withProducts = false) {
    return this.cartRepository.getCartById(cartId, withProducts);
  }

  async addProductToCart(cartId, productId, quantity) {
    const cart = await this.getCartById(cartId);
    if (!cart) return null;

    const productExists = await Product.findById(productId);
    if (!productExists) return "PRODUCT_NOT_FOUND";

    const index = cart.products.findIndex(p => p.product.toString() === productId);
    if (index !== -1) {
      cart.products[index].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await this.cartRepository.saveCart(cart);
    return cart;
  }

  async deleteProduct(cartId, productId) {
    const cart = await this.getCartById(cartId);
    if (!cart) return null;

    const originalLength = cart.products.length;
    const updatedCart = await this.cartRepository.deleteProduct(cart, productId);

    if (updatedCart.products.length === originalLength) return "PRODUCT_NOT_IN_CART";
    return updatedCart;
  }

  async clearCart(cartId) {
    const cart = await this.getCartById(cartId);
    if (!cart) return null;
    return this.cartRepository.clearCart(cart);
  }

  async addToUserCart(user, productId, quantity) {
    if (!user?.cart) return "NO_USER_CART";

    const cart = await this.getCartById(user.cart);
    if (!cart) return "CART_NOT_FOUND";

    const productExists = await Product.findById(productId);
    if (!productExists) return "PRODUCT_NOT_FOUND";

    const index = cart.products.findIndex(p => p.product.toString() === productId);
    if (index !== -1) {
      cart.products[index].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    return this.cartRepository.saveCart(cart);
  }
}

export default CartService;