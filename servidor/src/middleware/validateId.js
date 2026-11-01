import { isObjectId } from "../utils/validation.js";
import { notFound } from "../utils/httpError.js";

/** Un identificador mal formado equivale a un recurso inexistente (404). */
export const validateIds = (...names) => (req, _res, next) => {
  for (const n of names) {
    if (!isObjectId(req.params[n])) return next(notFound("El recurso no existe."));
  }
  next();
};
