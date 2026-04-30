import prisma from "../config/prisma"

export interface User{
    id:number,
    name:string,
    email:string,
    username:string,
    role: "host"|"guest",
    avatar:string,
    bio:string
}


