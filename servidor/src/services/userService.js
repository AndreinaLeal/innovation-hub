import { userRepository } from "../repositories/userRepository.js";
import { skillRepository } from "../repositories/skillRepository.js";
import { AVAILABILITY } from "../models/User.js";
import { Validator, parsePaging, pageResult } from "../utils/validation.js";
import { notFound } from "../utils/httpError.js";
import { isObjectId } from "../utils/validation.js";
import { userPublic, userPrivate } from "../utils/serializers.js";

export const userService = {
  async search(query) {
    const paging = parsePaging(query, { defaultSize: 12 });
    const filters = { q: query.q?.trim(), career: query.career?.trim(), availability: undefined, skillId: undefined };
    if (query.availability) {
      if (!AVAILABILITY.includes(query.availability)) return pageResult([], 0, paging);
      filters.availability = query.availability;
    }
    if (query.skill) {
      filters.skillId = await skillRepository.findIdByName(query.skill);
      if (!filters.skillId) return pageResult([], 0, paging);
    }
    const { items, total } = await userRepository.search(filters, paging);
    return pageResult(items.map(userPublic), total, paging);
  },

  async getById(id) {
    if (!isObjectId(id)) throw notFound("El usuario no existe.");
    const user = await userRepository.findById(id);
    if (!user) throw notFound("El usuario no existe.");
    return userPublic(user);
  },

  async updateProfile(current, body) {
    const v = new Validator();
    // El correo es el identificador: no se modifica desde el perfil.
    if (body?.email !== undefined && String(body.email).trim().toLowerCase() !== current.email) {
      v.add("email", "El correo no se puede modificar.");
    }
    const name = v.string(body, "name", { label: "El nombre", min: 2, max: 80 });
    const career = v.string(body, "career", { label: "La carrera", max: 80, required: false });
    const bio = v.string(body, "bio", { label: "La presentación", max: 400, required: false });
    const availability = v.oneOf(body, "availability", AVAILABILITY, { label: "La disponibilidad" });
    const skills = v.stringArray(body, "skills", { label: "Las competencias", maxItems: 20 });
    v.done();

    const skillIds = await skillRepository.findOrCreateMany(skills);
    const updated = await userRepository.update(current._id, {
      name, career: career ?? "", bio: bio ?? "", availability, skills: skillIds,
    });
    return userPrivate(updated);
  },
};
