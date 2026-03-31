import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { verifyToken } from "../lib/jwt.js";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    req.auth = { userId: payload.userId, role: payload.role as Role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token." });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.auth?.role !== Role.ADMIN) {
    return res.status(403).json({ message: "Admin access required." });
  }

  next();
};
