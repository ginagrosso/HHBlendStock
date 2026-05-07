import type {Request, Response, NextFunction} from "express";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const manejarError = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({error: err.message});
    return;
  }
  console.error("Error inesperado:", err);
  res.status(500).json({error: "Error interno del servidor"});
};
