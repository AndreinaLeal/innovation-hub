import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    // Clave normalizada (minúsculas, sin tildes) para evitar duplicados como "SQL" y "sql".
    key: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const normalizeSkill = (name) =>
  name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const Skill = mongoose.model("Skill", skillSchema);
