import { authService } from "../services/authService.js";
import { unauthorized } from "../errors/AppError.js";

function readToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

// Para rutas públicas que cambian según quién pregunta (ej. visibilidad)
export async function optionalAuth(req, res, next) {
  try {
    const token = readToken(req);
    if (token) {
      const user = await authService.getUserByToken(token);
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

// Para rutas que exigen sesión
export async function requireAuth(req, res, next) {
  try {
    const token = readToken(req);
    const user = token ? await authService.getUserByToken(token) : null;
    if (!user) throw unauthorized("Debes iniciar sesión");
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}