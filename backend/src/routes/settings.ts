import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { fetchOwnedSteamGames } from "../services/steamService.js";
import { createActivity } from "../services/activityService.js";
import { ActivityType, GameStatus, Platform } from "@prisma/client";
import { normalizeSteamId, parseCustomLinks } from "../utils/serialize.js";

const router = Router();

const settingsSchema = z.object({
  preferredLanguage: z.enum(["English", "Spanish", "Chinese", "Japanese", "Russian", "Portuguese"]),
  steamProfileUrl: z.string().optional().nullable(),
  epicProfileUrl: z.string().optional().nullable(),
  gogProfileUrl: z.string().optional().nullable(),
  customLinks: z.array(
    z.object({
      name: z.string().min(1),
      url: z.string().url()
    })
  )
});

router.use(requireAuth);

router.get("/", async (req, res) => {
  const settings = await prisma.settings.findUnique({
    where: { userId: req.auth!.userId }
  });

  if (!settings) {
    return res.json(null);
  }

  return res.json({
    ...settings,
    customLinks: parseCustomLinks(settings.customLinks)
  });
});

router.put("/", async (req, res) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid settings payload." });
  }

  const payload = parsed.data;

  const settings = await prisma.settings.upsert({
    where: { userId: req.auth!.userId },
    update: {
      preferredLanguage: payload.preferredLanguage,
      steamProfileUrl: payload.steamProfileUrl,
      epicProfileUrl: payload.epicProfileUrl,
      gogProfileUrl: payload.gogProfileUrl,
      customLinks: JSON.stringify(payload.customLinks)
    },
    create: {
      userId: req.auth!.userId,
      preferredLanguage: payload.preferredLanguage,
      steamProfileUrl: payload.steamProfileUrl,
      epicProfileUrl: payload.epicProfileUrl,
      gogProfileUrl: payload.gogProfileUrl,
      customLinks: JSON.stringify(payload.customLinks)
    }
  });

  await prisma.user.update({
    where: { id: req.auth!.userId },
    data: {
      language: payload.preferredLanguage
    }
  });

  return res.json({
    ...settings,
    customLinks: parseCustomLinks(settings.customLinks)
  });
});

router.post("/steam/connect", async (req, res) => {
  const parsed = z.object({
    steamProfileUrl: z.string().min(1)
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid Steam profile input." });
  }

  const steamId = normalizeSteamId(parsed.data.steamProfileUrl);
  await prisma.user.update({
    where: { id: req.auth!.userId },
    data: { steamId }
  });

  await prisma.settings.upsert({
    where: { userId: req.auth!.userId },
    update: {
      steamProfileUrl: parsed.data.steamProfileUrl
    },
    create: {
      userId: req.auth!.userId,
      steamProfileUrl: parsed.data.steamProfileUrl
    }
  });

  return res.json({ steamId, message: "Steam account connected." });
});

router.post("/steam/sync", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId }
  });

  if (!user?.steamId) {
    return res.status(400).json({ message: "Connect Steam first." });
  }

  const steamData = await fetchOwnedSteamGames(user.steamId);
  const syncedGames = [];

  for (const steamGame of steamData.games) {
    const existing = await prisma.game.findFirst({
      where: {
        userId: user.id,
        externalId: steamGame.externalId,
        platform: Platform.STEAM
      }
    });

    if (existing) {
      const updated = await prisma.game.update({
        where: { id: existing.id },
        data: {
          hoursPlayed: steamGame.hoursPlayed,
          coverUrl: steamGame.coverUrl || existing.coverUrl,
          source: "steam"
        }
      });
      syncedGames.push(updated);
    } else {
      const created = await prisma.game.create({
        data: {
          userId: user.id,
          name: steamGame.name,
          platform: Platform.STEAM,
          status: GameStatus.PLAYING,
          hoursPlayed: steamGame.hoursPlayed,
          coverUrl: steamGame.coverUrl,
          source: "steam",
          externalId: steamGame.externalId
        }
      });
      syncedGames.push(created);
    }
  }

  const lastSyncAt = new Date();
  await prisma.user.update({
    where: { id: user.id },
    data: { lastSyncAt }
  });

  await createActivity({
    userId: user.id,
    type: ActivityType.STEAM_SYNCED
  });

  return res.json({
    message: "Steam sync completed.",
    imported: syncedGames.length,
    lastSyncAt
  });
});

export default router;
