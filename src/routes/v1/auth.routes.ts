import { Router } from "express";

import { asyncHandler } from "../../utils/async-handler";
import { register,login, getMe, changePassword, forgotPassword, resetPassword } from "../../controllers/auth.controller";
import { autheticate } from "../../middlewares/auth.middleware";
import {strictLimit } from "../../middlewares/ratelimit.middleware";



/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - username
 *         - phone
 *         - password
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           example: Aziza Ahmed
 *         email:
 *           type: string
 *           format: email
 *           example: aziza@example.com
 *         username:
 *           type: string
 *           example: aziza1
 *         phone:
 *           type: string
 *           example: 00978787878
 *         password:
 *           type: string
 *           format: password
 *           example: StrongPassword123!
 *         role:
 *           type: string
 *           example: GUEST
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: aziza@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: StrongPassword123!
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Resource not found
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           $ref: '#/components/schemas/User'
 */

const authRoutes = Router()

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: user registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

authRoutes.post('/register', asyncHandler('auth.register', register))

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: login existing user
 *     description: login user whois already registered to get token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
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
authRoutes.post('/login',  strictLimit,asyncHandler('auth.login', login))


/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.get('/me', autheticate, asyncHandler('auth.getMe', getMe))
/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change the current user's password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
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
authRoutes.post('/change-password', autheticate, asyncHandler('auth.changePassword', changePassword))
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     description: Same response is returned whether the email exists or not.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: If the email exists, a reset link has been sent
 */
authRoutes.post('/forgot-password',  strictLimit, asyncHandler('auth.forgotPassword', forgotPassword))
/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset the user's password
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Password reset token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.post('/reset-password/:token', strictLimit, asyncHandler('auth.resetPassword', resetPassword))


// // Single file upload — field name must match what the client sends
// router.post("/upload", upload.single("image"), uploadImage);

// // Multiple files
// router.post("/upload", upload.array("images", 5), uploadImages);

export default authRoutes