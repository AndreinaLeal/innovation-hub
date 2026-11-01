import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler, routeNotFound } from "./middleware/errorHandler.js";

const app = express();

// CORS explícito: solo acepta peticiones del origen del cliente
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);

app.use(routeNotFound);
app.use(errorHandler);

export default app;