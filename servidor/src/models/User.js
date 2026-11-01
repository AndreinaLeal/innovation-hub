import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    career: { type: String, trim: true, default: "" },
    availability: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    bio: { type: String, trim: true, default: "" },
    skills: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Cómo se ve el usuario al convertirlo a JSON: nunca incluye el hash
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);