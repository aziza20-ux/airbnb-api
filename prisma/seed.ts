import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt"

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] as string });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data first — order matters because of foreign keys
  // Delete in reverse order of dependencies
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.listingPhoto.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleared existing data");

  // ─── Seed ADMIN User First ────────────────────────────────────────────────

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@airbnb.com",
      username: "admin",
      phone: "0791168562",
      password: await bcrypt.hash("Admin@123", 10),
      role: "ADMIN",
    },
  });
  console.log(`👤 Created admin user: ${admin.email}`);
  console.log("✅ Seeding complete!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });