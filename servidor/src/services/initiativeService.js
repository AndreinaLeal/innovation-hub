import { initiativeRepository as repo } from "../repositories/initiativeRepository.js";
import { skillRepository } from "../repositories/skillRepository.js";
import { TYPES, CATEGORIES, VISIBILITIES, STATUSES } from "../models/Initiative.js";
import { Validator, parsePaging, pageResult, escapeRegex, isObjectId } from "../utils/validation.js";
import { notFound, forbidden, unauthorized, conflict, badRequest } from "../utils/httpError.js";
import { initiativeSummary, initiativeDetail, memberDto } from "../utils/serializers.js";

const idOf = (v) => String(v?._id ?? v);

/* ---------- Visibilidad (RN-03) ---------- */

export const isOwner = (ini, userId) => Boolean(userId) && idOf(ini.owner) === String(userId);
export const isMember = (ini, userId) => Boolean(userId) && ini.members.some((m) => idOf(m.user) === String(userId));

/**
 * Nivel de acceso del visitante a una iniciativa:
 *  "full" | "summary" (restringida, no miembro) | "login" (anónimo en no pública) | "none" (no existe para él)
 */
export function accessLevel(ini, viewerId) {
  if (ini.archived) return isOwner(ini, viewerId) ? "full" : "none";
  const member = isMember(ini, viewerId);
  switch (ini.visibility) {
    case "publica": return "full";
    case "institucional": return viewerId ? "full" : "login";
    case "restringida": return !viewerId ? "login" : member ? "full" : "summary";
    case "privada": return member ? "full" : "none"; // se oculta incluso su existencia
    default: return "none";
  }
}

/** Filtro Mongo equivalente a accessLevel != none/login para listados (nunca se filtra en el cliente). */
function visibilityClause(viewerId) {
  if (!viewerId) return { visibility: "publica" };
  return {
    $or: [
      { visibility: { $in: ["publica", "institucional", "restringida"] } },
      { visibility: "privada", "members.user": viewerId },
    ],
  };
}
/** Iniciativas cuyo contenido completo puede ver el usuario (para proyectos). */
export function fullAccessClause(viewerId) {
  return {
    $or: [
      { visibility: { $in: ["publica", "institucional"] } },
      { visibility: { $in: ["restringida", "privada"] }, "members.user": viewerId },
    ],
  };
}

/** Carga una iniciativa y aplica las reglas de visibilidad; lanza 401/404 según corresponda. */
export async function loadVisible(id, viewerId) {
  if (!isObjectId(id)) throw notFound("La iniciativa no existe.");
  const ini = await repo.findById(id);
  if (!ini) throw notFound("La iniciativa no existe.");
  const level = accessLevel(ini, viewerId);
  if (level === "none") throw notFound("La iniciativa no existe.");
  if (level === "login") throw unauthorized("Debes iniciar sesión para ver esta iniciativa.");
  return { ini, level };
}

/** Además de verla, exige ser la propietaria (RN-04). 403 si puede verla pero no es suya. */
export async function loadOwned(id, viewerId) {
  const { ini, level } = await loadVisible(id, viewerId);
  if (!isOwner(ini, viewerId)) throw forbidden("Solo el propietario de la iniciativa puede realizar esta acción.");
  return { ini, level };
}

/* ---------- Validación ---------- */

function validateBody(body, currentMembers = 1) {
  const v = new Validator();
  const data = {
    title: v.string(body, "title", { label: "El título", min: 5, max: 120 }),
    type: v.oneOf(body, "type", TYPES, { label: "El tipo" }),
    category: v.oneOf(body, "category", CATEGORIES, { label: "La categoría" }),
    summary: v.string(body, "summary", { label: "El resumen", min: 10, max: 160 }),
    description: v.string(body, "description", { label: "La descripción", min: 20, max: 4000 }),
    problem: v.string(body, "problem", { label: "El problema", max: 1500, required: false }) ?? "",
    beneficiaries: v.string(body, "beneficiaries", { label: "Los beneficiarios", max: 300, required: false }) ?? "",
    visibility: v.oneOf(body, "visibility", VISIBILITIES, { label: "La visibilidad" }),
    targetMembers: v.int(body, "targetMembers", { label: "La cantidad de participantes", min: 1, max: 20 }),
    tags: v.stringArray(body, "tags", { label: "Las etiquetas", maxItems: 10, maxLen: 40 }),
  };
  if (body?.status !== undefined) data.status = v.oneOf(body, "status", STATUSES, { label: "El estado" });
  const skills = v.stringArray(body, "skills", { label: "Las competencias", minItems: 1, maxItems: 15 });
  if (data.targetMembers !== undefined && data.targetMembers < currentMembers) {
    v.add("targetMembers", `No puede ser menor que los miembros actuales (${currentMembers}).`);
  }
  v.done();
  return { data, skills };
}

