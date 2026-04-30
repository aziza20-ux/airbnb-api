import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { autheticate, requireGuest } from "../../middlewares/auth.middleware";
import {
  getAllBookings,
  getBookingById,
  createBooking,
  deleteBooking,
  updateBookingStatus,
} from "../../controllers/bookings.controller";

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440100
 *         checkIn:
 *           type: string
 *           format: date-time
 *           example: 2026-05-10T15:00:00.000Z
 *         checkOut:
 *           type: string
 *           format: date-time
 *           example: 2026-05-15T11:00:00.000Z
 *         total:
 *           type: number
 *           example: 750
 *         status:
 *           type: string
 *           enum: [confirmed, cancelled]
 *         guests:
 *           type: integer
 *           example: 2
 *         userId:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440101
 *         listingId:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440102
 *         user:
 *           $ref: '#/components/schemas/User'
 *         listing:
 *           $ref: '#/components/schemas/Listing'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2026-04-28T10:30:00.000Z
 *     CreateBookingInput:
 *       type: object
 *       required:
 *         - listingId
 *         - userId
 *         - checkIn
 *         - checkOut
 *       properties:
 *         listingId:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440102
 *         userId:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440101
 *         checkIn:
 *           type: string
 *           format: date-time
 *           example: 2026-05-10T15:00:00.000Z
 *         checkOut:
 *           type: string
 *           format: date-time
 *           example: 2026-05-15T11:00:00.000Z
 *         guests:
 *           type: integer
 *           example: 2
 *     PaginatedBookingsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Booking'
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             total:
 *               type: integer
 *             totalPages:
 *               type: integer
 */

const bookingsRoutes = Router();

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Paginated bookings with user and listing details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedBookingsResponse'
 */
bookingsRoutes.get("/", asyncHandler("bookings.getAllBookings", getAllBookings));

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The booking ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Booking retrieved successfully with user and listing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Booking not found
 */
bookingsRoutes.get("/:id", asyncHandler("bookings.getBookingById", getBookingById));

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking
 *     description: Creates a new booking. The total is auto-calculated from pricePerNight × nights.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingInput'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Listing or user not found
 */
bookingsRoutes.post("/", autheticate, requireGuest, asyncHandler("bookings.createBooking", createBooking));

/**
 * @swagger
 * /bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The booking ID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, cancelled]
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *       404:
 *         description: Booking not found
 */
bookingsRoutes.patch("/:id/status", asyncHandler("bookings.updateBookingStatus", updateBookingStatus));

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The booking ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Booking not found
 */
bookingsRoutes.delete("/:id", autheticate, asyncHandler("bookings.deleteBooking", deleteBooking));

export default bookingsRoutes;

