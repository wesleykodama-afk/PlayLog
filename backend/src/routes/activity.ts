import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const friendIds = await prisma.friend.findMany({
    where: { userId: req.auth!.userId },
    select: { friendId: true }
  });

  const ids = [req.auth!.userId, ...friendIds.map((item) => item.friendId)];
  const activities = await prisma.activity.findMany({
    where: {
      userId: { in: ids }
    },
    include: {
      user: {
        select: {
          username: true,
          profileImage: true
        }
      },
      likes: {
        select: {
          userId: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 40
  });

  return res.json(
    activities.map((activity) => ({
      ...activity,
      likeCount: activity.likes.length,
      likedByMe: activity.likes.some((like) => like.userId === req.auth!.userId)
    }))
  );
});

router.post("/:id/like", async (req, res) => {
  await prisma.activityLike.upsert({
    where: {
      activityId_userId: {
        activityId: req.params.id,
        userId: req.auth!.userId
      }
    },
    update: {},
    create: {
      activityId: req.params.id,
      userId: req.auth!.userId
    }
  });

  return res.status(201).json({ message: "Liked." });
});

router.delete("/:id/like", async (req, res) => {
  await prisma.activityLike.deleteMany({
    where: {
      activityId: req.params.id,
      userId: req.auth!.userId
    }
  });

  return res.status(204).send();
});

export default router;
