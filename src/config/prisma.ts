import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env["DATABASE_URL"],
  max: 10,  // maximum connections in the pool
  idleTimeoutMillis: 30000, // close idle connections after 30s
  connectionTimeoutMillis: 2000, 
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function connectDB() {
  await prisma.$connect();
  console.log("Database connected successfully");
}

export default prisma;