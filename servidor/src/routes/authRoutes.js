import { Router } from "express";
import { authService } from "../services/authService.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { token, user } = await authService.login(req.body);
    res.status(200).json({ token, user });
  })
);

router.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    await authService.logout(req.token);
    res.status(204).send();
  })
);

router.get("/me", requireAuth, (req, res) => {
  res.json(req.user);
});

export default router;