import type { Request, Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary";
import { deleteCacheByPrefix } from "../config/cache";

type UploadRequest = AuthRequest & {
	file?: Express.Multer.File;
	files?: Express.Multer.File[];
};

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
	const authReq = req as UploadRequest;
	const id = req.params.id;

	if (authReq.userId !== id) {
		res.status(403).json({ error: "Forbidden" });
		return;
	}

	if (!authReq.file) {
		res.status(400).json({ error: "No file uploaded" });
		return;
	}

	const user = await prisma.user.findUnique({ where: { id: String(id) } });
	if (!user) {
		res.status(404).json({ error: "User not found" });
		return;
	}

	const currentAvatarPublicId = user.avatarPublicId;
	if (currentAvatarPublicId) {
		await deleteFromCloudinary(currentAvatarPublicId);
	}

	const uploaded = await uploadToCloudinary(authReq.file.buffer, "airbnb/avatars");

	const updatedUser = await prisma.user.update({
		where: { id: String(id) },
		data: {
			avatar: uploaded.url,
			avatarPublicId: uploaded.publicId,
		},
	});

	const { password: _, ...userWithoutPassword } = updatedUser;
	res.status(200).json({ status: "success", user: userWithoutPassword });
};

export const deleteAvatar = async (req: Request, res: Response): Promise<void> => {
	const authReq = req as AuthRequest;
	const id = req.params.id;

	if (authReq.userId !== id) {
		res.status(403).json({ error: "Forbidden" });
		return;
	}

	const user = await prisma.user.findUnique({ where: { id: String(id) } });
	if (!user) {
		res.status(404).json({ error: "User not found" });
		return;
	}

	if (!user.avatar) {
		res.status(400).json({ error: "No avatar to remove" });
		return;
	}

	const currentAvatarPublicId = user.avatarPublicId;
	if (currentAvatarPublicId) {
		await deleteFromCloudinary(currentAvatarPublicId);
	}

	await prisma.user.update({
		where: { id: String(id) },
		data: {
			avatar: null,
			avatarPublicId: null,
		},
	});

	res.status(200).json({ status: "success", message: "Avatar removed successfully" });
};

export const uploadListingPhotos = async (req: Request, res: Response): Promise<void> => {
	const authReq = req as UploadRequest;
	const id = req.params.id;

	const listing = await prisma.listing.findUnique({ where: { id: String(id) } });
	if (!listing) {
		res.status(404).json({ error: "Listing not found" });
		return;
	}

	if (listing.hostId !== authReq.userId) {
		res.status(403).json({ error: "Forbidden" });
		return;
	}

	const existingCount = await prisma.listingPhoto.count({ where: { listingId: String(id) } });
	if (existingCount >= 5) {
		res.status(400).json({ error: "Maximum of 5 photos allowed per listing" });
		return;
	}

	const files = authReq.files;
	if (!files || files.length === 0) {
		res.status(400).json({ error: "No file uploaded" });
		return;
	}

	const remainingSlots = 5 - existingCount;
	const filesToProcess = files.slice(0, remainingSlots);

	for (const file of filesToProcess) {
		const uploaded = await uploadToCloudinary(file.buffer, "airbnb/listings");
		await prisma.listingPhoto.create({
			data: {
				listingId: String(id),
				url: uploaded.url,
				publicId: uploaded.publicId,
			},
		});
	}

	const photos = await prisma.listingPhoto.findMany({
		where: { listingId: String(id) },
		orderBy: { id: "asc" },
	});

	deleteCacheByPrefix("listings:list:");

	res.status(200).json({
		status: "success",
		listing: {
			...listing,
			photos,
		},
	});
};

export const deleteListingPhoto = async (req: Request, res: Response): Promise<void> => {
	const authReq = req as AuthRequest;
	const id = req.params.id;
	const photoId = req.params.photoId;

	const listing = await prisma.listing.findUnique({ where: { id: String(id) } });
	if (!listing) {
		res.status(404).json({ error: "Listing not found" });
		return;
	}

	if (listing.hostId !== authReq.userId) {
		res.status(403).json({ error: "Forbidden" });
		return;
	}

	const photo = await prisma.listingPhoto.findUnique({ where: { id: String(photoId) } });
	if (!photo) {
		res.status(404).json({ error: "Photo not found" });
		return;
	}

	if (photo.listingId !== id) {
		res.status(403).json({ error: "Forbidden" });
		return;
	}

	await deleteFromCloudinary(photo.publicId);
	await prisma.listingPhoto.delete({ where: { id: String(photoId) } });
	deleteCacheByPrefix("listings:list:");

	res.status(200).json({ status: "success", message: "Listing photo deleted successfully" });
};
