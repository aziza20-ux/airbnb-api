import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/app-error";

type ErrorWithOperation = Error & { operation?: string };

export function globalErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  void next;

  const operation =
    err instanceof Error && "operation" in err && typeof (err as ErrorWithOperation).operation === "string"
      ? (err as ErrorWithOperation).operation
      : `${req.method} ${req.originalUrl}`;

  const message = err instanceof Error ? err.message : String(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("Request failed", {
      operation,
      code: err.code,
      message,
    });

    if (err.code === "P2002") {
      res.status(409).json({ message: "Resource already exists" });
      return;
    }

    if (err.code === "P2025") {
      res.status(404).json({ message: "Record not found" });
      return;
    }

    if (err.code === "P2003") {
      res.status(400).json({ message: "Invalid related record reference" });
      return;
    }

    res.status(500).json({ message: "Something went wrong" });
    return;
  }

  if (err instanceof AppError) {
    console.error("Request failed", {
      operation,
      code: "APP_ERROR",
      message,
    });
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  console.error("Request failed", {
    operation,
    code: "UNKNOWN",
    message,
  });
  res.status(500).json({ message: "Something went wrong" });
}
