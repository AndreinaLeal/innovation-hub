import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/innovation_hub",
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  sessionHours: Number(process.env.SESSION_HOURS) || 12,
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
};
