import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import { AppError } from "../utils/app-error";

/**
 * Create a host request
 * POST /host-requests
 */
export const createHostRequest = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      throw new AppError(401, "User not authenticated");
    }

    // Check if user already has a pending request
    const existingRequest = await prisma.hostRequest.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      throw new AppError(409, "You already have a pending host request");
    }

    // Create the host request
    const hostRequest = await prisma.hostRequest.create({
      data: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Host request created successfully",
      data: hostRequest,
    });
  }
);

/**
 * Get all host requests (Admin only)
 * GET /admin/host-requests
 */
export const listHostRequests = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { status } = req.query;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const requests = await prisma.hostRequest.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      message: "Host requests fetched successfully",
      data: requests,
    });
  }
);

/**
 * Approve host request and update user role
 * PATCH /admin/host-requests/:id/approve
 */
export const approveHostRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      throw new AppError(400, "Host request id is required");
    }

    const hostRequest = await prisma.hostRequest.findUnique({
      where: { id },
    });

    if (!hostRequest) {
      throw new AppError(404, "Host request not found");
    }

    if (hostRequest.status !== "PENDING") {
      throw new AppError(400, `Cannot approve request with status: ${hostRequest.status}`);
    }

    // Update request status and user role in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update host request
      const updatedRequest = await tx.hostRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Update user role to HOST
      await tx.user.update({
        where: { id: hostRequest.userId },
        data: {
          role: "HOST",
        },
      });

      return updatedRequest;
    });

    res.status(200).json({
      message: "Host request approved successfully",
      data: result,
    });
  }
);

/**
 * Deny host request
 * PATCH /admin/host-requests/:id/deny
 */
export const denyHostRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      throw new AppError(400, "Host request id is required");
    }

    const hostRequest = await prisma.hostRequest.findUnique({
      where: { id },
    });

    if (!hostRequest) {
      throw new AppError(404, "Host request not found");
    }

    if (hostRequest.status !== "PENDING") {
      throw new AppError(400, `Cannot deny request with status: ${hostRequest.status}`);
    }

    const deniedRequest = await prisma.hostRequest.update({
      where: { id },
      data: {
        status: "DENIED",
        reviewedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Host request denied successfully",
      data: deniedRequest,
    });
  }
);

/**
 * Get host request by user ID (Check if current user has a pending request)
 * GET /host-requests/me
 */
export const getUserHostRequest = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      throw new AppError(401, "User not authenticated");
    }

    const hostRequest = await prisma.hostRequest.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
    });

    res.status(200).json({
      message: "Host request fetched successfully",
      data: hostRequest,
    });
  }
);
