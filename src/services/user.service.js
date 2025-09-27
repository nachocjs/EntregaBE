import jwt from "jsonwebtoken";
import userDAO from "../daos/user.dao.js";
import { sendPasswordResetEmail } from "./emailService.js";

class UserService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || "miclavesecreta123";
  }

  async registerUser(userData) {
    const existingUser = await userDAO.findByEmail(userData.email);
    if (existingUser) throw new Error("El email ya está registrado");

    userData.role = "user"; // siempre forzamos a user

    const user = await userDAO.createUser(userData);
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
    try {
      const user = await userDAO.findByEmail(email);
      if (!user) {
        console.warn(`Intento de recuperación de contraseña: email no encontrado (${email})`);
        return;
      }

      const token = this.generateResetToken(email);
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      await sendPasswordResetEmail(email, resetLink);
      console.log(`Correo de recuperación enviado a ${email}`);
    } catch (err) {
      console.error("Error enviando correo:", err.message);
      throw new Error("No se pudo enviar el correo. Intenta nuevamente.");
    }
  }

  async updatePassword(email, newPassword) {
    const user = await userDAO.getRawUserByEmail(email);
    if (!user) throw new Error("Usuario no encontrado");

    user.password = newPassword; // el pre-save se encargará del hash
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

  async getAllUsers() {
    return await userDAO.getAllUsers();
  }

  // --------------------
  // ADMIN: actualizar rol de usuario
  // --------------------
  async updateUserRole(userId, newRole) {
    const user = await userDAO.getRawUserById(userId);
    if (!user) throw new Error("Usuario no encontrado");

    user.role = newRole;
    await user.save();

    return await userDAO.findByIdWithCart(userId); // retorna DTO actualizado
  }
}

export default new UserService();