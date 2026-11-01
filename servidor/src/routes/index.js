import { Router } from "express";
import {
  authController, userController, skillController,
  initiativeController, requestController, projectController,
} from "../controllers/handlers.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { validateIds } from "../middleware/validateId.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));

// Autenticación
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/logout", requireAuth, authController.logout);
router.get("/auth/me", requireAuth, authController.me);

// Usuarios y competencias
router.get("/users", requireAuth, userController.search);
router.put("/users/me", requireAuth, userController.updateMe);
router.get("/users/:id", requireAuth, validateIds("id"), userController.get);
router.get("/skills", skillController.list);

// Iniciativas (el catálogo es accesible sin sesión; la visibilidad se resuelve en el servicio)
router.get("/initiatives", optionalAuth, initiativeController.list);
router.post("/initiatives", requireAuth, initiativeController.create);
router.get("/initiatives/:id", optionalAuth, validateIds("id"), initiativeController.get);
router.put("/initiatives/:id", requireAuth, validateIds("id"), initiativeController.update);
router.delete("/initiatives/:id", requireAuth, validateIds("id"), initiativeController.remove);
router.get("/initiatives/:id/members", optionalAuth, validateIds("id"), initiativeController.members);
router.delete("/initiatives/:id/members/:userId", requireAuth, validateIds("id", "userId"), initiativeController.removeMember);
router.post("/initiatives/:id/requests", requireAuth, validateIds("id"), requestController.create);
router.get("/initiatives/:id/requests", requireAuth, validateIds("id"), requestController.listForInitiative);

// Solicitudes (las rutas fijas van antes que /:id)
router.get("/requests/mine", requireAuth, requestController.mine);
router.get("/requests/received", requireAuth, requestController.received);
router.get("/requests/:id", requireAuth, validateIds("id"), requestController.get);
router.put("/requests/:id", requireAuth, validateIds("id"), requestController.update);
router.post("/requests/:id/cancel", requireAuth, validateIds("id"), requestController.cancel);
router.post("/requests/:id/accept", requireAuth, validateIds("id"), requestController.accept);
router.post("/requests/:id/reject", requireAuth, validateIds("id"), requestController.reject);

// Proyectos
router.get("/projects", requireAuth, projectController.list);
router.post("/projects", requireAuth, projectController.create);
router.get("/projects/:id", requireAuth, validateIds("id"), projectController.get);

export default router;
