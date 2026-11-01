import { requestRepository as repo } from "../repositories/requestRepository.js";
import { initiativeRepository } from "../repositories/initiativeRepository.js";
import { REQUEST_STATUSES } from "../models/Request.js";
import { loadVisible, loadOwned, isOwner, isMember } from "./initiativeService.js";
import { Validator, parsePaging, pageResult, isObjectId } from "../utils/validation.js";
import { notFound, forbidden, conflict, badRequest } from "../utils/httpError.js";
import { requestDto } from "../utils/serializers.js";

const idOf = (v) => String(v?._id ?? v);

function validateBody(body) {
  const v = new Validator();
  const data = {
    message: v.string(body, "message", { label: "El mensaje", min: 20, max: 600 }),
    mainSkill: v.string(body, "mainSkill", { label: "La competencia principal", max: 60 }),
    desiredRole: v.string(body, "desiredRole", { label: "El rol deseado", max: 80 }),
    availability: v.oneOf(body, "availability", ["alta", "media", "baja"], { label: "La disponibilidad" }),
  };
  v.done();
  return data;
}

function statusFilter(query) {
  if (!query.status) return {};
  if (!REQUEST_STATUSES.includes(query.status)) {
    throw badRequest("Filtro inválido.", [{ field: "status", message: `Debe ser uno de: ${REQUEST_STATUSES.join(", ")}.` }]);
  }
  return { status: query.status };
}

/** Carga una solicitud visible para el usuario: solo el solicitante y el propietario de la iniciativa. */
async function loadRequest(id, user) {
  if (!isObjectId(id)) throw notFound("La solicitud no existe.");
  const req = await repo.findById(id);
  if (!req) throw notFound("La solicitud no existe.");
  const applicant = idOf(req.applicant) === String(user._id);
  const owner = idOf(req.initiative?.owner) === String(user._id);
  if (!applicant && !owner) throw notFound("La solicitud no existe.");
  return { req, applicant, owner };
}

const mustBePending = (req) => {
  if (req.status !== "pendiente") throw conflict("REQUEST_NOT_PENDING", `La solicitud ya está ${req.status}.`);
};

export const requestService = {
  async create(initiativeId, body, user) {
    const { ini } = await loadVisible(initiativeId, user._id);
    const data = validateBody(body);
    if (ini.archived || ini.status === "completada") throw conflict("INITIATIVE_CLOSED", "Esta iniciativa ya no recibe solicitudes.");
    if (isOwner(ini, user._id)) throw conflict("OWN_INITIATIVE", "No puedes solicitar participar en tu propia iniciativa.");
    if (isMember(ini, user._id)) throw conflict("ALREADY_MEMBER", "Ya formas parte del equipo de esta iniciativa.");
    if (await repo.findPending(ini._id, user._id)) {
      throw conflict("DUPLICATE_REQUEST", "Ya tienes una solicitud pendiente para esta iniciativa.");
    }
    const created = await repo.create({ ...data, initiative: ini._id, applicant: user._id });
    return requestDto(created);
  },

  async update(id, body, user) {
    const { req, applicant } = await loadRequest(id, user);
    if (!applicant) throw forbidden("Solo quien envió la solicitud puede modificarla.");
    mustBePending(req);
    const updated = await repo.update(req._id, validateBody(body));
    return requestDto(updated);
  },

  async cancel(id, user) {
    const { req, applicant } = await loadRequest(id, user);
    if (!applicant) throw forbidden("Solo quien envió la solicitud puede cancelarla.");
    mustBePending(req);
    if (!(await repo.transition(req._id, "cancelada"))) throw conflict("REQUEST_NOT_PENDING", "La solicitud ya fue resuelta.");
    return requestDto(await repo.findById(req._id));
  },

  /** RN-07: solo el propietario resuelve; RN-08: al aceptar, el solicitante entra al equipo. */
  async resolve(id, decision, user) {
    const { req, owner } = await loadRequest(id, user);
    if (!owner) throw forbidden("Solo el propietario de la iniciativa puede resolver la solicitud.");
    mustBePending(req);
    const status = decision === "accept" ? "aceptada" : "rechazada";
    if (!(await repo.transition(req._id, status))) throw conflict("REQUEST_NOT_PENDING", "La solicitud ya fue resuelta.");
    if (status === "aceptada") await initiativeRepository.addMember(req.initiative._id, req.applicant._id);
    return requestDto(await repo.findById(req._id));
  },

  async get(id, user) {
    return requestDto((await loadRequest(id, user)).req);
  },

  async listMine(query, user) {
    const paging = parsePaging(query, { defaultSize: 10 });
    const { items, total } = await repo.list({ applicant: user._id, ...statusFilter(query) }, paging);
    return pageResult(items.map(requestDto), total, paging);
  },

  async listReceived(query, user) {
    const paging = parsePaging(query, { defaultSize: 10 });
    const owned = await initiativeRepository.idsOwnedBy(user._id);
    const filter = { initiative: { $in: owned }, ...statusFilter(query) };
    if (query.initiative) {
      if (!isObjectId(query.initiative) || !owned.some((o) => String(o) === query.initiative)) {
        return pageResult([], 0, paging);
      }
      filter.initiative = query.initiative;
    }
    const { items, total } = await repo.list(filter, paging);
    return pageResult(items.map(requestDto), total, paging);
  },

  async listForInitiative(initiativeId, query, user) {
    const { ini } = await loadOwned(initiativeId, user._id);
    const paging = parsePaging(query, { defaultSize: 10 });
    const { items, total } = await repo.list({ initiative: ini._id, ...statusFilter(query) }, paging);
    return pageResult(items.map(requestDto), total, paging);
  },
};
