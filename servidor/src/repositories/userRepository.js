import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import { escapeRegex } from "../utils/validation.js";

export const userRepository = {
  create: (data) => User.create(data),
  findByEmailWithHash: (email) => User.findOne({ email }),
  findById: (id) => User.findById(id).populate("skills"),
  async update(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate("skills");
  },
  async search({ q, skillId, career, availability }, { skip, size }) {
    const filter = {};
    if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };
    if (career) filter.career = { $regex: escapeRegex(career), $options: "i" };
    if (availability) filter.availability = availability;
    if (skillId) filter.skills = skillId;
    const [items, total] = await Promise.all([
      User.find(filter).sort({ name: 1 }).skip(skip).limit(size).populate("skills"),
      User.countDocuments(filter),
    ]);
    return { items, total };
  },
  // Sesiones
  createSession: (data) => Session.create(data),
  findSession: (tokenHash) => Session.findOne({ tokenHash, expiresAt: { $gt: new Date() } }),
  deleteSession: (tokenHash) => Session.deleteOne({ tokenHash }),
};
