import { User } from "../models/User.js";

export const userRepository = {
  create: (data) => User.create(data),
  findByEmail: (email) => User.findOne({ email: email.toLowerCase().trim() }),
  findById: (id) => User.findById(id),
};