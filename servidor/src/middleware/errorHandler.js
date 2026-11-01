import { HttpError, notFound } from "../utils/httpError.js";

export function routeNotFound(_req, _res, next) {
  next(notFound("La ruta solicitada no existe."));
}

// Formato de error uniforme: { error: { code, message, details? } }
export function errorHandler(err, _req, res, _next) {
  let status = 500;
  let body = { code: "INTERNAL_ERROR", message: "Ocurrió un error inesperado. Intenta de nuevo más tarde." };

  if (err instanceof HttpError) {
    status = err.status;
    body = { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) };
  } else if (err?.type === "entity.parse.failed") {
    status = 400;
    body = { code: "INVALID_JSON", message: "El cuerpo de la petición no es un JSON válido." };
  } else if (err?.type === "entity.too.large") {
    status = 400;
    body = { code: "PAYLOAD_TOO_LARGE", message: "El cuerpo de la petición es demasiado grande." };
  } else if (err?.code === 11000) {
    status = 409;
    body = { code: "DUPLICATE", message: "Ya existe un registro con esos datos." };
  } else {
    // Solo en el servidor: nunca se envía la traza ni el error de la base de datos al cliente.
    console.error(err);
  }
  res.status(status).json({ error: body });
}
