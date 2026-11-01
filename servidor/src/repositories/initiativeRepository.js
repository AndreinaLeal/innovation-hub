import { Initiative } from "../models/Initiative.js";
import { Request } from "../models/Request.js";
import { Project } from "../models/Project.js";

const populate = [
  { path: "owner", select: "name" },
  { path: "skills", select: "name" },
  { path: "members.user", select: "name" },
];

const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  title: { title: 1, _id: 1 },
};

export const initiativeRepository = {
  create: async (data) => {
    const doc = await Initiative.create(data);
    return Initiative.findById(doc._id).populate(populate);
  },
  findById: (id) => Initiative.findById(id).populate(populate),

  async list(filter, { sort, skip, size }) {
    const order = SORTS[sort] ?? SORTS.newest;
    const [items, total] = await Promise.all([
      Initiative.find(filter).sort(order).skip(skip).limit(size).populate(populate),
      Initiative.countDocuments(filter),
    ]);
    return { items, total };
  },

  async update(id, data) {
    await Initiative.updateOne({ _id: id }, { $set: data }, { runValidators: true });
    return Initiative.findById(id).populate(populate);
  },

  /** RN-10: ¿tiene información relacionada (equipo, solicitudes o proyecto)? */
  async hasRelatedInfo(ini) {
    if (ini.members.length > 1) return true;
    const [requests, project] = await Promise.all([
      Request.exists({ initiative: ini._id }),
      Project.exists({ initiative: ini._id }),
    ]);
    return Boolean(requests || project);
  },
  archive: (id) => Initiative.updateOne({ _id: id }, { $set: { archived: true } }),
  remove: (id) => Initiative.deleteOne({ _id: id }),

  /** Agrega un miembro solo si todavía no está (evita duplicados aunque haya dos peticiones a la vez). */
  addMember: (id, userId) =>
    Initiative.updateOne(
      { _id: id, "members.user": { $ne: userId } },
      { $push: { members: { user: userId, role: "miembro", joinedAt: new Date() } } }
    ),
  removeMember: (id, userId) => Initiative.updateOne({ _id: id }, { $pull: { members: { user: userId } } }),
  idsOwnedBy: async (userId) => (await Initiative.find({ owner: userId }).select("_id").lean()).map((i) => i._id),
  idsVisibleTo: async (clause) => (await Initiative.find({ archived: false, ...clause }).select("_id").lean()).map((i) => i._id),
};
