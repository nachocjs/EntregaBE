import fs from "fs";

class CartManager {
  constructor(pathFile) {
    this.pathFile = pathFile;
  }

  generateNewId(carts) {
    if (carts.length > 0) {
      return carts[carts.length - 1].id + 1;
    } else {
      return 1;
    }
  }

  async getCartById(cartId) {
    try {
      if (!cartId || isNaN(cartId)) {
        throw new Error(`Carrito con id: ${cartId} no válido`);
      }

      const fileData = await fs.promises.readFile(this.pathFile, 'utf-8');
      const data = JSON.parse(fileData);
      const findCart = data.find(cart => cart.id === parseInt(cartId));

      if (!findCart) {
        throw new Error(`Carrito con id: ${cartId} no encontrado`);
      }

      return findCart;

    } catch (error) {
      throw new Error(`Error al buscar el carrito: ${error.message}`);
    }
  }

  async newCart() {
    try {
      let carts = [];
      if (fs.existsSync(this.pathFile)) {
        const fileData = await fs.promises.readFile(this.pathFile, "utf-8");
        carts = JSON.parse(fileData);
      }

      const newId = this.generateNewId(carts);
      const cart = { id: newId, products: [] };
      carts.push(cart);

      await fs.promises.writeFile(this.pathFile, JSON.stringify(carts, null, 2), "utf-8");
      return cart;

    } catch (error) {
      throw new Error(`Error al crear el carrito: ${error.message}`);
    }
  }

 async addProductInCart(cid, pid, quantity) {
  try {
    console.log("Leyendo el archivo de carritos:", this.pathFile);

    const cartJson = await fs.promises.readFile(this.pathFile, 'utf-8');
    const carts = JSON.parse(cartJson);

    console.log("Carritos leídos:", carts);

    const cart = carts.find(c => c.id == cid);
    if (!cart) {
      throw new Error(`Carrito con id ${cid} no encontrado`);
    }

    console.log("Carrito encontrado:", cart);

    const productIndex = cart.products.findIndex(p => p.id == pid);
    console.log("Índice del producto en el carrito:", productIndex);

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ id: pid, quantity });
    }

    console.log("Carrito actualizado:", cart);

    await fs.promises.writeFile(this.pathFile, JSON.stringify(carts, null, 2), 'utf-8');
    console.log("Archivo de carritos actualizado");

    return cart;

  } catch (error) {
    console.error("Error en addProductInCart:", error.message);
    throw new Error(`Error al agregar el producto al carrito: ${error.message}`);
  }
}

  async getCartProductsById(cartId) {
    try {
      if (!cartId || isNaN(cartId)) {
        throw new Error(`Carrito con id: ${cartId} no válido`);
      }

      const fileData = await fs.promises.readFile(this.pathFile, 'utf-8');
      const data = JSON.parse(fileData);
      const findCart = data.find(cart => cart.id === parseInt(cartId));

      if (!findCart) {
        throw new Error(`Carrito con id: ${cartId} no encontrado`);
      }

      return findCart.products;

    } catch (error) {
      throw new Error(`Error al buscar los productos del carrito: ${error.message}`);
    }
  }
}

export default CartManager;