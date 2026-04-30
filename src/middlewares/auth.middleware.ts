import type { Request, Response,NextFunction } from "express";
import prisma from "../config/prisma";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}
const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "";
export const autheticate= async (req:AuthRequest,res:Response, next:NextFunction):Promise<void>=>{
    const header = req.headers['authorization']
    if (!header?.startsWith('Bearer ')){
        res.status(401).json({error:'Invalid token'})
        return;
    }
    const token = header.split(" ")[1]
    try{
        const decoded = jwt.verify(token!, JWT_SECRET) as { userId: string; role: string }
        req.userId=decoded.userId;
        req.role=decoded.role
        next();
    } catch {
        res.status(401).json({error:'Invalid or expired token'})
    }
}

export const requireHost = async(req:AuthRequest,res:Response,next:NextFunction):Promise<void>=>{
    if (req.role==='HOST' || req.role==="ADMIN"){
        next()
        return;
    }
    res.status(403)
.json({error:"forbidden access"})
}

export const requireGuest = async (req:AuthRequest,res:Response,next:NextFunction):Promise<void>=>{
    if (req.role === "GUEST" ||req.role === "ADMIN"){
        next()
        return
    }
    res.status(403).json({error:"fobidden access"})
}

export const requireAdmin = async (req:AuthRequest,res:Response,next:NextFunction):Promise<void>=>{
        if (req.role === "ADMIN"){
        next()
        return
    }
    res.status(403).json({error:"fobidden access"})
}