import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : undefined;
    const token = headerToken || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};

export const authorize =
  (...roles: Array<"user" | "organizer" | "admin">) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    next();
  };
