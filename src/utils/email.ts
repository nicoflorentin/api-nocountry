import nodemailer from "nodemailer";
import { User } from "../models/user";

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    // Define el contenido del correo
    const mailOptions = {
      from: `"Mi App 👋" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    // Envía el email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

export async function sendEmailCreateUser(name: string, email: string, password: string) {
  const subject = "Bienvenido a Mi App";
  const html = `
    <p>¡Hola ${name}! Bienvenido a Mi App.</p>
    <p>Estamos encantados de tenerte aquí.</p>
    <p>Tu correo electrónico es: ${email}</p>
    <p>Tu contraseña de acceso es: ${password}</p>
  `;
  await sendEmail(email, subject, html);
}
