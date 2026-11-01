import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { routeNotFound, errorHandler } from "./middleware/errorHandler.js";
import { HttpError } from "./utils/httpError.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  // CORS explícito: solo los orígenes configurados en CORS_ORIGIN.
  app.use(cors({
    origin(origin, cb) {
      if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
      cb(new HttpError(403, "CORS_FORBIDDEN", "Origen no permitido."));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));

  app.use((_req, res, next) => { res.setHeader("X-Content-Type-Options", "nosniff"); next(); });
  app.use(express.json({ limit: "100kb" }));

  app.use("/api", routes);
  app.use(routeNotFound);
  app.use(errorHandler);
  return app;
}
