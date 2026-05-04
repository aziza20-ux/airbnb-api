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
import {
  createListingReview,
  getListingReviews,
} from "../../controllers/review.controller";


/**
 * @swagger
 * components:
 *   schemas:
 *     Listing:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
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
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440001
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
 *     ReviewUser:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         avatar:
 *           type: string
 *           nullable: true
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         userId:
 *           type: string
 *           format: uuid
 *         listingId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         user:
 *           $ref: '#/components/schemas/ReviewUser'
 *     CreateReviewInput:
 *       type: object
 *       required:
 *         - userId
 *         - rating
 *         - comment
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *     PaginatedReviewsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Review'
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

const listingsRoutes = Router();

/**
 * @swagger
 * /listings:
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
 * /listings/search:
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
 * /listings/stats:
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
 * /listings:
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
 * /listings/{id}:
 *   put:
 *     summary: Update a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 * 
 * @swagger
 * /listings/{id}/reviews:
 *   get:
 *     summary: Get paginated reviews for a listing
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The listing ID
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Paginated reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedReviewsResponse'
 *       404:
 *         description: Listing not found
 *   post:
 *     summary: Create a review for a listing
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The listing ID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewInput'
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid review input (e.g., rating not between 1-5)
 *       404:
 *         description: Listing or user not found
 */
listingsRoutes.get("/:id/reviews", asyncHandler("reviews.getListingReviews", getListingReviews));
listingsRoutes.post("/:id/reviews", asyncHandler("reviews.createListingReview", createListingReview));

/**        required: true
 *         description: The listing ID
 *         example: 550e8400-e29b-41d4-a716-446655440002
 *         schema:
 *           type: string
 *           format: uuid
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
 * /listings/{id}:
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
 *         example: 550e8400-e29b-41d4-a716-446655440002
 *         schema:
 *           type: string
 *           format: uuid
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
 * /listings/search:
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


