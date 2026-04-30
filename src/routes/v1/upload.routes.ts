import { Router } from "express";
import upload from "../../config/multer";
import { autheticate } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { deleteAvatar, deleteListingPhoto, uploadAvatar, uploadListingPhotos } from "../../controllers/upload.controller";

const uploadRoutes = Router();

uploadRoutes.post("/:id/avatar", autheticate, upload.single("image"), asyncHandler("upload.uploadAvatar", uploadAvatar));
uploadRoutes.delete("/:id/avatar", autheticate, asyncHandler("upload.deleteAvatar", deleteAvatar));
uploadRoutes.post("/listings/:id/photos", autheticate, upload.array("photos", 5), asyncHandler("upload.uploadListingPhotos", uploadListingPhotos));
uploadRoutes.delete("/listings/:id/photos/:photoId", autheticate, asyncHandler("upload.deleteListingPhoto", deleteListingPhoto));

export default uploadRoutes;
