import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { parseCustomLinks } from "../utils/serialize.js";

const router = Router();

router.use(requireAuth);

router.get("/me", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    include: {
      games: {
        orderBy: { updatedAt: "desc" }
      },
      settings: true
    }
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    bio: user.bio,
    profileImage: user.profileImage,
    language: user.language,
    stats: {
      totalHours: user.games.reduce((sum, game) => sum + game.hoursPlayed, 0),
      totalGames: user.games.length,
      totalPlatinum: user.games.filter((game) => game.status === "PLATINUM").length
    },
    games: user.games,
    settings: user.settings
      ? {
          ...user.settings,
          customLinks: parseCustomLinks(user.settings.customLinks)
        }
      : null
  });
});

export default router;
