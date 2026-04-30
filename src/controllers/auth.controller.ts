import type { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as crypto from "node:crypto";
import { sendEmail } from "../config/email.config";
import { passwordResetEmail, welcomeEmail } from "../templates/emailtemplates";


const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
    (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? "1d";
export const register = async (req:Request,res:Response):Promise<void> =>{
    const {name,email,username,phone,password,role}=req.body
    if(
        !name
        || !email
        || !username
        || !phone
        || !password
        || !role
    ){
        res.status(400).json({error:"one of the required fields is missing"})
        return;
    }
    if(password.length<8){
        res.status(400).json({error:'password too short'})
        return;
    }
    const existingUser = await prisma.user.findFirst({where:{OR:[{email},{username}]}})
    if (existingUser){
        if(existingUser.email === email){
            res.status(409).json({error:'email already in use'})
            return;
        }
        if(existingUser.username === username){
            res.status(409).json({error:'username already in use'})
            return;
        }
    }
    const hashedpassword = await bcrypt.hash(password,10)

    try{
        const newuser = await prisma.user.create({
            data:{
                name,
                email, 
                username,
                phone,
                password: hashedpassword,
                role  
            }
        })

        const {password:_, ...userWithoutPassword} =  newuser
        res.status(201).json({status:'success', userWithoutPassword})
        
        // try{
        //     await sendEmail(
        //         email,
        //         "Welcome to Airbnb",
        //         welcomeEmail(name,role)
        //     );
        // }catch(error){
        //     console.log("Email send error:", error)
        // }
        // return;
    }catch(error:any){
        if(error.code === 'P2002'){
            const field = error.meta?.target?.[0] || 'field'
            res.status(409).json({error: `${field} already in use`})
            return;
        }else{
            res.status(500).json({error: 'Failed to create user'})
            return;
        }
    }
} 

export const login = async (req:Request,res:Response):Promise<void>=>{
    const {email,password} = req.body
    if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' })
        return
    }
    const user = await prisma.user.findFirst({where:{email}})
    if (!user){
        res.status(401).json({error:'Invalid credetials'})
        return;
    }
    if (!user.password) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if (!isMatch){
        res.status(401).json({error:'Invalid credentials'})
        return
    }
    if (!JWT_SECRET){
        res.status(500).json({error:'JWT secret is not configured'})
        return
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
     const {password:_, ...userWithoutPassword} =  user
    res.status(200).json({ status: 'success', token, user:userWithoutPassword })
    return;
}

export const getMe = async (req:AuthRequest,res:Response):Promise<void>=>{
    const id = req.userId
    if (!id) {
        res.status(401).json({error:"Invalid or expired token"})
        return;
    }
    let includeoptions = {}
    if (req.role=="HOST"){
        includeoptions={
            listings:true
        }
    } else if(req.role=="GUEST"){
        includeoptions ={
            bookings:{
                include:{
                        listing:true
                }
            }
        }
    }
    const user = await prisma.user.findFirst({
        where:{id},
        include:includeoptions

    })
    if (!user){
        res.status(404).json({error:"user not found"})
        return;
    }

    const {password, ...safeuser}=user
    res.status(200).json({status:"success",safeuser})
    return;
}

export const changePassword = async (req:AuthRequest,res:Response):Promise<void> =>{
    const {currentPassword,newPassword} = req.body;
    if (!currentPassword&&!newPassword){
        res.status(404).json({error:"please provide both current and new password"});
        return;
    }
    const id = req.userId
    if (!id) {
        res.status(401).json({error:"Invalid or expired token"})
        return;
    }
    const user = await prisma.user.findFirst({
        where:{id}
    })
    if (!user){
        res.status(404).json({error:"user not found"})
        return;
    }

   const isMatch = await bcrypt.compare(currentPassword,user.password!)
   if (!isMatch){
    res.status(404).json({
       error:"Invalide credentials" 
    })
    return;
   }
 
   if ( newPassword.length < 8){
    res.status(502).json({error:"password must be atleast 8 characters long"})
    return;
   }
   const hashedpassword =  await bcrypt.hash(newPassword,10)
    await prisma.user.update(
   { where:{id},
        data:{
            password:hashedpassword
        }
    }
   )
   res.status(200).json({status:"success"})
   return;
}
export const forgotPassword = async (req:AuthRequest,res:Response):Promise<void>=>{
    const {email} = req.body

    const user = await prisma.user.findFirst({where:{email}})
    if (!user){
        res.status(200).json({message:"If that email is registered, a reset link has been sent"})
        return;
    }
    const rawToken=crypto.randomBytes(32).toString("hex")
    const hashedtoken = crypto.createHash("sha256").update(rawToken).digest("hex")
    const updatetokenexpiry = new Date(Date.now() + 60*60*1000)
    await prisma.user.update({
        where:{email},
        data:{
            resetTokenExpiry:updatetokenexpiry,
            resetToken: hashedtoken
        }
    })

    const resetLink = `${process.env["API_URL"] || "http://localhost:3000"}/auth/reset-password/${rawToken}`

    try{
        await sendEmail(
            user.email,
            "Reset your password",
            passwordResetEmail(user.name, resetLink)
        )
    }catch(error){
        console.log(error)
    }

    res.status(200).json({message:"If that email is registered, a reset link has been sent"})
    return;
}

export const resetPassword = async (req:AuthRequest,res:Response):Promise<void>=>{
    const tokenParam = req.params["token"]
    const rawToken = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam
    const { newPassword } = req.body

    if (!rawToken) {
        res.status(400).json({error:"Invalid or expired reset token"})
        return;
    }

    if (!newPassword || newPassword.length < 8) {
        res.status(400).json({error:"password must be atleast 8 characters long"})
        return;
    }

    const hashedtoken = crypto.createHash("sha256").update(rawToken).digest("hex")

    const user = await prisma.user.findFirst({
        where:{
            resetToken: hashedtoken,
            resetTokenExpiry: {
                gt: new Date()
            }
        }
    })

    if (!user) {
        res.status(400).json({error:"Invalid or expired reset token"})
        return;
    }

    const hashedpassword = await bcrypt.hash(newPassword,10)

    await prisma.user.update({
        where:{id:user.id},
        data:{
            password:hashedpassword,
            resetToken:null,
            resetTokenExpiry:null
        }
    })

    res.status(200).json({status:"success"})
    return;
}
 
