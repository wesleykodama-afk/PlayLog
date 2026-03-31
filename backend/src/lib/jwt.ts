import jwt from "jsonwebtoken";
import { env } from "../config.js";

type TokenPayload = {
  userId: string;
  role: string;
};

export const signToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;
