import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../utils/app-error";
import { deleteCacheByPrefix, getCache, setCache } from "../config/cache";
import type { Prisma } from "../generated/prisma/client";

type ReviewWithUser = Prisma.ReviewGetPayload<{
	include: {
		user: {
			select: {
				name: true;
				avatar: true;
			};
		};
	};
}>;

type PaginatedReviewsResponse = {
	data: ReviewWithUser[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

const parsePositiveInteger = (value: unknown, fieldName: string, defaultValue: number): number => {
	if (value === undefined) {
		return defaultValue;
	}

	const parsedValue = Number.parseInt(String(value), 10);
	if (Number.isNaN(parsedValue) || parsedValue < 1) {
		throw new AppError(400, `${fieldName} must be a positive integer`);
	}

	return parsedValue;
};

const clearListingReviewCache = (listingId: string): void => {
	deleteCacheByPrefix(`reviews:list:${listingId}:`);
};

export const getListingReviews = async (req: Request, res: Response): Promise<void> => {
	const listingId = String(req.params.id);
	const listing = await prisma.listing.findUnique({ where: { id: listingId } });

	if (!listing) {
		throw new AppError(404, "Listing not found");
	}

	const page = parsePositiveInteger(req.query.page, "page", 1);
	const limit = parsePositiveInteger(req.query.limit, "limit", 10);
	const cacheKey = `reviews:list:${listingId}:${page}:${limit}`;
	const cachedResponse = getCache<PaginatedReviewsResponse>(cacheKey);

	if (cachedResponse) {
		res.status(200).json(cachedResponse);
		return;
	}

	const skip = (page - 1) * limit;

	const [total, reviews] = await Promise.all([
		prisma.review.count({ where: { listingId } }),
		prisma.review.findMany({
			where: { listingId },
			skip,
			take: limit,
			orderBy: {
				createdAt: "desc",
			},
			include: {
				user: {
					select: {
						name: true,
						avatar: true,
					},
				},
			},
		}),
	]);

	const responseData: PaginatedReviewsResponse = {
		data: reviews,
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};

	setCache(cacheKey, responseData, 30);

	res.status(200).json(responseData);
};

export const createListingReview = async (req: Request, res: Response): Promise<void> => {
	const listingId = String(req.params.id);
	const { userId, rating, comment } = req.body;

	if (userId === undefined || rating === undefined || comment === undefined) {
		throw new AppError(400, "Missing required fields");
	}

	const parsedRating = Number(rating);
	if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
		throw new AppError(400, "rating must be between 1 and 5");
	}

	if (typeof comment !== "string" || comment.trim() === "") {
		throw new AppError(400, "Missing required fields");
	}

	const [listing, user] = await Promise.all([
		prisma.listing.findUnique({ where: { id: listingId } }),
		prisma.user.findUnique({ where: { id: String(userId) } }),
	]);

	if (!listing) {
		throw new AppError(404, "Listing not found");
	}

	if (!user) {
		throw new AppError(404, "User not found");
	}

	const newReview = await prisma.review.create({
		data: {
			userId: String(userId),
			listingId,
			rating: parsedRating,
			comment: comment.trim(),
		},
		include: {
			user: {
				select: {
					name: true,
					avatar: true,
				},
			},
		},
	});

	clearListingReviewCache(listingId);

	res.status(201).json(newReview);
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
	const id = String(req.params.id);
	const existing = await prisma.review.findUnique({ where: { id } });

	if (!existing) {
		throw new AppError(404, "Review not found");
	}

	await prisma.review.delete({ where: { id } });
	clearListingReviewCache(existing.listingId);

	res.status(200).json({ message: "Review deleted successfully" });
};