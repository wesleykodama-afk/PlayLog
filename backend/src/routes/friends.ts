import { ActivityType } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { createActivity } from "../services/activityService.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const friends = await prisma.friend.findMany({
    where: { userId: req.auth!.userId },
    include: {
      friend: {
        include: {
          games: true
        }
      }
    }
  });

  return res.json(
    friends.map(({ friend }) => ({
      id: friend.id,
      username: friend.username,
      bio: friend.bio,
      profileImage: friend.profileImage,
      totalHours: friend.games.reduce((sum, game) => sum + game.hoursPlayed, 0),
      totalGames: friend.games.length
    }))
  );
});

router.post("/", async (req, res) => {
  const parsed = z.object({
    username: z.string().min(3)
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid friend payload." });
  }

  const friend = await prisma.user.findUnique({
    where: { username: parsed.data.username }
  });

  if (!friend) {
    return res.status(404).json({ message: "User not found." });
  }

  if (friend.id === req.auth!.userId) {
    return res.status(400).json({ message: "You cannot add yourself." });
  }

  const existingFriendship = await prisma.friend.findUnique({
    where: {
      userId_friendId: {
        userId: req.auth!.userId,
        friendId: friend.id
      }
    }
  });

  if (existingFriendship) {
    return res.status(409).json({ message: "Friend already added." });
  }

  await prisma.friend.create({
    data: {
      userId: req.auth!.userId,
      friendId: friend.id
    }
  });

  await createActivity({
    userId: req.auth!.userId,
    type: ActivityType.FRIEND_ADDED
  });

  return res.status(201).json({ message: "Friend added." });
});

export default router;
