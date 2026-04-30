import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getListingsByHost,
  getBookingsByGuest,
  usersStats,
} from "../../controllers/users.controller";

import { register,login } from "../../controllers/auth.controller";
import { requireAdmin } from "../../middlewares/auth.middleware";

/**
 * @swagger
 * components:
 *    schemas:
 *      User:
 *          type: object
 *          properties:
 *              id:
 *                type: string
 *                format: uuid
 *                example: 550e8400-e29b-41d4-a716-446655440000
 *              name:
 *                type: string
 *                example: aziza
 *              email:
 *                type: string
 *                example: azizaasa@gmail.com
 *              username:
 *                type: string
 *                example: aziza1
 *              phone:
 *                type: string
 *                example: 00978787878
 *              role:
 *                type: string
 *                enum: [GUEST, HOST]
 *                example: GUEST
 *              avatar:
 *                type: string
 *                nullable: true
 *                example: https://res.cloudinary.com/demo/image/upload/sample.jpg
 *              bio:
 *                type: string
 *                nullable: true
 *                example: I'm a software engineer
 *              createdAt:
 *                type: string
 *                format: date-time
 *                example: 2026-05-15T11:00:00.000Z                              
 */


const usersRoutes = Router();




/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all registered users. Requires authentication.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: No token provided or token is invalid
 */

usersRoutes.get("/", requireAdmin,asyncHandler("users.getAllUsers", getAllUsers));

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 */
usersRoutes.get("/stats", asyncHandler("users.usersStats", usersStats));

usersRoutes.get("/:id/listings", asyncHandler("users.getListingsByHost", getListingsByHost));

/**
 * @swagger
 * /users/{id}/bookings:
 *   get:
 *     summary: Get bookings for a specific user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated bookings for the user retrieved successfully
 *       404:
 *         description: User not found
 */
usersRoutes.get("/:id/bookings", asyncHandler("users.getBookingsByGuest", getBookingsByGuest));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
usersRoutes.get("/:id", asyncHandler("users.getUserById", getUserById));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields
 */
usersRoutes.post("/", asyncHandler("users.createUser", createUser));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInput'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
usersRoutes.put("/:id", asyncHandler("users.updateUser", updateUser));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
usersRoutes.delete("/:id", requireAdmin,asyncHandler("users.deleteUser", deleteUser));

export default usersRoutes;

