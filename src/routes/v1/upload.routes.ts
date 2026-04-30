import { Router } from "express";
import upload from "../../config/multer";
import { autheticate } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { deleteAvatar, deleteListingPhoto, uploadAvatar, uploadListingPhotos } from "../../controllers/upload.controller";

const uploadRoutes = Router();

/**
 * @swagger
 * /usersuploads/{id}/avatar:
 *   post:
 *     summary: Upload a user avatar
 *     tags: [Uploads]
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
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */

uploadRoutes.post("/:id/avatar", autheticate, upload.single("image"), asyncHandler("upload.uploadAvatar", uploadAvatar));

/**
 * @swagger
 * /usersuploads/{id}/avatar:
 *   delete:
 *     summary: Delete a user avatar
 *     tags: [Uploads]
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
 *         description: Avatar deleted successfully
 */
uploadRoutes.delete("/:id/avatar", autheticate, asyncHandler("upload.deleteAvatar", deleteAvatar));

/**
 * @swagger
 * /usersuploads/listings/{id}/photos:
 *   post:
 *     summary: Upload listing photos
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Listing photos uploaded successfully
 */
uploadRoutes.post("/listings/:id/photos", autheticate, upload.array("photos", 5), asyncHandler("upload.uploadListingPhotos", uploadListingPhotos));

/**
 * @swagger
 * /usersuploads/listings/{id}/photos/{photoId}:
 *   delete:
 *     summary: Delete a listing photo
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The listing ID
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The photo ID
 *     responses:
 *       200:
 *         description: Listing photo deleted successfully
 */
uploadRoutes.delete("/listings/:id/photos/:photoId", autheticate, asyncHandler("upload.deleteListingPhoto", deleteListingPhoto));

export default uploadRoutes;
