import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { autheticate,requireHost } from "../../middlewares/auth.middleware";
import {
  getAllListings,
  searchListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  listingStats,
} from "../../controllers/listings.controller"

/**
 * @swagger
 * components:
 *   schemas:
 *     Listing:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Cozy cabin retreat
 *         description:
 *           type: string
 *           example: A peaceful cabin surrounded by trees.
 *         location:
 *           type: string
 *           example: Aspen, Colorado
 *         pricePerNight:
 *           type: number
 *           example: 120
 *         guests:
 *           type: integer
 *           example: 4
 *         type:
 *           type: string
 *           enum: [APARTMENT, HOUSE, VILLA, CABIN]
 *           example: CABIN
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           example: [WiFi, Kitchen, Free parking]
 *         rating:
 *           type: number
 *           nullable: true
 *           example: 4.8
 *         userId:
 *           type: integer
 *           example: 12
 *         host:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2026-04-28T10:30:00.000Z
 *     CreateListingInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - location
 *         - pricePerNight
 *         - guests
 *         - type
 *         - amenities
 *       properties:
 *         title:
 *           type: string
 *           example: Cozy cabin retreat
 *         description:
 *           type: string
 *           example: A peaceful cabin surrounded by trees.
 *         location:
 *           type: string
 *           example: Aspen, Colorado
 *         pricePerNight:
 *           type: number
 *           example: 120
 *         guests:
 *           type: integer
 *           example: 4
 *         type:
 *           type: string
 *           enum: [APARTMENT, HOUSE, VILLA, CABIN]
 *           example: CABIN
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           example: [WiFi, Kitchen, Free parking]
 *     UpdateListingInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         location:
 *           type: string
 *         pricePerNight:
 *           type: number
 *         guests:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [APARTMENT, HOUSE, VILLA, CABIN]
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *     PaginatedListingsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Listing'
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
 *     ListingStatsResponse:
 *       type: object
 *       properties:
 *         totalListings:
 *           type: integer
 *         averagePrice:
 *           type: number
 *         byLocation:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *         byType:
 *           type: object
 *           additionalProperties:
 *             type: integer
 */

const listingsRoutes = Router();

/**
 * @swagger
 * /api/listings:
 *   get:
 *     summary: Get paginated listings
 *     tags: [Listings]
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
 *         description: Paginated listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedListingsResponse'
 */
listingsRoutes.get("/", asyncHandler("listings.getAllListings", getAllListings));

/**
 * @swagger
 * /api/listings/search:
 *   get:
 *     summary: Search and filter listings
 *     tags: [Listings]
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
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [apartment, house, villa, cabin]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: guests
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedListingsResponse'
 */
listingsRoutes.get("/search", asyncHandler("listings.searchListings", searchListings));

/**
 * @swagger
 * /api/listings/stats:
 *   get:
 *     summary: Get listing statistics
 *     tags: [Listings]
 *     responses:
 *       200:
 *         description: Listing statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListingStatsResponse'
 */
listingsRoutes.get("/stats", asyncHandler("listings.listingStats", listingStats));

/**
 * @swagger
 * /api/listings:
 *   post:
 *     summary: Create a listing
 *     description: Creates a new listing.
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateListingInput'
 *     responses:
 *       201:
 *         description: Listing created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
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
 */
listingsRoutes.post("/", autheticate,requireHost, asyncHandler("listings.createListing", createListing));

/**
 * @swagger
 * /api/listings/{id}:
 *   put:
 *     summary: Update a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The listing ID
 *         example: 1
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateListingInput'
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Listing not found
 */



listingsRoutes.put("/:id", autheticate,asyncHandler("listings.updateListing", updateListing));


/**
 * @swagger
 * /api/listings/{id}:
 *   delete:
 *     summary: Delete a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The listing ID
 *         example: 1
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Listing deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Listing not found
 */
listingsRoutes.delete("/:id", autheticate,asyncHandler("listings.deleteListing", deleteListing));

/**
 * @swagger
 * /api/listings/search:
 *   get:
 *     summary: Search listings
 *     tags: [Listings]
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
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [apartment, house, villa, cabin]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: guests
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedListingsResponse'
 */





export default listingsRoutes;


