import { AppError, notFound } from "../errors/AppError.js";

export function routeNotFound(req, res, next) {
  next(notFound("La ruta solicitada no existe"));
}

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    const body = { error: { code: err.code, message: err.message } };
    if (err.details) body.error.details = err.details;
    return res.status(err.status).json(body);
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "El cuerpo de la petición no es un JSON válido" },
    });
  }

  // El detalle real solo se imprime en el servidor, nunca se envía al cliente
  console.error(err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Ocurrió un error inesperado" },
  });
}