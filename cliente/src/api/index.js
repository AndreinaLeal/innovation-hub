import { request } from "./http.js";

// Un módulo por dominio. Cada función recibe `signal` opcional para poder cancelar en useEffect.

export const authApi = {
  register: (body) => request("/auth/register", { method: "POST", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: (signal) => request("/auth/me", { signal }),
};

export const usersApi = {
  search: (params, signal) => request("/users", { params, signal }),
  updateMe: (body) => request("/users/me", { method: "PUT", body }),
};

export const skillsApi = {
  list: (q, signal) => request("/skills", { params: { q }, signal }),
};

export const initiativesApi = {
  list: (params, signal) => request("/initiatives", { params, signal }),
  get: (id, signal) => request(`/initiatives/${encodeURIComponent(id)}`, { signal }),
  create: (body) => request("/initiatives", { method: "POST", body }),
  update: (id, body) => request(`/initiatives/${encodeURIComponent(id)}`, { method: "PUT", body }),
  remove: (id) => request(`/initiatives/${encodeURIComponent(id)}`, { method: "DELETE" }),
  removeMember: (id, userId) =>
    request(`/initiatives/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}`, { method: "DELETE" }),
};

export const requestsApi = {
  create: (initiativeId, body) =>
    request(`/initiatives/${encodeURIComponent(initiativeId)}/requests`, { method: "POST", body }),
  mine: (params, signal) => request("/requests/mine", { params, signal }),
  received: (params, signal) => request("/requests/received", { params, signal }),
  get: (id, signal) => request(`/requests/${encodeURIComponent(id)}`, { signal }),
  update: (id, body) => request(`/requests/${encodeURIComponent(id)}`, { method: "PUT", body }),
  cancel: (id) => request(`/requests/${encodeURIComponent(id)}/cancel`, { method: "POST" }),
  accept: (id) => request(`/requests/${encodeURIComponent(id)}/accept`, { method: "POST" }),
  reject: (id) => request(`/requests/${encodeURIComponent(id)}/reject`, { method: "POST" }),
};

export const projectsApi = {
  list: (params, signal) => request("/projects", { params, signal }),
  get: (id, signal) => request(`/projects/${encodeURIComponent(id)}`, { signal }),
  create: (body) => request("/projects", { method: "POST", body }),
};
