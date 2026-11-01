import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { userRepository } from "../repositories/userRepository.js";
import { sessionRepository } from "../repositories/sessionRepository.js";
import { badRequest, conflict, unauthorized } from "../errors/AppError.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// En la base de datos solo se guarda el hash del token, no el token
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

function validateRegister({ name, email, password }) {
  const details = [];
  if (typeof name !== "string" || !name.trim()) {
    details.push({ field: "name", message: "El nombre es obligatorio" });
  }
  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    details.push({ field: "email", message: "El correo no tiene un formato válido" });
  }
  if (typeof password !== "string" || password.length < 8) {
    details.push({ field: "password", message: "La contraseña debe tener al menos 8 caracteres" });
  }
  if (details.length) throw badRequest("Datos de registro inválidos", details);
}

export const authService = {
  async register(body = {}) {
    validateRegister(body);

    const existing = await userRepository.findByEmail(body.email);
    if (existing) throw conflict("Ya existe una cuenta con ese correo");

    const passwordHash = await bcrypt.hash(body.password, 10);
    return userRepository.create({
      name: body.name,
      email: body.email,
      passwordHash,
      career: body.career,
    });
  },

  async login(body = {}) {
    const { email, password } = body;
    const details = [];
    if (typeof email !== "string" || !email.trim()) {
      details.push({ field: "email", message: "El correo es obligatorio" });
    }
    if (typeof password !== "string" || !password) {
      details.push({ field: "password", message: "La contraseña es obligatoria" });
    }
    if (details.length) throw badRequest("Datos de inicio de sesión inválidos", details);

    const user = await userRepository.findByEmail(email);
    const passwordOk = user && (await bcrypt.compare(password, user.passwordHash));
    if (!passwordOk) throw unauthorized("Correo o contraseña incorrectos");

    const token = crypto.randomBytes(32).toString("hex");
    await sessionRepository.create(hashToken(token), user._id);
    return { token, user };
  },

  async logout(token) {
    await sessionRepository.deleteByTokenHash(hashToken(token));
  },

  async getUserByToken(token) {
    const session = await sessionRepository.findByTokenHash(hashToken(token));
    if (!session) return null;
    return userRepository.findById(session.userId);
  },
};