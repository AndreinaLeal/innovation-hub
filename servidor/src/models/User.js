import mongoose from "mongoose";

const { Schema } = mongoose;

export const AVAILABILITY = ["alta", "media", "baja"];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    career: { type: String, trim: true, maxlength: 80, default: "" },
    bio: { type: String, trim: true, maxlength: 400, default: "" },
    availability: { type: String, enum: AVAILABILITY, default: "media" },
    // Relación N:M usuario-competencia: referencias a la colección "skills".
    skills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
  },
  { timestamps: true }
);

userSchema.index({ name: 1 });
userSchema.index({ skills: 1 });

export const User = mongoose.model("User", userSchema);
