import User from "../models/User.model.js";
import Cart from "../models/cart.model.js";
import { UserDTO } from "../dtos/userDTO.js";

class UserDAO {
  async findByEmail(email) {
    const user = await User.findOne({ email }).populate("cart").lean();
    return user ? new UserDTO(user) : null;
  }

  async getRawUserByEmail(email) {
    return await User.findOne({ email });
  }

  async getRawUserById(id) {
    return await User.findById(id); // ✅ Método agregado para updateUserRole
  }

  async createUser(data) {
    const cart = new Cart({ products: [] });
    await cart.save();

    const user = new User({
      ...data,
      cart: cart._id,
    });
    await user.save();

    return new UserDTO(await user.populate("cart").execPopulate());
  }

  async findByIdWithCart(id) {
    const user = await User.findById(id).populate("cart").lean();
    return user ? new UserDTO(user) : null;
  }

  async findById(id) {
    const user = await User.findById(id).populate("cart").lean();
    return user ? new UserDTO(user) : null;
  }

  async getAllUsers() {
    const users = await User.find().populate("cart").lean();
    return users.map(user => new UserDTO(user));
  }
}

export default new UserDAO();