/* ---------- Servicio ---------- */

export const initiativeService = {
  async list(query, viewerId) {
    const paging = parsePaging(query, { defaultSize: 9 });
    const and = [{ archived: false }, visibilityClause(viewerId)];

    if (query.owner === "me" || query.member === "me") {
      if (!viewerId) throw unauthorized();
      if (query.owner === "me") {
        and.shift();
        and.unshift({ archived: query.archived === "true" });
        and.push({ owner: viewerId });
      }
      if (query.member === "me") and.push({ "members.user": viewerId });
    }
    if (query.type) {
      if (!TYPES.includes(query.type)) throw badRequest("Filtro inválido.", [{ field: "type", message: `Debe ser uno de: ${TYPES.join(", ")}.` }]);
      and.push({ type: query.type });
    }
    if (query.category) {
      if (!CATEGORIES.includes(query.category)) throw badRequest("Filtro inválido.", [{ field: "category", message: "Categoría desconocida." }]);
      and.push({ category: query.category });
    }
    if (query.status) {
      if (!STATUSES.includes(query.status)) throw badRequest("Filtro inválido.", [{ field: "status", message: `Debe ser uno de: ${STATUSES.join(", ")}.` }]);
      and.push({ status: query.status });
    }
    if (query.q?.trim()) {
      const rx = { $regex: escapeRegex(query.q.trim()), $options: "i" };
      and.push({ $or: [{ title: rx }, { summary: rx }, { tags: rx }] });
    }
    if (query.skill?.trim()) {
      const skillId = await skillRepository.findIdByName(query.skill);
      if (!skillId) return pageResult([], 0, paging);
      and.push({ skills: skillId });
      // Las competencias de una iniciativa restringida solo las ve su equipo.
      and.push(viewerId
        ? { $or: [{ visibility: { $ne: "restringida" } }, { "members.user": viewerId }] }
        : { visibility: { $ne: "restringida" } });
    }
    if (query.sort && !["newest", "oldest", "title"].includes(query.sort)) {
      throw badRequest("Orden inválido.", [{ field: "sort", message: "Debe ser newest, oldest o title." }]);
    }

    const { items, total } = await repo.list({ $and: and }, { ...paging, sort: query.sort });
    const data = items.map((ini) => initiativeSummary(ini, { restricted: accessLevel(ini, viewerId) === "summary" }));
    return pageResult(data, total, paging);
  },

  async get(id, viewerId) {
    const { ini, level } = await loadVisible(id, viewerId);
    return initiativeDetail(ini, { level, viewerId });
  },

  async create(body, user) {
    const { data, skills } = validateBody(body);
    const skillIds = await skillRepository.findOrCreateMany(skills);
    const ini = await repo.create({
      ...data,
      status: data.status ?? "buscando-equipo",
      skills: skillIds,
      owner: user._id,
      members: [{ user: user._id, role: "propietario" }],
    });
    return initiativeDetail(ini, { level: "full", viewerId: user._id });
  },

  async update(id, body, user) {
    const { ini } = await loadOwned(id, user._id);
    if (ini.archived) throw conflict("INITIATIVE_ARCHIVED", "Una iniciativa archivada no se puede modificar.");
    const { data, skills } = validateBody(body, ini.members.length);
    const skillIds = await skillRepository.findOrCreateMany(skills);
    const updated = await repo.update(ini._id, { ...data, skills: skillIds });
    return initiativeDetail(updated, { level: "full", viewerId: user._id });
  },

  /** RN-10: se archiva si tiene información relacionada; si no, se elimina. */
  async remove(id, user) {
    const { ini } = await loadOwned(id, user._id);
    if (await repo.hasRelatedInfo(ini)) {
      await repo.archive(ini._id);
    } else {
      await repo.remove(ini._id);
    }
  },

  async listMembers(id, viewerId) {
    const { ini, level } = await loadVisible(id, viewerId);
    if (level !== "full") throw forbidden("El equipo de esta iniciativa solo es visible para sus miembros.");
    return { data: ini.members.map(memberDto) };
  },

  async removeMember(id, memberId, user) {
    const { ini } = await loadOwned(id, user._id);
    if (!isObjectId(memberId) || !isMember(ini, memberId)) throw notFound("Esa persona no pertenece al equipo.");
    if (String(memberId) === String(ini.owner._id ?? ini.owner)) {
      throw conflict("OWNER_CANNOT_LEAVE", "El propietario no puede retirarse del equipo.");
    }
    await repo.removeMember(ini._id, memberId);
  },
};
