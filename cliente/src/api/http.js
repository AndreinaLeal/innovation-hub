import { API_URL } from "../config.js";

const TOKEN_KEY = "innovation-hub.token";

export const tokenStore = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* almacenamiento no disponible */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* idem */ } },
};

/** Error de la API con el formato uniforme del contrato { error: { code, message, details } }. */
export class ApiError extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

/** Convierte los details[] del servidor en { campo: mensaje } para los formularios. */
export const fieldErrors = (err) =>
  Object.fromEntries((err?.details ?? []).map((d) => [d.field, d.message]));

export async function request(path, { method = "GET", body, params, signal } = {}) {
  if (!API_URL) {
    throw new ApiError(0, "CONFIG", "Falta configurar VITE_API_URL (ver cliente/.env.example).");
  }
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") query.set(k, v);
  });
  const qs = query.toString();
  const url = `${API_URL}${path}${qs ? `?${qs}` : ""}`;

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, { method, headers, signal, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new ApiError(0, "NETWORK", "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
  }

  if (response.status === 204) return null;

  let payload = null;
  try { payload = await response.json(); } catch { /* cuerpo vacío o no JSON */ }

  if (!response.ok) {
    const e = payload?.error;
    if (response.status === 401 && token) onUnauthorized();
    throw new ApiError(
      response.status,
      e?.code ?? "HTTP_ERROR",
      e?.message ?? `El servidor respondió con un error (${response.status}).`,
      e?.details ?? []
    );
  }
  if (payload === null) throw new ApiError(response.status, "INVALID_RESPONSE", "La respuesta del servidor no es válida.");
  return payload;
}
