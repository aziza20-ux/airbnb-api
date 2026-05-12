import type { Request, Response } from "express";
import { ListingType, type Prisma } from "../generated/prisma/client";
import prisma from "../config/prisma";
import { AppError } from "../utils/app-error";
import { autheticate,AuthRequest } from "../middlewares/auth.middleware";
import { deleteCache, deleteCacheByPrefix, getCache, setCache } from "../config/cache";

type ListingStatsResponse = {
	totalListings: number;
	averagePrice: number;
	byLocation: Record<string, number>;
	byType: Record<string, number>;
};

type CachedListingStats = {
	data: ListingStatsResponse;
	expiresAt: number;
};

const clearListingStatsCache = (): void => {
	deleteCache("listings:stats");
};

const clearListingListCache = (): void => {
	deleteCacheByPrefix("listings:list:");
};

const listingPhotoInclude = {
	photos: {
		orderBy: {
			id: "asc" as const,
		},
	},
};

const parsePositiveInteger = (value: unknown, fieldName: string, defaultValue: number): number => {
	if (value === undefined) {
		return defaultValue;
	}

	const parsedValue = parseInt(String(value), 10);
	if (Number.isNaN(parsedValue) || parsedValue < 1) {
		throw new AppError(400, `${fieldName} must be a positive integer`);
	}

	return parsedValue;
};

const buildSearchWhere = (req: Request): Prisma.ListingWhereInput => {
	const locationQuery = req.query.location;
	const typeQuery = req.query.type;
	const minPriceQuery = req.query.minPrice;
	const maxPriceQuery = req.query.maxPrice;
	const guestsQuery = req.query.guests;

	const where: Prisma.ListingWhereInput = {};

	if (typeof locationQuery === "string" && locationQuery.trim() !== "") {
		where.location = {
			contains: locationQuery.trim(),
			mode: "insensitive",
		};
	}

	if (typeof typeQuery === "string" && typeQuery.trim() !== "") {
		const normalizedType = typeQuery.trim().toUpperCase();
		if (!Object.values(ListingType).includes(normalizedType as ListingType)) {
			throw new AppError(400, "Invalid listing type");
		}
		where.type = normalizedType as ListingType;
	}

	if (minPriceQuery !== undefined || maxPriceQuery !== undefined) {
		const priceFilter: Prisma.FloatFilter = {};

		if (minPriceQuery !== undefined) {
			const parsedMinPrice = parseFloat(String(minPriceQuery));
			if (Number.isNaN(parsedMinPrice) || parsedMinPrice < 0) {
				throw new AppError(400, "minPrice must be a non-negative number");
			}
			priceFilter.gte = parsedMinPrice;
		}

		if (maxPriceQuery !== undefined) {
			const parsedMaxPrice = parseFloat(String(maxPriceQuery));
			if (Number.isNaN(parsedMaxPrice) || parsedMaxPrice < 0) {
				throw new AppError(400, "maxPrice must be a non-negative number");
			}
			priceFilter.lte = parsedMaxPrice;
		}

		where.pricePerNight = priceFilter;
	}

	if (guestsQuery !== undefined) {
		const parsedGuests = parseInt(String(guestsQuery), 10);
		if (Number.isNaN(parsedGuests) || parsedGuests < 1) {
			throw new AppError(400, "guests must be a positive integer");
		}
		where.guests = {
			gte: parsedGuests,
		};
	}

	return where;
};

export const getAllListings = async (req: Request, res: Response): Promise<void> => {
	const locationQuery = req.query.location;
	const typeQuery = req.query.type;
	const maxPriceQuery = req.query.maxPrice;
	const pageQuery = req.query.page;
	const limitQuery = req.query.limit;

	const page = pageQuery === undefined ? 1 : parseInt(String(pageQuery), 10);
	const limit = limitQuery === undefined ? 10 : parseInt(String(limitQuery), 10);

	if (Number.isNaN(page) || page < 1 || Number.isNaN(limit) || limit < 1) {
		throw new AppError(400, "page and limit must be positive integers");
	}

	const cacheKey = `listings:list:${page}:${limit}:${String(locationQuery ?? "")}:${String(typeQuery ?? "")}:${String(maxPriceQuery ?? "")}`;
	const cachedResponse = getCache<{ data: Prisma.ListingGetPayload<{ include: { host: { select: { name: true; avatar: true } }, photos: { orderBy: { id: "asc" } } } }>[], meta: { page: number; limit: number; total: number; totalPages: number } }>(cacheKey);
	if (cachedResponse) {
		res.status(200).json(cachedResponse);
		return;
	}

	const where: Prisma.ListingWhereInput = {};

	if (typeof locationQuery === "string" && locationQuery.trim() !== "") {
		where.location = {
			contains: locationQuery,
			mode: "insensitive",
		};
	}

	if (typeQuery !== undefined) {
		const typeValue = String(typeQuery);
		if (!Object.values(ListingType).includes(typeValue as ListingType)) {
			throw new AppError(400, "Invalid listing type");
		}
		where.type = typeValue as ListingType;
	}

	if (maxPriceQuery !== undefined) {
		const parsedMaxPrice = parseFloat(String(maxPriceQuery));
		if (Number.isNaN(parsedMaxPrice) || parsedMaxPrice < 0) {
			throw new AppError(400, "maxPrice must be a non-negative number");
		}
		where.pricePerNight = {
			lte: parsedMaxPrice,
		};
	}

	const skip = (page - 1) * limit;

	const [total, listings] = await Promise.all([
		prisma.listing.count({ where }),
		prisma.listing.findMany({
			where,
			skip,
			take: limit,
			include: {
				host: {
					select: {
						id: true,
						name: true,
						email: true,
						avatar: true,
					},
				},
				...listingPhotoInclude,
			},
		}),
	]);

	const responseData = {
		data: listings,
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};

	setCache(cacheKey, responseData, 60);

	res.status(200).json(responseData);
};

export const searchListings = async (req: Request, res: Response): Promise<void> => {
	const page = parsePositiveInteger(req.query.page, "page", 1);
	const limit = parsePositiveInteger(req.query.limit, "limit", 10);
	const where = buildSearchWhere(req);
	const skip = (page - 1) * limit;

	const [total, listings] = await Promise.all([
		prisma.listing.count({ where }),
		prisma.listing.findMany({
			where,
			skip,
			take: limit,
			include: {
				host: {
					select: {
						id: true,
						name: true,
						email: true,
						avatar: true,
					},
				},
				...listingPhotoInclude,
			},
		}),
	]);

	res.status(200).json({
		data: listings,
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	});
};

export const getListingById = async (req: Request, res: Response): Promise<void> => {
	const id = req.params.id as string;
	const listing = await prisma.listing.findUnique({
		where: { id:id },
		include: {
			host: {
				select: {
					id: true,
					name: true,
					email: true,
					avatar: true,
				},
			},
			bookings: true,
				...listingPhotoInclude,
		},
	});

	if (!listing) {
		throw new AppError(404, "Listing not found");
	}

	res.status(200).json(listing);
};

export const createListing = async (req:AuthRequest, res: Response): Promise<void> => {
	const {
		title,
		description,
		location,
		pricePerNight,
		guests,
		type,
		amenities,
	} = req.body;

	if (
		!title ||
		!description ||
		!location ||
		pricePerNight === undefined ||
		guests === undefined ||
		!type ||
		!Array.isArray(amenities)
	) {
		throw new AppError(400, "Missing required fields");
	}

	const host = await prisma.user.findUnique({ where: { id: String(req.userId) } });
	if (!host) {
		throw new AppError(404, "Host not found");
	}

	const newListing = await prisma.listing.create({
		data: {
			title,
			description,
			location,
			pricePerNight: Number(pricePerNight),
			guests: Number(guests),
			type,
			amenities,
			hostId: String(req.userId),
		},
		include: {
			host: {
				select: {
					id: true,
					name: true,
					email: true,
					username: true,
					phone: true,
					role: true,
					avatar: true,
					bio: true,
					createdAt: true,
				},
			},
			...listingPhotoInclude,
		},
	});

	clearListingStatsCache();
	clearListingListCache();

	res.status(201).json(newListing);
};

