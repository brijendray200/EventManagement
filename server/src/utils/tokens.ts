import crypto from "crypto";
import type { Response } from "express";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

export const getCookieOptions = (days: number, httpOnly = true) => ({
  httpOnly,
  sameSite: (process.env.COOKIE_SAME_SITE || "lax") as "lax" | "strict" | "none",
  secure: isProduction || process.env.COOKIE_SECURE === "true",
  expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  path: "/",
});

export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET || "dev-refresh-secret") as {
    id: string;
    type?: string;
  };

export const attachAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const accessDays = Number(process.env.JWT_COOKIE_DAYS || 1);
  const refreshDays = Number(process.env.JWT_REFRESH_COOKIE_DAYS || 7);

  res.cookie("token", accessToken, getCookieOptions(accessDays));
  res.cookie("refresh_token", refreshToken, getCookieOptions(refreshDays));
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("token", getCookieOptions(1));
  res.clearCookie("refresh_token", getCookieOptions(1));
};
