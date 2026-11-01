import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { userRepository } from "../repositories/userRepository.js";
import { skillRepository } from "../repositories/skillRepository.js";
import { Validator } from "../utils/validation.js";
import { conflict, unauthorized } from "../utils/httpError.js";
import { userPrivate } from "../utils/serializers.js";

const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Hash de relleno para que el tiempo de respuesta no revele si el correo existe.
const DUMMY_HASH = bcrypt.hashSync("relleno-no-valido", 10);

async function openSession(user) {
  const token = crypto.randomBytes(32).toString("hex");
  await userRepository.createSession({
    tokenHash: hashToken(token),
    user: user._id,
    expiresAt: new Date(Date.now() + env.sessionHours * 3600 * 1000),
  });
  return token;
}

export const authService = {
  async register(body) {
    const v = new Validator();
    const name = v.string(body, "name", { label: "El nombre", min: 2, max: 80 });
    const email = v.string(body, "email", { label: "El correo", max: 120 })?.toLowerCase();
    if (email && !EMAIL_RE.test(email)) v.add("email", "El correo no tiene un formato válido.");
    const password = body?.password;
    if (typeof password !== "string" || password.length < 8) v.add("password", "La contraseña debe tener al menos 8 caracteres.");
    else if (password.length > 72) v.add("password", "La contraseña no puede superar los 72 caracteres.");
    else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) v.add("password", "La contraseña debe incluir letras y números.");
    const career = v.string(body, "career", { label: "La carrera", max: 80, required: false });
    v.done();

    if (await userRepository.findByEmailWithHash(email)) {
      throw conflict("EMAIL_TAKEN", "Ya existe una cuenta con ese correo.");
    }
    const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
    const created = await userRepository.create({ name, email, passwordHash, career: career ?? "" });
    const user = await userRepository.findById(created._id);
    const token = await openSession(user);
    return { user: userPrivate(user), token };
  },

  async login(body) {
    const v = new Validator();
    const email = v.string(body, "email", { label: "El correo", max: 120 })?.toLowerCase();
    if (typeof body?.password !== "string" || !body.password) v.add("password", "La contraseña es obligatoria.");
    v.done();

    const found = await userRepository.findByEmailWithHash(email);
    const ok = await bcrypt.compare(body.password, found?.passwordHash ?? DUMMY_HASH);
    if (!found || !ok) throw unauthorized("Correo o contraseña incorrectos.");
    const user = await userRepository.findById(found._id);
    const token = await openSession(user);
    return { user: userPrivate(user), token };
  },

  logout: (token) => userRepository.deleteSession(hashToken(token)),

  /** Devuelve { user } si el token corresponde a una sesión vigente. */
  async authenticate(token) {
    const session = await userRepository.findSession(hashToken(token));
    if (!session) return null;
    const user = await userRepository.findById(session.user);
    return user ? { user } : null;
  },

  skillsFor: (names) => skillRepository.findOrCreateMany(names),
};