export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
	const id = req.params.id as string;
	const existing = await prisma.listing.findFirst({ where: { id: id } });

	if (!existing) {
		throw new AppError(404, "Listing not found");

	}
	if (existing.hostId !== req.userId || req.role !== "ADMIN"){
		res.status(403).json({error:"You can only edit your own listings"})
	}

	const { title, description, location, pricePerNight, guests, type, amenities, hostId, rating } = req.body;

	if (hostId !== undefined) {
		const host = await prisma.user.findUnique({ where: { id: hostId } });
		if (!host) {
			throw new AppError(404, "Host not found");
		}
	}

	const data: Prisma.ListingUncheckedUpdateInput = {};

	if (title !== undefined) data.title = title;
	if (description !== undefined) data.description = description;
	if (location !== undefined) data.location = location;
	if (pricePerNight !== undefined) data.pricePerNight = Number(pricePerNight);
	if (guests !== undefined) data.guests = Number(guests);
	if (type !== undefined) data.type = type;
	if (amenities !== undefined) data.amenities = amenities;
	if (hostId !== undefined) data.hostId = hostId;
	if (rating !== undefined) data.rating = rating === null ? null : Number(rating);

	const updatedListing = await prisma.listing.update({
		where: { id: String(id) },
		data,
		include: {
			host: {
				select: {
					id: true,
					name: true,
					email: true,
					username: true,
					phone: true,
					role: true,
					avatar: true,
					bio: true,
					createdAt: true,
				},
			},
			...listingPhotoInclude,
		},
	});

	clearListingStatsCache();
	clearListingListCache();

	res.status(200).json(updatedListing);
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
	const id = req.params.id as string;
	const existing = await prisma.listing.findFirst({ where: { id: id } });

	if (!existing) {
		throw new AppError(404, "Listing not found");
	}

	if (existing.hostId !== req.userId){
		res.status(403).json({error:"forbidden access"})
		return;
	}

	const deletedListing = await prisma.listing.delete({ where: { id: String(id) } });
	clearListingStatsCache();
	clearListingListCache();
	res.status(200).json(deletedListing);
};

export const listingStats = async (req:Request,res:Response):Promise<void>=>{
	const now = Date.now();
	const cachedStats = getCache<ListingStatsResponse>("listings:stats");
	if (cachedStats) {
		res.status(200).json(cachedStats);
		return;
	}

	const [totalListings, averagePriceResult, locationGroups, typeGroups] = await Promise.all([
		prisma.listing.count(),
		prisma.listing.aggregate({
			_avg: {
				pricePerNight: true,
			},
		}),
		prisma.listing.groupBy({
			by: ["location"],
			_count: {
				location: true,
			},
		}),
		prisma.listing.groupBy({
			by: ["type"],
			_count: {
				type: true,
			},
		}),
	]);

	const responseData: ListingStatsResponse = {
		totalListings,
		averagePrice: averagePriceResult._avg.pricePerNight ?? 0,
		byLocation: locationGroups.reduce<Record<string, number>>((accumulator: Record<string, number>, group: { location: string; _count: { location: number } }) => {
			accumulator[group.location] = group._count.location;
			return accumulator;
		}, {}),
		byType: typeGroups.reduce<Record<string, number>>((accumulator: Record<string, number>, group: { type: string; _count: { type: number } }) => {
			accumulator[group.type] = group._count.type;
			return accumulator;
		}, {}),
	};

	setCache("listings:stats", responseData, 5 * 60);

	res.status(200).json(responseData);
}

