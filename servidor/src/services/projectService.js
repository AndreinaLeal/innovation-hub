import { projectRepository as repo } from "../repositories/projectRepository.js";
import { initiativeRepository } from "../repositories/initiativeRepository.js";
import { PROJECT_STATUSES } from "../models/Project.js";
import { loadOwned, fullAccessClause } from "./initiativeService.js";
import { Validator, parsePaging, pageResult, isObjectId } from "../utils/validation.js";
import { notFound, conflict, badRequest } from "../utils/httpError.js";
import { projectDto } from "../utils/serializers.js";

const REPO_RE = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;

function validateBody(body) {
  const v = new Validator();
  const initiativeId = typeof body?.initiativeId === "string" ? body.initiativeId : undefined;
  if (!initiativeId) v.add("initiativeId", "La iniciativa de origen es obligatoria.");
  else if (!isObjectId(initiativeId)) v.add("initiativeId", "La iniciativa de origen no es válida.");
  const data = {
    name: v.string(body, "name", { label: "El nombre", min: 3, max: 120 }),
    description: v.string(body, "description", { label: "La descripción", min: 20, max: 2000 }),
    objective: v.string(body, "objective", { label: "El objetivo", min: 10, max: 500 }),
    status: v.oneOf(body, "status", PROJECT_STATUSES, { label: "El estado", required: false }) ?? "planificacion",
    repositoryUrl: v.string(body, "repositoryUrl", { label: "El repositorio", max: 200, required: false }) ?? "",
  };
  const rawDate = body?.startDate;
  if (typeof rawDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate) || Number.isNaN(Date.parse(rawDate))) {
    v.add("startDate", "La fecha de inicio debe tener el formato AAAA-MM-DD.");
  } else data.startDate = new Date(`${rawDate}T00:00:00.000Z`);
  if (data.repositoryUrl && !REPO_RE.test(data.repositoryUrl)) {
    v.add("repositoryUrl", "Debe ser una dirección de GitHub como https://github.com/usuario/repositorio.");
  }
  v.done();
  return { initiativeId, data };
}

export const projectService = {
  /** RN-09: solo procede si la iniciativa tiene al menos un miembro además del propietario. */
  async create(body, user) {
    const { initiativeId, data } = validateBody(body);
    const { ini } = await loadOwned(initiativeId, user._id);
    if (ini.archived) throw conflict("INITIATIVE_ARCHIVED", "Una iniciativa archivada no se puede convertir en proyecto.");
    if (ini.members.length < 2) {
      throw conflict("RN09_NOT_ENOUGH_MEMBERS", "La iniciativa necesita al menos un miembro además del propietario para convertirse en proyecto.");
    }
    if (await repo.findByInitiative(ini._id)) {
      throw conflict("PROJECT_EXISTS", "Esta iniciativa ya fue convertida en proyecto.");
    }
    const created = await repo.create({ ...data, initiative: ini._id, owner: user._id });
    await initiativeRepository.update(ini._id, { status: "en-progreso" });
    return projectDto(created, { withMembers: true });
  },

  async list(query, user) {
    const paging = parsePaging(query, { defaultSize: 9 });
    if (query.status && !PROJECT_STATUSES.includes(query.status)) {
      throw badRequest("Filtro inválido.", [{ field: "status", message: `Debe ser uno de: ${PROJECT_STATUSES.join(", ")}.` }]);
    }
    const ids = await initiativeRepository.idsVisibleTo(fullAccessClause(user._id));
    const filter = { initiative: { $in: ids } };
    if (query.status) filter.status = query.status;
    const { items, total } = await repo.list(filter, paging);
    return pageResult(items.map((p) => projectDto(p)), total, paging);
  },

  async get(id, user) {
    if (!isObjectId(id)) throw notFound("El proyecto no existe.");
    const project = await repo.findById(id);
    if (!project) throw notFound("El proyecto no existe.");
    const ids = await initiativeRepository.idsVisibleTo(fullAccessClause(user._id));
    const origin = String(project.initiative._id ?? project.initiative);
    if (!ids.some((i) => String(i) === origin)) throw notFound("El proyecto no existe.");
    return projectDto(project, { withMembers: true });
  },
};
