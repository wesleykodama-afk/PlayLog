import { ActivityType, GameStatus, Platform } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { createActivity } from "../services/activityService.js";
import { getGameDetails, searchGames } from "../services/rawgService.js";

const router = Router();

const gameInputSchema = z.object({
  name: z.string().min(1),
  platform: z.nativeEnum(Platform),
  status: z.nativeEnum(GameStatus),
  hoursPlayed: z.coerce.number().min(0),
  rating: z.coerce.number().min(1).max(10).nullable().optional(),
  review: z.string().optional().nullable(),
  playedDate: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  source: z.string().default("manual"),
  externalId: z.string().optional().nullable(),
  releaseDate: z.string().optional().nullable(),
  genre: z.string().optional().nullable()
});

router.use(requireAuth);

router.get("/", async (req, res) => {
  const status = req.query.status as GameStatus | undefined;
  const games = await prisma.game.findMany({
    where: {
      userId: req.auth!.userId,
      ...(status ? { status } : {})
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  return res.json(games);
});

router.get("/discover/search", async (req, res) => {
  const query = String(req.query.query ?? "");
  if (!query) {
    return res.json([]);
  }

  const results = await searchGames(query);
  return res.json(results);
});

router.get("/discover/:externalId", async (req, res) => {
  const details = await getGameDetails(req.params.externalId);
  return res.json(details);
});

router.post("/", async (req, res) => {
  const parsed = gameInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid game payload." });
  }

  const game = await prisma.game.create({
    data: {
      ...parsed.data,
      userId: req.auth!.userId,
      playedDate: parsed.data.playedDate ? new Date(parsed.data.playedDate) : null
    }
  });

  await createActivity({
    userId: req.auth!.userId,
    type: ActivityType.GAME_ADDED,
    gameName: game.name,
    hoursPlayed: game.hoursPlayed,
    rating: game.rating ?? undefined,
    review: game.review ?? undefined
  });

  return res.status(201).json(game);
});

router.put("/:id", async (req, res) => {
  const parsed = gameInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid game update payload." });
  }

  const existing = await prisma.game.findFirst({
    where: { id: req.params.id, userId: req.auth!.userId }
  });

  if (!existing) {
    return res.status(404).json({ message: "Game not found." });
  }

  const game = await prisma.game.update({
    where: { id: req.params.id },
    data: {
      ...parsed.data,
      playedDate: parsed.data.playedDate ? new Date(parsed.data.playedDate) : existing.playedDate
    }
  });

  await createActivity({
    userId: req.auth!.userId,
    type: ActivityType.GAME_UPDATED,
    gameName: game.name,
    hoursPlayed: game.hoursPlayed,
    rating: game.rating ?? undefined,
    review: game.review ?? undefined
  });

  return res.json(game);
});

router.delete("/:id", async (req, res) => {
  const existing = await prisma.game.findFirst({
    where: { id: req.params.id, userId: req.auth!.userId }
  });

  if (!existing) {
    return res.status(404).json({ message: "Game not found." });
  }

  await prisma.game.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

export default router;
