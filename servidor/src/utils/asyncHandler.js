// Envuelve una ruta async: si falla, el error pasa al manejador de errores
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);