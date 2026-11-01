import mongoose from "mongoose";

const { Schema } = mongoose;

export const REQUEST_STATUSES = ["pendiente", "aceptada", "rechazada", "cancelada"];

// Las solicitudes son una colección APARTE (referencias): tienen ciclo de vida
// propio, se consultan desde dos lados (solicitante y propietario) y crecen sin límite.
const requestSchema = new Schema(
  {
    initiative: { type: Schema.Types.ObjectId, ref: "Initiative", required: true, index: true },
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    message: { type: String, required: true, trim: true, minlength: 20, maxlength: 600 },
    mainSkill: { type: String, required: true, trim: true, maxlength: 60 },
    desiredRole: { type: String, required: true, trim: true, maxlength: 80 },
    availability: { type: String, enum: ["alta", "media", "baja"], required: true },
    status: { type: String, enum: REQUEST_STATUSES, default: "pendiente" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

// RN-05: una sola solicitud pendiente por usuario e iniciativa.
requestSchema.index(
  { initiative: 1, applicant: 1 },
  { unique: true, partialFilterExpression: { status: "pendiente" } }
);

export const Request = mongoose.model("Request", requestSchema);
