import { Router } from "express";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid registration payload." });
  }

  const { username, email, password } = parsed.data;
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }]
    }
  });

  if (existing) {
    return res.status(409).json({ message: "Username or email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const role = email.includes("admin") ? Role.ADMIN : Role.USER;

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role,
      settings: {
        create: {}
      }
    }
  });

  const token = signToken({ userId: user.id, role: user.role });

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      language: user.language
    }
  });
});

router.post("/login", async (req, res) => {
  const parsed = z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid login payload." });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const isMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = signToken({ userId: user.id, role: user.role });

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      language: user.language
    }
  });
});

export default router;
