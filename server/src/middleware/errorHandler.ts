import type { NextFunction, Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

export const errorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(error?.statusCode || 500).json({
    success: false,
    message: error?.message || "Internal server error",
  });
};
