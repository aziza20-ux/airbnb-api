import type { Request, Response } from "express";
import { BookingStatus } from "../generated/prisma/client";
import prisma from "../config/prisma";
import { AppError } from "../utils/app-error";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

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

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
	const page = parsePositiveInteger(req.query.page, "page", 1);
	const limit = parsePositiveInteger(req.query.limit, "limit", 10);
	const skip = (page - 1) * limit;

	const [total, bookings] = await Promise.all([
		prisma.booking.count(),
		prisma.booking.findMany({
			skip,
			take: limit,
			orderBy: {
				createdAt: "desc",
			},
			include: {
				guest: {
					select: {
						name: true,
					},
				},
				listing: {
					select: {
						title: true,
						location: true,
					},
				},
			},
		}),
	]);

	res.status(200).json({
		data: bookings,
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	});
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
	const id = req.params.id as string;

	const booking = await prisma.booking.findUnique({
		where: { id },
		include: {
			guest: true,
			listing: true,
		},
	});

	if (!booking) {
		throw new AppError(404, "Booking not found");
	}

	res.status(200).json(booking);
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
	const { userId, listingId, checkIn, checkOut, guests } = req.body;

	if (userId === undefined || listingId === undefined || !checkIn || !checkOut || guests === undefined) {
		throw new AppError(400, "Missing required fields");
	}

	const parsedGuests = Number(guests);

	if (!Number.isInteger(parsedGuests) || parsedGuests < 1) {
		throw new AppError(400, "Invalid booking input");
	}

	const [guest, listing] = await Promise.all([
		prisma.user.findUnique({ where: { id: userId } }),
		prisma.listing.findUnique({ where: { id: listingId } }),
	]);

	if (!guest) {
		throw new AppError(404, "User not found");
	}

	if (!listing) {
		throw new AppError(404, "Listing not found");
	}

	if (parsedGuests > listing.guests) {
		throw new AppError(400, "guests cannot exceed listing capacity");
	}

	const checkInDate = new Date(checkIn);
	const checkOutDate = new Date(checkOut);

	if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
		throw new AppError(400, "Invalid check-in or check-out date");
	}

	if (checkInDate >= checkOutDate) {
		throw new AppError(400, "checkOut must be after checkIn");
	}

	if (checkInDate.getTime() <= Date.now()) {
		throw new AppError(400, "checkIn must be in the future");
	}

	const nights = (checkOutDate.getTime() - checkInDate.getTime()) / MS_PER_DAY;
	const totalPrice = nights * listing.pricePerNight;

	const newBooking = await prisma.$transaction(async (tx) => {
		const conflict = await tx.booking.findFirst({
			where: {
				listingId: listingId,
				status: BookingStatus.CONFIRMED,
				checkIn: { lt: checkOutDate },
				checkOut: { gt: checkInDate },
			},
		});

		if (conflict) {
			throw new AppError(409, "Booking conflict");
		}

		return tx.booking.create({
			data: {
				guestId: userId,
				listingId: listingId,
				checkIn: checkInDate,
				checkOut: checkOutDate,
				totalPrice,
				status: BookingStatus.PENDING,
			},
		});
	});

	res.status(201).json(newBooking);
};

export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
	const id = req.params.id;
	const existing = await prisma.booking.findUnique({ where: { id } });

	if (!existing) {
		throw new AppError(404, "Booking not found");
	}

	await prisma.booking.delete({ where: { id } });

	res.status(200).json({ message: "Booking deleted successfully" });
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
	const id = req.params.id;
	const { status } = req.body;

	if (typeof status !== "string" || !Object.values(BookingStatus).includes(status as typeof BookingStatus[keyof typeof BookingStatus])) {
		throw new AppError(400, "Invalid booking status");
	}

	const existing = await prisma.booking.findFirst({ where: { id } });
	if (!existing) {
		throw new AppError(404, "Booking not found");
	}

	const updatedBooking = await prisma.booking.update({
		where: { id },
		data: {
			status: status as typeof BookingStatus[keyof typeof BookingStatus],
		},
	});

	res.status(200).json(updatedBooking);
};
