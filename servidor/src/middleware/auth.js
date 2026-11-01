import { authService } from "../services/authService.js";
import { unauthorized } from "../utils/httpError.js";

function readToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

/** Si hay token válido, deja req.user; si no hay token, continúa como anónimo. */
export async function optionalAuth(req, _res, next) {
  try {
    const token = readToken(req);
    if (token) {
      const auth = await authService.authenticate(token);
      if (!auth) throw unauthorized("La sesión no es válida o expiró.");
      req.user = auth.user;
      req.token = token;
    }
    next();
  } catch (e) { next(e); }
}

/** Exige sesión válida. */
export async function requireAuth(req, _res, next) {
  try {
    const token = readToken(req);
    const auth = token ? await authService.authenticate(token) : null;
    if (!auth) throw unauthorized("Debes iniciar sesión para realizar esta acción.");
    req.user = auth.user;
    req.token = token;
    next();
  } catch (e) { next(e); }
}
