import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

const productSchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().url(),
  description: z.string().min(1),
  affiliateLink: z.string().url()
});

router.get("/", async (_req, res) => {
  const products = await prisma.affiliateProduct.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
  return res.json(products);
});

router.use(requireAuth, requireAdmin);

router.post("/", async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid affiliate payload." });
  }

  const product = await prisma.affiliateProduct.create({
    data: parsed.data
  });

  return res.status(201).json(product);
});

router.put("/:id", async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid affiliate payload." });
  }

  const product = await prisma.affiliateProduct.update({
    where: { id: req.params.id },
    data: parsed.data
  });

  return res.json(product);
});

router.delete("/:id", async (req, res) => {
  await prisma.affiliateProduct.delete({
    where: { id: req.params.id }
  });
  return res.status(204).send();
});

export default router;
