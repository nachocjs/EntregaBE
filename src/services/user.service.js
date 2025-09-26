import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userDAO from "../daos/user.dao.js";
import { sendPasswordResetEmail } from "./emailService.js";

class UserService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || "miclavesecreta123";
  }

  async registerUser(userData) {
    const existingUser = await userDAO.findByEmail(userData.email);
    if (existingUser) throw new Error("El email ya está registrado");

    const allowedRoles = ["user", "admin"];
    userData.role = allowedRoles.includes(userData.role) ? userData.role : "user";

    const user = await userDAO.createUser(userData); // Devuelve DTO
    return user;
  }

  generateToken(user) {
    const id = user._id || user.id;
    return jwt.sign({ id, email: user.email, role: user.role }, this.JWT_SECRET, {
      expiresIn: "1h",
    });
  }

  generateResetToken(email) {
    return jwt.sign({ email }, this.JWT_SECRET, { expiresIn: "1h" });
  }

  async sendResetEmail(email) {
    const user = await userDAO.findByEmail(email);
    if (!user) throw new Error("No se encontró un usuario con ese email");

    const token = this.generateResetToken(email);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetLink);
  }

  async updatePassword(email, newPassword) {
    const user = await userDAO.getRawUserByEmail(email);
    if (!user) throw new Error("Usuario no encontrado");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
  }

  async loginUser(user) {
    const token = this.generateToken(user);
    const userWithCart = await userDAO.findByIdWithCart(user._id);
    return { token, user: userWithCart };
  }

  async getCurrentUser(id) {
    const user = await userDAO.findByIdWithCart(id);
    return user || null;
  }

  async findByEmail(email) {
    return await userDAO.findByEmail(email);
  }
}

export default new UserService();