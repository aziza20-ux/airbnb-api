import { Router } from "express";
import {
  createHostRequest,
  listHostRequests,
  approveHostRequest,
  denyHostRequest,
  getUserHostRequest,
} from "../../controllers/hostRequest.controller.js";
import { autheticate, requireAdmin } from "../../middlewares/auth.middleware.js";

const hostRequestRoutes = Router();

/**
 * @swagger
 * /api/v1/host-requests:
 *   post:
 *     summary: Create a new host request (Guest only)
 *     tags: [Host Requests]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Host request created successfully
 *       401:
 *         description: Not authenticated
 *       409:
 *         description: Pending request already exists
 */
hostRequestRoutes.post("/", autheticate, createHostRequest);

/**
 * @swagger
 * /api/v1/host-requests/me:
 *   get:
 *     summary: Get current user's pending host request
 *     tags: [Host Requests]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Host request fetched successfully
 *       401:
 *         description: Not authenticated
 */
hostRequestRoutes.get("/me", autheticate, getUserHostRequest);

/**
 * @swagger
 * /api/v1/admin/host-requests:
 *   get:
 *     summary: List all host requests (Admin only)
 *     tags: [Admin - Host Requests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, DENIED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Host requests fetched successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (not admin)
 */
hostRequestRoutes.get("/admin/list", autheticate, requireAdmin, listHostRequests);

/**
 * @swagger
 * /api/v1/admin/host-requests/{id}/approve:
 *   patch:
 *     summary: Approve a host request (Admin only)
 *     tags: [Admin - Host Requests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Host request approved successfully
 *       404:
 *         description: Host request not found
 */
hostRequestRoutes.patch(
  "/admin/:id/approve",
  autheticate,
  requireAdmin,
  approveHostRequest
);

/**
 * @swagger
 * /api/v1/admin/host-requests/{id}/deny:
 *   patch:
 *     summary: Deny a host request (Admin only)
 *     tags: [Admin - Host Requests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Host request denied successfully
 *       404:
 *         description: Host request not found
 */
hostRequestRoutes.patch(
  "/admin/:id/deny",
  autheticate,
  requireAdmin,
  denyHostRequest
);

export default hostRequestRoutes;
