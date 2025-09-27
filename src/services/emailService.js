import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envía un correo de recuperación de contraseña
 * @param {string} to
 * @param {string} resetLink
 */
export const sendPasswordResetEmail = async (to, resetLink) => {
  const mailOptions = {
    from: `"Tienda App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Recuperación de contraseña",
    html: `
      <h2>Solicitud de recuperación de contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p>Este enlace expirará en 1 hora.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado a ${to}`);
  } catch (err) {
    // Solo logueamos, no lanzamos error
    console.warn(`⚠️ No se pudo confirmar entrega SMTP, pero la app continúa: ${err.message}`);
  }
};