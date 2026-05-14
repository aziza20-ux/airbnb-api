import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncController = RequestHandler;

export function asyncHandler(handler: AsyncController): RequestHandler;
export function asyncHandler(operation: string, handler: AsyncController): RequestHandler;
export function asyncHandler(
  operationOrHandler: string | AsyncController,
  maybeHandler?: AsyncController
): RequestHandler {
  const operation = typeof operationOrHandler === "string" ? operationOrHandler : undefined;
  const handler = typeof operationOrHandler === "string" ? maybeHandler : operationOrHandler;

  if (!handler) {
    throw new TypeError("asyncHandler requires a handler function");
  }

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error) {
      if (operation && error instanceof Error && !("operation" in error)) {
        Object.assign(error, { operation });
      }
      next(error);
    }
  };
}
