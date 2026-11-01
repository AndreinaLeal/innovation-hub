import { Project } from "../models/Project.js";

const populate = [
  { path: "owner", select: "name" },
  { path: "initiative", select: "title members", populate: { path: "members.user", select: "name" } },
];

export const projectRepository = {
  create: async (data) => {
    const doc = await Project.create(data);
    return Project.findById(doc._id).populate(populate);
  },
  findById: (id) => Project.findById(id).populate(populate),
  findByInitiative: (initiative) => Project.findOne({ initiative }),
  async list(filter, { skip, size }) {
    const [items, total] = await Promise.all([
      Project.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(size).populate(populate),
      Project.countDocuments(filter),
    ]);
    return { items, total };
  },
};
