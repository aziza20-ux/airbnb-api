import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../utils/app-error";
import { deleteCache, getCache, setCache } from "../config/cache";
import type { AuthRequest } from "../middlewares/auth.middleware";

type UsersStatsResponse = {
    totalUsers: number;
    byRole: Record<string, number>;
};

type CachedUsersStats = {
    data: UsersStatsResponse;
    expiresAt: number;
};

const clearUsersStatsCache = (): void => {
    deleteCache("users:stats");
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




export const getAllUsers = async (req: Request, res: Response) => {
    const page = parsePositiveInteger(req.query.page, "page", 1);
    const limit = parsePositiveInteger(req.query.limit, "limit", 10);
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
        prisma.user.count(),
        prisma.user.findMany({
            skip,
            take: limit,
            include: {
                _count: {
                    select: {
                        listings: true,
                    },
                },
            },
        }),
    ]);

    res.status(200).json({
        data: users,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
};

export const getUserById = async (req: Request, res: Response):Promise<void> => {
    const id = String(req.params.id);
    const user = await prisma.user.findUnique({
        where: {id},
        include:{
            _count:{
                select:{
                    listings:true,
                    bookings:true
                }
            }
        }
    });

    if (!user) {
        throw new AppError(404, "user not found");
    }

    res.status(200).json({ message: "success", user });
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, username, role, avatar, bio,phone } = req.body;

    if (!name || !email || !username || !role || !bio||!phone) {
        throw new AppError(400, "one of required field is missing");
    }

    const newUser = await prisma.user.create(
{        data:{
            phone,
            name,
            email,
            username,
            role,
            bio,
            avatar: avatar ?? "",
        }}
    );

    clearUsersStatsCache();

    res.status(201).json(newUser);
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
        throw new AppError(404, "user not found");
    }

    const isSelf = req.userId === id;
    const isAdmin = req.role === "ADMIN";

    if (!isSelf && !isAdmin) {
        throw new AppError(403, "forbidden access");
    }

    const { name, email, username, role, avatar, bio, phone } = req.body;
    const data = {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(username !== undefined ? { username } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(role !== undefined && isAdmin ? { role } : {}),
    };

    if (Object.keys(data).length === 0) {
        throw new AppError(400, "No profile fields were provided");
    }

    let updatedUser;

    try {
        updatedUser = await prisma.user.update({
            where: { id },
            data,
        });
    } catch (error: any) {
        if (error?.code === "P2002") {
            throw new AppError(409, "Email or username already in use");
        }

        throw error;
    }

    clearUsersStatsCache();

    res.status(200).json(updatedUser);
};

export const deleteUser =  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const deletedUser = await prisma.user.delete({where:{id}});

    clearUsersStatsCache();

    res.status(200).json(deletedUser);
};

export const getListingsByHost = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);

    const page = parsePositiveInteger(req.query.page, "page", 1);
    const limit = parsePositiveInteger(req.query.limit, "limit", 10);
    const skip = (page - 1) * limit;

    const [total, listings] = await Promise.all([
        prisma.listing.count({ where: { hostId: id } }),
        prisma.listing.findMany({
            where: {
                hostId: id,
            },
            skip,
            take: limit,
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

export const getBookingsByGuest = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new AppError(404, "user not found");
    }

    const page = parsePositiveInteger(req.query.page, "page", 1);
    const limit = parsePositiveInteger(req.query.limit, "limit", 10);
    const skip = (page - 1) * limit;

    const [total, bookings] = await Promise.all([
        prisma.booking.count({ where: { guestId: id } }),
        prisma.booking.findMany({
            where: {
                guestId: id,
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                listing: true,
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

export const usersStats = async (req: Request, res: Response): Promise<void> => {
    const now = Date.now();

    const cachedStats = getCache<UsersStatsResponse>("users:stats");
    if (cachedStats) {
        res.status(200).json(cachedStats);
        return;
    }

    const [totalUsers, roleGroups] = await Promise.all([
        prisma.user.count(),
        prisma.user.groupBy({
            by: ["role"],
            _count: {
                role: true,
            },
        }),
    ]);

    const responseData: UsersStatsResponse = {
        totalUsers,
        byRole: roleGroups.reduce<Record<string, number>>((accumulator: Record<string, number>, group: { role: string; _count: { role: number } }) => {
            accumulator[group.role] = group._count.role;
            return accumulator;
        }, {}),
    };

    setCache("users:stats", responseData, 5 * 60);

    res.status(200).json(responseData);
};