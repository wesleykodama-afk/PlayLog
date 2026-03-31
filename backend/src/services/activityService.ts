import { ActivityType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export const createActivity = async ({
  userId,
  type,
  gameName,
  hoursPlayed,
  rating,
  review
}: {
  userId: string;
  type: ActivityType;
  gameName?: string;
  hoursPlayed?: number;
  rating?: number;
  review?: string;
}) => {
  return prisma.activity.create({
    data: {
      userId,
      type,
      gameName,
      hoursPlayed,
      rating,
      review
    }
  });
};
