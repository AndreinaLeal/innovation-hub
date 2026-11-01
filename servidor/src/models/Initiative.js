import mongoose from "mongoose";

const { Schema } = mongoose;

export const TYPES = ["idea", "necesidad", "reto"];
export const CATEGORIES = [
  "tecnologia", "educacion", "sostenibilidad", "impacto-social",
  "negocios-emprendimiento", "salud-bienestar", "cultura-creatividad", "otro",
];
export const VISIBILITIES = ["publica", "institucional", "restringida", "privada"];
export const STATUSES = ["buscando-equipo", "en-progreso", "pausada", "completada"];

// El equipo se EMBEBE: es pequeño (máx. ~20), siempre se lee junto con la iniciativa
// y su ciclo de vida depende de ella. Cada miembro referencia al usuario.
const memberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["propietario", "miembro"], default: "miembro" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const initiativeSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, // RN-01
    title: { type: String, required: true, trim: true, maxlength: 120 },
    type: { type: String, enum: TYPES, required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    summary: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    problem: { type: String, trim: true, maxlength: 1500, default: "" },
    beneficiaries: { type: String, trim: true, maxlength: 300, default: "" },
    tags: [{ type: String, trim: true, maxlength: 40 }],
    visibility: { type: String, enum: VISIBILITIES, required: true }, // RN-03
    status: { type: String, enum: STATUSES, default: "buscando-equipo" },
    targetMembers: { type: Number, min: 1, max: 20, required: true },
    // Relación N:M iniciativa-competencia: referencias a "skills".
    skills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    members: [memberSchema],
    archived: { type: Boolean, default: false, index: true }, // RN-10
  },
  { timestamps: true }
);

initiativeSchema.index({ "members.user": 1 });
initiativeSchema.index({ skills: 1 });
initiativeSchema.index({ type: 1, category: 1, createdAt: -1 });

export const Initiative = mongoose.model("Initiative", initiativeSchema);
