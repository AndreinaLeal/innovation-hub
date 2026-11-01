import { Session } from "../models/Session.js";

export const sessionRepository = {
  create: (tokenHash, userId) => Session.create({ tokenHash, userId }),
  findByTokenHash: (tokenHash) => Session.findOne({ tokenHash }),
  deleteByTokenHash: (tokenHash) => Session.deleteOne({ tokenHash }),
};