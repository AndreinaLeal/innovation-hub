import { Request } from "../models/Request.js";

const populate = [
  { path: "initiative", select: "title owner" },
  { path: "applicant", select: "name career" },
];

export const requestRepository = {
  create: async (data) => {
    const doc = await Request.create(data);
    return Request.findById(doc._id).populate(populate);
  },
  findById: (id) => Request.findById(id).populate(populate),
  findPending: (initiative, applicant) => Request.findOne({ initiative, applicant, status: "pendiente" }),
  update: async (id, data) => {
    await Request.updateOne({ _id: id }, { $set: data }, { runValidators: true });
    return Request.findById(id).populate(populate);
  },
  /** Cambio de estado atómico: solo procede si la solicitud sigue pendiente. */
  async transition(id, status) {
    const res = await Request.updateOne(
      { _id: id, status: "pendiente" },
      { $set: { status, resolvedAt: new Date() } }
    );
    return res.modifiedCount === 1;
  },
  async list(filter, { skip, size }) {
    const [items, total] = await Promise.all([
      Request.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(size).populate(populate),
      Request.countDocuments(filter),
    ]);
    return { items, total };
  },
};
