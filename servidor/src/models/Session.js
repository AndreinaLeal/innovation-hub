import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  // Se guarda el hash SHA-256 del token, nunca el token en claro.
  tokenHash: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true },
});

// MongoDB elimina automáticamente las sesiones vencidas.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model("Session", sessionSchema);
