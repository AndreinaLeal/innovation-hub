import { GITHUB_API_URL } from "../config.js";

/** Error del consumo de GitHub, con un `tipo` para que la interfaz muestre el mensaje correcto. */
export class GitHubError extends Error {
  constructor(tipo, message) {
    super(message);
    this.tipo = tipo; // inexistente | privado | limite | invalida | no-disponible | config | url
  }
}

const REPO_URL = /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/;

export function parseRepoUrl(url) {
  const m = REPO_URL.exec((url ?? "").trim());
  return m ? { owner: m[1], repo: m[2] } : null;
}

/**
 * Consulta la API pública de GitHub y devuelve solo los datos que muestra la interfaz.
 * Casos: repositorio inexistente, privado, respuesta inválida, límite alcanzado y servicio caído.
 */
export async function fetchRepoInfo(repositoryUrl, signal) {
  if (!GITHUB_API_URL) throw new GitHubError("config", "Falta configurar VITE_GITHUB_API_URL.");
  const parsed = parseRepoUrl(repositoryUrl);
  if (!parsed) throw new GitHubError("url", "La dirección del repositorio no tiene un formato válido de GitHub.");

  let res;
  try {
    res = await fetch(`${GITHUB_API_URL}/repos/${parsed.owner}/${parsed.repo}`, {
      signal,
      headers: { Accept: "application/vnd.github+json" },
    });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new GitHubError("no-disponible", "No se pudo contactar a GitHub. Revisa tu conexión o inténtalo más tarde.");
  }

  const sinCupo = res.headers.get("x-ratelimit-remaining") === "0";
  if (res.status === 429 || (res.status === 403 && sinCupo)) {
    throw new GitHubError("limite", "Se alcanzó el límite de solicitudes de GitHub. Intenta de nuevo en unos minutos.");
  }
  if (res.status === 401 || res.status === 403) {
    throw new GitHubError("privado", "El repositorio es privado o no tienes acceso a él.");
  }
  if (res.status === 404) {
    // GitHub responde 404 tanto a repositorios inexistentes como a privados sin autenticación.
    throw new GitHubError("inexistente", "No se encontró el repositorio. Puede que no exista o que sea privado.");
  }
  if (res.status >= 500) throw new GitHubError("no-disponible", "GitHub no está disponible en este momento.");
  if (!res.ok) throw new GitHubError("no-disponible", `GitHub respondió con un error (${res.status}).`);

  let d;
  try { d = await res.json(); } catch { throw new GitHubError("invalida", "GitHub devolvió una respuesta que no se pudo interpretar."); }
  if (!d || typeof d.name !== "string" || typeof d.owner?.login !== "string") {
    throw new GitHubError("invalida", "GitHub devolvió una respuesta con un formato inesperado.");
  }
  return {
    name: d.name,
    owner: d.owner.login,
    description: d.description ?? "",
    language: d.language ?? "",
    defaultBranch: d.default_branch ?? "",
    updatedAt: d.pushed_at ?? d.updated_at ?? "",
    openIssues: Number.isFinite(d.open_issues_count) ? d.open_issues_count : 0,
    url: d.html_url ?? repositoryUrl,
  };
}
