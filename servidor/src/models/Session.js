import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // Mongo borra la sesión solo a los 7 días
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 },
});

export const Session = mongoose.model("Session", sessionSchema);