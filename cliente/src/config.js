// La dirección del servidor sale de variables de entorno (ver .env.example), nunca del código.
const strip = (v) => (v ?? "").replace(/\/+$/, "");

export const API_URL = strip(import.meta.env.VITE_API_URL);
export const GITHUB_API_URL = strip(import.meta.env.VITE_GITHUB_API_URL);
