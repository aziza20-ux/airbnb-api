import type { NextFunction, Request, Response, RequestHandler } from "express";

type AsyncController = RequestHandler;

export function asyncHandler(operation: string, handler: AsyncController) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error) {
      if (error instanceof Error && !("operation" in error)) {
        Object.assign(error, { operation });
      }
      next(error);
    }
  };
}
