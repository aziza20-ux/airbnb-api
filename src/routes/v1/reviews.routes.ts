import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { deleteReview } from "../../controllers/review.controller";

/**
 * @swagger
 * components:
 *   schemas:
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

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The review ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 */
const reviewsRoutes = Router();

reviewsRoutes.delete("/:id", asyncHandler("reviews.deleteReview", deleteReview));

export default reviewsRoutes;