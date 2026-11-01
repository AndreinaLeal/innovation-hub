import { Skill, normalizeSkill } from "../models/Skill.js";
import { escapeRegex } from "../utils/validation.js";

export const skillRepository = {
  /** Devuelve los ids de las competencias indicadas, creando las que no existan. */
  async findOrCreateMany(names) {
    const ids = [];
    for (const name of names) {
      const key = normalizeSkill(name);
      const skill = await Skill.findOneAndUpdate(
        { key },
        { $setOnInsert: { key, name: name.trim() } },
        { new: true, upsert: true }
      );
      ids.push(skill._id);
    }
    return ids;
  },
  async findIdByName(name) {
    const s = await Skill.findOne({ key: normalizeSkill(name) }).select("_id");
    return s?._id ?? null;
  },
  async search(q) {
    const filter = q ? { name: { $regex: escapeRegex(q), $options: "i" } } : {};
    return Skill.find(filter).sort({ name: 1 }).limit(50).lean();
  },
};
