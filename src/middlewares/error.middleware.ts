import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/app-error";

type ErrorWithOperation = Error & { operation?: string };

export function globalErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  void next;

  const error = err instanceof Error ? err : new Error(String(err));

  const operation =
    error instanceof Error && "operation" in error && typeof (error as ErrorWithOperation).operation === "string"
      ? (error as ErrorWithOperation).operation
      : `${req.method} ${req.originalUrl}`;

  const message = error.message;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("Request failed", {
      operation,
      code: error.code,
      message,
    });

    if (error.code === "P2002") {
      res.status(409).json({ message: "Resource already exists" });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({ message: "Record not found" });
      return;
    }

    if (error.code === "P2003") {
      res.status(400).json({ message: "Invalid related record reference" });
      return;
    }

    res.status(500).json({ message: "Something went wrong" });
    return;
  }

  if (error instanceof AppError) {
    console.error("Request failed", {
      operation,
      code: "APP_ERROR",
      message,
    });
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  console.error("Request failed", {
    operation,
    code: "UNKNOWN",
    message,
  });
  res.status(500).json({ message: "Something went wrong" });
}
