import { Router } from "express";
import { chat, generateListingDescription, naturalLanguageSearch } from "../../controllers/ai.controllers";
import { autheticate, requireHost } from "../../middlewares/auth.middleware";

const aiRoutes = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AiSearchInput:
 *       type: object
 *       required:
 *         - query
 *       properties:
 *         query:
 *           type: string
 *           example: Find a villa in Miami for 4 guests under 300 dollars
 *     AiSearchResponse:
 *       type: object
 *       properties:
 *         query:
 *           type: string
 *         extractedfilters:
 *           type: object
 *           properties:
 *             location:
 *               type: string
 *             type:
 *               type: string
 *               enum: [APARTMENT, HOUSE, VILLA, CABIN]
 *             guests:
 *               type: number
 *             maxPrice:
 *               type: number
 *         results:
 *           type: array
 *           items:
 *             type: object
 *         count:
 *           type: integer
 *     AiDescriptionInput:
 *       type: object
 *       required:
 *         - title
 *         - location
 *         - type
 *         - guests
 *         - amenities
 *         - pricePerNight
 *       properties:
 *         title:
 *           type: string
 *         location:
 *           type: string
 *         type:
 *           type: string
 *           enum: [APARTMENT, HOUSE, VILLA, CABIN]
 *         guests:
 *           type: integer
 *         amenities:
 *           oneOf:
 *             - type: array
 *               items:
 *                 type: string
 *             - type: string
 *         pricePerNight:
 *           type: number
 *     AiDescriptionResponse:
 *       type: object
 *       properties:
 *         description:
 *           type: string
 *     AiChatInput:
 *       type: object
 *       required:
 *         - message
 *         - sessionId
 *       properties:
 *         message:
 *           type: string
 *         sessionId:
 *           type: string
 *     AiChatResponse:
 *       type: object
 *       properties:
 *         reply:
 *           type: string
 *         sessionId:
 *           type: string
 */

/**
 * @swagger
 * /ai/search:
 *   post:
 *     summary: Extract search filters and search listings
 *     tags: [AI Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AiSearchInput'
 *     responses:
 *       200:
 *         description: Search results returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AiSearchResponse'
 *       400:
 *         description: query is required
 */
aiRoutes.post("/search", naturalLanguageSearch);

/**
 * @swagger
 * /ai/description:
 *   post:
 *     summary: Generate an Airbnb listing description
 *     tags: [AI Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AiDescriptionInput'
 *     responses:
 *       200:
 *         description: Description generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AiDescriptionResponse'
 *       400:
 *         description: Missing required fields
 */
aiRoutes.post("/description", autheticate, requireHost, generateListingDescription)

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Chat with the Airbnb assistant
 *     tags: [AI Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AiChatInput'
 *     responses:
 *       200:
 *         description: Chat reply returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AiChatResponse'
 *       400:
 *         description: message and sessionId are required
 */
aiRoutes.post("/chat", chat )

export default aiRoutes