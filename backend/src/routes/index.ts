import { Router } from "express";
import authRoutes from "./auth.js";
import gamesRoutes from "./games.js";
import homeRoutes from "./home.js";
import friendsRoutes from "./friends.js";
import activityRoutes from "./activity.js";
import profileRoutes from "./profile.js";
import settingsRoutes from "./settings.js";
import affiliateRoutes from "./affiliate.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/games", gamesRoutes);
router.use("/home", homeRoutes);
router.use("/friends", friendsRoutes);
router.use("/activity", activityRoutes);
router.use("/profile", profileRoutes);
router.use("/settings", settingsRoutes);
router.use("/affiliate-products", affiliateRoutes);

export default router;
