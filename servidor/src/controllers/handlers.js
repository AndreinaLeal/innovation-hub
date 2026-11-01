import { authService } from "../services/authService.js";
import { userService } from "../services/userService.js";
import { initiativeService } from "../services/initiativeService.js";
import { requestService } from "../services/requestService.js";
import { projectService } from "../services/projectService.js";
import { skillRepository } from "../repositories/skillRepository.js";
import { userPrivate } from "../utils/serializers.js";

// Controladores delgados: traducen HTTP <-> servicios. Toda la lógica vive en services/.
const wrap = (fn) => async (req, res, next) => {
  try { await fn(req, res); } catch (e) { next(e); }
};
const viewerId = (req) => req.user?._id;

export const authController = {
  register: wrap(async (req, res) => res.status(201).json(await authService.register(req.body))),
  login: wrap(async (req, res) => res.status(200).json(await authService.login(req.body))),
  logout: wrap(async (req, res) => { await authService.logout(req.token); res.status(204).end(); }),
  me: wrap(async (req, res) => res.status(200).json(userPrivate(req.user))),
};

export const userController = {
  search: wrap(async (req, res) => res.json(await userService.search(req.query))),
  get: wrap(async (req, res) => res.json(await userService.getById(req.params.id))),
  updateMe: wrap(async (req, res) => res.json(await userService.updateProfile(req.user, req.body))),
};

export const skillController = {
  list: wrap(async (req, res) => {
    const skills = await skillRepository.search(req.query.q?.trim());
    res.json({ data: skills.map((s) => s.name) });
  }),
};

export const initiativeController = {
  list: wrap(async (req, res) => res.json(await initiativeService.list(req.query, viewerId(req)))),
  get: wrap(async (req, res) => res.json(await initiativeService.get(req.params.id, viewerId(req)))),
  create: wrap(async (req, res) => res.status(201).json(await initiativeService.create(req.body, req.user))),
  update: wrap(async (req, res) => res.json(await initiativeService.update(req.params.id, req.body, req.user))),
  remove: wrap(async (req, res) => { await initiativeService.remove(req.params.id, req.user); res.status(204).end(); }),
  members: wrap(async (req, res) => res.json(await initiativeService.listMembers(req.params.id, viewerId(req)))),
  removeMember: wrap(async (req, res) => {
    await initiativeService.removeMember(req.params.id, req.params.userId, req.user);
    res.status(204).end();
  }),
};

export const requestController = {
  create: wrap(async (req, res) => res.status(201).json(await requestService.create(req.params.id, req.body, req.user))),
  listForInitiative: wrap(async (req, res) => res.json(await requestService.listForInitiative(req.params.id, req.query, req.user))),
  mine: wrap(async (req, res) => res.json(await requestService.listMine(req.query, req.user))),
  received: wrap(async (req, res) => res.json(await requestService.listReceived(req.query, req.user))),
  get: wrap(async (req, res) => res.json(await requestService.get(req.params.id, req.user))),
  update: wrap(async (req, res) => res.json(await requestService.update(req.params.id, req.body, req.user))),
  cancel: wrap(async (req, res) => res.json(await requestService.cancel(req.params.id, req.user))),
  accept: wrap(async (req, res) => res.json(await requestService.resolve(req.params.id, "accept", req.user))),
  reject: wrap(async (req, res) => res.json(await requestService.resolve(req.params.id, "reject", req.user))),
};

export const projectController = {
  create: wrap(async (req, res) => res.status(201).json(await projectService.create(req.body, req.user))),
  list: wrap(async (req, res) => res.json(await projectService.list(req.query, req.user))),
  get: wrap(async (req, res) => res.json(await projectService.get(req.params.id, req.user))),
};
