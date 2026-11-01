/** Error controlado de la aplicación: lleva código HTTP, código de máquina y mensaje. */
export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, details) => new HttpError(400, "VALIDATION_ERROR", message, details);
export const unauthorized = (message = "Debes iniciar sesión.") => new HttpError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "No tienes permiso para realizar esta acción.") => new HttpError(403, "FORBIDDEN", message);
export const notFound = (message = "El recurso no existe.") => new HttpError(404, "NOT_FOUND", message);
export const conflict = (code, message) => new HttpError(409, code, message);
