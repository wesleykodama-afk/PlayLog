import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const userId = req.auth!.userId;
  const friendships = await prisma.friend.findMany({
    where: { userId },
    include: {
      friend: {
        include: {
          games: true
        }
      }
    }
  });

  const leaderboard = friendships
    .map(({ friend }) => ({
      id: friend.id,
      username: friend.username,
      profileImage: friend.profileImage,
      totalHours: friend.games.reduce((sum, game) => sum + game.hoursPlayed, 0),
      totalGames: friend.games.length
    }))
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 3);

  const allGames = await prisma.game.findMany();
  const recentActivities = await prisma.activity.findMany({
    include: {
      user: {
        select: {
          username: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  });

  const grouped = new Map<string, {
    name: string;
    coverUrl: string;
    hoursTotal: number;
    ratings: number[];
    trendScore: number;
  }>();

  for (const game of allGames) {
    const entry = grouped.get(game.name) ?? {
      name: game.name,
      coverUrl: game.coverUrl ?? "",
      hoursTotal: 0,
      ratings: [],
      trendScore: 0
    };

    entry.hoursTotal += game.hoursPlayed;
    if (game.rating) {
      entry.ratings.push(game.rating);
    }
    grouped.set(game.name, entry);
  }

  for (const activity of recentActivities) {
    if (!activity.gameName) {
      continue;
    }

    const entry = grouped.get(activity.gameName) ?? {
      name: activity.gameName,
      coverUrl: "",
      hoursTotal: 0,
      ratings: [],
      trendScore: 0
    };

    entry.trendScore += 1;
    grouped.set(activity.gameName, entry);
  }

  const catalog = [...grouped.values()];
  const mapCard = (item: typeof catalog[number]) => ({
    name: item.name,
    coverUrl: item.coverUrl,
    hoursPlayed: Math.round(item.hoursTotal * 10) / 10,
    rating: item.ratings.length
      ? Math.round((item.ratings.reduce((sum, value) => sum + value, 0) / item.ratings.length) * 10) / 10
      : null
  });

  return res.json({
    leaderboard,
    tabs: {
      trending: [...catalog].sort((a, b) => b.trendScore - a.trendScore).slice(0, 12).map(mapCard),
      mostPlayed: [...catalog].sort((a, b) => b.hoursTotal - a.hoursTotal).slice(0, 12).map(mapCard),
      topRated: [...catalog]
        .filter((item) => item.ratings.length)
        .sort((a, b) => (b.ratings.reduce((x, y) => x + y, 0) / b.ratings.length) - (a.ratings.reduce((x, y) => x + y, 0) / a.ratings.length))
        .slice(0, 12)
        .map(mapCard),
      lowestRated: [...catalog]
        .filter((item) => item.ratings.length)
        .sort((a, b) => (a.ratings.reduce((x, y) => x + y, 0) / a.ratings.length) - (b.ratings.reduce((x, y) => x + y, 0) / b.ratings.length))
        .slice(0, 12)
        .map(mapCard)
    }
  });
});

export default router;
