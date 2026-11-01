import app from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";

try {
  await connectDb();
} catch (error) {
  console.error("No se pudo conectar a MongoDB:", error.message);
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`API escuchando en http://localhost:${env.port}`);
});