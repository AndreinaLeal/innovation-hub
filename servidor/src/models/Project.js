import mongoose from "mongoose";

const { Schema } = mongoose;

export const PROJECT_STATUSES = ["planificacion", "activo", "finalizado"];

// El proyecto REFERENCIA a la iniciativa de origen (única) y no duplica el equipo:
// los miembros se leen de la iniciativa.
const projectSchema = new Schema(
  {
    initiative: { type: Schema.Types.ObjectId, ref: "Initiative", required: true, unique: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    objective: { type: String, required: true, trim: true, maxlength: 500 },
    startDate: { type: Date, required: true },
    status: { type: String, enum: PROJECT_STATUSES, default: "planificacion" },
    repositoryUrl: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
